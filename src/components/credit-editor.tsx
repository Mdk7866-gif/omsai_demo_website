"use client";
import { useContext, useState, type FormEvent } from "react";
import { DemoContext } from "./demo-context";
import { money, round, fractionalUnit, type CreditLine } from "./demo-data";
import { SearchSelect } from "./demo-ui";
import { Icon } from "./icons";

type Draft = {
  key: number;
  productId: number | null;
  query: string;
  manual: boolean;
  category: string;
  brand: string;
  unit: string;
  batch: string;
  quantity: string;
  purchase: string;
  selling: string;
  discount: string;
};
const blank = (key: number): Draft => ({
  key,
  productId: null,
  query: "",
  manual: false,
  category: "Fertilizers",
  brand: "",
  unit: "bags",
  batch: "",
  quantity: "1",
  purchase: "",
  selling: "",
  discount: "",
});
export function CreditEditor({
  onSave,
  close,
}: {
  onSave: (lines: CreditLine[]) => void;
  close: () => void;
}) {
  const { data } = useContext(DemoContext);
  const [lines, setLines] = useState<Draft[]>([blank(1)]);
  const [error, setError] = useState("");
  const update = (key: number, patch: Partial<Draft>) => {
    setError("");
    setLines((old) => old.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  };
  const available = data.products.filter((p) => !p.archived);
  const total = round(
    lines.reduce(
      (s, l) =>
        s +
        Number(l.quantity) * Number(l.discount !== "" ? l.discount : l.selling),
      0,
    ),
  );
  const cost = round(
    lines.reduce((s, l) => s + Number(l.quantity) * Number(l.purchase), 0),
  );
  function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    const result: CreditLine[] = [];
    const quantities = new Map<number, number>();
    for (const [index, l] of lines.entries()) {
      const product = available.find((p) => p.id === l.productId);
      if (!l.manual && !product) {
        setError(
          `Choose an inventory suggestion for product ${index + 1}, or explicitly select manual entry.`,
        );
        return;
      }
      if (!l.query.trim()) {
        setError("Each product needs a name.");
        return;
      }
      const quantity = Number(l.quantity),
        purchase = Number(l.purchase),
        selling = Number(l.selling),
        discount = l.discount === "" ? null : Number(l.discount);
      if (
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(purchase) ||
        purchase < 0 ||
        !Number.isFinite(selling) ||
        selling < 0 ||
        (discount !== null &&
          (!Number.isFinite(discount) || discount < 0 || discount > selling))
      ) {
        setError(
          `Check quantity and prices for product ${index + 1}. A discounted final price cannot exceed the selling price.`,
        );
        return;
      }
      if (!fractionalUnit(l.unit) && !Number.isInteger(quantity)) {
        setError(`Use whole ${l.unit} for ${l.query}.`);
        return;
      }
      if (product)
        quantities.set(
          product.id,
          (quantities.get(product.id) || 0) + quantity,
        );
      result.push({
        productId: product?.id ?? null,
        name: l.query.trim(),
        category: l.category,
        brand: l.brand,
        batch: l.batch,
        unit: l.unit,
        quantity,
        purchasePrice: purchase,
        sellingPrice: selling,
        discountedPrice: discount,
        total: round(quantity * (discount ?? selling)),
      });
    }
    for (const [id, qty] of quantities) {
      const p = available.find((p) => p.id === id)!;
      if (qty > p.stock) {
        setError(
          `${p.name}: ${qty} ${p.unit} requested across all lines, but only ${p.stock} available. Reduce quantity or choose manual entry explicitly.`,
        );
        return;
      }
    }
    onSave(result);
  }
  return (
    <form onSubmit={save}>
      <div className="credit-intro">
        <span>
          <Icon name="leaf" size={16} /> Choose inputs for this farmer
        </span>
        <small>Prices are per unit · discount applies only to this sale</small>
      </div>
      {lines.map((l, index) => (
        <section className="credit-line-editor" key={l.key}>
          <div className="line-editor-heading">
            <strong>
              <span>{String(index + 1).padStart(2, "0")}</span> Product{" "}
              {index + 1}
            </strong>
            <div>
              <button
                type="button"
                className={`text-button ${l.manual ? "positive" : ""}`}
                onClick={() =>
                  update(l.key, {
                    ...blank(l.key),
                    manual: !l.manual,
                    query: l.query,
                  })
                }
              >
                {l.manual ? "Switch to inventory" : "Enter manually"}
              </button>
              {lines.length > 1 && (
                <button
                  type="button"
                  className="icon-button negative"
                  aria-label={`Remove product ${index + 1}`}
                  onClick={() =>
                    setLines((old) => old.filter((x) => x.key !== l.key))
                  }
                >
                  <Icon name="trash" size={16} />
                </button>
              )}
            </div>
          </div>
          {l.manual ? (
            <label className="field">
              Product name · manual entry
              <input
                aria-label={`Manual product ${index + 1}`}
                value={l.query}
                onChange={(e) => update(l.key, { query: e.target.value })}
                required
                placeholder="Enter product name"
              />
            </label>
          ) : (
            <SearchSelect
              label={`Product ${index + 1} name`}
              placeholder="Type a product name, e.g. Paddy, Urea…"
              value={l.query}
              onChange={(query) =>
                update(l.key, {
                  query,
                  productId: null,
                  purchase: "",
                  selling: "",
                  discount: "",
                })
              }
              selected={l.productId}
              items={available.map((p) => ({
                id: p.id,
                label: p.name,
                detail: (
                  <>
                    <span>
                      {p.category} · {p.brand} · {p.batch}
                    </span>
                    <span>
                      <b>
                        {p.stock} {p.unit} available
                      </b>
                      <span>
                        Purchase {money(p.purchasePrice)} · Selling{" "}
                        {money(p.price)}
                      </span>
                    </span>
                  </>
                ),
              }))}
              onSelect={(id) => {
                const p = available.find((p) => p.id === id)!;
                update(l.key, {
                  productId: id,
                  query: p.name,
                  category: p.category,
                  brand: p.brand,
                  unit: p.unit,
                  batch: p.batch,
                  purchase: String(p.purchasePrice),
                  selling: String(p.price),
                  discount: "",
                });
              }}
              required
            />
          )}
          {l.manual ? (
            <div className="form-grid three-fields">
              <label className="field">
                Category
                <select
                  value={l.category}
                  onChange={(e) =>
                    update(l.key, {
                      category: e.target.value,
                      unit:
                        e.target.value === "Pesticides"
                          ? "bottles"
                          : e.target.value === "Seeds"
                            ? "packets"
                            : "bags",
                    })
                  }
                >
                  {["Fertilizers", "Pesticides", "Seeds"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Unit
                <input
                  required
                  value={l.unit}
                  onChange={(e) => update(l.key, { unit: e.target.value })}
                  placeholder="bags / kg / packets"
                />
              </label>
              <label className="field">
                Brand (optional)
                <input
                  value={l.brand}
                  onChange={(e) => update(l.key, { brand: e.target.value })}
                />
              </label>
            </div>
          ) : (
            l.productId && (
              <div className="selected-product-meta">
                <span className="subtle-pill">{l.category}</span>
                <span>
                  Batch {l.batch} ·{" "}
                  {available.find((p) => p.id === l.productId)?.stock} {l.unit}{" "}
                  in stock
                </span>
              </div>
            )
          )}
          <div className="credit-prices-grid">
            <label className="field">
              Quantity ({l.unit})
              <input
                aria-label={`Product ${index + 1} quantity`}
                type="number"
                min={fractionalUnit(l.unit) ? "0.01" : "1"}
                step={fractionalUnit(l.unit) ? "0.01" : "1"}
                required
                value={l.quantity}
                onChange={(e) => update(l.key, { quantity: e.target.value })}
              />
            </label>
            <label className="field">
              Purchase / unit (₹)
              <input
                aria-label={`Product ${index + 1} purchase price`}
                type="number"
                min="0"
                step="0.01"
                required
                readOnly={!l.manual}
                value={l.purchase}
                onChange={(e) => update(l.key, { purchase: e.target.value })}
              />
            </label>
            <label className="field">
              Selling / unit (₹)
              <input
                aria-label={`Product ${index + 1} selling price`}
                type="number"
                min="0"
                step="0.01"
                required
                readOnly={!l.manual}
                value={l.selling}
                onChange={(e) => update(l.key, { selling: e.target.value })}
              />
            </label>
            <label className="field discount-field">
              Discounted price (₹)
              <input
                aria-label={`Product ${index + 1} discounted price`}
                type="number"
                min="0"
                max={l.selling || undefined}
                step="0.01"
                value={l.discount}
                onChange={(e) => update(l.key, { discount: e.target.value })}
                placeholder="Optional final price"
              />
            </label>
          </div>
          <div className="credit-line-total">
            <span>
              {l.manual
                ? "Manual · no inventory movement"
                : l.productId ? "Linked inventory · stock deducted on save" : "Choose a suggestion to link inventory"}
            </span>
            <strong>
              Line total{" "}
              {money(
                round(
                  Number(l.quantity) *
                    Number(l.discount !== "" ? l.discount : l.selling),
                ),
              )}
            </strong>
          </div>
        </section>
      ))}
      <button
        type="button"
        className="outline add-product-line"
        onClick={() =>
          setLines((old) => [
            ...old,
            blank(Math.max(...old.map((l) => l.key)) + 1),
          ])
        }
      >
        <Icon name="plus" size={17} /> Add another product
      </button>
      <div className="credit-summary">
        <div>
          <small>Your input purchase cost</small>
          <strong>{money(cost)}</strong>
        </div>
        <div>
          <small>Total credit to farmer</small>
          <strong>{money(total)}</strong>
        </div>
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <div className="modal-actions">
        <button type="button" className="outline" onClick={close}>
          Cancel
        </button>
        <button type="submit" className="primary">
          <Icon name="check" size={16} /> Save{" "}
          {lines.length > 1 ? `${lines.length} products & ` : ""}credit
        </button>
      </div>
    </form>
  );
}
type PurchaseDraft = {
  key: number;
  name: string;
  brand: string;
  category: string;
  batch: string;
  unit: string;
  quantity: string;
  price: string;
  expiry: string;
};
const purchaseBlank = (key: number): PurchaseDraft => ({
  key,
  name: "",
  brand: "",
  category: "Fertilizers",
  batch: "",
  unit: "bags",
  quantity: "1",
  price: "",
  expiry: "",
});
export function PurchaseEditor({
  onSave,
  close,
}: {
  onSave: (lines: CreditLine[], paid: boolean) => void;
  close: () => void;
}) {
  const [lines, setLines] = useState([purchaseBlank(1)]),
    [paid, setPaid] = useState(false),
    [error, setError] = useState("");
  const update = (key: number, patch: Partial<PurchaseDraft>) =>
    setLines((old) => old.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const field = (
    l: PurchaseDraft,
    label: string,
    key: keyof PurchaseDraft,
    type = "text",
    required = true,
  ) => (
    <label className="field">
      {label}
      <input
        type={type}
        required={required}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.01" : undefined}
        value={l[key]}
        onChange={(e) => update(l.key, { [key]: e.target.value })}
      />
    </label>
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        if (
          lines.some(
            (l) =>
              Number(l.quantity) <= 0 ||
              !l.name.trim() ||
              (!fractionalUnit(l.unit) &&
                !Number.isInteger(Number(l.quantity))),
          )
        ) {
          setError(
            "Enter product names and positive quantities using the selected units.",
          );
          return;
        }
        onSave(
          lines.map((l) => ({
            productId: null,
            name: l.name.trim(),
            brand: l.brand,
            category: l.category,
            batch: l.batch,
            unit: l.unit,
            quantity: Number(l.quantity),
            purchasePrice: Number(l.price),
            sellingPrice: 0,
            discountedPrice: null,
            total: round(Number(l.quantity) * Number(l.price)),
            expiry: l.expiry,
          })),
          paid,
        );
      }}
    >
      <div className="info-note">
        Supplier purchases are recorded independently. Add or restock inventory
        separately.
      </div>
      {lines.map((l, i) => (
        <section className="credit-line-editor" key={l.key}>
          <div className="line-editor-heading">
            <strong>Product {i + 1}</strong>
            {lines.length > 1 && (
              <button
                type="button"
                className="icon-button"
                aria-label={`Remove purchase product ${i + 1}`}
                onClick={() =>
                  setLines((old) => old.filter((x) => x.key !== l.key))
                }
              >
                <Icon name="trash" size={16} />
              </button>
            )}
          </div>
          <div className="form-grid">
            {field(l, "Product name", "name")}
            {field(l, "Brand", "brand")}
          </div>
          <div className="form-grid three-fields">
            <label className="field">
              Category
              <select
                value={l.category}
                onChange={(e) => update(l.key, { category: e.target.value })}
              >
                {["Fertilizers", "Pesticides", "Seeds"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            {field(l, "Quantity", "quantity", "number")}
            {field(l, "Unit", "unit")}
          </div>
          <div className="form-grid three-fields">
            {field(l, "Purchase price / unit (₹)", "price", "number")}
            {field(l, "Batch number", "batch", "text", false)}
            {field(l, "Expiry (optional)", "expiry", "date", false)}
          </div>
          <div className="credit-line-total">
            <span>Line total</span>
            <strong>{money(Number(l.quantity) * Number(l.price))}</strong>
          </div>
        </section>
      ))}
      <button
        type="button"
        className="outline"
        onClick={() =>
          setLines((old) => [
            ...old,
            purchaseBlank(Math.max(...old.map((l) => l.key)) + 1),
          ])
        }
      >
        <Icon name="plus" size={16} /> Add another product
      </button>
      <div className="balance-strip">
        <span>Total purchase value</span>
        <strong>
          {money(
            lines.reduce((s, l) => s + Number(l.quantity) * Number(l.price), 0),
          )}
        </strong>
      </div>
      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={paid}
          onChange={(e) => setPaid(e.target.checked)}
        />{" "}
        Mark this purchase fully Paid
      </label>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <div className="modal-actions">
        <button type="button" className="outline" onClick={close}>
          Cancel
        </button>
        <button type="submit" className="primary">
          Save purchase
        </button>
      </div>
    </form>
  );
}
