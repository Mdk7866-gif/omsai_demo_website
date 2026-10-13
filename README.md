# Omsai Fertiliser, Pesticides and Seeds

## Start here — handoff for future AI work

**Last updated: 14 October 2026.** This README captures the owner's requirements and feedback from building the client presentation demo. Read this section, inspect the current website and `UI.png`, then read the relevant production requirements below before making changes. The current demo is the practical reference for the final website's appearance and everyday interactions. Preserve that direction while implementing the production services.

The client is an agro input shop proprietor serving farmers, mostly in **Andhra Pradesh**. They need an easy way to manage farmer credit and repayments, inventory, supplier purchases, interest, and bills. Desktop is the main workspace; every workflow must also be usable on a phone. The client is Hindu and religious, and the owner requested a tasteful temple-inspired design that feels familiar, trustworthy, and polished enough to impress during a demonstration.

### Approved visual direction

- Use the **temple-gold, deep maroon, warm cream** direction from [`UI.png`](UI.png) and the implemented demo. Keep the Omsai name, Om motif, restrained gold decorative details, and agricultural context. “Temple Gold — Revised UI” is the reference image's presentation heading, not the shop's name or an application heading.
- Current palette: maroon `#711e29`, deep maroon `#4c121d`, gold `#c4913f`, cream `#faf7f0`, paper `#fffdf9`, dark text `#352923`, muted text `#8a8175`, and green `#2d794d`. Use serif display headings with readable sans-serif body text. Keep generous spacing, soft borders, rounded cards, subtle shadows, and clear financial hierarchy.
- Keep a comfortably wide **desktop sidebar** with Omsai branding and a strong active-page highlight. The current desktop width is approximately 260 px. The top strip provides page context and useful alerts; it is not a replacement navigation bar. The owner explicitly asked to remove the **OP** avatar/initials.
- On mobile, use a side drawer for navigation and bottom sheets for forms and accounts. Reflow cards and keep long forms scrollable with visible actions. Avoid horizontal page overflow, clipped amounts, and controls hidden behind the keyboard.
- Preserve the illustrated **product/package icons** used for fertilizers, pesticides, and seeds. The owner specifically liked these and the explicit product **unit** field. Product photos are not required by the current brief.
- Date pickers must match the design: maroon/gold month controls, a clear selected date, readable day grid, and obvious month navigation. Fixed October 2026 shortcuts and activity dots are demo conveniences, not a production date restriction.
- Use green for money received/positive values and maroon/red for dues or outgoing values, always with text labels and signs. Use visible Due/Clear and Compounding badges rather than relying only on color.

### Owner feedback to preserve

- **Dashboard:** remove the Add Farmer button; farmer creation belongs on Farmers. Keep the date picker, daily summaries, farmer activity, low stock, all-time overview, and Business report. Clicking a farmer in the activity card or its expanded list opens that farmer's full account.
- **Credit given means purchase cost:** the dashboard measures what the proprietor actually spent on the products supplied to farmers. Farmer debt uses the selling price after any discount. Preserve both values separately. Product profit is selling value minus purchase cost.
- **Discoverable cards:** the whole farmer, product, and supplier card opens its account/details/history. Do not require users to discover a small arrow. Keep Edit, Delete, Credit, Pay, and Restock as independent actions that do not accidentally open the card.
- **Farmer sorting:** Recent by default, Highest activity, Highest due, Highest paid, and A–Z. Include practical search, status filters, pagination, and an archive view.
- **Credit entry:** use typed product search with suggestions, not a long select-only dropdown. Show name, category, available stock and unit, purchase price, and selling price. Support multiple products in one transaction and adding/removing lines. Autofill selling price after selection and provide a nearby optional discounted final unit price. Quantity rules follow the unit; category also guides the product presentation.
- **Adding products:** the proprietor can add inventory products through Products, including purchase price and unit. Explicit manual credit lines support products absent from inventory without creating an inventory record. These are distinct actions. No two inventory products may have exactly the same name.
- **Farmer account:** show principal, interest, total due, and compounding status clearly. Expand each credit transaction to see every product supplied that day. Keep understandable interest setting/accrual histories and full farmer bill generation. The Pay screen also shows the current mode so the proprietor need not reopen settings to check it.
- **Aadhaar:** Add Farmer visibly includes optional image upload/preview. The demo can simulate storage, but the final interface includes view/replace/remove controls.
- **Deletion:** archive farmers, products, and suppliers while retaining necessary history, outstanding balances, and saved bills. Allow archive inspection/restoration. Farmer Aadhaar has its separate deletion lifecycle.
- **Bills and reports:** create realistic multi-product farmer bills; provide farmer-name/phone suggestions in Create farmer bill, Product report on Products, and Business report on Dashboard with an inclusive From/To range. PDFs carry the same Omsai maroon/gold identity and remain readable over multiple pages.
- **Demo realism:** retain a substantial, internally consistent dataset in separate JSON files under `dummy_data`, with mostly Andhra Pradesh farmer names, long village/mandal/district addresses, varied units, batches, discounts, repayments, interest changes, and multi-product credits. Include meaningful activity on **5 October 2026**. Do not replace it with a few generic placeholder cards.

### Demo versus production, and PDF feedback

The demo implements the visual direction, five routes, client-side forms, archive/restore, linked stock deductions, account histories, local image previews, invoice snapshots, and browser-print reports. It uses JSON seed data and browser local storage. It demonstrates intended UI and basic workflows; it is not the finished financial system.

Production still requires FastAPI authentication and APIs, Supabase persistence, concurrent transaction integrity, authoritative elapsed-day interest calculations, private Cloudinary image handling, durable image cleanup, and deployment. Keep the architecture below unless the owner changes it. Building the demo entirely in Next.js was a deliberate demo simplification, not a decision to remove the production backend.

**PDF feedback:** the owner successfully generated business, farmer, and inventory PDFs, then reported a sideways business PDF. Inspection showed landscape content placed on portrait paper by Microsoft Print to PDF. The website now requests portrait for business reports with compact columns; this revised output still needs the owner's visual recheck. Farmer bills use portrait, inventory/supplier reports use landscape. Test exported pages, not only on-screen previews. Chrome's Save as PDF is the documented demo export route.

Treat explicit owner decisions as requirements. Items labeled **implementation default**, **recommendation**, or **future consideration** remain distinguishable from those decisions. Sample balances, the fixed demo date, local storage, placeholder identity images, and fixture interest histories are not production logic. Continue routine work from this context without asking the owner to repeat it; ask only when a missing decision materially changes scope or business behavior.

### Code and data map

- `src/app/page.tsx` and the four page folders expose Dashboard, Farmers, Products, Invoices, and Suppliers. The dashboard is `/`, not a separate `/dashboard` route in this checkout.
- `src/components/demo.tsx`: shell/sidebar, page cards, filters, pagination, and dashboard interactions.
- `src/components/demo-modal.tsx`: forms, detail views, payments, account history, bills, report dialogs, and archive/restore actions.
- `src/components/credit-editor.tsx`: multi-product credit entry and supplier purchase lines.
- `src/components/demo-ui.tsx`: themed calendar, typed suggestions, badges, avatars, and pagination.
- `src/components/demo-data.ts` and `demo-context.tsx`: domain types, seed imports, helpers, and browser demo state.
- `src/components/reports.tsx` and `demo-math.ts`: branded bill/report layouts and historical business-report aggregation.
- `src/components/icons.tsx` and `src/app/globals.css`: icons, design tokens, responsive layout, and print styling.
- `dummy_data/*.json` and `scripts/generate-demo-data.mjs`: split fixtures and their deterministic generator. The generator overwrites fixtures; browser edits do not write them.
- `tests/demo-data.test.mjs`: financial snapshot, stock ledger, historical report, and invoice consistency checks.

Read `AGENTS.md` and the installed Next.js guides before code changes. The current checkout uses Next.js 16.4 with React 19.3; use installed documentation rather than assuming older framework conventions. This README is the enduring product brief; implementation files show the current working example.

## Client presentation demo

The repository now includes an interactive **Next.js-only demo**, inspired by the temple-gold and maroon reference in `UI.png`. It uses a desktop sidebar, a mobile side drawer, and mobile bottom sheets. This demo is for presenting the design and workflows to the client; the production backend requirements below remain the implementation brief.

### Run the demo

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. All five pages are available: Dashboard, Farmers, Products, Invoices, and Suppliers. The production build can be verified with `npm run build` and served with `npm run start`.

### Sample data and walkthrough

- Sample records are split across JSON files in [`dummy_data`](dummy_data): `farmers.json`, `products.json`, `suppliers.json`, `transactions.json`, `purchases.json`, `interest_history.json`, `stock_movements.json`, and `invoices.json`. The fixtures include 120 fictional Andhra Pradesh farmer accounts with detailed village/mandal/district addresses, 32 products, 12 suppliers, 1,098 transactions, 96 supplier purchases, and 48 saved bills.
- Edit the JSON files to customize the presentation, then use **Reset demo** in the footer to reload them. Browser changes stay local and do not overwrite the JSON. `node scripts/generate-demo-data.mjs` deliberately regenerates all fixtures and overwrites manual JSON edits.
- The fixed demo business date is **14 October 2026**. The themed calendar includes activity from September through 14 October, including **240 transactions on 5 October**. New demo transactions use the fixed business date and sequential demo times after the latest existing entry, keeping the account history in order during presentations.
- Add/edit farmers with an optional local Aadhaar photo preview. Entire cards open their accounts. Sort by Recent (default), Highest activity, Highest due, Highest paid, or A–Z. Compounding has a visible badge on cards and payment screens.
- Give multi-product credit using typed inventory suggestions showing category, batch, stock, purchase price, and selling price. Selling price fills automatically; an optional discounted final price applies only to that transaction. Whole-unit products and fractional kg/litre quantities use their own quantity rules. Manual lines are explicitly selected and require their purchase cost too.
- Payments reduce unpaid interest first, then principal. Expand transactions to inspect every credited line and before/after balances. Interest History includes effective rate/mode changes, accrued interest, and capitalization examples.
- Dashboard **Credit given** measures the purchase cost of inputs supplied to farmers. Farmer debts, transaction amounts, and bills use actual selling prices after discounts.
- Restock products and watch their quantities and low-stock alerts update. Search and filter the product inventory.
- Add suppliers, record purchases, and toggle their Paid/Due status from History. Supplier purchases do not restock inventory.
- Search for a farmer by name or phone when creating a bill. Full bills retain their captured contact details, multi-product credits, discounts, payments, interest history, and settlement breakdown.
- **Product report** prints active inventory, category, brand, batch, units, quantities, purchase/selling prices, and expiry. **Business report** accepts an inclusive From/To range and shows credited products at their historical cost and actual selling prices, with purchase-cost, selling-value, and product-profit summaries. Supplier account histories have a printable report too.
- Reports share the website's maroon/gold Omsai styling and support multiple pages. Use **Print / Save as PDF** and the browser's **Save as PDF** destination to export. Farmer bills and business reports use portrait pages; inventory and supplier reports use landscape pages. The business table fits portrait paper to avoid sideways output from printer drivers that keep a portrait paper setting.
- Delete actions archive farmers/products/suppliers. Use **Archived** to inspect or restore them. Financial history, stock movements, outstanding balances, and saved bills remain. Farmer archival removes the local Aadhaar reference and blocks new credits; payments and bills remain available.
- Demo changes are saved in this browser's local storage. **Reset demo** restores the original JSON sample data before another client presentation.

The demo has no production authentication, database, Cloudinary uploads, or external services. Aadhaar previews are local to this browser; several sample accounts have an unmistakably fictional document placeholder. Historical interest calculations are demonstration fixtures, and the UI records same-day setting changes and payment allocations; a production-grade, continuously accruing financial engine is still outside this demo. It requires no FastAPI setup.

Validation: `npm run lint`, `npm run build`, and `npm test` (Node 22.17+). The tests check transaction totals, payment allocations, historical report prices, stock reconciliation, and invoice snapshots.

## Project context and requirements

This document is the implementation brief for a private website used to manage the farmer accounts, inventory, supplier purchases, bills, and daily activity of **Omsai Fertiliser,pesticides and seeds**.

The shop is an agro input dealer. Farmers purchase fertilizers, pesticides, and seeds, often on credit, and repay later, frequently after harvest. They can purchase repeatedly and make partial payments on any day. The website must maintain an accurate running account for each farmer, including interest and historical transactions.

**Requirements updated:** 14 October 2026, incorporating the owner's demo feedback. The sections below describe the production requirements, not completed production behavior. The client demo and its local run instructions are documented above; production deployment and backend setup do not exist yet.

Requirements explicitly agreed with the owner are described below. Additional choices needed to make those requirements implementable are marked **implementation default** or **recommendation**. They can be revised before implementation without changing the agreed business scope.

## 1. Business scope and confirmed decisions

- Use **Farmer** and **Farmers** throughout the interface, documentation, route names, and new domain entities.
- Expected initial scale: approximately **2,000 farmers**, **100 suppliers**, and a growing transaction history.
- Fewer than **10 people** will use the website. Desktop is the main device, but all workflows must also work on mobile.
- Default farmer interest is **2% per month**, configurable individually for each farmer.
- Interest must account for elapsed days. One calculation month is **30 days**.
- Simple interest is the default. Monthly compound interest can be enabled or disabled manually for a farmer.
- Farmers do **not** provide repayment deadlines or repayment durations. There is **no automatic overdue-based switch to compound interest**.
- Farmer payments clear accumulated interest first, then reduce unpaid principal.
- Interest rate and mode changes affect future calculations only.
- A farmer account becomes **Clear** only when payment settles the entire amount due. There is no manual clear or waive control.
- Farmer credits linked to inventory automatically reduce stock. Manually entered credit products do not change inventory.
- **Supplier purchases and product inventory are separate in the current scope.** Saving or changing a supplier purchase must never create, edit, or restock an inventory product. The owner enters inventory independently. Connecting these modules is a possible future decision.
- Each supplier purchase has a **Paid/Due toggle**. Partial supplier payments are outside the current scope.
- Deleting a farmer removes the farmer from the active list and deletes their Aadhaar image, while retaining transaction history, interest history, and saved bill data.
- Generated PDFs are created on demand. **Cloudinary stores images only**, not PDFs.
- Dashboard activity can be inspected for today or a past date through a calendar.
- Dockerization is required. The hosting destination is undecided.

## 2. Technology and hosting

- **Frontend:** Next.js.
- **Backend:** FastAPI, with **uv** for Python dependency and environment management.
- **Database:** Supabase PostgreSQL.
- **Image storage:** Cloudinary.
- **Packaging:** Docker, with a recommended Docker Compose setup for running the frontend and backend locally.
- **Hosting candidates:** AWS or Vercel. The deployment arrangement must be chosen later; do not assume both services will necessarily run on the same platform.
- **Domain:** An existing domain held with Hostinger will be connected to the chosen deployment.

The owner is considering database queries/functions for financial calculations to reduce backend workload. This is a preference to evaluate, not a requirement to put every calculation into SQL. Select one authoritative calculation implementation, either in the backend or in database functions called by the backend, and keep previews, transactions, reports, and dashboard totals consistent with it.

Package versions, hosting services, PDF libraries, and migration tooling must be selected during implementation. Do not invent working installation commands before the repository and its dependencies exist.

## 3. Access, navigation, and responsive behavior

### 3.1 Password access

Before accessing any business page, a visitor must enter the website password. The temporary initial development password is **`1234`**. Store the configured password as **`APP_PASSWORD` in the FastAPI backend's environment**, so the owner can change it later. Do not copy it into Next.js environment files or configuration. FastAPI supports loading server configuration from environment variables and a backend `.env` file for development. [FastAPI settings documentation](https://fastapi.tiangolo.com/advanced/settings/).

Authentication belongs to **FastAPI**. Next.js renders the login form and submits the password entered by the visitor to FastAPI over HTTPS. FastAPI verifies it against its backend-only configuration and creates the authenticated session. Next.js then displays the dashboard. The configured password and session signing secret must never be sent to the frontend.

FastAPI must verify the session before allowing business-data access, image delivery, PDF generation, or mutations. Next.js can show login redirects and forward session credentials when requesting backend data, but frontend page visibility is not an authorization check.

**Implementation defaults:** FastAPI handles login, session issuance/validation, and logout. Use an expiring session in a secure HttpOnly cookie, rate-limit password attempts, and protect authenticated mutations against cross-site request forgery. Keep `SESSION_SECRET` in FastAPI's environment too. Shared password access is the initial model; individual staff accounts and roles are not required.

Use a strong password for production. Never expose the website password, session secret, database credentials, or Cloudinary API secret in browser code. Next.js exposes variables prefixed with `NEXT_PUBLIC_` to the browser, so that prefix is reserved for intentionally public configuration. [Next.js environment-variable documentation](https://nextjs.org/docs/app/guides/environment-variables).

### 3.2 Sidebar navigation

Use a sidebar as the primary navigation instead of a navbar. The sidebar contains:

- **Dashboard:** `/` — the home route.
- **Farmers:** `/farmers`.
- **Products:** `/products`.
- **Invoices:** `/invoices`.
- **Suppliers:** `/suppliers`.

The sidebar must clearly highlight the current page. Keep it visible on desktop; on mobile, open it as a collapsible side drawer with an accessible menu button and clear close control. Selecting a route closes the mobile drawer.

### 3.3 Dialogs and mobile bottom sheets

- Use dialogs/pop-ups for desktop forms and detail views.
- On mobile, open the same interactions as sheets rising from the bottom of the screen, following the placement and opening behavior of the supplied screenshot.
- The screenshot is a visual reference for bottom-sheet behavior, not a specification of its unrelated text or business content.
- Long forms and expanded histories must scroll inside the sheet without hiding the save/cancel actions.
- The on-screen keyboard must not cover the active field or essential actions.
- Provide clear close controls, accessible labels, keyboard navigation, and loading, empty, success, and error states.
- Reflow cards on mobile. Financial and report columns must remain readable through an appropriate compact layout or horizontal scrolling.

## 4. Farmers page — `/farmers`

### 4.1 Add Farmer

Provide a **+ Add Farmer** button. Its form contains:

- Farmer name — required.
- Phone number — required.
- Address — optional.
- Monthly interest rate (%) — required, default **2**.
- Aadhaar card photo — optional.

New farmers start in simple-interest mode. Creation time is recorded automatically. An account with no outstanding credit is Clear.

**Implementation defaults:** Store phone numbers as text, allow a zero interest rate, and reject negative rates. Warn about a potentially duplicated phone number without assuming it uniquely identifies a person.

### 4.2 Farmer cards

Show farmer cards with the name, phone number, current total due including interest, and an unmistakable **Due/Clear** badge. Each active card has:

- **Edit**.
- **Delete**.
- **Credit**.
- **Pay**.

Do not add a manual Clear button. A zero balance derives the Clear status automatically.

The entire card opens the farmer account. Show a visible **Compounding** badge when enabled, including on the payment screen. Separate action buttons must not trigger the card's open action.

### 4.3 Search and sorting

- Search by farmer name or phone number.
- **Recent** (default): most recently visited/active farmer first; use creation time for an account without transactions.
- **Highest activity:** greatest number of credit/payment transactions first.
- **Highest due:** greatest current due including interest first.
- **Highest paid:** greatest total actual payments first.
- **A–Z:** farmer name in alphabetical order.
- Creation-date sorting can be an additional option; retain the five owner-requested options above.
- Recommended optional status filter: Due or Clear.

**Implementation default:** Credit and payment transactions update the most recent visit/activity time. Editing a phone number, viewing a profile, or generating a bill does not represent a shop visit. Highest paid means the sum of actual farmer payments; highest due uses the calculated balance as of the current date.

### 4.4 Edit and detail view

The Edit dialog/bottom sheet contains:

- Editable farmer name, phone number, optional address, and monthly interest rate.
- View/upload/replace/remove controls for the optional Aadhaar image.
- A **Compounding** toggle, off by default.
- Read-only Due/Clear status.
- Read-only account creation date/time.
- Current total due, including interest, with an as-of date.
- Recommended breakdown of unpaid principal and unpaid interest.
- **See History**, followed by **Interest History** and **Full Farmer Bill**.

Saving a rate or mode change records its effective time and old/new values. It must first settle the calculation up to that time using the old settings, then use the new settings prospectively.

### 4.5 Credit and payment history

**See History** expands the detail view downward and loads the farmer's chronological account history. Support pagination or incremental loading for long accounts.

For each credit show its date, product lines, quantities, original selling prices, optional discounted prices, effective prices, line totals, and total credit amount.

For each payment show its date, amount received, amount due before payment, and amount due after payment. Preserve these before/after values as transaction snapshots.

### 4.6 Interest History

Show the historical periods during which each monthly rate and mode applied, with effective start/end dates. Include rate changes, simple/compound switches, interest accrued for calculation periods, and capitalization events when applicable.

The owner must be able to understand why the current amount due differs from the original credits. Earlier rates and modes must remain visible after changes.

### 4.7 Full Farmer Bill

The **Full Farmer Bill** action creates a printable/downloadable PDF containing:

- Shop name and bill reference.
- Generation date and balance as-of date.
- Farmer name, phone number, and address when available.
- All credit/purchase lines with dates, quantities, selling prices, discounts, effective prices, and totals.
- All payments with their dates and amounts.
- Interest history, including rates, modes, effective periods, and calculated interest.
- Current unpaid principal, unpaid interest, total due, and Due/Clear status.

Save a structured snapshot of this bill in the database and add it to `/invoices`. Generating a new full bill creates a new snapshot; reprinting an existing invoice does not create another entry.

The Aadhaar image is not part of the bill. A saved bill must remain usable after that image has been deleted.

### 4.8 Delete Farmer

The Delete action archives the farmer instead of destroying financial records. Explain in the confirmation that the farmer will leave the active list, their Aadhaar image will be removed, and financial history will remain.

- Keep credits, payments, rate/mode changes, and invoice snapshots.
- Preserve the identity/contact snapshots needed to understand historical transactions and bills.
- Delete the associated Aadhaar asset from Cloudinary, including cached delivery copies where supported.
- Keep archived farmers searchable through an archive/history view.
- Archiving must not erase an unpaid balance or act as payment.

**Implementation default:** An archived farmer with unpaid dues continues to accrue interest under the recorded settings and remains included in total outstanding dues. Allow history access, bill generation, and payments against that archived account. Block new credits unless the farmer is restored. This preserves the rule that only full payment clears an account.

## 5. Farmer credit workflow

Clicking **Credit** opens a multi-product form. Each line contains:

- Product name, with inventory suggestions while typing.
- Selected inventory item/batch, when applicable.
- Quantity.
- Original selling price per unit.
- Optional discounted selling price per unit for this farmer and this transaction.
- Effective unit price and calculated line total.

**Implementation default:** The discounted-price field contains the final unit price, not a percentage or the amount deducted. A blank discount uses the original selling price. A supplied discounted price affects this transaction only and must not change the inventory product's selling price.

Selecting an inventory product retrieves its current selling price and available quantity. Provide **+ Add Products** to add further lines and display the overall credit total live.

Use a searchable suggestion list while the owner types the first letters of a product name. Suggestions and the selected-line summary show product name, category, available stock with unit, purchase price, and selling price; include brand/batch when available. Autofill the original selling price, keep the optional discounted final unit price beside it, and calculate totals immediately. Retain the purchase-cost snapshot separately from the farmer's selling-price debt. When the same item appears on multiple lines, validate the combined requested quantity against stock.

`Line total = quantity × effective unit price`

`Credit total = sum of line totals`

### 5.1 Inventory-linked credit

- Saving a credit deducts the selected quantity from the linked inventory item/batch.
- Save the credit and its stock-out movement together in a single database transaction.
- Validate stock again when saving; do not rely only on the quantity displayed when the form opened.
- Preserve the sale's names, prices, discounts, and batch details as snapshots so future product edits do not change old transactions.
- Reject a linked quantity that exceeds available stock. Stock must not become negative.

### 5.2 Manually entered credit

The owner can explicitly enter a product that is absent from inventory or out of stock. Require its name, unit, quantity, purchase cost per unit, and selling price; allow an optional discounted final price. Include category and brand/batch details where applicable so the line remains useful in reports.

- Mark the line as **Manual / not linked to inventory**.
- It creates a financial credit and appears in farmer activity and bills.
- It creates no inventory deduction or stock-out movement.
- Do not silently turn an insufficient-stock inventory line into a manual line. The owner must explicitly choose manual entry.

New credit starts accruing interest from its own transaction date. It must never be charged interest for days before the product was credited.

## 6. Farmer payment workflow

Clicking **Pay** opens a form with the latest total due, including interest accrued through the payment date.

- Enter the amount actually received.
- Show the remaining amount live.
- Support repeated partial payments on any day.
- Clearly indicate **“This payment will clear the account”** when the amount equals the total due.
- Saving a full payment changes the account to Clear and stops further interest on that settled balance.
- A later credit changes the account back to Due and begins new accrual.

Payments are allocated to accumulated unpaid interest first, then to unpaid principal. Record that allocation, the amount received, and the due before/after payment.

**Implementation defaults:** Require a positive payment. Do not accept more than the displayed authoritative settlement amount; overpayments and wallet balances are outside the current scope. Recalculate and validate the balance when saving. If another action changes the amount due, show the updated amount before accepting a mismatched full-settlement payment.

## 7. Interest calculation specification

### 7.1 Definitions and day counting

- Currency: Indian rupees (INR).
- Monthly rate is a percentage; **2% = 0.02** in formulas.
- One calculation month equals **30 elapsed days**, regardless of calendar-month length.
- Daily rate = monthly rate / 30.
- Charge for elapsed days, including incomplete 30-day periods.
- Do not apply an annual rate or an annual compounding schedule.

**Implementation defaults:** Use the configurable business timezone **Asia/Kolkata** for date-based accrual and dashboard reporting. Store audit timestamps consistently. A credit accrues no interest on its transaction date; the following business date represents the first elapsed day. Same-day events accrue no additional interest between them and are ordered deterministically by timestamp and transaction ID.

### 7.2 Simple interest

Maintain unpaid principal separately from unpaid accrued interest. During simple mode, unpaid interest does not itself earn interest.

For a segment with unchanged principal and rate:

`Interest = unpaid principal × monthly rate × elapsed days / 30`

Split calculations at credits, payments, rate changes, and mode changes. Each segment uses the balance and settings applicable to that segment.

Examples at 2% monthly:

- ₹100 for 30 days: ₹2 interest; total due **₹102**.
- ₹100 for 60 days: ₹4 interest; total due **₹104**.
- ₹100 for 80 days: ₹5.333… interest; displayed total due **₹105.33**.
- ₹100 for 30 days, then payment of ₹50: ₹2 pays interest and ₹48 reduces principal. Remaining principal is **₹52**. Another 30 days adds ₹1.04; total due becomes **₹53.04**.
- ₹100 for 30 days, then payment of ₹1: ₹1 interest remains unpaid and principal stays ₹100. Another 30 days adds ₹2 interest; total due becomes **₹103**. Simple mode does not charge interest on that unpaid ₹1.

The previously discussed tentative numeric example is superseded by these confirmed rules.

### 7.3 Compound interest

During compound mode, accrue daily interest proportionally and capitalize unpaid accrued interest at each completed 30-day boundary. Capitalized interest becomes part of the interest-bearing balance.

For an unchanged balance/rate with no intervening events:

`m = floor(elapsed days / 30)`

`d = elapsed days modulo 30`

`Total due = starting balance × (1 + monthly rate)^m × (1 + monthly rate × d / 30)`

This is the unrounded mathematical formula. When posting monthly interest to currency precision, process and round each capitalization sequentially under section 7.5; do not substitute the closed-form expression if it would produce a different posted balance.

At 2% monthly, ₹100 with no payments becomes **₹102** after 30 days and **₹104.04** after 60 days. After 80 days, the displayed amount is **₹105.43**.

The final incomplete period uses proportional daily accrual. Do not compound daily and do not apply a fractional exponential formula instead of this agreed prorating rule.

### 7.4 Events within compound periods

The no-event formula above is not sufficient when credits, payments, or setting changes occur. Process those events in date order, accruing interest up to each event before applying it.

**Implementation defaults for cycle behavior:**

- Starting compound mode first accrues simple interest up to the switch date, then capitalizes the existing unpaid interest once and starts a 30-day compound cycle from that date. This capitalization is recorded; earlier transactions and interest are not rewritten.
- Use one compound cycle for the farmer account. New credit added mid-cycle accrues only from its own date and joins the existing cycle; it does not receive a retroactive full month's interest.
- A payment first settles current unpaid accrued interest, then reduces the interest-bearing principal. A payment does not reset the existing compound boundary.
- A rate change splits accrual at its effective date without resetting the compound boundary.
- A display refresh, bill generation, or intermediate calculation must not capitalize interest early.
- Switching compound mode off accrues up to that date and ends future capitalization. Already capitalized amounts remain in the interest-bearing principal; uncapitalized interest stays separate in simple mode.
- A full settlement ends the cycle. A later credit starts a new cycle if the farmer's retained mode is compound.

These defaults define otherwise unspecified transition details. The implementation must document any approved changes to them before changing financial behavior.

### 7.5 Precision and account status

- Use fixed-precision decimal arithmetic for money and interest calculations.
- Keep sufficient internal precision for prorated interest; do not round away small daily amounts or round once for every page view.
- Display money to two decimal places.
- **Implementation default:** Use consistent round-half-up rules when posting monetary amounts and monthly capitalization. Full settlement uses the rounded payable total and explicitly settles any sub-paise residual.
- Derive Due/Clear from the authoritative amount owed. A newly created account with no credit is Clear.
- Display the as-of date on balances and reports.
- Keep payments and capitalization events auditable and idempotent so retries cannot charge or collect twice.

No repayment-date field, deadline-triggered compounding, manual unpaid-account clearance, or automatic interest waiver is part of this specification.

## 8. Products page — `/products`

### 8.1 Add and edit inventory products

Provide **+ Add Product** with:

- Product name.
- Brand.
- Category.
- Expiry date.
- Batch number.
- Quantity.
- Unit — for example bags, packets, bottles, kg, or litres.
- Purchase price per unit.
- Selling price per unit.

Categories are exactly **Fertilizers**, **Pesticides**, and **Seeds**. Default category is Fertilizers.

Product names must be unique across inventory records, including archived records (trimmed, case-insensitive comparison). Use a distinct name or batch suffix when entering another batch of the same product; do not merge incompatible batches silently.

Display searchable product cards with **Edit** and **Delete** actions. Search by product name; brand and batch search are useful optional extensions.

The entire product card opens product details and stock history. Keep the existing category/package illustrations. Whole-unit quantities such as bags, packets, and bottles must be integers; kg and litres support fractional quantities. Unit prices always correspond to that same unit, rather than being inferred only from category.

**Implementation defaults:** Treat each inventory record as a product/batch combination because expiry date and purchase price may differ between batches. Require a unit label and keep the entered quantity consistent with its unit price. Reject negative quantity and prices. Missing batch/expiry information must be explicitly represented rather than fabricated.

### 8.2 Low-stock alerts and restocking

An alert-icon button opens all active products with quantity **strictly less than 10**, including zero stock. Show the product name, batch where applicable, and current quantity.

Each entry has a **+** action to add quantity directly. If current quantity is 4 and the owner adds 20, the new quantity is **24**.

Record each addition as a dated stock-in movement. Create a separate inventory entry when the new stock has a different batch or expiry date instead of merging incompatible stock.

### 8.3 Stock movement history

Maintain a stock ledger for:

- Initial inventory quantities.
- Manual additions/restocks.
- Inventory-linked farmer credits.
- Explicit quantity corrections/removals, with a reason.

**Implementation default:** Inventory quantity edits create adjustment movements rather than silently replacing the historical balance. Product deletion archives the record and preserves stock movements and historical sale snapshots; deletion is not a sale.

Supplier purchases do not appear as inventory stock-in. Manual farmer credit lines do not appear as inventory stock-out.

### 8.4 Inventory Report

The **Product report** button generates a printable/downloadable inventory PDF containing a column-based list of all current active inventory records, not just the currently displayed page:

- Product name.
- Category.
- Brand.
- Purchase price.
- Selling price.
- Expiry date.
- Batch number.
- Current quantity.
- Unit.

Include the shop name and report generation date. Repeat column headings across pages and preserve legibility when the inventory spans many pages. The report is generated on demand and is not stored in Cloudinary.

## 9. Invoices page — `/invoices`

This page lists the history of generated **Full Farmer Bills**, including bill reference, farmer name, generation date, balance as-of date, and the total due captured at generation.

Provide **Create farmer bill** with typed farmer-name/phone suggestions. After selecting a farmer, confirming bill creation creates their full account snapshot and opens the bill preview. Merely selecting a suggestion does not save an invoice. Multi-product credits remain grouped under their original transaction date and reference, with every credited line visible.

Provide **Generate PDF** for each saved bill. Generate it from the saved structured snapshot, not from the farmer's current balance or today's product prices.

The snapshot must contain all data required to reproduce the bill: shop identity, farmer contact details, transaction lines, historical prices/discounts, payments, interest periods and events, and captured totals.

- Do not store PDF files in Cloudinary.
- Do not store generated PDFs permanently in the database.
- Stream/download the PDF when requested; transient rendering files may exist only for generation.
- Saved invoices remain accessible after farmer archival or product edits/deletion.
- Recommended search/filter controls: farmer name, bill reference, and generation date range.
- Paginate the list and retain a snapshot/schema version so later application changes can still render older bills.

Generating another Full Farmer Bill creates an updated snapshot. Regenerating a saved invoice reproduces that historical bill and does not accrue fresh interest into it.

## 10. Suppliers page — `/suppliers`

### 10.1 Supplier management

Provide **+ Add Supplier** with supplier name, phone number, and optional address. Display searchable supplier cards with:

- **Edit** — opens the name, phone, and address form.
- **Delete**.
- **Purchase**.
- **History**.

Search by supplier name. Phone search is a recommended convenience.

The entire supplier card opens its account/purchase history. Edit, Delete, and Purchase remain independently clickable. Include an Archived view with history access and restoration.

**Implementation default:** Archive suppliers on deletion so purchase history, status history, dashboard totals, and supplier reports remain available.

### 10.2 Record a supplier purchase

Purchase opens a form with one or more lines containing:

- Product name.
- Brand.
- Category: Fertilizers, Pesticides, or Seeds.
- Quantity.
- Expiry date.
- Batch number.
- Purchase price per unit.

Provide **+ Add Products**, live line totals, and a live total purchase amount. Record the purchase date/time.

Each purchase has a **Paid/Due toggle**. **Implementation default:** Start a new purchase as Due unless the owner explicitly marks it Paid. Paid means the entire purchase amount is paid; Due means the entire purchase amount is unpaid. A purchase containing several products has one status for its total.

Store dated status changes, including when a Due purchase becomes Paid, for audit and reporting. Partial supplier payments, supplier interest, and an amount-based supplier repayment ledger are outside the current scope.

Saving a purchase or changing its status must not change inventory quantity, inventory purchase prices, or inventory selling prices. Inventory entry remains a separate manual workflow.

### 10.3 Supplier History PDF

History displays the supplier's purchases and offers a printable/downloadable PDF containing the supplier name/contact details and all purchases with their dates, product details, quantities, purchase prices, totals, and current Paid/Due status.

Show status-change dates where useful. Generate the PDF on demand from retained database records; do not store it in Cloudinary.

## 11. Dashboard — `/`

### 11.1 Calendar and selected-day view

Show a calendar/date selector, defaulting to today. Selecting a previous date updates all selected-day cards, totals, and activity details. Clearly show the selected date and provide a way to return to today.

Use the themed calendar described in the visual brief. Keep **Business report** beside the date control. Do not place Add Farmer on the dashboard; that action belongs on `/farmers`.

**Implementation default:** Day boundaries use the configured business timezone. Historical daily views use recorded events from that date; current account dues must be explicitly labeled if shown alongside historical activity.

### 11.2 Farmer activity card

The Farmer Activity card shows the number of distinct farmers with a credit or payment on the selected day. Clicking it opens a dialog/bottom sheet listing:

- Farmer name.
- Credit, payment, or both.
- Transaction times and amounts.
- Credited products and quantities for each credit transaction.

Retain every transaction even when a farmer visits multiple times in one day. Profile edits and bill generation do not count as visits.

Clicking a farmer row in either the dashboard preview or expanded activity list opens their full farmer account, with history, payment, credit, and bill actions as appropriate to their active/archive status.

### 11.3 Stock activity card

The Stock Activity card opens stock-in/stock-out history for the selected day, showing product/batch, movement time, quantity, movement direction, and source/reason. Show totals by product or compatible unit; do not add kilograms and packets into one misleading physical quantity.

Inventory-linked farmer credits are stock-out. Manual inventory entries/restocks are stock-in. Supplier purchases remain separate and are not automatically stock-in.

### 11.4 Daily business totals

Show these distinct values for the selected day:

1. **Farmer payments received:** money actually received from farmers, including the interest component of payments.
2. **Credit given / input purchase cost:** the historical purchase cost of products supplied to farmers, calculated as quantity × purchase price per unit for each credited line. This shows the proprietor's money invested in those inputs. Farmer debts and credit transaction totals continue to use the selling price after discounts; they are different measures.
3. **Supplier purchase value:** the total recorded value purchased from suppliers.
4. **Total outgoing activity value:** input purchase cost + supplier purchase value.
5. **Net Business Activity:** farmer payments received − input purchase cost − supplier purchase value.

The owner requested this fifth measure to understand the day's incoming and outgoing business activity. Show positive values as a surplus and negative values as a deficit, with the formula visible in help text. It remains a custom business measure, not accounting profit or pure cash flow: input cost represents products supplied from stock, and a Due supplier purchase has not yet been paid. Preserve the purchase-cost snapshot at the time of credit; later inventory price edits must not change historical totals. Manual credits must also record purchase cost.

**Implementation default:** Count a supplier purchase in this activity measure once, on its purchase date, whether Paid or Due. Marking it Paid on a later day does not count the purchase again. Inventory additions also do not create another supplier purchase expense in this measure.

**Recommendation:** A separate actual cash summary can show farmer receipts minus purchases marked Paid on their payment/status date. If added, status corrections need dated reversal events rather than silently rewriting earlier daily totals. A formal profit/loss statement and tax accounting are outside the agreed initial scope.

### 11.5 Lifetime overview

Show all-time farmer payments received, input purchase cost, supplier purchase value, total outgoing activity value, and Net Business Activity using the same definitions as the daily view.

Also show **Total Farmer Dues**, including unpaid interest as of the current business date. Include archived farmers that still owe money. Recommended additional counts: active farmers, farmers with dues, active suppliers, and low-stock inventory items.

Historical dashboard activity must survive farmer, product, or supplier archival. Interest accrual alone is not a cash receipt and must not increase farmer-payment inflow.

### 11.6 Business report

Provide **Business report** on the dashboard. The owner selects an inclusive From/To date range and generates a printable/downloadable report of products sold or credited to farmers in that period. Include category, product name, brand, batch number, quantity with unit, historical purchase price per unit, actual selling price per unit after any discount, and product profit.

Group compatible quantities with the same product, unit, batch, and transaction prices. Keep different batches or prices separate. Include manual credit lines and retained transactions for archived farmers/products. Do not reconstruct old transaction prices from today's inventory.

Summarize **Total purchase cost**, **Total selling amount**, and **Total product profit**. For this report, total purchase cost means the cost basis of the products supplied in the selected period, not all supplier purchases booked during that period. Product profit is actual selling value after discounts minus purchase cost; interest, shop expenses, and tax accounting are excluded. This product-margin report does not replace a formal profit/loss statement.

Use the shop's Omsai identity and maroon/gold styling, show the selected date range and generation date, repeat table headings across pages, and preserve legibility. Generate the PDF on demand; do not store it in Cloudinary.

The business report uses upright portrait pages with compact, readable columns. The owner reported sideways output from Microsoft Print to PDF when landscape content was placed on portrait paper. Verify orientation, margins, amounts, table continuation, and repeated headings in the exported PDF; do not rely only on the preview.

## 12. Aadhaar image optimization and lifecycle

The optional Aadhaar image may originate from a phone camera and be approximately **7–20 MB**. Storing every original at that size would consume storage unnecessarily. The owner accepts reduced image quality, but the document should remain readable.

### 12.1 Upload pipeline

1. Validate the actual image type and source size, not only its filename.
2. Correct orientation, resize, and compress before permanent storage.
3. Show an optimized preview so the owner can check readability.
4. Upload only the optimized image to Cloudinary through an authorized flow.
5. Save the Cloudinary asset identifier, resource/delivery type, dimensions, byte size, and relevant metadata in Supabase.

**Recommended starting settings, to validate with real Aadhaar photos:** Accept source images up to 25 MB; aim for a stored file of approximately 200–500 KB with a longest edge of 1,600 pixels; use a supported compressed format such as JPEG/WebP; and use a configurable optimized-upload cap of 1 MB. These targets are not guarantees. Prefer legibility over forcing every document below an arbitrary byte target, and allow the owner to retake an unreadable image.

Strip unnecessary metadata such as location information. Enforce final image constraints on the server even if initial compression happens in the browser. Do not keep an unnecessary original alongside the optimized file or generate unlimited stored variants.

Delivery-only resizing does not replace the large original. If compression is performed through Cloudinary, incoming transformations can modify the asset before storage; eager transformations create derived assets. Choose the upload strategy accordingly. [Cloudinary incoming/eager transformation documentation](https://cloudinary.com/documentation/eager_and_incoming_transformations).

### 12.2 Private access

Serve Aadhaar images only after the application verifies a valid session. Use protected Cloudinary delivery for both the stored image and any variants. Cloudinary's `authenticated` delivery type protects originals and derived assets; `private` by itself leaves derived assets public by default. Configure controlled delivery rather than treating an obscure public URL as protection. [Cloudinary media access documentation](https://cloudinary.com/documentation/control_access_to_media).

Never expose the Cloudinary API secret to the browser. Authorized uploads can be handled by the backend or use server-generated signatures with narrowly enforced upload settings. [Cloudinary upload documentation](https://cloudinary.com/documentation/upload_images).

### 12.3 Replacement and deletion

- Removing a photo deletes its cloud asset and clears the farmer's active image reference.
- Replacing a photo saves and links the new optimized asset successfully before removing the old one.
- Archiving a farmer also deletes their Aadhaar asset, while financial records and bill snapshots remain.
- Database changes and cloud deletion are not one atomic operation. Persist a cleanup task/asset identifier and retry failures; do not lose the information needed to finish deletion.
- Until cleanup succeeds, block the archived/removed image from application delivery. Report or log cleanup failures for the owner/administrator.
- Do not copy Aadhaar images into invoices, supplier reports, logs, or retained financial snapshots.

## 13. Suggested data model and transaction integrity

This is a suggested logical model, not a mandatory final SQL schema:

- **Farmers:** profile, monthly rate, current mode, creation/activity timestamps, archive state, and optional image reference.
- **Farmer credits:** farmer, transaction date, total, and due snapshots where needed.
- **Farmer credit lines:** inventory reference when linked; otherwise manual; historical product/batch, quantity, prices, discount, and totals.
- **Farmer payments:** date, amount, allocation to interest/principal, and due before/after payment.
- **Interest setting history:** old/new rate and mode, effective time, and audit metadata.
- **Interest/account ledger:** accrual, capitalization, payment allocations, cycle state, and checkpoints needed to calculate balances without losing historical settings.
- **Inventory items/batches:** product fields, prices, quantity or ledger-derived balance, and archive state.
- **Stock movements:** inventory item, time, direction, quantity, reason, and linked credit where applicable.
- **Suppliers:** contact details and archive state.
- **Supplier purchases and lines:** dated purchase records and historical product details, independent of inventory items.
- **Supplier purchase status history:** Paid/Due changes and effective timestamps.
- **Invoice snapshots:** bill reference, farmer reference, generation/as-of dates, structured snapshot, and schema version.
- **Asset cleanup tasks:** asset identifiers, pending/retry/completed state, and error information.

### Integrity requirements

- Use stable identifiers and foreign keys. Archive domain records instead of cascading away financial history.
- Store original transaction prices; do not reconstruct old sales from current product data.
- Save a linked farmer credit, its line items, account change, and inventory movements atomically.
- Save a farmer payment, allocation, balance snapshots, and status change atomically.
- Apply a rate/mode change together with its effective history entry and required accrual checkpoint.
- Protect concurrent writes with suitable transactions/locking so two users cannot sell the same remaining stock or settle the same due twice.
- Use idempotency/deduplication for financial saves and cloud cleanup retries.
- Validate quantities, monetary values, rates, stock availability, and permissions on the server.
- Preserve financial transaction history; corrections should use dated reversal/correction entries rather than deleting evidence. Reversing an inventory-linked sale must also restore the corresponding stock movement.

**Implementation default:** Forms use the current business date/time; the initial scope does not expose backdating. If backdating is introduced later, replay interest and balances from the affected point and preserve an audit trail. Existing invoices remain immutable snapshots.

## 14. Performance and calculation placement

The number of transactions may grow much faster than the number of people using the website. Design for approximately 2,000 farmer accounts and long histories without loading every record into the browser.

- Paginate farmer, product, supplier, invoice, and transaction lists.
- Search and filter on the server/database.
- Index farmer name/phone search paths, transaction dates, farmer IDs, supplier IDs, inventory references, archive state, and recent activity as appropriate.
- Load detailed account history only when opened.
- Use compact aggregate queries for selected-day and all-time dashboard summaries.
- Calculate current dues from a trustworthy checkpoint plus later events instead of repeatedly replaying every transaction for every card.
- Include elapsed interest when sorting by highest due or computing total dues; a stale stored balance is not sufficient.
- Treat caches/checkpoints as accelerators that can be reconciled against the authoritative ledger.
- Keep one authoritative interest implementation, with versioned rules if behavior later changes.

A database-first calculation approach is acceptable if it improves measured performance and remains understandable and testable. Avoid unnecessary scheduled writes to every farmer every day solely to refresh displayed balances. Monthly boundaries still need to be reflected correctly whenever balances are evaluated.

## 15. Configuration, deployment, and maintenance

### 15.1 Suggested environment variables

These names are proposed conventions, to be finalized with the implementation. The following configuration belongs to the **FastAPI backend environment**:

- `APP_PASSWORD` — backend-only website access password; temporary development value `1234`. Never put this in Next.js configuration.
- `SESSION_SECRET` — backend-only session signing/encryption secret; FastAPI owns session creation and verification.
- `BUSINESS_TIMEZONE` — default `Asia/Kolkata`.
- `SUPABASE_URL` — database/API project location.
- `SUPABASE_SECRET_KEY` and/or `DATABASE_URL` — backend database access, depending on the selected integration.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — image service configuration.
- `ALLOWED_ORIGINS` — frontend origins permitted to call FastAPI, according to the chosen deployment.
- `IMAGE_SOURCE_MAX_BYTES`, `IMAGE_OPTIMIZED_MAX_BYTES`, `IMAGE_MAX_EDGE_PX` — upload/compression limits.

The **Next.js frontend** may have `BACKEND_URL` (or an intentionally public API base URL) for contacting FastAPI. It must not receive `APP_PASSWORD`, `SESSION_SECRET`, Supabase secret/database credentials, or the Cloudinary API secret. If Next.js forwards requests through a same-origin route, it forwards the visitor's request/session to FastAPI; it does not keep its own copy of the configured authentication secrets.

Keep secrets out of source control, browser bundles, logs, and Docker image layers. Use an example environment file containing placeholders and inject real values through runtime/deployment configuration.

Backend Supabase secret keys have elevated access and must stay server-side. Protect access from anonymous/public database API clients with appropriate grants and Row Level Security; the backend must still perform its own authorization. [Supabase API key documentation](https://supabase.com/docs/guides/getting-started/api-keys).

### 15.2 Docker and hosting

- Provide reproducible frontend and backend Docker builds and a documented local run configuration.
- Keep Supabase and Cloudinary as the selected external services unless the owner explicitly changes that architecture.
- Add suitable service health checks, HTTPS, allowed-origin/session configuration, and production environment injection.
- After choosing AWS, Vercel, or a split deployment, document where each component runs and how Docker fits that platform.
- Connect the Hostinger-managed domain through the DNS records required by the final deployment.
- Add real setup, migration, backup, and deployment commands to this README after they exist and have been verified.

### 15.3 Operations

Back up the database and verify restoration, because the retained ledger and invoice snapshots are the source of financial history. Monitor failed transactions, image-cleanup retries, failed bill generation, and calculation errors without logging sensitive images, passwords, or secrets.

Record the acting session/user where available, event timestamps, and reasons for financial or stock corrections. With the initial shared-password model, do not claim reliable attribution to an individual staff member.

## 16. Acceptance criteria

The implementation is ready for review when the following behavior is demonstrated:

### Access and responsive UI

- An unauthenticated visitor cannot read business data, call protected APIs, retrieve Aadhaar images, or generate private reports.
- FastAPI verifies the password configured in its own environment, issues/verifies the session, and ends that access on logout. Next.js contains no copy of the configured password or session signing secret.
- All five routes are accessible through the sidebar, with the current page highlighted; the sidebar remains visible on desktop and works as a collapsible side drawer on mobile.
- Add/edit/credit/pay/history workflows work on desktop and as usable mobile bottom sheets.
- The maroon/gold/cream Omsai design, product illustrations, wider desktop sidebar, and themed calendars remain consistent across pages. No OP avatar or dashboard Add Farmer button is present.
- Entire farmer/product/supplier cards open details, while individual action buttons remain independent. Dashboard farmer activity opens the same farmer account.
- Farmer search and the five requested sort options work. Credit and bill forms offer typed suggestions instead of requiring a scan through long dropdowns.

### Farmer accounts and interest

- Farmer creation works without an address or Aadhaar image.
- Individual monthly rates and manual compounding work; there is no repayment deadline or automatic overdue conversion.
- The simple-interest examples in section 7 return ₹102 at 30 days, ₹104 at 60 days, and ₹105.33 at 80 days for ₹100 at 2%.
- The compound example returns ₹104.04 at 60 days and ₹105.43 at 80 days under the specified rounding.
- Partial payments allocate to interest first and then principal, including a payment too small to clear accrued interest.
- New credits mid-period accrue from their own dates; rate and mode changes do not recalculate earlier periods with new settings.
- Full payment clears the account without a fractional residual, stops further accrual, and a later credit reopens it.
- Reopening a page, generating a bill, or retrying a request does not duplicate interest, payments, or capitalization.

### Inventory and suppliers

- Inventory-linked credits deduct stock once and cannot create negative stock.
- Explicit manual credit lines do not change stock.
- Multi-product credits show stock, unit, category, cost, selling price, and optional discounted final price. Duplicate lines cannot bypass aggregate stock validation.
- Product creation includes purchase price and unit; duplicate names are rejected using trimmed, case-insensitive comparison, including archived records.
- Quantity 4 appears in low-stock alerts, quantity 10 does not, and adding 20 to 4 produces 24.
- Supplier purchases and Paid/Due changes do not modify inventory.
- A supplier purchase has one Paid/Due state; partial supplier payments are not presented.
- Inventory and supplier-history PDFs include the specified fields and handle multiple pages.

### Bills, deletion, and dashboard

- A generated Full Farmer Bill appears in Invoices as a structured snapshot and can be reproduced later without storing its PDF.
- Changing prices, rates, or farmer details does not change an existing invoice snapshot.
- Farmer deletion removes the farmer from active cards, completes or retries Aadhaar cleanup, and preserves financial/bill history and outstanding dues.
- Product and supplier archival preserves stock/purchase/transaction history; archive views allow inspection and restoration.
- The calendar changes all selected-day activities and totals correctly, including multiple visits by one farmer.
- Dashboard Credit given uses historical input purchase cost while farmer debt uses actual selling price after discounts.
- Business reports use inclusive date ranges and retained historical prices, include manual lines, and reconcile purchase cost, selling amount, and product profit. Exported PDFs are upright and readable, with all multi-product bill lines retained.
- Net Business Activity uses the documented formula and counts supplier purchases only on their purchase date.
- All-time totals survive archival, and Total Farmer Dues includes current interest on outstanding archived accounts.
- Lists and detailed histories remain usable with the expected dataset size and growing transaction volume.

## 17. Future considerations

These are possible later additions, not current requirements:

- Connect supplier purchases to inventory only after the owner approves the stock-entry, batch-matching, pricing, and reconciliation rules.
- Individual staff accounts, permissions, and stronger person-level audit attribution.
- Supplier partial-payment tracking.
- A formal profit/loss view based on an agreed accounting method.
- Backdated transactions, imports of existing registers, and additional reporting periods.

Any future change to interest rules must be effective-dated, tested, and reflected in this document. Historical transactions and saved invoice snapshots must remain understandable under the rules that applied when they were recorded.
