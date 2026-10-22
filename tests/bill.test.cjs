/* Render the actual TSX bill to verify the farmer-facing output. */
/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
for (const extension of ['.tsx', '.ts']) {
  require.extensions[extension] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2022}, fileName: filename,
  }).outputText, filename);
}
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const {BillDocument} = require('../src/components/reports.tsx');
const {createInvoice, seed} = require('../src/components/demo-data.ts');
const farmer = seed.farmers.find(f => f.id === 11);

test('default bill contains products, bank placeholders and balance, without history or interest percentages', () => {
  const invoice = createInvoice(seed, farmer);
  assert.equal(invoice.includeHistory, false);
  const html = renderToStaticMarkup(React.createElement(BillDocument, {invoice}));
  assert.ok(html.includes(farmer.name));
  assert.ok(html.includes('Principal amount'));
  assert.ok(html.includes('Interest amount'));
  assert.ok(html.includes('SAMPLE / NOT FOR PAYMENT'));
  assert.ok(html.includes('State Bank of India (SBI)'));
  for (const event of invoice.events.filter(e => e.type === 'Credit')) {
    for (const line of event.lines) assert.ok(html.includes(line.name.replaceAll('&', '&amp;')));
  }
  for (const text of ['Account history', 'Interest history', 'Products credited', 'Payment received', '%', 'CGST', 'SGST', 'ॐ']) assert.ok(!html.includes(text), text);
});

test('first-page bill groups quantities and shows the final charged rate without a discount column', () => {
  const invoice = createInvoice(seed, farmer);
  const event = invoice.events.find(e => e.type === 'Credit');
  const base = {...event.lines[0], name:'Example product', unit:'bags', sellingPrice:100, discountedPrice:90};
  invoice.events = [{...event, lines:[
    {...base, quantity:2, total:180},
    {...base, quantity:3, total:270},
    {...base, sellingPrice:110, discountedPrice:null, quantity:1, total:110},
    {...base, unit:'kg', quantity:1.5, total:135},
  ]}];
  const html = renderToStaticMarkup(React.createElement(BillDocument, {invoice}));
  const table = html.match(/<table class="simple-product-list">([\s\S]*?)<\/table>/)[1];
  for (const heading of ['Quantity','Rate / unit','Amount']) assert.ok(table.includes(`<th>${heading}</th>`));
  assert.ok(!table.includes('Discount'));
  assert.ok(!table.includes('<td>₹100.00</td>'));
  assert.equal((table.match(/<tbody>([\s\S]*?)<\/tbody>/)[1].match(/<tr>/g) || []).length, 3);
  for (const text of ['5 bags','1 bags','1.5 kg','₹450.00','₹110.00','₹135.00','₹90.00']) assert.ok(table.includes(text), text);
});

test('With history is retained on the saved bill and does not reveal interest percentages', () => {
  const invoice = createInvoice(seed, farmer, true);
  const html = renderToStaticMarkup(React.createElement(BillDocument, {invoice}));
  assert.ok(html.includes('Account history'));
  assert.ok(html.includes('Interest history'));
  assert.ok(html.includes('Purchase'));
  assert.ok(html.includes('Payment'));
  assert.ok(!html.includes('%'));
  assert.ok(!html.includes('per month'));
  assert.ok(!html.includes('Discount'));
  assert.notEqual(invoice.shop, require('../src/components/demo-data.ts').shopDetails);
});
