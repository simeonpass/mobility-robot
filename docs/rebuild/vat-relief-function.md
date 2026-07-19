# VAT relief — tax-exempt checkout (tax-exclusive catalog)

**Catalog basis:** Shopify product prices are **tax-exclusive** (ex VAT). Storefront
display shows ex VAT (large) and inc VAT = catalog × 1.2 (small).

## How checkout math works

| Scenario | Payable |
|----------|---------|
| No relief | catalog × 1.2 (Shopify adds 20% VAT) |
| With relief | catalog (customer `taxExempt: true` — no VAT) |

Example: catalog **£1,000** ex VAT → no relief **£1,200** → with relief **£1,000**.

### Why not a product discount?

A fixed product discount of `catalog / 6` only works if Shopify still adds 20% tax
on the reduced base (`(net − net/6) × 1.2 = net`). On this store, tax is **not**
reliably added after that discount in real checkout, so customers were charged
~**83.3%** of catalog (e.g. **£833** on a **£1,000** item).

Combining `taxExempt` **and** a `/6` discount double-relieves the same way.

**Correct combo for tax-exclusive catalog:**

1. Product discount function applies **£0** (returns no candidates).
2. Declarant customer is marked **`taxExempt: true`** via Admin API.
3. Cart UI estimates payable = catalog (ex VAT) for relief lines.

Customer-facing “VAT savings” copy uses catalog × 0.2 (true saving vs paying inc VAT).

## How it works (UX)

1. Customer ticks **“I'm eligible for HMRC VAT relief”** and completes the declaration.
2. Cart line attributes include `VAT Relief: Yes` plus declaration details.
3. `/api/vat-relief` and cart sync upsert the customer with `taxExempt: true` (+ tags/notes).
4. At checkout, Shopify charges **no VAT** for that tax-exempt customer → pay catalog.
5. The automatic app discount remains installed but the function is a no-op.

## Admin tax settings (required)

1. **Settings → Taxes** — product prices **exclude** tax (tax-exclusive catalog).
2. UK VAT **20%** configured for non-exempt customers.
3. Keep **Charge tax** enabled on wheelchair products.
4. Declarants **must** be `taxExempt` (set by the website Admin upsert).

## One-time setup in Shopify

### 1. Link and deploy the function

```bash
shopify app config link   # if not already linked
shopify app function schema --path extensions/vat-relief-discount
cd extensions/vat-relief-discount && npm install && npm test && npm run build
cd ../..
shopify app deploy --config shopify.app.xsto-vat-relief.toml
```

Build from the **repo root** (not only inside the extension folder). Redeploy after
this change so the live function stops applying catalog/6 discounts.

### 2. Automatic discount (optional keep)

The **VAT Relief (exact)** automatic discount can stay **Active**; the function now
returns no product discount candidates. Or deactivate it — taxExempt alone is enough.

### 3. Verify

1. Add a wheelchair with VAT relief declaration (registers tax-exempt customer).
2. Proceed to Shopify checkout **with that email** (sign in if possible).
3. Confirm **no VAT** / tax line waived and **total ≈ catalog (ex VAT)**.
4. Without relief: checkout total ≈ catalog × 1.2.
5. Confirm there is **no** “VAT relief” product discount of ~catalog/6.

## Admin API

`/api/vat-relief` and cart-line sync call `upsertTaxExemptCustomer` with
`taxExempt: true`. Requires `SHOPIFY_ADMIN_API_ACCESS_TOKEN` with `write_customers`.

## Files

| Path | Purpose |
|------|---------|
| `extensions/vat-relief-discount/` | Shopify Function (no-op product discount) |
| `app/lib/shopify-admin-vat.ts` | Sets customer `taxExempt: true` |
| `app/lib/vat-math.ts` | Shared VAT calculation (display; discount = 0) |
| `app/lib/vat-relief.ts` | Cart estimated totals |
| `app/components/product/ProductPurchasePanel.tsx` | Inline declaration UX |
| `docs/rebuild/preorder-deposit.md` | Deposits are 10% of tax-exclusive catalog |
