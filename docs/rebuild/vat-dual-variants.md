# Dual VAT variants (Standard + VAT Relief)

Clean checkout totals without the “Including £X in taxes” discount dance:

| Variant | Example (M4) | When used |
|---------|--------------|-----------|
| **Standard** | £4,200 | Default / no relief |
| **VAT Relief** | £3,500 | After HMRC declaration on the site |

With **tax-inclusive** Shopify pricing, the customer pays the **listed** variant price. Checkout shows one clear total.

## How the site uses it

1. Product option **`VAT`**: values `Standard` and `VAT Relief` (hidden in the UI).
2. Shopper claims relief → storefront adds the **VAT Relief** variant (same Colour, etc.).
3. Line still gets declaration attributes (`VAT Relief: Yes`, email, …) for HMRC records.
4. Discount function **skips** lines that are already `VAT: VAT Relief` so price is not cut twice.

## One-time Admin setup

```bash
# Dry run first (chairs only by default)
node scripts/setup-vat-relief-variants.mjs --dry-run

# Chairs only (default)
node scripts/setup-vat-relief-variants.mjs
# or
node scripts/setup-vat-relief-variants.mjs --chairs

# Accessories collection (creates missing VAT pairs + syncs prices/taxable)
node scripts/setup-vat-relief-variants.mjs --accessories

# Chairs + accessories
node scripts/setup-vat-relief-variants.mjs --all

# Or a subset
node scripts/setup-vat-relief-variants.mjs --handles=buy-robot-wheelchair,armrest-bag
```

Needs `.env`:

```env
PUBLIC_STORE_DOMAIN=f7vjea-hq.myshopify.com
SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_...   # write_products
# or SHOPIFY_DEPOSIT_CLIENT_ID + SHOPIFY_DEPOSIT_CLIENT_SECRET (write_products)
```

The script also sets **taxable** flags so checkout tax matches the listed price:

| Variant | Price | Taxable |
|---------|-------|---------|
| **Standard** | gross (inc VAT) | `true` |
| **VAT Relief** | `gross ÷ 1.2` | `false` |

After create:

1. Check each product: Standard = gross, VAT Relief = `gross ÷ 1.2`, Relief taxable = off.
2. Confirm inventory / “continue selling” on new variants.
3. Re-attach **10% deposit** selling plans to new variants if X12 / X12 Pro.
4. Publish variants to the Hydrogen / Online Store channel if needed.
5. Optional: deactivate **VAT Relief (exact)** once every qualifying product has dual variants (legacy products still use the discount).

## Merchant checklist in Admin (manual alternative)

For each product:

1. Add option **VAT** with values **Standard** and **VAT Relief**.
2. Set Standard price = current inc-VAT price; leave **Charge tax** on.
3. Set VAT Relief price = `round(price ÷ 1.2, 2)`; turn **Charge tax** off.
4. Do **not** show VAT as a customer-facing swatch (the site hides it).

## Files

| Path | Role |
|------|------|
| `scripts/setup-vat-relief-variants.mjs` | Create / price dual variants |
| `app/lib/product-vat-variants.ts` | Resolve Standard ↔ Relief |
| `app/components/product/ProductPurchasePanel.tsx` | ATC uses Relief SKU when claimed |
| `extensions/vat-relief-discount/` | Skips discount on Relief variants |
