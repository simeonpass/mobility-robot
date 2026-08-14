# VAT tax-exclusive cutover (no Shopify Plus)

## Goal

1. Store product prices in Shopify as **ex VAT** (net)
2. UK market tax display = **Show as line item** (add VAT at checkout)
3. Website shows **ex VAT** large + **inc VAT** secondary
4. Eligible buyers claim HMRC VAT relief on the site

## Critical: keep the VAT Relief discount ACTIVE

On **non-Plus** Shopify, customer `taxExempt` alone is **unreliable** for guest checkout.
The automatic app discount **VAT Relief (exact)** must stay **Active**.

With net prices + line-item VAT + that discount:

| Step | Amount (M4 £3,500 net) |
|------|-------------------------|
| Catalog / subtotal | £3,500 |
| VAT relief discount (~16.67%) | −£583.33 |
| VAT 20% on discounted amount | +£583.33 |
| **Customer pays** | **£3,500** |

So checkout may still **show a tax line**, but the **total** should be the ex-VAT price.
Without relief: **£3,500 + £700 VAT = £4,200**.

Do **not** deactivate **VAT Relief (exact)** unless you move to Shopify Plus or another platform.

`taxExempt` sync remains a secondary helper (Admin customer record / notes).

## Website price display

- **Large price:** ex VAT
- **Secondary:** inc VAT if not eligible
- **Google Product schema:** ex VAT
- Storefront defaults to tax-exclusive catalog mode (`PUBLIC_SHOPIFY_PRICES_EX_VAT`)

## Admin checklist

### 1. Net product prices

Example: old gross £4,200 → net **£3,500**. Formula: `net = round(gross ÷ 1.2, 2)`.

Keep **Charge tax on this product** ticked on chairs/accessories.

### 2. UK market tax display

**Markets → United Kingdom → Taxes and duties**

- **Show as line item** (add tax at checkout)
- Not “Show as included”

Store-level “Include sales tax in product price” should stay **unticked**.

### 3. Discounts

**Discounts → VAT Relief (exact)** = **Active**

If it was turned off during cutover, turn it back on in Admin, or run:

```bash
node scripts/activate-vat-relief-discount.mjs
```

### 4. Admin API (optional but useful)

Oxygen `SHOPIFY_ADMIN_API_ACCESS_TOKEN` with `write_customers` so declarations can mark the customer tax-exempt for Admin records.

Checkout now goes through `/cart/checkout`, which syncs taxExempt and locks the cart buyer email to the declaration before Shopify checkout.

### 5. Test

1. New cart, claim VAT relief, click **Proceed to checkout** (uses declaration email)
2. Enter UK address so tax calculates
3. **Check the Total**, not only the Tax line:
   - With relief → Total ≈ **£3,500** (look for a **VAT relief** discount line)
   - Without relief → Total ≈ **£4,200**

If the total is still full + VAT with relief claimed, the automatic discount is almost certainly **Inactive**.

## Rollback to “this morning” (tax-inclusive + discount)

1. Markets UK → tax display **Show as included**
2. Reprice products back to **gross** (old inc-VAT amounts)
3. Keep **VAT Relief (exact)** Active
4. Set Oxygen `PUBLIC_SHOPIFY_PRICES_EX_VAT=false` (or delete it) and redeploy
5. Optionally set code default back to inclusive if needed

## Files

| Path | Role |
|------|--------|
| `app/lib/pricing-mode.ts` | Flag + catalog → display conversion |
| `extensions/vat-relief-discount/` | Checkout discount (~16.67%) — keep active |
| `app/routes/cart.checkout.tsx` | Checkout gate (taxExempt sync + buyer email) |
| `app/lib/shopify-admin-vat.ts` | Optional taxExempt customer sync |
| `scripts/activate-vat-relief-discount.mjs` | Reactivate discount via Admin API |
| `docs/rebuild/vat-relief-function.md` | Discount setup |
