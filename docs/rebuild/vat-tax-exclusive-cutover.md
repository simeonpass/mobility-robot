# VAT tax-exclusive cutover (rolled back)

> **Status (Aug 2026):** Rolled back to **tax-inclusive** catalog prices.
> Keep this doc for history. Do **not** set `PUBLIC_SHOPIFY_PRICES_EX_VAT=true`
> unless you intentionally cut over to net prices again.

## Current live mode (inclusive)

1. Shopify product prices are **gross (inc VAT)**
2. UK market tax display = **Show as included**
3. Website shows **inc VAT** as the main price; ex VAT when VAT relief is claimed
4. Automatic discount **VAT Relief (exact)** stays **Active** (removes ~16.67% at checkout)
5. `PUBLIC_SHOPIFY_PRICES_EX_VAT` unset or `false`

## Merchant checklist for this rollback

1. Reprice products back to **gross** (inc VAT) amounts in Shopify Admin
2. **Markets → United Kingdom → Taxes and duties** → **Show as included**
3. Keep **Charge tax on this product** ticked
4. Keep **Discounts → VAT Relief (exact)** **Active**
5. Oxygen: set `PUBLIC_SHOPIFY_PRICES_EX_VAT=false` or delete the variable, then redeploy
6. Merge the inclusive-rollback PR so the storefront default matches Admin

## If you try tax-exclusive again later

Only then:

1. Reprice to net (`gross ÷ 1.2`)
2. Markets → **Show as line item**
3. Set `PUBLIC_SHOPIFY_PRICES_EX_VAT=true` and redeploy
4. Keep **VAT Relief (exact)** Active (guest `taxExempt` alone is unreliable on non-Plus)

## Files

| Path | Role |
|------|--------|
| `app/lib/pricing-mode.ts` | Flag (default **false** = inclusive) |
| `extensions/vat-relief-discount/` | Checkout discount — keep Active |
| `docs/rebuild/vat-relief-function.md` | Discount setup |
