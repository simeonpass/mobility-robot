# Dual VAT variants (Standard + VAT Relief)

Clean checkout totals without the “Including £X in taxes” discount dance:

| Variant | Example (M4) | When used |
|---------|--------------|-----------|
| **Standard** | £4,200 | Default / no relief |
| **VAT Relief** | £3,500 | After HMRC declaration on the site |

With **tax-inclusive** Shopify pricing, the customer pays the **listed** variant price. Checkout shows one clear total when **VAT Relief** variants have **Charge tax** unticked (Standard keeps Charge tax on).

## How the site uses it

1. Product option **`VAT`**: values `Standard` and `VAT Relief` (hidden in the UI).
2. Shopper claims relief on the PDP **or cart** → storefront uses the **VAT Relief** variant (same Colour, etc.). Cart claim swaps the line’s `merchandiseId`; PDP add-to-cart picks Relief before ATC.
3. Line still gets declaration attributes (`VAT Relief: Yes`, email, …) for HMRC records.
4. Discount function **skips** lines that are already `VAT: VAT Relief` so price is not cut twice.

**Tax setting (Admin, per variant):**

| Variant | Charge tax | Why |
|---------|------------|-----|
| **Standard** | ON (ticked) | Full price includes VAT |
| **VAT Relief** | OFF (unticked) | Net price — stops “Including £X in taxes” |

Also keep Markets / store tax display as **include in product price** (not “show as line item”).

## One-time Admin setup

```bash
# Chairs only (default)
node scripts/setup-vat-relief-variants.mjs --dry-run
node scripts/setup-vat-relief-variants.mjs

# Accessories (creates VAT Relief + sets taxable flags)
node scripts/setup-vat-relief-variants.mjs --accessories --dry-run
node scripts/setup-vat-relief-variants.mjs --accessories

# Chairs + accessories
node scripts/setup-vat-relief-variants.mjs --all

# Or a subset
node scripts/setup-vat-relief-variants.mjs --handles=armrest-bag,rear-cover-m4
```

Needs env:

```env
PUBLIC_STORE_DOMAIN=f7vjea-hq.myshopify.com
# either:
SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_...   # write_products
# or Dev Dashboard app:
SHOPIFY_DEPOSIT_CLIENT_ID=...
SHOPIFY_DEPOSIT_CLIENT_SECRET=...
```

The script:

1. Creates **VAT** option (`Standard` / `VAT Relief`) when missing.
2. Sets Relief price = `gross ÷ 1.2`.
3. Sets **Standard taxable=true**, **VAT Relief taxable=false**.

After create:

1. Check each product: Standard = gross, VAT Relief = `gross ÷ 1.2`.
2. Confirm inventory / “continue selling” on new variants.
3. Re-attach **10% deposit** selling plans to new variants if X12 / X12 Pro.
4. Publish variants to the Hydrogen / Online Store channel if needed.
5. Optional: deactivate **VAT Relief (exact)** once every qualifying product has dual variants (legacy products still use the discount).

## Merchant checklist in Admin (manual alternative)

For each product:

1. Add option **VAT** with values **Standard** and **VAT Relief**.
2. Set Standard price = current inc-VAT price; **Charge tax** = on.
3. Set VAT Relief price = `round(price ÷ 1.2, 2)`; **Charge tax** = off.
4. Do **not** show VAT as a customer-facing swatch (the site hides it).

## Files

| Path | Role |
|------|------|
| `scripts/setup-vat-relief-variants.mjs` | Create / price dual variants + taxable flags |
| `app/lib/product-vat-variants.ts` | Resolve Standard ↔ Relief |
| `app/components/product/ProductPurchasePanel.tsx` | ATC uses Relief SKU when claimed |
| `app/components/vat-relief/VatReliefModal.tsx` | Cart claim swaps to Relief SKU |
| `extensions/vat-relief-discount/` | Skips discount on Relief variants |
