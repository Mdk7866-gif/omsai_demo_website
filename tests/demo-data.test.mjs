import test from "node:test";
import { simplifyInterestHistory, interestReason } from "../src/components/interest-history.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  aggregateBusinessLines,
  roundMoney,
  supplierPaymentsOn,
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

test("supplier dashboard excludes Due and counts Paid on its payment date once", () => {
  const entries = [
    { amount: 100, date: "2026-10-20", paid: false, statusHistory: [{ date: "2026-10-20", paid: false }] },
    { amount: 200, date: "2026-10-20", paid: true, statusHistory: [{ date: "2026-10-20", paid: false }, { date: "2026-10-22", paid: true }] },
    { amount: 50, date: "2026-10-22", paid: true, statusHistory: [{ date: "2026-10-22", paid: true }] },
  ];
  assert.equal(supplierPaymentsOn(entries, "2026-10-20"), 0);
  assert.equal(supplierPaymentsOn(entries, "2026-10-22"), 250);
  assert.equal(supplierPaymentsOn(entries), 250);
  entries[1].paid = false;
  entries[1].statusHistory.push({ date: "2026-10-22", paid: false });
  assert.equal(supplierPaymentsOn(entries), 50);
});

test("extended fixtures contain credits and payments on every day from 14 to 22 October", () => {
  for (let day = 14; day <= 22; day++) {
    const date = `2026-10-${day}`;
    assert.ok(events.some((e) => e.date === date && e.type === "Credit"));
    assert.ok(events.some((e) => e.date === date && e.type === "Payment"));
  }
  assert.ok(purchases.some((p) => p.date === "2026-10-22"));
});

test("seasonal accounts keep months of interest and appear on the first page", () => {
  const returns = events.filter(e => e.date === "2026-10-22" && e.time === "05:20 PM");
  assert.equal(returns.length, 12);
  for (const event of returns) {
    const farmer = farmers.find(f => f.id === event.farmer);
    assert.ok(farmer.interest >= 200, `${farmer.name} should show meaningful seasonal interest`);
    assert.equal(farmer.due, roundMoney(farmer.principal + farmer.interest));
  }
  const delays = new Set();
  let noRepayments = 0;
  for (const farmer of farmers) {
    const history = events.filter(e => e.farmer === farmer.id).sort((a,b) => a.date.localeCompare(b.date));
    const firstCredit = history.find(e => e.type === "Credit");
    const firstPayment = history.find(e => e.type === "Payment");
    if (!firstPayment) noRepayments++;
    else delays.add((Date.parse(firstPayment.date) - Date.parse(firstCredit.date)) / 86400000);
    assert.ok(history.filter(e => e.type === "Payment").length <= 2);
  }
  for (const days of [60, 90, 120, 150]) assert.ok(delays.has(days));
  assert.ok(noRepayments >= 20);
  assert.ok(events.some(e => e.date.startsWith("2026-04")));
  assert.ok(farmers.find(f => f.id === 11).interest >= 1000);
});

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
    aggregateBusinessLines({ events }, "2026-03-01", "2026-03-31"),
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


test('interest periods merge reporting checkpoints while keeping account events and amounts', () => {
  const accrual = (id, from, to, amount) => ({id, farmer:1, date:to, type:'Accrual', oldRate:2, newRate:2, oldCompound:false, newCompound:false, from, to, amount, note:''});
  const entries = [accrual(1,'2026-10-01','2026-10-05',10.01),accrual(2,'2026-10-05','2026-10-10',20.02),accrual(3,'2026-10-10','2026-10-13',30.03),accrual(4,'2026-10-13','2026-10-22',40.04)];
  const activity = [{farmer:1,date:'2026-10-01',type:'Credit'},{farmer:1,date:'2026-10-10',type:'Payment'}];
  const result = simplifyInterestHistory(entries, activity);
  assert.equal(result.length,2);
  assert.deepEqual(result.map(e=>[e.from,e.to,e.amount,e.reason,e.ongoing]),[['2026-10-01','2026-10-10',30.03,'payment',false],['2026-10-10','2026-10-22',70.07,'payment',true]]);
  assert.equal(interestReason(result[1]),'Since payment');
  assert.deepEqual(simplifyInterestHistory(result, activity),result);
  assert.equal(entries.length,4);
});

test('fixture interest boundaries have only account events or the final as-of date', () => {
  const history=read('interest_history');
  const reasons=new Set(['credit','payment','settings','compound']);
  for(const farmer of farmers) {
    const own=history.filter(h=>h.farmer===farmer.id);
    const boundaries=new Set([
      ...events.filter(e=>e.farmer===farmer.id).map(e=>e.date),
      ...own.filter(e=>e.type!=='Accrual').map(e=>e.date),
    ]);
    for(const entry of own) {
      assert.ok(reasons.has(entry.reason));
      if(entry.type==='Accrual') {
        assert.ok(boundaries.has(entry.from));
        assert.ok(boundaries.has(entry.to)||entry.to==='2026-10-22');
      }
    }
  }
  const ramesh=history.filter(h=>h.farmer===1&&h.type==='Accrual');
  assert.ok(ramesh.some(h=>h.from==='2026-10-05'&&h.to==='2026-10-14'&&h.amount===239.11));
  assert.ok(!ramesh.some(h=>['2026-10-10','2026-10-13'].includes(h.to)));
});
