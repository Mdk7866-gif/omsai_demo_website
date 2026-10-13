import { aggregateBusinessLines } from "./demo-math";
import {
  DAY,
  dateLabel,
  money,
  round,
  type CreditLine,
  type Invoice,
  type Store,
} from "./demo-data";
import { Icon } from "./icons";

export function LineTable({
  lines,
  showCost = false,
}: {
  lines: CreditLine[];
  showCost?: boolean;
}) {
  return (
    <div className="table-scroll">
      <table className="detail-table">
        <thead>
          <tr>
            <th>Product / batch</th>
            <th>Quantity</th>
            {showCost && <th>Purchase / unit</th>}
            <th>Selling / unit</th>
            <th>Discounted / unit</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i}>
              <td>
                <strong>{l.name}</strong>
                <small>
                  {l.category} · {l.brand || "Manual"} · {l.batch || "No batch"}
                  {l.productId === null ? " · Manual entry" : ""}
                </small>
              </td>
              <td>
                {l.quantity} {l.unit}
              </td>
              {showCost && <td>{money(l.purchasePrice)}</td>}
              <td>{money(l.sellingPrice)}</td>
              <td>
                {l.discountedPrice === null ? "—" : money(l.discountedPrice)}
              </td>
              <td>
                <strong>{money(l.total)}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Letterhead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <div className="report-letterhead">
        <div className="report-shop">
          <span>ॐ</span>
          <div>
            <h2>Omsai</h2>
            <p>Fertiliser, pesticides and seeds</p>
            <small>Andhra Pradesh · Farmer & shop accounts</small>
          </div>
        </div>
        <div className="report-title">
          <h3>{title}</h3>
          <p>{subtitle}</p>
          <small>Generated {dateLabel(DAY)}</small>
        </div>
      </div>
      <div className="report-gold-line" />
    </>
  );
}
export function BillDocument({ invoice }: { invoice: Invoice }) {
  const credit = round(
    invoice.events
      .filter((e) => e.type === "Credit")
      .reduce((s, e) => s + e.amount, 0),
  );
  const paid = round(
    invoice.events
      .filter((e) => e.type === "Payment")
      .reduce((s, e) => s + e.amount, 0),
  );
  return (
    <div className="print-document farmer-document">
      <Letterhead
        title="Farmer account statement"
        subtitle={`OMS-${invoice.id} · Balance as of ${dateLabel(invoice.date)}`}
      />
      <div className="bill-meta">
        <div>
          <small>FARMER DETAILS</small>
          <strong>{invoice.name}</strong>
          <span>{invoice.phone}</span>
          <p>{invoice.address}</p>
        </div>
        <div>
          <small>INTEREST SETTINGS AT GENERATION</small>
          <strong>{invoice.rate}% per month</strong>
          <span>
            {invoice.compound ? "Monthly compound interest" : "Simple interest"}
          </span>
          <span className={`status ${invoice.due ? "due" : "clear"}`}>
            {invoice.due ? "Due" : "Clear"}
          </span>
        </div>
      </div>
      <div className="report-summary">
        <div>
          <small>Total products credited</small>
          <strong>{money(credit)}</strong>
        </div>
        <div>
          <small>Payments received</small>
          <strong className="positive">{money(paid)}</strong>
        </div>
        <div>
          <small>Balance due</small>
          <strong>{money(invoice.due)}</strong>
        </div>
      </div>
      <h3 className="report-section-title">Credits & payments</h3>
      {[...invoice.events]
        .sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
        .map((e) => (
          <section className="bill-event" key={e.id}>
            <div className="bill-event-heading">
              <div>
                <strong>
                  {e.type === "Credit"
                    ? "Products credited"
                    : "Payment received"}
                </strong>
                <span>
                  {dateLabel(e.date)} · {e.time}
                </span>
              </div>
              <strong className={e.type === "Payment" ? "positive" : ""}>
                {money(e.amount)}
              </strong>
            </div>
            {e.type === "Credit" ? (
              <LineTable lines={e.lines} />
            ) : (
              <div className="payment-allocation">
                <span>Interest paid: {money(e.interestPaid || 0)}</span>
                <span>Principal paid: {money(e.principalPaid || 0)}</span>
                <span>Due after payment: {money(e.dueAfter)}</span>
              </div>
            )}
          </section>
        ))}
      <h3 className="report-section-title">Interest history</h3>
      <div className="table-scroll">
        <table className="detail-table">
          <thead>
            <tr>
              <th>Period / date</th>
              <th>Event</th>
              <th>Rate & mode</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.interestHistory.map((e) => (
              <tr key={e.id}>
                <td>
                  {e.type === "Accrual"
                    ? `${dateLabel(e.from)} – ${dateLabel(e.to)}`
                    : dateLabel(e.date)}
                </td>
                <td>
                  {e.type}
                  <small>{e.note}</small>
                </td>
                <td>
                  {e.type === "Settings"
                    ? `${e.oldRate}% → ${e.newRate}%`
                    : `${e.newRate}%`}
                  <small>
                    {e.type === "Settings"
                      ? `${e.oldCompound ? "Compound" : "Simple"} → ${e.newCompound ? "Compound" : "Simple"}`
                      : e.newCompound
                        ? "Compound"
                        : "Simple"}
                  </small>
                </td>
                <td>{e.type === "Settings" ? "—" : money(e.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bill-settlement">
        <div>
          <span>Unpaid principal</span>
          <strong>{money(invoice.principal)}</strong>
        </div>
        <div>
          <span>Unpaid interest</span>
          <strong>{money(invoice.interest)}</strong>
        </div>
        <div className="total">
          <span>Total amount due</span>
          <strong>{money(invoice.due)}</strong>
        </div>
      </div>
      <ReportFoot />
    </div>
  );
}
export function InventoryDocument({ data }: { data: Store }) {
  const products = data.products.filter((p) => !p.archived);
  const cost = round(
    products.reduce((s, p) => s + p.stock * p.purchasePrice, 0),
  );
  return (
    <div className="print-document landscape-document">
      <Letterhead
        title="Product inventory report"
        subtitle={`${products.length} active products · Stock as of ${dateLabel(DAY)}`}
      />
      <div className="report-summary">
        <div>
          <small>Active products</small>
          <strong>{products.length}</strong>
        </div>
        <div>
          <small>Inventory purchase value</small>
          <strong>{money(cost)}</strong>
        </div>
        <div>
          <small>Products below 10 units</small>
          <strong>{products.filter((p) => p.stock < 10).length}</strong>
        </div>
      </div>
      <div className="table-scroll">
        <table className="detail-table report-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Product name</th>
              <th>Brand</th>
              <th>Batch no.</th>
              <th>Stock</th>
              <th>Purchase / unit</th>
              <th>Selling / unit</th>
              <th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.category}</td>
                <td>
                  <strong>{p.name}</strong>
                </td>
                <td>{p.brand}</td>
                <td>{p.batch || "—"}</td>
                <td>
                  {p.stock} {p.unit}
                </td>
                <td>{money(p.purchasePrice)}</td>
                <td>{money(p.price)}</td>
                <td>{p.expiry ? dateLabel(p.expiry) : "Not specified"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ReportFoot />
    </div>
  );
}
export const businessRows = aggregateBusinessLines;
export function BusinessDocument({
  data,
  from,
  to,
}: {
  data: Store;
  from: string;
  to: string;
}) {
  const rows = businessRows(data, from, to);
  const cost = round(
    rows.reduce((s, l) => s + l.quantity * l.purchasePrice, 0),
  );
  const sales = round(rows.reduce((s, l) => s + l.total, 0));
  return (
    <div className="print-document business-document">
      <Letterhead
        title="Business report"
        subtitle={`${dateLabel(from)} to ${dateLabel(to)} · Products sold / credited`}
      />
      <div className="report-summary">
        <div>
          <small>Total purchase cost</small>
          <strong>{money(cost)}</strong>
        </div>
        <div>
          <small>Total selling amount</small>
          <strong>{money(sales)}</strong>
        </div>
        <div>
          <small>Total product profit</small>
          <strong className={sales - cost >= 0 ? "positive" : "negative"}>
            {money(round(sales - cost))}
          </strong>
        </div>
      </div>
      <p className="report-explanation">
        Product profit = actual selling value after discounts − purchase cost of
        the products supplied. Interest and other shop expenses are excluded.
        Quantities with different batches or transaction prices appear
        separately.
      </p>
      <div className="table-scroll">
        <table className="detail-table report-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Product name</th>
              <th>Brand</th>
              <th>Batch no.</th>
              <th>Quantity</th>
              <th>Purchase / unit</th>
              <th>Actual selling / unit</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l, i) => (
              <tr key={i}>
                <td>{l.category}</td>
                <td>
                  <strong>{l.name}</strong>
                  {l.productId === null && <small>Manual credit</small>}
                </td>
                <td>{l.brand || "—"}</td>
                <td>{l.batch || "—"}</td>
                <td>
                  {l.quantity} {l.unit}
                </td>
                <td>{money(l.purchasePrice)}</td>
                <td>{money(l.discountedPrice ?? l.sellingPrice)}</td>
                <td
                  className={
                    l.total - l.quantity * l.purchasePrice >= 0
                      ? "positive"
                      : "negative"
                  }
                >
                  {money(round(l.total - l.quantity * l.purchasePrice))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={7}>Total product profit</td>
              <td>{money(round(sales - cost))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {!rows.length && (
        <div className="empty">No products credited in this date range.</div>
      )}
      <ReportFoot />
    </div>
  );
}
export function SupplierDocument({ data, id }: { data: Store; id: number }) {
  const supplier = data.suppliers.find((s) => s.id === id)!;
  return (
    <div className="print-document landscape-document">
      <Letterhead title="Supplier purchase history" subtitle={supplier.name} />
      <div className="bill-meta">
        <div>
          <strong>{supplier.name}</strong>
          <span>{supplier.phone}</span>
          <p>{supplier.address}</p>
        </div>
        <div>
          <small>Total recorded purchases</small>
          <strong>
            {money(
              data.purchases
                .filter((p) => p.supplier === id)
                .reduce((s, p) => s + p.amount, 0),
            )}
          </strong>
        </div>
      </div>
      {data.purchases
        .filter((p) => p.supplier === id)
        .map((p) => (
          <section className="bill-event" key={p.id}>
            <div className="bill-event-heading">
              <div>
                <strong>
                  {dateLabel(p.date)} · {p.paid ? "Paid" : "Due"}
                </strong>
                <span>Purchase SUP-{p.id}</span>
              </div>
              <strong>{money(p.amount)}</strong>
            </div>
            <div className="table-scroll">
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Brand / batch</th>
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
                        <small>{l.category}</small>
                      </td>
                      <td>
                        {l.brand}
                        <small>{l.batch}</small>
                      </td>
                      <td>
                        {l.quantity} {l.unit}
                      </td>
                      <td>{money(l.purchasePrice)}</td>
                      <td>{money(l.quantity * l.purchasePrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="payment-allocation">
              {p.statusHistory.map((h, i) => (
                <span key={i}>
                  {dateLabel(h.date)} · {h.paid ? "Paid" : "Due"}
                </span>
              ))}
            </div>
          </section>
        ))}
      <ReportFoot />
    </div>
  );
}
function ReportFoot() {
  return (
    <div className="report-footer">
      <span>
        Omsai <span>✧</span> Rooted in trust. Growing together.
      </span>
      <small>Client presentation · Fictional demonstration records</small>
    </div>
  );
}
export function PrintButton() {
  return (
    <button
      type="button"
      className="primary print-button"
      onClick={() => window.print()}
    >
      <Icon name="download" size={17} /> Print / Save as PDF
    </button>
  );
}
