# VAT relief — exact checkout discount (Shopify Function)

HMRC VAT relief removes **exactly** 20% VAT from inc-VAT prices (`gross ÷ 1.2`).
Percentage discount codes cannot do this on Shopify — we use a **Product Discount Function** instead.

## How it works

1. Customer ticks **“I'm eligible for HMRC VAT relief”** on the product page and completes the inline declaration.
2. Cart line attributes include `VAT Relief: Yes` plus declaration details.
3. At checkout, the **VAT Relief (exact)** automatic app discount runs the function (`cart.lines.discounts.generate.run`).
4. The function applies a **fixed-amount** discount per line equal to the exact VAT portion.

Example: £3,995 inc VAT → **£665.83** discount → customer pays **£3,329.17**.

## One-time setup in Shopify

### 1. Link and deploy the function

```bash
shopify app config link   # if not already linked
shopify app function schema --path extensions/vat-relief-discount
cd extensions/vat-relief-discount && npm install && npm test && npm run build
cd ../..
shopify app deploy --config shopify.app.xsto-vat-relief.toml
```

Build from the **repo root** (not only inside the extension folder). The function uses the current Discount API (`cart.lines.discounts.generate.run`), not the deprecated product-discount API.

### 2. Create the automatic discount (API — required for this app)

**XSTO VAT Relief** is function-only (no admin UI). Do **not** use **Discounts → Create discount → VAT Relief (exact)** — that opens a blank app page.

Instead, create the discount once via Admin API.

**Option A — XSTO VAT Relief app credentials** (required — `store execute` uses the wrong app):

1. Open [XSTO VAT Relief in Dev Dashboard](https://dev.shopify.com/dashboard/156117887/apps/399371436033)
2. **Settings → Credentials** → copy **Client secret** (Client ID is `d0589c6e7756aea84becc989391f687d`)
3. Add to `.env`:

```env
XSTO_VAT_RELIEF_CLIENT_ID=d0589c6e7756aea84becc989391f687d
XSTO_VAT_RELIEF_CLIENT_SECRET=shpss_...
PUBLIC_STORE_DOMAIN=f7vjea-hq.myshopify.com
```

4. Run:

```bash
node scripts/create-vat-relief-discount-with-app.mjs
```

**Option B — Shopify CLI** (only works if Bentech is a Partner dev store):

```bash
npx shopify app execute --config shopify.app.xsto-vat-relief.toml \
  --store f7vjea-hq.myshopify.com \
  --query-file extensions/vat-relief-discount/create-automatic-discount.graphql
```

Do **not** use `shopify store execute` — it authenticates as a generic CLI app, not XSTO VAT Relief.

**Option C — custom Admin app token** (needs `write_discounts` in `.env`):

```bash
node scripts/create-vat-relief-discount.mjs
```

Add to `.env` if missing:

```env
PUBLIC_STORE_DOMAIN=f7vjea-hq.myshopify.com
SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_...   # from Settings → Develop apps
```

**Option C — Shopify GraphiQL App** in Admin:

1. Install [Shopify GraphiQL app](https://apps.shopify.com/shopify-graphiql-app) (or use your custom app token)
2. Run:

```graphql
mutation {
  discountAutomaticAppCreate(
    automaticAppDiscount: {
      title: "VAT Relief (exact)"
      functionHandle: "vat-relief-discount"
      discountClasses: [ORDER]
      startsAt: "2026-07-18T00:00:00"
      combinesWith: {
        orderDiscounts: true
        productDiscounts: true
        shippingDiscounts: true
      }
    }
  ) {
    automaticAppDiscount { discountId title status }
    userErrors { field message }
  }
}
```

> **Combining with discount codes:** VAT relief is an **ORDER** discount so it can stack with product codes (e.g. `JENNI10`) on non-Plus plans. It removes ~16.67% (the UK VAT share) from declared lines after product discounts. If you recreate the discount, keep `combinesWith.productDiscounts: true`. To update a live discount: `node scripts/enable-vat-relief-discount-combinations.mjs`.

3. In **Discounts**, confirm **VAT Relief (exact)** is **Active**
4. **Deactivate** the old **VAT Exemption** automatic discount

### 3. Verify

1. Add a wheelchair with VAT relief declaration to cart
2. Proceed to Shopify checkout
3. Confirm line shows **“VAT relief”** discount with exact amount (e.g. −£665.83 on £3,995)

## Admin API (optional)

The `/api/vat-relief` route still marks customers as **tax exempt** in Shopify Admin for your records. The checkout price change comes from the function, not the tax-exempt flag alone.

## Files

| Path | Purpose |
|------|---------|
| `extensions/vat-relief-discount/` | Shopify Function (exact fixed discount) |
| `app/lib/vat-math.ts` | Shared VAT calculation (storefront display) |
| `app/lib/vat-relief.ts` | Cart estimated totals |
| `app/components/product/ProductPurchasePanel.tsx` | Inline declaration UX |
