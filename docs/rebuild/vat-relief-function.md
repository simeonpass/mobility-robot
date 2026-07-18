# VAT relief — exact checkout discount (Shopify Function)

HMRC VAT relief removes **exactly** 20% VAT from inc-VAT prices (`gross ÷ 1.2`).
Percentage discount codes cannot do this on Shopify — we use a **Product Discount Function** instead.

## How it works

1. Customer ticks **“I'm eligible for HMRC VAT relief”** on the product page and completes the inline declaration.
2. Cart line attributes include `VAT Relief: Yes` plus declaration details.
3. At checkout, the **VAT Relief (exact)** automatic app discount runs the function.
4. The function applies a **fixed-amount** discount per line equal to the exact VAT portion.

Example: £3,995 inc VAT → **£665.83** discount → customer pays **£3,329.17**.

## One-time setup in Shopify

### 1. Link and deploy the function

```bash
shopify app config link
cd extensions/vat-relief-discount && npm install && npm run build
cd ../..
shopify app deploy
```

### 2. Create the automatic app discount

In **Shopify Admin → Discounts → Create discount**:

1. Choose **App discount**
2. Select **VAT Relief (exact)**
3. Set it as **Automatic** (no code required)
4. Activate the discount

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
