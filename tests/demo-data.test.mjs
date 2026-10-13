import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  aggregateBusinessLines,
  roundMoney,
} from "../src/components/demo-math.ts";
const read = (name) =>
  JSON.parse(
    readFileSync(
      new URL(`../dummy_data/${name}.json`, import.meta.url),
      "utf8",
    ),
  );
const events = read("transactions"),
  products = read("products"),
  farmers = read("farmers"),
  purchases = read("purchases"),
  invoices = read("invoices"),
  movements = read("stock_movements");

test("credit snapshots and payments reconcile to their stored amounts", () => {
  for (const e of events) {
    if (e.type === "Credit") {
      assert.equal(
        e.amount,
        roundMoney(e.lines.reduce((s, l) => s + l.total, 0)),
      );
      for (const l of e.lines)
        assert.equal(
          l.total,
          roundMoney(l.quantity * (l.discountedPrice ?? l.sellingPrice)),
        );
    } else {
      assert.equal(roundMoney(e.interestPaid + e.principalPaid), e.amount);
      assert.ok(
        Math.abs(roundMoney(e.dueBefore - e.amount) - e.dueAfter) <= 0.011,
      );
    }
  }
  for (const f of farmers)
    assert.equal(f.due, roundMoney(f.principal + f.interest));
});
test("the stock ledger balances, never goes negative, and excludes manual credits and supplier purchases", () => {
  for (const p of products) {
    let stock = 0;
    for (const m of movements
      .filter((m) => m.product === p.id)
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) || (a.direction === "In" ? -1 : 1),
      )) {
      stock = roundMoney(
        stock + (m.direction === "In" ? m.quantity : -m.quantity),
      );
      assert.ok(stock >= 0, `${p.name} had negative stock`);
    }
    assert.equal(stock, p.stock);
  }
  assert.ok(movements.every((m) => Number.isInteger(m.product)));
  assert.ok(purchases.every((p) => p.lines.every((l) => l.productId === null)));
  assert.ok(events.some((e) => e.lines.some((l) => l.productId === null)));
});
test("historical business reports use inclusive dates and snapshot prices after discounts", () => {
  const rows = aggregateBusinessLines({ events }, "2026-10-05", "2026-10-05");
  const eligible = events.filter(
    (e) => e.type === "Credit" && e.date === "2026-10-05",
  );
  assert.equal(
    roundMoney(rows.reduce((s, l) => s + l.total, 0)),
    roundMoney(eligible.reduce((s, e) => s + e.amount, 0)),
  );
  assert.equal(
    roundMoney(rows.reduce((s, l) => s + l.quantity * l.purchasePrice, 0)),
    roundMoney(
      eligible
        .flatMap((e) => e.lines)
        .reduce((s, l) => s + l.quantity * l.purchasePrice, 0),
    ),
  );
  assert.ok(rows.some((l) => l.discountedPrice !== null));
  assert.deepEqual(
    aggregateBusinessLines({ events }, "2026-08-01", "2026-08-31"),
    [],
  );
});
test("saved bills retain full multi-product history without future events or Aadhaar photos", () => {
  for (const i of invoices) {
    assert.ok(i.events.every((e) => e.date <= i.date));
    assert.ok(i.interestHistory.every((e) => e.date <= i.date));
    assert.ok(!("aadhaar" in i));
    assert.equal(i.due, roundMoney(i.principal + i.interest));
  }
  assert.ok(invoices.every((i) => i.events.some((e) => e.lines.length > 1)));
  assert.equal(
    new Set(products.map((p) => p.name.trim().toLowerCase())).size,
    products.length,
  );
  assert.ok(farmers.some((f) => f.archived && f.due > 0));
});
