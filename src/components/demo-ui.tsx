"use client";
import { useId, useRef, useState, type ReactNode } from "react";
import { DAY, dateLabel, initials } from "./demo-data";
import { Icon } from "./icons";

export function Avatar({ name, id = 1 }: { name: string; id?: number }) {
  return <div className={`avatar tone-${id % 4}`}>{initials(name)}</div>;
}
export function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <Icon name="leaf" size={32} />
      <p>{text}</p>
    </div>
  );
}
export function ModeBadge({ compound }: { compound: boolean }) {
  return (
    <span className={`mode-badge ${compound ? "compound" : ""}`}>
      <Icon name={compound ? "reset" : "leaf"} size={12} />
      {compound ? "Compounding on" : "Simple interest"}
    </span>
  );
}
export function Pager({
  page,
  count,
  size,
  onChange,
}: {
  page: number;
  count: number;
  size: number;
  onChange: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(count / size));
  return (
    <div className="pagination">
      <span>
        {count
          ? `${(page - 1) * size + 1}–${Math.min(page * size, count)} of ${count}`
          : "0 results"}
      </span>
      <div>
        <button
          className="outline small"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >
          <span className="rotate-icon">
            <Icon name="chevron" size={15} />
          </span>
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button
          className="outline small"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          <Icon name="chevron" size={15} />
        </button>
      </div>
    </div>
  );
}
export function DatePicker({
  value,
  onChange,
  label = "Select date",
  min,
  max = DAY,
  marked = [],
}: {
  value: string;
  onChange: (s: string) => void;
  label?: string;
  min?: string;
  max?: string;
  marked?: string[];
}) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [month, setMonth] = useState(value.slice(0, 7));
  const [opened, setOpened] = useState(false);
  const [year, m] = month.split("-").map(Number);
  const first = new Date(year, m - 1, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, m, 0).getDate();
  const shift = (n: number) => {
    const d = new Date(year, m - 1 + n, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };
  const choose = (date: string) => {
    onChange(date);
    ref.current?.hidePopover();
    button.current?.focus();
  };
  function show() {
    if (opened) {
      ref.current?.hidePopover();
      return;
    }
    setMonth(value.slice(0, 7));
    const rect = button.current!.getBoundingClientRect();
    const width = Math.min(316, window.innerWidth - 24);
    const pop = ref.current!;
    pop.style.width = `${width}px`;
    pop.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - width - 12))}px`;
    pop.style.top = `${Math.max(12, Math.min(rect.bottom + 9, window.innerHeight - 385))}px`;
    pop.showPopover();
  }
  return (
    <div className="custom-date-picker">
      <button
        ref={button}
        type="button"
        className="date-trigger"
        aria-label={label}
        aria-expanded={opened}
        aria-controls={id}
        aria-haspopup="dialog"
        onClick={show}
      >
        <Icon name="calendar" size={17} />
        <span>{dateLabel(value)}</span>
        <span className="down-chevron">
          <Icon name="chevron" size={12} />
        </span>
      </button>
      <div
        ref={ref}
        id={id}
        popover="auto"
        className="calendar-popover"
        role="dialog"
        aria-label={`${label} calendar`}
        onToggle={(e) => setOpened(e.newState === "open")}
      >
        <div className="calendar-kicker">
          OMSAI CALENDAR <span>✧</span>
        </div>
        <div className="calendar-month">
          <button
            type="button"
            className="icon-button rotate-icon"
            aria-label="Previous month"
            onClick={() => shift(-1)}
          >
            <Icon name="chevron" size={17} />
          </button>
          <strong>
            {first.toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </strong>
          <button
            type="button"
            className="icon-button"
            aria-label="Next month"
            onClick={() => shift(1)}
          >
            <Icon name="chevron" size={17} />
          </button>
        </div>
        <div className="calendar-week">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="calendar-days">
          {Array.from(
            { length: Math.ceil((offset + days) / 7) * 7 },
            (_, i) => {
              const n = i - offset + 1;
              if (n < 1 || n > days) return <span key={i} />;
              const date = `${month}-${String(n).padStart(2, "0")}`;
              return (
                <button
                  key={date}
                  type="button"
                  disabled={
                    Boolean(min && date < min) || Boolean(max && date > max)
                  }
                  className={`${date === value ? "selected" : ""} ${date === DAY ? "today" : ""}`}
                  aria-label={dateLabel(date)}
                  aria-pressed={date === value}
                  onClick={() => choose(date)}
                >
                  {n}
                  {marked.includes(date) && <i />}
                </button>
              );
            },
          )}
        </div>
        <div className="calendar-bottom">
          <span>
            <i /> Recorded activity
          </span>
          <button
            type="button"
            className="text-button"
            disabled={Boolean(min && DAY < min) || Boolean(max && DAY > max)}
            onClick={() => choose(DAY)}
          >
            Today
          </button>
        </div>
        <div className="calendar-shortcuts">
          <button
            type="button"
            onClick={() => choose("2026-10-05")}
            disabled={
              Boolean(min && "2026-10-05" < min) ||
              Boolean(max && "2026-10-05" > max)
            }
          >
            5 Oct · Market day
          </button>
          <button
            type="button"
            onClick={() => choose("2026-10-21")}
            disabled={
              Boolean(min && "2026-10-21" < min) ||
              Boolean(max && "2026-10-21" > max)
            }
          >
            21 Oct · Yesterday
          </button>
        </div>
      </div>
    </div>
  );
}
type Suggestion = { id: number; label: string; detail: ReactNode };
export function SearchSelect({
  label,
  placeholder,
  value,
  onChange,
  items,
  onSelect,
  selected,
  required = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  items: Suggestion[];
  onSelect: (id: number) => void;
  selected?: number | null;
  required?: boolean;
}) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(-1);
  const matches = items
    .filter((i) => i.label.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 7);
  function select(id: number) {
    onSelect(id);
    setExpanded(false);
    setActive(-1);
  }
  return (
    <div className="suggestion-field">
      <label className="field" htmlFor={id}>
        {label}
        <div className="suggestion-input">
          <Icon name="search" size={16} />
          <input
            id={id}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={expanded}
            aria-controls={`${id}-list`}
            aria-activedescendant={
              active >= 0 ? `${id}-option-${active}` : undefined
            }
            placeholder={placeholder}
            value={value}
            required={required}
            autoComplete="off"
            onFocus={() => setExpanded(true)}
            onBlur={() => setExpanded(false)}
            onChange={(e) => {
              onChange(e.target.value);
              setExpanded(true);
              setActive(-1);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setExpanded(true);
                setActive((a) => Math.min(a + 1, matches.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(0, a - 1));
              }
              if (
                e.key === "Enter" &&
                expanded &&
                active >= 0 &&
                matches[active]
              ) {
                e.preventDefault();
                select(matches[active].id);
              }
              if (e.key === "Escape" && expanded) {
                e.preventDefault();
                e.stopPropagation();
                setExpanded(false);
              }
            }}
          />
          {selected && <Icon name="check" size={16} />}
        </div>
      </label>
      {expanded && (
        <div className="suggestion-list" id={`${id}-list`} role="listbox">
          {matches.map((i, n) => (
            <div
              role="option"
              aria-selected={n === active}
              id={`${id}-option-${n}`}
              key={i.id}
              className={`suggestion-option ${n === active ? "highlighted" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(i.id)}
            >
              <strong>{i.label}</strong>
              <div>{i.detail}</div>
            </div>
          ))}
          {!matches.length && (
            <div className="suggestion-empty">
              No matches. Check the name or use manual entry.
            </div>
          )}
          {matches.length > 0 && (
            <div className="suggestion-hint">
              Type to narrow the list · ↑ ↓ and Enter to choose
            </div>
          )}
        </div>
      )}
    </div>
  );
}
