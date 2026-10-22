"use client";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useRef, useState, type FormEvent } from "react";
import { DemoContext } from "./demo-context";
import { Avatar, Empty, ModeBadge, DatePicker, SearchSelect } from "./demo-ui";
import {
  DAY,
  seed,
  PROFILE_STORAGE_KEY,
  money,
  round,
  dateLabel,
  createInvoice,
  fractionalUnit,
  eventOrder,
  nextRecordId,
  nextDemoTime,
  type Modal,
  type Farmer,
  type Product,
  type CreditLine,
  type InterestEntry,
} from "./demo-data";
import { Icon } from "./icons";
import { CreditEditor, PurchaseEditor } from "./credit-editor";
import {
  BillDocument,
  InventoryDocument,
  BusinessDocument,
  SupplierDocument,
  LineTable,
  PrintButton,
} from "./reports";

export function DemoModal({
  modal,
  close,
}: {
  modal: NonNullable<Modal>;
  close: () => void;
}) {
  const { data, change, notify, date, open } = useContext(DemoContext);
  const ref = useRef<HTMLDialogElement>(null);
  const f = data.farmers.find((f) => f.id === modal.id),
    p = data.products.find((p) => p.id === modal.id),
    supplier = data.suppliers.find((s) => s.id === modal.id),
    invoice = data.invoices.find((i) => i.id === modal.id);
  const [includeHistory, setIncludeHistory] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [historyTab, setHistoryTab] = useState("Transactions");
  const [visible, setVisible] = useState(8);
  const [aadhaar, setAadhaar] = useState(f?.aadhaar || "");
  const [farmerQuery, setFarmerQuery] = useState("");
  const [farmerId, setFarmerId] = useState<number | null>(null);
  const [from, setFrom] = useState(date.slice(0, 7) + "-01"),
    [to, setTo] = useState(date),
    [reportReady, setReportReady] = useState(false);
  const isReport =
    ["invoice", "inventoryReport", "supplierReport"].includes(modal.kind) ||
    (modal.kind === "businessReport" && reportReady);
  const wide = isReport || ["credit", "purchase"].includes(modal.kind);
  const isArchiveAction =
    modal.kind.startsWith("delete") || modal.kind.startsWith("restore");
  const titles: Record<string, string> = {
    farmer: f ? "Edit farmer" : "Add farmer",
    pay: "Record payment",
    credit: "Give farmer credit",
    history: "Farmer account",
    restock: "Restock product",
    product: p ? "Edit product" : "Add a new product",
    productDetails: "Product details",
    supplier: supplier ? "Edit supplier" : "Add a supplier",
    purchase: "Record supplier purchase",
    supplierHistory: "Supplier account",
    activity: "Farmer activity",
    stockActivity: "Stock activity",
    lowstock: "Low-stock alerts",
    bill: "Create farmer bill",
    invoice: "Farmer account bill",
    inventoryReport: "Product report",
    businessReport: "Business report",
    supplierReport: "Supplier history report",
    reset: "Reset demo data",
    deleteFarmer: "Delete farmer",
    deleteProduct: "Delete product",
    deleteSupplier: "Delete supplier",
    restoreFarmer: "Restore farmer",
    restoreProduct: "Restore product",
    restoreSupplier: "Restore supplier",
  };
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  const finish = (message = "Saved successfully.") => {
    notify(message);
    close();
  };
  const now = () => nextDemoTime(data);
  function saveBill(farmer: Farmer) {
    const bill = createInvoice(data, farmer, includeHistory);
    change((s) => ({ ...s, invoices: [bill, ...s.invoices] }));
    notify(`Bill OMS-${bill.id} saved to Invoices.`);
    open({ kind: "invoice", id: bill.id });
  }
  function saveCredit(lines: CreditLine[]) {
    if (!f || f.archived) return;
    const total = round(lines.reduce((s, l) => s + l.total, 0));
    const id = nextRecordId(data),
      time = now();
    change((s) => ({
      ...s,
      farmers: s.farmers.map((old) =>
        old.id === f.id
          ? {
              ...old,
              principal: round(old.principal + total),
              due: round(old.due + total),
            }
          : old,
      ),
      products: s.products.map((old) => ({
        ...old,
        stock: round(
          old.stock -
            lines
              .filter((l) => l.productId === old.id)
              .reduce((n, l) => n + l.quantity, 0),
        ),
      })),
      events: [
        {
          id,
          farmer: f.id,
          name: f.name,
          type: "Credit",
          amount: total,
          date: DAY,
          time,
          detail: `${lines.length} products credited`,
          lines,
          dueBefore: f.due,
          dueAfter: round(f.due + total),
        },
        ...s.events,
      ],
      stockMovements: [
        ...lines
          .filter((l) => l.productId !== null)
          .map((l, index) => ({
            id: id + index,
            product: l.productId!,
            date: DAY,
            time,
            direction: "Out" as const,
            quantity: l.quantity,
            reason: `Credit sale to ${f.name}`,
          })),
        ...s.stockMovements,
      ],
    }));
    finish("Products credited. Farmer account and linked stock updated.");
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget),
      text = (key: string) => String(form.get(key) || "").trim(),
      number = (key: string) => Number(form.get(key)),
      id = nextRecordId(data);
    if (modal.kind === "farmer") {
      if (!text("name") || !text("phone")) {
        setError("Farmer name and phone are required.");
        return;
      }
      const compound = f ? form.get("compound") === "on" : false;
      const capitalized = f && compound && !f.compound ? f.interest : 0;
      const farmer: Farmer = {
        id: f?.id || id,
        name: text("name"),
        phone: text("phone"),
        address: text("address"),
        principal: round((f?.principal || 0) + capitalized),
        interest: capitalized ? 0 : f?.interest || 0,
        due: f?.due || 0,
        rate: number("rate"),
        compound,
        created: f?.created || DAY,
        archived: f?.archived || false,
        ...(aadhaar ? { aadhaar } : {}),
      };
      const history: InterestEntry[] = [];
      if (f && (f.rate !== farmer.rate || f.compound !== compound)) {
        history.push({
          id,
          farmer: f.id,
          date: DAY,
          type: "Settings",
          oldRate: f.rate,
          newRate: farmer.rate,
          oldCompound: f.compound,
          newCompound: compound,
          amount: 0,
          from: DAY,
          to: DAY,
          note: "Interest settings changed by proprietor; applies prospectively",
        });
        if (capitalized)
          history.push({
            id: id + 1,
            farmer: f.id,
            date: DAY,
            type: "Capitalization",
            oldRate: f.rate,
            newRate: farmer.rate,
            oldCompound: false,
            newCompound: true,
            amount: capitalized,
            from: DAY,
            to: DAY,
            note: "Existing unpaid interest capitalized once on starting compound mode",
          });
      }
      change((s) => ({
        ...s,
        farmers: f
          ? s.farmers.map((old) => (old.id === f.id ? farmer : old))
          : [farmer, ...s.farmers],
        interestHistory: [...s.interestHistory, ...history],
      }));
    } else if (modal.kind === "pay" && f) {
      const value = Number(amount);
      if (!Number.isFinite(value) || value <= 0 || value > f.due) {
        setError("Enter a positive payment no greater than the total due.");
        return;
      }
      const interestPaid = round(Math.min(value, f.interest)),
        principalPaid = round(value - interestPaid),
        remaining = round(f.due - value);
      change((s) => ({
        ...s,
        farmers: s.farmers.map((old) =>
          old.id === f.id
            ? {
                ...old,
                principal:
                  remaining === 0
                    ? 0
                    : round(Math.max(0, old.principal - principalPaid)),
                interest:
                  remaining === 0
                    ? 0
                    : round(Math.max(0, old.interest - interestPaid)),
                due: remaining,
              }
            : old,
        ),
        events: [
          {
            id,
            farmer: f.id,
            name: f.name,
            type: "Payment",
            amount: value,
            date: DAY,
            time: now(),
            detail:
              remaining === 0
                ? "Account settled in full"
                : "Partial payment received",
            lines: [],
            dueBefore: f.due,
            dueAfter: remaining,
            interestPaid,
            principalPaid,
          },
          ...s.events,
        ],
      }));
    } else if (modal.kind === "restock" && p) {
      const qty = Number(amount);
      if (
        qty <= 0 ||
        !Number.isFinite(qty) ||
        (!fractionalUnit(p.unit) && !Number.isInteger(qty))
      ) {
        setError(
          `Enter a positive ${fractionalUnit(p.unit) ? "quantity" : "whole quantity"} in ${p.unit}.`,
        );
        return;
      }
      change((s) => ({
        ...s,
        products: s.products.map((old) =>
          old.id === p.id ? { ...old, stock: round(old.stock + qty) } : old,
        ),
        stockMovements: [
          {
            id,
            product: p.id,
            date: DAY,
            time: now(),
            direction: "In",
            quantity: qty,
            reason: "Manual restock by the proprietor",
          },
          ...s.stockMovements,
        ],
      }));
    } else if (modal.kind === "product") {
      if (!text("name") || !text("unit")) {
        setError("Name and unit are required.");
        return;
      }
      if (
        data.products.some(
          (old) =>
            old.id !== p?.id &&
            old.name.trim().toLowerCase() === text("name").toLowerCase(),
        )
      ) {
        setError(
          "A product with this name already exists, including archived records. Use a unique product name or restore the existing product.",
        );
        return;
      }
      const product: Product = {
        id: p?.id || id,
        name: text("name"),
        brand: text("brand"),
        category: text("category"),
        unit: text("unit"),
        stock: number("stock"),
        purchasePrice: number("purchasePrice"),
        price: number("price"),
        batch: text("batch"),
        expiry: text("expiry"),
        archived: p?.archived || false,
      };
      if (!fractionalUnit(product.unit) && !Number.isInteger(product.stock)) {
        setError(`Stock must use whole ${product.unit}.`);
        return;
      }
      const delta = round(product.stock - (p?.stock || 0));
      if (p && delta !== 0 && !text("reason")) {
        setError("Enter a reason when correcting the stock quantity.");
        return;
      }
      change((s) => ({
        ...s,
        products: p
          ? s.products.map((old) => (old.id === p.id ? product : old))
          : [product, ...s.products],
        stockMovements:
          delta !== 0
            ? [
                {
                  id,
                  product: product.id,
                  date: DAY,
                  time: now(),
                  direction: delta > 0 ? "In" : "Out",
                  quantity: Math.abs(delta),
                  reason: p
                    ? text("reason")
                    : "Initial product stock entered by proprietor",
                },
                ...s.stockMovements,
              ]
            : s.stockMovements,
      }));
    } else if (modal.kind === "supplier") {
      if (!text("name") || !text("phone")) {
        setError("Supplier name and phone are required.");
        return;
      }
      const record = {
        id: supplier?.id || id,
        name: text("name"),
        phone: text("phone"),
        address: text("address"),
        archived: supplier?.archived || false,
      };
      change((s) => ({
        ...s,
        suppliers: supplier
          ? s.suppliers.map((old) => (old.id === supplier.id ? record : old))
          : [record, ...s.suppliers],
      }));
    } else if (modal.kind === "bill") {
      const farmer = data.farmers.find((f) => f.id === farmerId);
      if (!farmer) {
        setError("Choose a farmer from the suggestions.");
        return;
      }
      saveBill(farmer);
      return;
    }
    finish(
      modal.kind === "pay"
        ? "Payment received. Farmer account updated."
        : modal.kind === "restock"
          ? "Stock added. Inventory and movement history updated."
          : "Saved successfully.",
    );
  }
  const field = (
    label: string,
    name: string,
    value = "",
    type = "text",
    required = true,
  ) => (
    <label className="field">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={value}
        required={required}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.01" : undefined}
      />
    </label>
  );
  function archiveAction() {
    const restore = modal.kind.startsWith("restore"),
      archived = !restore;
    change((s) => ({
      ...s,
      farmers: modal.kind.endsWith("Farmer")
        ? s.farmers.map((old) =>
            old.id === modal.id
              ? {
                  ...old,
                  archived,
                  ...(!restore ? { aadhaar: undefined } : {}),
                }
              : old,
          )
        : s.farmers,
      products: modal.kind.endsWith("Product")
        ? s.products.map((old) =>
            old.id === modal.id ? { ...old, archived } : old,
          )
        : s.products,
      suppliers: modal.kind.endsWith("Supplier")
        ? s.suppliers.map((old) =>
            old.id === modal.id ? { ...old, archived } : old,
          )
        : s.suppliers,
    }));
    finish(
      restore
        ? "Record restored to the active list."
        : "Record archived. Financial history and saved bills retained.",
    );
  }
  async function uploadPhoto(file: File | undefined) {
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPEG, PNG or WebP image.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("Use an image smaller than 25 MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const image = new window.Image();
      image.src = url;
      await image.decode();
      const scale = Math.min(1, 1000 / Math.max(image.width, image.height)),
        canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      setAadhaar(canvas.toDataURL("image/jpeg", 0.72));
    } catch {
      setError("This image could not be opened. Choose another file.");
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  const accountEvents = f
    ? data.events
        .filter((e) => e.farmer === f.id)
        .sort((a, b) => eventOrder(b) - eventOrder(a))
    : [];
  const interestEntries = f
    ? data.interestHistory
        .filter((e) => e.farmer === f.id)
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
    : [];
  const isSimpleForm = [
    "farmer",
    "pay",
    "restock",
    "product",
    "supplier",
    "bill",
  ].includes(modal.kind);
  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      className={`modal ${wide ? "wide-modal" : ""} ${isReport ? "report-modal" : ""} ${modal.kind === "supplierHistory" ? "supplier-account" : ""} ${modal.kind === "history" ? "farmer-account" : ""}`}
      data-report={isReport ? "true" : undefined}
      onCancel={close}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const bounds = e.currentTarget.getBoundingClientRect();
        const outside = e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom;
        if (outside && !isSimpleForm && !["credit", "purchase"].includes(modal.kind)) close();
      }}
    >
      <div className="sheet-handle" />
      <div className="modal-heading">
        <div>
          <h2 id="dialog-title">{titles[modal.kind]}</h2>
        </div>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={close}
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="modal-content">
        {["pay", "credit", "history"].includes(modal.kind) && f && (
          <div className="modal-person">
            <Avatar name={f.name} id={f.id} />
            <div>
              <strong>{f.name}</strong>
              <small>{f.phone}</small>
              <ModeBadge compound={f.compound} />
            </div>
            <span className={`status ${f.due ? "due" : "clear"}`}>
              {f.archived ? "Archived · " : ""}
              {f.due ? "Due" : "Clear"}
            </span>
          </div>
        )}
        {isSimpleForm && (
          <form onSubmit={submit}>
            {modal.kind === "farmer" && (
              <>
                <div className="form-grid">
                  {field("Farmer name", "name", f?.name)}
                  {field("Phone number", "phone", f?.phone, "tel")}
                </div>
                <label className="field">
                  Address (optional)
                  <textarea
                    name="address"
                    defaultValue={f?.address}
                    rows={3}
                    placeholder="House no., village, mandal, district, PIN code"
                  />
                </label>
                {field(
                  "Monthly interest rate (%)",
                  "rate",
                  String(f?.rate ?? 2),
                  "number",
                )}
                {f && (
                  <label className="toggle-field">
                    <span>
                      <strong>Monthly compounding</strong>
                      <small>Visible on farmer cards and payment screens</small>
                    </span>
                    <input
                      type="checkbox"
                      name="compound"
                      defaultChecked={f.compound}
                    />
                  </label>
                )}
                <div className="aadhaar-field">
                  <div className="section-label">
                    <strong>Aadhaar photo</strong>
                    <span>Optional · local demo preview</span>
                  </div>
                  {aadhaar ? (
                    <div className="aadhaar-preview">
                      <Image
                        src={aadhaar}
                        alt="Aadhaar image preview"
                        width={800}
                        height={500}
                        unoptimized
                      />
                      <button
                        type="button"
                        className="outline small"
                        onClick={() => setAadhaar("")}
                      >
                        <Icon name="trash" size={14} /> Remove image
                      </button>
                    </div>
                  ) : (
                    <label className="upload-area">
                      <Icon name="file" size={27} />
                      <strong>Upload an Aadhaar card photo</strong>
                      <span>
                        JPEG, PNG or WebP · a sample image is enough for the
                        demo
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => uploadPhoto(e.target.files?.[0])}
                      />
                    </label>
                  )}
                  {aadhaar && (
                    <label className="text-button replace-photo">
                      Replace photo
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => uploadPhoto(e.target.files?.[0])}
                      />
                    </label>
                  )}
                </div>
                <div className="info-note">
                  {f
                    ? "Changes apply from today. Earlier rates and bill snapshots stay in history."
                    : "A new account starts Clear and uses simple interest by default."}
                </div>
              </>
            )}
            {modal.kind === "pay" && f && (
              <>
                <div className="account-breakdown">
                  <div>
                    <small>Unpaid principal</small>
                    <strong>{money(f.principal)}</strong>
                  </div>
                  <div>
                    <small>Unpaid interest</small>
                    <strong>{money(f.interest)}</strong>
                  </div>
                </div>
                <div className="balance-strip">
                  <span>Total due · {dateLabel(DAY)}</span>
                  <strong>{money(f.due)}</strong>
                </div>
                <label className="field">
                  Amount received (₹)
                  <input
                    type="number"
                    min="0.01"
                    max={f.due}
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </label>
                <div className="payment-shortcuts">
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setAmount(String(f.due))}
                  >
                    Settle full amount <Icon name="arrow" size={14} />
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => open({ kind: "farmer", id: f.id })}
                  >
                    Change interest settings
                  </button>
                </div>
                <div className="payment-allocation">
                  <span>
                    Interest payment:{" "}
                    {money(Math.min(Number(amount), f.interest))}
                  </span>
                  <span>
                    Principal payment:{" "}
                    {money(Math.max(0, Number(amount) - f.interest))}
                  </span>
                </div>
                <div className="balance-strip remaining">
                  <span>Remaining due</span>
                  <strong>{money(Math.max(0, f.due - Number(amount)))}</strong>
                </div>
                {Number(amount) === f.due && (
                  <div className="info-note positive">
                    This payment will clear the account.
                  </div>
                )}
              </>
            )}
            {modal.kind === "restock" && p && (
              <>
                <div className="modal-person">
                  <div className="round-icon amber">
                    <Icon name="leaf" />
                  </div>
                  <div>
                    <strong>{p.name}</strong>
                    <small>
                      {p.brand} · Batch {p.batch}
                    </small>
                  </div>
                </div>
                <div className="balance-strip">
                  <span>Current stock</span>
                  <strong>
                    {p.stock} {p.unit}
                  </strong>
                </div>
                <label className="field">
                  Quantity to add ({p.unit})
                  <input
                    type="number"
                    min={fractionalUnit(p.unit) ? "0.01" : "1"}
                    step={fractionalUnit(p.unit) ? "0.01" : "1"}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 20"
                  />
                </label>
                <div className="balance-strip">
                  <span>New stock</span>
                  <strong>
                    {round(p.stock + Number(amount))} {p.unit}
                  </strong>
                </div>
                <div className="info-note">
                  This adds stock to the existing batch. Add a separate,
                  uniquely named product when the batch is different.
                </div>
              </>
            )}
            {modal.kind === "product" && (
              <>
                <div className="form-grid">
                  {field("Product name (unique)", "name", p?.name)}
                  {field("Brand", "brand", p?.brand)}
                </div>
                <div className="form-grid">
                  <label className="field">
                    Category
                    <select
                      name="category"
                      defaultValue={p?.category || "Fertilizers"}
                    >
                      {["Fertilizers", "Pesticides", "Seeds"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  {field(
                    "Unit (bags, packets, bottles, kg)",
                    "unit",
                    p?.unit || "bags",
                  )}
                </div>
                <div className="form-grid three-fields">
                  {field(
                    "Quantity in stock",
                    "stock",
                    String(p?.stock ?? 0),
                    "number",
                  )}
                  {field(
                    "Purchase price / unit (₹)",
                    "purchasePrice",
                    p ? String(p.purchasePrice) : "",
                    "number",
                  )}
                  {field(
                    "Selling price / unit (₹)",
                    "price",
                    p ? String(p.price) : "",
                    "number",
                  )}
                </div>
                <div className="form-grid">
                  {field(
                    "Batch number (optional)",
                    "batch",
                    p?.batch,
                    "text",
                    false,
                  )}
                  {field(
                    "Expiry date (optional)",
                    "expiry",
                    p?.expiry,
                    "date",
                    false,
                  )}
                </div>
                {p &&
                  field(
                    "Reason (required for a stock correction)",
                    "reason",
                    "",
                    "text",
                    false,
                  )}
                <div className="info-note">
                  Each product has a unique name. Prices are per selected unit.
                  Editing stock records a dated adjustment.
                </div>
              </>
            )}
            {modal.kind === "supplier" && (
              <>
                {field("Supplier name", "name", supplier?.name)}
                {field("Phone number", "phone", supplier?.phone, "tel")}
                <label className="field">
                  Address (optional)
                  <textarea
                    name="address"
                    defaultValue={supplier?.address}
                    rows={3}
                  />
                </label>
              </>
            )}
            {modal.kind === "bill" && (
              <>
                <SearchSelect
                  label="Farmer name or phone"
                  placeholder="Start typing a farmer’s name or phone…"
                  value={farmerQuery}
                  onChange={(v) => {
                    setFarmerQuery(v);
                    setFarmerId(null);
                  }}
                  selected={farmerId}
                  items={data.farmers.map((f) => ({
                    id: f.id,
                    label: `${f.name} · ${f.phone}`,
                    detail: (
                      <>
                        <span>{f.address}</span>
                        <span>
                          {money(f.due)} due ·{" "}
                          {f.archived
                            ? "Archived account"
                            : f.compound
                              ? "Compound interest"
                              : "Simple interest"}
                        </span>
                      </>
                    ),
                  }))}
                  onSelect={(id) => {
                    const f = data.farmers.find((f) => f.id === id)!;
                    setFarmerId(id);
                    setFarmerQuery(f.name);
                  }}
                  required
                />
                <label className="checkbox-field bill-history-choice">
                  <input type="checkbox" checked={includeHistory} onChange={(e) => setIncludeHistory(e.target.checked)} /> With history
                </label>
                <div className="info-note">The bill includes products and the current balance. Select With history to add the complete account history.</div>
              </>
            )}
            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}
            <div className="modal-actions">
              <button type="button" className="outline" onClick={close}>
                Cancel
              </button>
              <button className="primary" type="submit">
                <Icon name="check" size={16} />
                {modal.kind === "pay"
                  ? "Save payment"
                  : modal.kind === "bill"
                    ? "Create bill"
                    : "Save changes"}
              </button>
            </div>
          </form>
        )}
        {modal.kind === "credit" && f && !f.archived && (
          <CreditEditor onSave={saveCredit} close={close} />
        )}
        {modal.kind === "purchase" && supplier && !supplier.archived && (
          <>
            <div className="modal-person">
              <div className="round-icon amber">
                <Icon name="truck" />
              </div>
              <div>
                <strong>{supplier.name}</strong>
                <small>{supplier.phone}</small>
              </div>
            </div>
            <PurchaseEditor
              close={close}
              onSave={(lines, paid) => {
                const id = nextRecordId(data);
                change((s) => ({
                  ...s,
                  purchases: [
                    {
                      id,
                      supplier: supplier.id,
                      name: supplier.name,
                      amount: round(lines.reduce((s, l) => s + l.total, 0)),
                      date: DAY,
                      paid,
                      detail: `${lines.length} products purchased`,
                      lines,
                      statusHistory: [{ date: DAY, paid }],
                    },
                    ...s.purchases,
                  ],
                }));
                finish("Supplier purchase recorded. Inventory stays separate.");
              }}
            />
          </>
        )}
        {modal.kind === "history" && f && (
          <>
            <div className="account-breakdown">
              <div>
                <small>Unpaid principal</small>
                <strong>{money(f.principal)}</strong>
              </div>
              <div>
                <small>Unpaid interest</small>
                <strong>{money(f.interest)}</strong>
              </div>
              <div>
                <small>Total due</small>
                <strong>{money(f.due)}</strong>
              </div>
            </div>
            <div className="filter-tabs history-tabs">
              {["Transactions", "Interest history", "Farmer details"].map(
                (t) => (
                  <button
                    key={t}
                    className={t === historyTab ? "selected" : ""}
                    aria-pressed={t === historyTab}
                    onClick={() => {
                      setHistoryTab(t);
                      setVisible(8);
                    }}
                  >
                    {t}
                  </button>
                ),
              )}
            </div>
            {historyTab === "Transactions" ? (
              <>
                {accountEvents.slice(0, visible).map((e) => (
                  <details className="transaction-detail" key={e.id}>
                    <summary>
                      <div
                        className={`transaction-icon ${e.type === "Payment" ? "green" : "amber"}`}
                      >
                        <Icon
                          name={e.type === "Payment" ? "wallet" : "leaf"}
                          size={18}
                        />
                      </div>
                      <div>
                        <strong>
                          {e.type === "Credit"
                            ? `${e.lines.length} products credited`
                            : "Payment received"}
                        </strong>
                        <small>
                          {dateLabel(e.date)} · {e.time}
                        </small>
                      </div>
                      <strong
                        className={
                          e.type === "Payment" ? "positive" : "negative"
                        }
                      >
                        {money(e.amount)}
                      </strong>
                      <Icon name="chevron" size={15} />
                    </summary>
                    <div className="transaction-content">
                      {e.type === "Credit" ? (
                        <LineTable lines={e.lines} showCost />
                      ) : (
                        <div className="payment-allocation">
                          <span>
                            Interest paid {money(e.interestPaid || 0)}
                          </span>
                          <span>
                            Principal paid {money(e.principalPaid || 0)}
                          </span>
                        </div>
                      )}
                      <div className="payment-allocation">
                        <span>Due before {money(e.dueBefore)}</span>
                        <span>Due after {money(e.dueAfter)}</span>
                      </div>
                    </div>
                  </details>
                ))}
                {!accountEvents.length && <Empty text="No transactions yet." />}
                {visible < accountEvents.length && (
                  <button
                    className="outline full-width"
                    onClick={() => setVisible((v) => v + 8)}
                  >
                    Load more transactions ({accountEvents.length - visible}{" "}
                    remaining)
                  </button>
                )}
              </>
            ) : historyTab === "Interest history" ? (
              <>
                <div className="info-note">
                  Current rate: {f.rate}% per 30 days ·{" "}
                  {f.compound ? "Monthly compound" : "Simple"}. Every rate or
                  mode change applies from its recorded date.
                </div>
                {interestEntries.slice(0, visible).map((e) => (
                  <div className="interest-history-item" key={e.id}>
                    <div
                      className={`transaction-icon ${e.type === "Settings" ? "rose" : "amber"}`}
                    >
                      <Icon
                        name={e.type === "Settings" ? "reset" : "chart"}
                        size={16}
                      />
                    </div>
                    <div>
                      <strong>
                        {e.type === "Settings"
                          ? "Interest settings changed"
                          : e.type === "Accrual"
                            ? "Interest accrued"
                            : "Interest capitalized"}
                      </strong>
                      <small>
                        {e.type === "Accrual"
                          ? `${dateLabel(e.from)} – ${dateLabel(e.to)}`
                          : dateLabel(e.date)}
                      </small>
                      <p>
                        {e.type === "Settings"
                          ? `${e.oldRate}% ${e.oldCompound ? "Compound" : "Simple"} → ${e.newRate}% ${e.newCompound ? "Compound" : "Simple"}`
                          : `${e.newRate}% · ${e.newCompound ? "Compound" : "Simple"}`}
                      </p>
                      <p>{e.note}</p>
                    </div>
                    {e.type !== "Settings" && (
                      <strong>{money(e.amount)}</strong>
                    )}
                  </div>
                ))}
                {visible < interestEntries.length && (
                  <button
                    className="outline full-width"
                    onClick={() => setVisible((v) => v + 8)}
                  >
                    Load more interest history
                  </button>
                )}
              </>
            ) : (
              <>
                <dl className="profile-details">
                  <div>
                    <dt>Phone</dt>
                    <dd>{f.phone}</dd>
                  </div>
                  <div>
                    <dt>Address</dt>
                    <dd>{f.address || "Not added"}</dd>
                  </div>
                  <div>
                    <dt>Account created</dt>
                    <dd>{dateLabel(f.created)}</dd>
                  </div>
                  <div>
                    <dt>Account status</dt>
                    <dd>
                      {f.archived ? "Archived · " : ""}
                      {f.due ? "Due" : "Clear"}
                    </dd>
                  </div>
                  <div>
                    <dt>Interest mode</dt>
                    <dd>
                      <ModeBadge compound={f.compound} />
                    </dd>
                  </div>
                </dl>
                {f.aadhaar ? (
                  <div className="aadhaar-preview">
                    <Image
                      src={f.aadhaar}
                      alt="Farmer Aadhaar preview"
                      width={800}
                      height={500}
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="info-note">
                    No Aadhaar photo added. You can add one from Edit farmer.
                  </div>
                )}
              </>
            )}
            <div className="modal-actions farmer-account-actions">
              <label className="checkbox-field">
                <input type="checkbox" checked={includeHistory} onChange={(e) => setIncludeHistory(e.target.checked)} /> With history
              </label>
              <button
                className="outline"
                onClick={() => open({ kind: "farmer", id: f.id })}
              >
                Edit farmer
              </button>
              <button className="primary" onClick={() => saveBill(f)}>
                <Icon name="file" size={16} /> Generate bill
              </button>
            </div>
          </>
        )}
        {modal.kind === "activity" && (
          <>
            <div className="info-note">
              {dateLabel(date)} · Click a farmer to open their account, product
              details, and full history.
            </div>
            {data.events
              .filter((e) => e.date === date)
              .sort((a, b) => eventOrder(b) - eventOrder(a))
              .slice(0, visible)
              .map((e) => (
                <button
                  className="history-row clickable-history"
                  key={e.id}
                  onClick={() => open({ kind: "history", id: e.farmer })}
                >
                  <Avatar name={e.name} id={e.farmer} />
                  <div>
                    <strong>{e.name}</strong>
                    <small>
                      {e.type} · {e.time}
                    </small>
                    <p>
                      {e.type === "Credit"
                        ? e.lines
                            .map((l) => `${l.name} × ${l.quantity} ${l.unit}`)
                            .join("; ")
                        : e.detail}
                    </p>
                  </div>
                  <strong
                    className={e.type === "Payment" ? "positive" : "negative"}
                  >
                    {money(e.amount)}
                  </strong>
                  <Icon name="chevron" size={15} />
                </button>
              ))}
            {!data.events.some((e) => e.date === date) && (
              <Empty text="No activity for the selected date." />
            )}
            {visible < data.events.filter((e) => e.date === date).length && (
              <button
                className="outline full-width"
                onClick={() => setVisible((v) => v + 12)}
              >
                Load more activity
              </button>
            )}
          </>
        )}
        {modal.kind === "lowstock" && (
          <>
            {data.products
              .filter((p) => !p.archived && p.stock < 10)
              .map((p) => (
                <button
                  className="history-row clickable-history"
                  key={p.id}
                  onClick={() => open({ kind: "restock", id: p.id })}
                >
                  <div className="round-icon amber">
                    <Icon name="leaf" />
                  </div>
                  <div>
                    <strong>{p.name}</strong>
                    <small>
                      {p.brand} · {p.batch}
                    </small>
                  </div>
                  <strong className="negative">
                    {p.stock} {p.unit}
                  </strong>
                  <Icon name="plus" size={16} />
                </button>
              ))}
            <Link
              className="primary full-width"
              href="/products"
              onClick={close}
            >
              Open inventory <Icon name="arrow" size={16} />
            </Link>
          </>
        )}
        {modal.kind === "stockActivity" && (
          <>
            <div className="info-note">
              {dateLabel(date)} · Stock additions and linked farmer credits.
              Quantities retain their own units.
            </div>
            {data.stockMovements
              .filter((m) => m.date === date)
              .slice(0, visible)
              .map((m) => {
                const product = data.products.find((p) => p.id === m.product);
                return (
                  <div className="history-row" key={m.id}>
                    <div
                      className={`round-icon ${m.direction === "In" ? "amber" : "rose"}`}
                    >
                      <Icon name="leaf" />
                    </div>
                    <div>
                      <strong>{product?.name || "Archived product"}</strong>
                      <small>
                        {m.time} · {m.reason}
                      </small>
                    </div>
                    <strong
                      className={m.direction === "In" ? "positive" : "negative"}
                    >
                      {m.direction === "In" ? "+" : "−"}
                      {m.quantity} {product?.unit}
                    </strong>
                  </div>
                );
              })}
            {visible <
              data.stockMovements.filter((m) => m.date === date).length && (
              <button
                className="outline full-width"
                onClick={() => setVisible((v) => v + 12)}
              >
                Load more stock movements
              </button>
            )}
            {!data.stockMovements.some((m) => m.date === date) && (
              <Empty text="No stock movements on this date." />
            )}
          </>
        )}
        {modal.kind === "productDetails" && p && (
          <>
            <div className="modal-person">
              <div className="round-icon amber">
                <Icon name="leaf" />
              </div>
              <div>
                <strong>{p.name}</strong>
                <small>
                  {p.brand} · {p.category}
                </small>
              </div>
              <span className={`status ${p.stock < 10 ? "due" : "clear"}`}>
                {p.archived
                  ? "Archived"
                  : p.stock < 10
                    ? "Low stock"
                    : "In stock"}
              </span>
            </div>
            <div className="account-breakdown">
              <div>
                <small>Purchase / unit</small>
                <strong>{money(p.purchasePrice)}</strong>
              </div>
              <div>
                <small>Selling / unit</small>
                <strong>{money(p.price)}</strong>
              </div>
              <div>
                <small>Available stock</small>
                <strong>
                  {p.stock} {p.unit}
                </strong>
              </div>
            </div>
            <dl className="profile-details">
              <div>
                <dt>Batch</dt>
                <dd>{p.batch || "Not specified"}</dd>
              </div>
              <div>
                <dt>Expiry</dt>
                <dd>{p.expiry ? dateLabel(p.expiry) : "Not specified"}</dd>
              </div>
              <div>
                <dt>Quantity unit</dt>
                <dd>
                  {p.unit} ·{" "}
                  {fractionalUnit(p.unit)
                    ? "Fractional quantities allowed"
                    : "Whole units"}
                </dd>
              </div>
            </dl>
            <h3 className="report-section-title">Stock history</h3>
            {data.stockMovements
              .filter((m) => m.product === p.id)
              .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
              .slice(0, visible)
              .map((m) => (
                <div className="history-row" key={m.id}>
                  <div>
                    <strong>
                      {m.direction === "In" ? "Stock added" : "Stock out"}
                    </strong>
                    <small>
                      {dateLabel(m.date)} · {m.time}
                    </small>
                    <p>{m.reason}</p>
                  </div>
                  <strong
                    className={m.direction === "In" ? "positive" : "negative"}
                  >
                    {m.direction === "In" ? "+" : "−"}
                    {m.quantity} {p.unit}
                  </strong>
                </div>
              ))}
            {visible <
              data.stockMovements.filter((m) => m.product === p.id).length && (
              <button
                className="outline full-width"
                onClick={() => setVisible((v) => v + 8)}
              >
                Load more stock history
              </button>
            )}
            <div className="modal-actions">
              <button
                className="outline"
                onClick={() => open({ kind: "product", id: p.id })}
              >
                Edit product
              </button>
              {!p.archived && (
                <button
                  className="primary"
                  onClick={() => open({ kind: "restock", id: p.id })}
                >
                  <Icon name="plus" size={16} /> Restock
                </button>
              )}
            </div>
          </>
        )}
        {modal.kind === "supplierHistory" && supplier && (
          <>
            <div className="supplier-account-header">
              <h3>{supplier.name}</h3>
              <p>{supplier.phone}</p>
            </div>
            {supplier.address && <details className="supplier-contact-details"><summary>Supplier address</summary><p>{supplier.address}</p></details>}
            <div className="balance-strip">
              <span>Total due</span>
              <strong>
                {money(
                  data.purchases
                    .filter((p) => p.supplier === supplier.id && !p.paid)
                    .reduce((s, p) => s + p.amount, 0),
                )}
              </strong>
            </div>
            <h3 className="supplier-history-title">Purchases</h3>
            {data.purchases
              .filter((p) => p.supplier === supplier.id)
              .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
              .slice(0, visible)
              .map((p) => (
                <section className="supplier-purchase" key={p.id}>
                  <div className="supplier-purchase-heading">
                    <div>
                      <strong>
                        SUP-{p.id}
                      </strong>
                      <small>
                        {dateLabel(p.date)} · {p.lines.length} products
                      </small>
                    </div>
                    <div className="supplier-purchase-payment">
                      <strong>{money(p.amount)}</strong>
                      <span className={`status ${p.paid ? "clear" : "due"}`}>{p.paid ? "Paid" : "Due"}</span>
                    </div>
                  </div>
                  <div className="supplier-purchase-actions">
                    <button
                      className="outline small"
                      aria-label={`Mark purchase SUP-${p.id} as ${p.paid ? "Due" : "Paid"}`}
                      onClick={() => {
                        change((s) => ({
                          ...s,
                          purchases: s.purchases.map((old) =>
                            old.id === p.id
                              ? {
                                  ...old,
                                  paid: !old.paid,
                                  statusHistory: [
                                    ...old.statusHistory,
                                    { date: DAY, paid: !old.paid },
                                  ],
                                }
                              : old,
                          ),
                        }));
                        notify(`Purchase marked ${p.paid ? "Due" : "Paid"}.`);
                      }}
                    >
                      Mark as {p.paid ? "Due" : "Paid"}
                    </button>
                  </div>
                  <details className="purchase-lines">
                    <summary>
                      Product details <Icon name="chevron" size={14} />
                    </summary>
                    <div className="table-scroll">
                      <table className="detail-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Purchase / unit</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.lines.map((l, i) => (
                            <tr key={i}>
                              <td>
                                {l.name}
                                <small>
                                  {l.category} · {l.brand} · {l.batch}
                                </small>
                              </td>
                              <td>
                                {l.quantity} {l.unit}
                              </td>
                              <td>{money(l.purchasePrice)}</td>
                              <td>{money(l.purchasePrice * l.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                  <details className="supplier-status-details"><summary>Payment status history</summary><div className="status-history">
                    {p.statusHistory.map((h, i) => (
                      <span key={i}>
                        {dateLabel(h.date)} · {h.paid ? "Paid" : "Due"}
                      </span>
                    ))}
                  </div></details>
                </section>
              ))}
            {visible <
              data.purchases.filter((p) => p.supplier === supplier.id)
                .length && (
              <button
                className="outline full-width"
                onClick={() => setVisible((v) => v + 8)}
              >
                Load more purchases
              </button>
            )}
            {!data.purchases.some((p) => p.supplier === supplier.id) && (
              <Empty text="No purchases recorded yet." />
            )}
            <div className="modal-actions">
              <button
                className="outline"
                onClick={() => open({ kind: "supplier", id: supplier.id })}
              >
                Edit supplier
              </button>
              {!supplier.archived && <button className="primary" onClick={() => open({ kind: "purchase", id: supplier.id })}>Add purchase</button>}
              <button
                className="outline"
                onClick={() =>
                  open({ kind: "supplierReport", id: supplier.id })
                }
              >
                <Icon name="file" size={16} /> History PDF
              </button>
            </div>
          </>
        )}
        {modal.kind === "businessReport" && (
          <>
            {!reportReady ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setError("");
                  if (from > to) {
                    setError(
                      "The start date must be on or before the end date.",
                    );
                    return;
                  }
                  setReportReady(true);
                }}
              >
                <div className="info-note">
                  See every product supplied to farmers, its purchase cost,
                  actual selling price after discount, and product profit.
                </div>
                <div className="report-range">
                  <label>
                    <span>From date</span>
                    <DatePicker
                      value={from}
                      onChange={(d) => {
                        setFrom(d);
                        if (d > to) setTo(d);
                      }}
                      label="Report from date"
                    />
                  </label>
                  <label>
                    <span>To date</span>
                    <DatePicker
                      value={to}
                      onChange={setTo}
                      min={from}
                      label="Report to date"
                    />
                  </label>
                </div>
                <div className="report-presets">
                  <button
                    type="button"
                    className="outline small"
                    onClick={() => {
                      setFrom("2026-10-05");
                      setTo("2026-10-05");
                    }}
                  >
                    5 October
                  </button>
                  <button
                    type="button"
                    className="outline small"
                    onClick={() => {
                      setFrom("2026-10-01");
                      setTo(DAY);
                    }}
                  >
                    This month
                  </button>
                  <button
                    type="button"
                    className="outline small"
                    onClick={() => {
                      setFrom("2026-09-01");
                      setTo(DAY);
                    }}
                  >
                    All demo activity
                  </button>
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
                  <button className="primary" type="submit">
                    <Icon name="file" size={16} /> Generate report
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="report-controls">
                  <button
                    className="outline"
                    onClick={() => setReportReady(false)}
                  >
                    <Icon name="calendar" size={16} /> Change dates
                  </button>
                  <PrintButton />
                </div>
                <BusinessDocument data={data} from={from} to={to} />
              </>
            )}
          </>
        )}
        {modal.kind === "inventoryReport" && (
          <>
            <div className="report-controls">
              <span>All active products, prices, batches and quantities</span>
              <PrintButton />
            </div>
            <InventoryDocument data={data} />
          </>
        )}
        {modal.kind === "supplierReport" && supplier && (
          <>
            <div className="report-controls">
              <span>Retained purchase history & current payment status</span>
              <PrintButton />
            </div>
            <SupplierDocument data={data} id={supplier.id} />
          </>
        )}
        {modal.kind === "invoice" && invoice && (
          <>
            <div className="report-controls">
              <span>Saved bill · OMS-{invoice.id}</span>
              <PrintButton />
            </div>
            <BillDocument invoice={invoice} />
          </>
        )}
        {isArchiveAction && (
          <>
            <div className="archive-confirmation">
              <div className="round-icon rose">
                <Icon
                  name={modal.kind.startsWith("delete") ? "archive" : "reset"}
                  size={26}
                />
              </div>
              <strong>
                {modal.kind.endsWith("Farmer")
                  ? f?.name
                  : modal.kind.endsWith("Product")
                    ? p?.name
                    : supplier?.name}
              </strong>
              <p>
                {modal.kind.startsWith("restore")
                  ? "This record will return to its active list. Its existing history will stay attached."
                  : modal.kind.endsWith("Farmer")
                    ? "The farmer will leave the active list and their Aadhaar image will be removed. Credits, payments, interest history, saved bills, and outstanding dues will remain. Payments and bill generation will still be available from Archived."
                    : modal.kind.endsWith("Product")
                      ? "The product will leave active inventory and suggestions. Stock movements and historical credit lines will stay in account histories and reports."
                      : "The supplier will leave the active list. Purchases, payment status history, outstanding purchase dues, and reports will remain available."}
              </p>
            </div>
            <div className="modal-actions">
              <button className="outline" onClick={close}>
                Cancel
              </button>
              <button className="primary" onClick={archiveAction}>
                {modal.kind.startsWith("restore")
                  ? "Restore record"
                  : "Delete & retain history"}
              </button>
            </div>
          </>
        )}
        {modal.kind === "reset" && (
          <>
            <div className="info-note">
              Restore the original JSON fixtures? Changes made in this browser
              demo will be replaced with the expanded sample dataset.
            </div>
            <div className="modal-actions">
              <button className="outline" onClick={close}>
                Keep my changes
              </button>
              <button
                className="primary"
                onClick={() => {
                  try {
                    localStorage.removeItem(PROFILE_STORAGE_KEY);
                  } catch {
                    notify("Browser storage is unavailable. The profile could not be reset.");
                    return;
                  }
                  change(() => seed);
                  finish("Original sample data restored.");
                }}
              >
                Reset demo
              </button>
            </div>
          </>
        )}
      </div>
      {isReport && (
        <style>{`@media print { @page { size: A4 ${modal.kind === "invoice" || modal.kind === "businessReport" ? "portrait" : "landscape"}; margin: 12mm; } }`}</style>
      )}
    </dialog>
  );
}
