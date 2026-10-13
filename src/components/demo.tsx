"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  DAY,
  STORAGE_KEY,
  seed,
  money,
  dateLabel,
  creditCost,
  eventOrder,
  type Section,
  type Store,
  type Modal,
} from "./demo-data";
import { DemoContext } from "./demo-context";
import { Avatar, Empty, ModeBadge, Pager, DatePicker } from "./demo-ui";
import { Icon, Lotus } from "./icons";
import { DemoModal } from "./demo-modal";
import { useContext } from "react";

export function DemoShell({ children }: { children: ReactNode }) {
  const [data, setData] = useState(seed);
  const [modal, open] = useState<Modal>(null);
  const [toast, notify] = useState("");
  const [menu, setMenu] = useState(false);
  const [date, setDate] = useState(DAY);
  const [ready, setReady] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null),
    menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed.farmers) &&
          Array.isArray(parsed.interestHistory)
        ) {
          // Restore saved demo state after server/client hydration.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setData(parsed);
        }
      }
    } catch {
      /* Use the JSON fixtures if storage is unavailable. */
    }
    // Enable persistence only after restoration.
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        /* The in-memory demo remains usable. */
      }
  }, [data, ready]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => notify(""), 4200);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!menu) return;
    const button = menuButtonRef.current;
    const controls =
      sidebarRef.current?.querySelectorAll<HTMLElement>("a,button");
    controls?.[0]?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
      if (e.key === "Tab" && controls?.length) {
        const first = controls[0],
          last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const resize = () => {
      if (window.innerWidth > 760) setMenu(false);
    };
    document.addEventListener("keydown", key);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("keydown", key);
      window.removeEventListener("resize", resize);
      document.body.style.overflow = overflow;
      button?.focus();
    };
  }, [menu]);
  const change = (fn: (s: Store) => Store) => setData((old) => fn(old));
  const routes: [Section, string, string][] = [
    ["Dashboard", "/", "home"],
    ["Farmers", "/farmers", "people"],
    ["Products", "/products", "leaf"],
    ["Invoices", "/invoices", "file"],
    ["Suppliers", "/suppliers", "truck"],
  ];
  return (
    <DemoContext.Provider value={{ data, change, open, notify, date, setDate }}>
      <div className="app-shell">
        {menu && (
          <button
            className="drawer-backdrop"
            aria-label="Close navigation"
            onClick={() => setMenu(false)}
          />
        )}
        <aside
          ref={sidebarRef}
          aria-label="Main navigation"
          className={`sidebar ${menu ? "is-open" : ""}`}
        >
          <button
            className="mobile-close"
            aria-label="Close sidebar"
            onClick={() => setMenu(false)}
          >
            <Icon name="close" />
          </button>
          <Link href="/" className="brand" onClick={() => setMenu(false)}>
            <div className="om-emblem">
              <span>ॐ</span>
            </div>
            <span className="brand-name">
              Omsai<span className="brand-dot">.</span>
            </span>
            <span className="brand-sub">FERTILISER, PESTICIDES & SEEDS</span>
          </Link>
          <div className="ornament">
            <span />✧<span />
          </div>
          <div className="nav-label">YOUR WORKSPACE</div>
          <nav>
            {routes.map(([name, href, icon]) => (
              <Link
                key={name}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                onClick={() => setMenu(false)}
                className={pathname === href ? "nav-item active" : "nav-item"}
              >
                <Icon name={icon} />
                <span>{name}</span>
                {pathname === href && <span className="nav-dot" />}
              </Link>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <Lotus />
            <p>
              Rooted in trust.
              <br />
              <em>Growing together.</em>
            </p>
            <div className="sidebar-profile">
              <div className="owner-avatar">
                <Icon name="leaf" size={16} />
              </div>
              <div>
                <strong>Omsai Proprietor</strong>
                <small>Andhra Pradesh · Shop workspace</small>
              </div>
            </div>
          </div>
        </aside>
        <div className="main-shell" inert={menu}>
          <header className="topbar">
            <div className="breadcrumb">
              <button
                className="menu-button"
                ref={menuButtonRef}
                aria-label="Open sidebar"
                aria-expanded={menu}
                onClick={() => setMenu(true)}
              >
                <Icon name="menu" />
              </button>
              <span>Workspace</span>
              <Icon name="chevron" size={13} />
              <strong>
                {routes.find((r) => r[1] === pathname)?.[0] || "Dashboard"}
              </strong>
            </div>
            <div className="topbar-right">
              <span className="demo-tag">
                <i /> Interactive demo
              </span>
              <button
                className="icon-button notification"
                aria-label="View low stock alerts"
                onClick={() => open({ kind: "lowstock" })}
              >
                <Icon name="bell" />
                <i />
              </button>
            </div>
          </header>
          {children}
          <footer className="page-footer">
            <span>
              Omsai <span className="gold">✧</span> Every account. Every
              harvest. Together.
            </span>
            <button
              className="text-button"
              onClick={() => open({ kind: "reset" })}
            >
              <Icon name="reset" size={13} /> Reset demo
            </button>
          </footer>
        </div>
      </div>
      {modal && (
        <DemoModal
          key={`${modal.kind}-${modal.id}`}
          modal={modal}
          close={() => open(null)}
        />
      )}{" "}
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" />
          {toast}
          <button aria-label="Dismiss" onClick={() => notify("")}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </DemoContext.Provider>
  );
}
function Stat({
  label,
  value,
  icon,
  tone = "green",
  caption,
}: {
  label: string;
  value: string;
  icon: string;
  tone?: string;
  caption: string;
}) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-top">
        <span>{label}</span>
        <div className="stat-icon">
          <Icon name={icon} size={21} />
        </div>
      </div>
      <strong>{value}</strong>
      <div className="stat-caption">{caption}</div>
      <Lotus className="stat-lotus" />
    </div>
  );
}
export function DemoPage({ section }: { section: Section }) {
  const { data, open, date, setDate } = useContext(DemoContext);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Recent");
  const [archive, setArchive] = useState(false);
  const [page, setPage] = useState(1);
  const size = section === "Invoices" ? 10 : 12;
  const dayEvents = data.events
    .filter((e) => e.date === date)
    .sort((a, b) => eventOrder(b) - eventOrder(a));
  const payments = dayEvents
    .filter((e) => e.type === "Payment")
    .reduce((s, e) => s + e.amount, 0);
  const credits = dayEvents
    .filter((e) => e.type === "Credit")
    .reduce((s, e) => s + creditCost(e), 0);
  const purchases = data.purchases
    .filter((p) => p.date === date)
    .reduce((s, p) => s + p.amount, 0);
  const net = payments - credits - purchases;
  const low = data.products.filter((p) => !p.archived && p.stock < 10),
    totalDue = data.farmers.reduce((s, f) => s + f.due, 0);
  const farmerEvents = (id: number) =>
    data.events.filter((e) => e.farmer === id);
  const descriptions = {
    Dashboard: "A little clarity for a flourishing business.",
    Farmers: "Relationships that grow, accounts you can trust.",
    Products: "Everything your farmers need for a better harvest.",
    Invoices: "Every transaction, thoughtfully recorded.",
    Suppliers: "Strong partnerships. A well-stocked tomorrow.",
  };
  const farmers = data.farmers
    .filter(
      (f) =>
        f.archived === archive &&
        `${f.name} ${f.phone} ${f.address}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (filter === "All" || (filter === "Due" ? f.due > 0 : f.due === 0)),
    )
    .sort((a, b) => {
      if (sort === "Highest due") return b.due - a.due;
      if (sort === "A–Z") return a.name.localeCompare(b.name);
      if (sort === "Highest activity")
        return farmerEvents(b.id).length - farmerEvents(a.id).length;
      if (sort === "Highest paid")
        return (
          farmerEvents(b.id)
            .filter((e) => e.type === "Payment")
            .reduce((s, e) => s + e.amount, 0) -
          farmerEvents(a.id)
            .filter((e) => e.type === "Payment")
            .reduce((s, e) => s + e.amount, 0)
        );
      return (
        Math.max(0, ...farmerEvents(b.id).map(eventOrder)) -
        Math.max(0, ...farmerEvents(a.id).map(eventOrder))
      );
    });
  const products = data.products.filter(
    (p) =>
      p.archived === archive &&
      `${p.name} ${p.brand} ${p.batch}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "All" ||
        (filter === "Low stock" && p.stock < 10) ||
        p.category === filter),
  );
  const suppliers = data.suppliers.filter(
    (s) =>
      s.archived === archive &&
      `${s.name} ${s.phone} ${s.address}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const invoices = data.invoices.filter((i) =>
    `${i.name} OMS-${i.id}`.toLowerCase().includes(query.toLowerCase()),
  );
  const count =
    section === "Farmers"
      ? farmers.length
      : section === "Products"
        ? products.length
        : section === "Suppliers"
          ? suppliers.length
          : invoices.length;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(count / size)));
  const slice = <T,>(list: T[]) =>
    list.slice((currentPage - 1) * size, currentPage * size);
  const setSearch = (v: string) => {
    setQuery(v);
    setPage(1);
  };
  const setStatus = (v: string) => {
    setFilter(v);
    setPage(1);
  };
  const showArchive = () => {
    setArchive(!archive);
    setPage(1);
  };
  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            {section === "Dashboard"
              ? "NAMASTE, WELCOME BACK"
              : "YOUR OMSAI WORKSPACE"}
            <span>✧</span>
          </div>
          <h1>{section === "Dashboard" ? "Business overview" : section}</h1>
          <p>{descriptions[section]}</p>
        </div>
        <div className="heading-actions">
          {section === "Dashboard" ? (
            <>
              <DatePicker
                value={date}
                onChange={setDate}
                label="Dashboard date"
                marked={[...new Set(data.events.map((e) => e.date))]}
              />
              <button
                className="primary"
                onClick={() => open({ kind: "businessReport" })}
              >
                <Icon name="file" size={17} /> Business report
              </button>
            </>
          ) : (
            <>
              {section === "Products" && (
                <button
                  className="outline"
                  onClick={() => open({ kind: "inventoryReport" })}
                >
                  <Icon name="file" size={17} /> Product report
                </button>
              )}
              <button
                className="primary"
                onClick={() =>
                  open({
                    kind:
                      section === "Farmers"
                        ? "farmer"
                        : section === "Products"
                          ? "product"
                          : section === "Suppliers"
                            ? "supplier"
                            : "bill",
                  })
                }
              >
                <Icon name="plus" size={18} />
                {section === "Invoices"
                  ? "Create Bill"
                  : `Add ${section === "Farmers" ? "Farmer" : section === "Products" ? "Product" : "Supplier"}`}
              </button>
            </>
          )}
        </div>
      </div>
      {section === "Dashboard" ? (
        <>
          <div className="section-kicker">
            <span>
              {date === DAY ? "TODAY AT A GLANCE" : "DAY AT A GLANCE"}
            </span>
            <span>
              {dateLabel(date)}
              {date !== DAY && (
                <button className="text-button" onClick={() => setDate(DAY)}>
                  Back to today
                </button>
              )}
            </span>
          </div>
          <div className="stats-grid">
            <Stat
              label="Farmer payments"
              value={money(payments)}
              icon="wallet"
              caption="Received from farmers"
            />
            <Stat
              label="Credit given"
              value={money(credits)}
              icon="leaf"
              tone="amber"
              caption="Purchase cost of inputs supplied"
            />
            <Stat
              label="Supplier purchases"
              value={money(purchases)}
              icon="truck"
              tone="rose"
              caption="Paid & due purchases"
            />
            <Stat
              label="Net business activity"
              value={`${net >= 0 ? "+" : "−"}${money(Math.abs(net))}`}
              icon="chart"
              tone={net >= 0 ? "green" : "rose"}
              caption="Payments − input cost − purchases"
            />
          </div>
          <div className="dashboard-panels">
            <section className="panel activity-panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    <button
                      className="heading-link"
                      onClick={() => open({ kind: "activity" })}
                    >
                      {date === DAY
                        ? "Today’s farmer activity"
                        : "Farmer activity"}
                    </button>
                  </h2>
                  <p>
                    <span className="green-dot" />
                    {new Set(dayEvents.map((e) => e.farmer)).size} farmers ·{" "}
                    {dayEvents.length} transactions
                  </p>
                </div>
                <button
                  className="text-button"
                  onClick={() => open({ kind: "activity" })}
                >
                  View all <Icon name="arrow" size={15} />
                </button>
              </div>
              <div className="activity-list">
                {dayEvents.length ? (
                  dayEvents.slice(0, 4).map((e) => (
                    <button
                      className="activity-row"
                      key={e.id}
                      onClick={() => open({ kind: "history", id: e.farmer })}
                    >
                      <Avatar name={e.name} id={e.farmer} />
                      <div className="activity-person">
                        <strong>{e.name}</strong>
                        <small>
                          {e.type === "Payment"
                            ? "Made a payment"
                            : `${e.lines.length} products credited`}
                        </small>
                      </div>
                      <span className="activity-time">{e.time}</span>
                      <div
                        className={`activity-amount ${e.type === "Payment" ? "positive" : "negative"}`}
                      >
                        <strong>+{money(e.amount)}</strong>
                        <small>
                          {e.type === "Payment"
                            ? "Received"
                            : "Farmer selling value"}
                        </small>
                      </div>
                    </button>
                  ))
                ) : (
                  <Empty text="No farmer activity on this date." />
                )}
              </div>
              <div className="panel-foot">
                <Icon name="people" size={15} />
                <span>Click a farmer to open their full account.</span>
              </div>
            </section>
            <section className="panel stock-panel">
              <div className="panel-heading">
                <div>
                  <h2>Time to restock</h2>
                  <p>
                    <span className="amber-dot" />
                    {low.length} products running low · current stock
                  </p>
                </div>
                <Link className="text-button" href="/products">
                  View inventory <Icon name="arrow" size={15} />
                </Link>
              </div>
              <div className="stock-table">
                <div className="stock-table-head">
                  <span>PRODUCT</span>
                  <span>IN STOCK</span>
                  <span>ACTION</span>
                </div>
                {low.slice(0, 3).map((p) => (
                  <div className="stock-row" key={p.id}>
                    <button
                      className="product-ident"
                      onClick={() => open({ kind: "productDetails", id: p.id })}
                    >
                      <div
                        className={`product-icon ${p.category === "Pesticides" ? "rose" : "amber"}`}
                      >
                        <Icon name="leaf" />
                      </div>
                      <div>
                        <strong>{p.name}</strong>
                        <small>{p.category}</small>
                      </div>
                    </button>
                    <div className="stock-number">
                      <strong>{p.stock}</strong>
                      <small>{p.unit}</small>
                    </div>
                    <button
                      className="outline small"
                      onClick={() => open({ kind: "restock", id: p.id })}
                    >
                      <Icon name="plus" size={13} /> Restock
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="stock-note full-stock-note"
                onClick={() => open({ kind: "stockActivity" })}
              >
                <Icon name="leaf" size={16} />
                <span>See stock movements for {dateLabel(date)}</span>
                <Icon name="arrow" size={13} />
              </button>
            </section>
          </div>
          <section className="panel overview-panel">
            <div className="panel-heading">
              <div>
                <h2>Business at a glance</h2>
                <p>The bigger picture, nurtured every day.</p>
              </div>
              <span className="subtle-pill">ALL-TIME OVERVIEW</span>
            </div>
            <div className="overview-grid">
              <div className="overview-stat">
                <div className="round-icon amber">₹</div>
                <div>
                  <small>Total farmer dues</small>
                  <strong>{money(totalDue)}</strong>
                  <span>Includes archived dues · as of {dateLabel(DAY)}</span>
                </div>
              </div>
              <div className="overview-stat">
                <div className="round-icon amber">
                  <Icon name="people" size={25} />
                </div>
                <div>
                  <small>Farmers</small>
                  <strong>
                    {data.farmers.filter((f) => !f.archived).length}
                  </strong>
                  <span>Trusted relationships across Andhra Pradesh</span>
                </div>
              </div>
              <div className="overview-stat">
                <div className="round-icon rose">
                  <Icon name="truck" size={25} />
                </div>
                <div>
                  <small>Suppliers</small>
                  <strong>
                    {data.suppliers.filter((s) => !s.archived).length}
                  </strong>
                  <span>Active business partners</span>
                </div>
              </div>
            </div>
            <div className="lifetime-strip">
              <div>
                <small>All-time payments</small>
                <strong>
                  {money(
                    data.events
                      .filter((e) => e.type === "Payment")
                      .reduce((s, e) => s + e.amount, 0),
                  )}
                </strong>
              </div>
              <div>
                <small>All-time inputs supplied at cost</small>
                <strong>
                  {money(
                    data.events
                      .filter((e) => e.type === "Credit")
                      .reduce((s, e) => s + creditCost(e), 0),
                  )}
                </strong>
              </div>
              <div>
                <small>All-time supplier purchases</small>
                <strong>
                  {money(data.purchases.reduce((s, p) => s + p.amount, 0))}
                </strong>
              </div>
            </div>
          </section>
          <div className="blessing-banner">
            <div className="blessing-symbol">ॐ</div>
            <div>
              <strong>Good seeds. Honest business. Abundant blessings.</strong>
              <p>Serving our farmers with care, one harvest at a time.</p>
            </div>
            <Lotus />
          </div>
        </>
      ) : (
        <>
          <div className="collection-summary">
            <span>
              <strong>{count}</strong> {archive ? "archived " : ""}
              {section.toLowerCase()} in your workspace
            </span>
            <span>
              {section === "Farmers"
                ? `${money(totalDue)} total dues including archive`
                : section === "Products"
                  ? `${low.length} low-stock products`
                  : section === "Suppliers"
                    ? `${money(data.purchases.filter((p) => !p.paid).reduce((s, p) => s + p.amount, 0))} purchase dues`
                    : "Immutable account snapshots"}
            </span>
          </div>
          <div className="toolbar">
            <label className="search-box">
              <Icon name="search" size={19} />
              <input
                aria-label={`Search ${section.toLowerCase()}`}
                placeholder={`Search ${section.toLowerCase()}${section === "Farmers" ? " by name, phone or village" : "…"}`}
                value={query}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            {section === "Farmers" && (
              <div className="filter-tabs">
                {["All", "Due", "Clear"].map((f) => (
                  <button
                    className={filter === f ? "selected" : ""}
                    key={f}
                    onClick={() => setStatus(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
            {section === "Products" && (
              <select
                aria-label="Filter category"
                value={filter}
                onChange={(e) => setStatus(e.target.value)}
              >
                {["All", "Fertilizers", "Pesticides", "Seeds", "Low stock"].map(
                  (f) => (
                    <option key={f}>{f}</option>
                  ),
                )}
              </select>
            )}
            {section === "Farmers" && (
              <select
                aria-label="Sort farmers"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                {[
                  "Recent",
                  "Highest activity",
                  "Highest due",
                  "Highest paid",
                  "A–Z",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            )}
            {section !== "Invoices" && (
              <button
                className={`archive-toggle ${archive ? "selected" : ""}`}
                onClick={showArchive}
              >
                <Icon name="archive" size={15} />
                {archive ? "Back to active" : "Archived"}
              </button>
            )}
          </div>
          {section === "Farmers" && (
            <div className="farmer-grid">
              {slice(farmers).map((f) => (
                <article className="farmer-card clickable-card" key={f.id}>
                  <button
                    className="card-open"
                    aria-label={`Open farmer account for ${f.name}`}
                    onClick={() => open({ kind: "history", id: f.id })}
                  />
                  <div className="card-person">
                    <Avatar name={f.name} id={f.id} />
                    <div>
                      <h3>{f.name}</h3>
                      <p>{f.phone}</p>
                    </div>
                    <span className={`status ${f.due ? "due" : "clear"}`}>
                      {f.due ? "Due" : "Clear"}
                    </span>
                  </div>
                  <div className="farmer-location">{f.address}</div>
                  <div className="farmer-balance">
                    <span>
                      Total due <small>As of {dateLabel(DAY)}</small>
                    </span>
                    <strong>{money(f.due)}</strong>
                  </div>
                  <div className="rate-line">
                    <span>{f.rate}% monthly</span>
                    <ModeBadge compound={f.compound} />
                  </div>
                  <div className="card-account-hint">
                    {archive
                      ? "Archived account · history retained"
                      : "View full account & history"}
                    <Icon name="arrow" size={13} />
                  </div>
                  <div className="card-actions">
                    {!archive && (
                      <button
                        className="outline"
                        onClick={() => open({ kind: "credit", id: f.id })}
                      >
                        <Icon name="plus" size={15} /> Credit
                      </button>
                    )}
                    <button
                      className="primary"
                      disabled={!f.due}
                      onClick={() => open({ kind: "pay", id: f.id })}
                    >
                      Record payment
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`${archive ? "Restore" : "Delete"} farmer ${f.name}`}
                      onClick={() =>
                        open({
                          kind: archive ? "restoreFarmer" : "deleteFarmer",
                          id: f.id,
                        })
                      }
                    >
                      <Icon name={archive ? "reset" : "trash"} size={16} />
                    </button>
                  </div>
                </article>
              ))}
              {!farmers.length && (
                <Empty text="No farmers match your search." />
              )}
            </div>
          )}
          {section === "Products" && (
            <div className="product-grid">
              {slice(products).map((p) => (
                <article className="inventory-card clickable-card" key={p.id}>
                  <button
                    className="card-open"
                    aria-label={`Open product details for ${p.name}`}
                    onClick={() => open({ kind: "productDetails", id: p.id })}
                  />
                  <div className={`product-art ${p.category.toLowerCase()}`}>
                    <div className="package">
                      <span>{p.brand}</span>
                      <Icon name="leaf" size={36} />
                      <strong>{p.name}</strong>
                      <small>QUALITY FARM INPUTS</small>
                    </div>
                    <span className="category-tag">{p.category}</span>
                  </div>
                  <div className="inventory-content">
                    <h3>{p.name}</h3>
                    <p>
                      {p.brand} · Batch {p.batch || "Not specified"}
                    </p>
                    <div className="inventory-details">
                      <div>
                        <small>Purchase / selling per unit</small>
                        <strong>
                          {money(p.purchasePrice)} <span>/</span>{" "}
                          {money(p.price)}
                        </strong>
                      </div>
                      <div>
                        <small>In stock</small>
                        <strong
                          className={p.stock < 10 ? "negative" : "positive"}
                        >
                          {p.stock} <span>{p.unit}</span>
                        </strong>
                      </div>
                    </div>
                    <div className="inventory-footer">
                      <span
                        className={`status ${p.stock < 10 ? "due" : "clear"}`}
                      >
                        {archive
                          ? "Archived"
                          : p.stock < 10
                            ? "Low stock"
                            : "In stock"}
                      </span>
                      {!archive && (
                        <button
                          className="text-button"
                          onClick={() => open({ kind: "restock", id: p.id })}
                        >
                          <Icon name="plus" size={14} /> Restock
                        </button>
                      )}
                      <button
                        className="icon-button"
                        aria-label={`${archive ? "Restore" : "Delete"} product ${p.name}`}
                        onClick={() =>
                          open({
                            kind: archive ? "restoreProduct" : "deleteProduct",
                            id: p.id,
                          })
                        }
                      >
                        <Icon name={archive ? "reset" : "trash"} size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {!products.length && (
                <Empty text="No products match your search." />
              )}
            </div>
          )}
          {section === "Suppliers" && (
            <div className="farmer-grid">
              {slice(suppliers).map((s) => (
                <article
                  className="farmer-card supplier-card clickable-card"
                  key={s.id}
                >
                  <button
                    className="card-open"
                    aria-label={`Open supplier details for ${s.name}`}
                    onClick={() => open({ kind: "supplierHistory", id: s.id })}
                  />
                  <div className="card-person">
                    <div className="round-icon amber">
                      <Icon name="truck" />
                    </div>
                    <div>
                      <h3>{s.name}</h3>
                      <p>{s.phone}</p>
                    </div>
                  </div>
                  <div className="farmer-location">{s.address}</div>
                  <div className="farmer-balance">
                    <span>Purchase dues</span>
                    <strong>
                      {money(
                        data.purchases
                          .filter((p) => p.supplier === s.id && !p.paid)
                          .reduce((sum, p) => sum + p.amount, 0),
                      )}
                    </strong>
                  </div>
                  <div className="card-account-hint">
                    View purchases & supplier details
                    <Icon name="arrow" size={13} />
                  </div>
                  <div className="card-actions">
                    <button
                      className="outline"
                      onClick={() =>
                        open({ kind: "supplierHistory", id: s.id })
                      }
                    >
                      History
                    </button>
                    {!archive && (
                      <button
                        className="primary"
                        onClick={() => open({ kind: "purchase", id: s.id })}
                      >
                        <Icon name="plus" size={15} /> Purchase
                      </button>
                    )}
                    <button
                      className="icon-button"
                      aria-label={`${archive ? "Restore" : "Delete"} supplier ${s.name}`}
                      onClick={() =>
                        open({
                          kind: archive ? "restoreSupplier" : "deleteSupplier",
                          id: s.id,
                        })
                      }
                    >
                      <Icon name={archive ? "reset" : "trash"} size={16} />
                    </button>
                  </div>
                </article>
              ))}
              {!suppliers.length && (
                <Empty text="No suppliers match your search." />
              )}
            </div>
          )}
          {section === "Invoices" && (
            <section className="panel invoice-list">
              <div className="invoice-table-head">
                <span>BILL & FARMER</span>
                <span>GENERATED ON</span>
                <span>CAPTURED DUE</span>
                <span />
              </div>
              {slice(invoices).map((i) => (
                <div className="invoice-row" key={i.id}>
                  <button
                    className="product-ident"
                    onClick={() => open({ kind: "invoice", id: i.id })}
                  >
                    <div className="round-icon amber">
                      <Icon name="file" />
                    </div>
                    <div>
                      <strong>{i.name}</strong>
                      <small>
                        OMS-{i.id} ·{" "}
                        {i.events.filter((e) => e.type === "Credit").length}{" "}
                        credits · Full account bill
                      </small>
                    </div>
                  </button>
                  <span>{dateLabel(i.date)}</span>
                  <strong>{money(i.due)}</strong>
                  <button
                    className="outline"
                    onClick={() => open({ kind: "invoice", id: i.id })}
                  >
                    <Icon name="file" size={16} /> View bill
                  </button>
                </div>
              ))}
              {!invoices.length && <Empty text="No bills match your search." />}
            </section>
          )}
          <Pager
            page={Math.min(page, Math.max(1, Math.ceil(count / size)))}
            count={count}
            size={size}
            onChange={setPage}
          />
        </>
      )}
    </main>
  );
}
