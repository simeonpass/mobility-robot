# Dual VAT variants (Standard + VAT Relief)

Clean checkout totals without the “Including £X in taxes” discount dance:

| Variant | Example (M4) | When used |
|---------|--------------|-----------|
| **Standard** | £4,200 | Default / no relief |
| **VAT Relief** | £3,500 | After HMRC declaration on the site |

With **tax-inclusive** Shopify pricing, the customer pays the **listed** variant price. Checkout shows one clear total.

## How the site uses it

1. Product option **`VAT`**: values `Standard` and `VAT Relief` (hidden in the UI).
2. Shopper claims relief on the PDP **or cart** → storefront uses the **VAT Relief** variant (same Colour, etc.). Cart claim swaps the line’s `merchandiseId`; PDP add-to-cart picks Relief before ATC.
3. Line still gets declaration attributes (`VAT Relief: Yes`, email, …) for HMRC records.
4. Discount function **skips** lines that are already `VAT: VAT Relief` so price is not cut twice.

**Tax setting:** Shopify must use **tax-inclusive** prices (“Include sales tax in product price” / show tax as included). If checkout adds 20% on top of the listed price, dual variants will not produce a clean net total.

## One-time Admin setup

```bash
# Dry run first
node scripts/setup-vat-relief-variants.mjs --dry-run

# Create / sync variants (needs write_products)
node scripts/setup-vat-relief-variants.mjs

# Or a subset
node scripts/setup-vat-relief-variants.mjs --handles=buy-robot-wheelchair,xsto-m4b-1
```

Needs `.env`:

```env
PUBLIC_STORE_DOMAIN=f7vjea-hq.myshopify.com
SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_...   # write_products
```

After create:

1. Check each product: Standard = gross, VAT Relief = `gross ÷ 1.2`.
2. Confirm inventory / “continue selling” on new variants.
3. Re-attach **10% deposit** selling plans to new variants if X12 / X12 Pro.
4. Publish variants to the Hydrogen / Online Store channel if needed.
5. Optional: deactivate **VAT Relief (exact)** once every qualifying product has dual variants (legacy products still use the discount).

## Merchant checklist in Admin (manual alternative)

For each product:

1. Add option **VAT** with values **Standard** and **VAT Relief**.
2. Set Standard price = current inc-VAT price.
3. Set VAT Relief price = `round(price ÷ 1.2, 2)`.
4. Do **not** show VAT as a customer-facing swatch (the site hides it).

## Files

| Path | Role |
|------|------|
| `scripts/setup-vat-relief-variants.mjs` | Create / price dual variants |
| `app/lib/product-vat-variants.ts` | Resolve Standard ↔ Relief |
| `app/components/product/ProductPurchasePanel.tsx` | ATC uses Relief SKU when claimed |
| `app/components/vat-relief/VatReliefModal.tsx` | Cart claim swaps to Relief SKU |
| `extensions/vat-relief-discount/` | Skips discount on Relief variants |
