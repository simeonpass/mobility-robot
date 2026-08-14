# VAT tax-exclusive cutover (no Shopify Plus)

Goal: stop using a “VAT relief” **discount**, and instead:

1. Store product prices in Shopify as **ex VAT** (net)
2. Let Shopify add **20% VAT** at checkout for normal buyers
3. Mark eligible buyers **tax exempt** so they pay net only
4. Keep the Hydrogen site showing **VAT-inclusive** UK prices

This removes the confusing Admin line where a discount + “VAT included” fight each other.

## Website price display

After cutover, product pages show:

- **Large price:** ex VAT (cheaper / VAT relief price)
- **Secondary:** inc VAT if the buyer is not eligible
- **Google Product schema:** ex VAT amount

Set `PUBLIC_SHOPIFY_PRICES_EX_VAT=true` only after Admin net prices are live.

## Admin checklist (you must do this)

Do this in a quiet window. Test on one product first if possible.

### 1. Export current prices

Note every live **inc-VAT** price (chairs + accessories). Example:

- M4B £4,500 → net **£3,750.00**
- Rear cover £60 → net **£50.00**

Formula: `net = round(gross ÷ 1.2, 2)`

### 2. Switch tax display

Shopify Admin → **Settings → Taxes and duties** (and UK market if using Markets):

- Turn **off** “include tax in product prices” / use **tax-exclusive** prices for the UK market
- Keep UK VAT registration at **20%**
- Confirm shipping tax settings still make sense

Exact labels vary by Shopify admin version / Markets.

### 3. Reprice products to net

For each product/variant, set price to the **net** amount from step 1.

Also check:

- Compare-at / RRP amounts (convert the same way if you keep them)
- **10% deposit selling plans** — recreate or verify charges are 10% of the **new net** price (or whatever deposit basis you want)
- Collections / price lists if any

### 4. Confirm Admin API token

Oxygen / `.env` needs `SHOPIFY_ADMIN_API_ACCESS_TOKEN` with `write_customers` so declarations can set **tax exempt**.

### 5. Flip the storefront flag

The storefront now **defaults to tax-exclusive mode**. Your Oxygen variable
`PUBLIC_SHOPIFY_PRICES_EX_VAT=true` is fine to keep.

Only set `PUBLIC_SHOPIFY_PRICES_EX_VAT=false` if you need to roll back.

Redeploy after merging so Hydrogen uses net catalog amounts correctly:

- Hero / Google: net (ex VAT)
- Secondary: net × 1.2 (inc VAT)

### 6. Deactivate the discount

Admin → **Discounts** → deactivate **VAT Relief (exact)** (the app function discount).

Leave the declaration UX and taxExempt sync in place.

### 7. Test matrix

| Case | Expected |
|------|----------|
| Buy chair, no relief | Checkout total ≈ catalog net + 20% VAT (= old gross) |
| Buy chair + cover, with relief | Tax £0; total = sum of nets; **same email** as declaration |
| Deposit + relief | Due today = deposit on net; tax £0 |
| Wrong email at checkout | Tax may still apply — buyer must use declaration email |

## Order Admin after cutover (what you should see)

Example: M4B + cover with relief

- Subtotal: £3,800.00 (nets)
- Tax: **£0.00**
- Total: **£3,800.00**

No “VAT relief −£760” discount line. No fake “£635 VAT included”.

## Rollback

1. Set `PUBLIC_SHOPIFY_PRICES_EX_VAT` back to unset/`false`
2. Revert product prices to gross (inc VAT)
3. Turn tax-inclusive pricing back on
4. Re-activate the VAT Relief discount

## Files

| Path | Role |
|------|--------|
| `app/lib/pricing-mode.ts` | Flag + catalog → display conversion |
| `app/lib/product-pricing.ts` | PDP / Klarna / package totals |
| `app/lib/vat-relief.ts` | Cart summary math |
| `app/routes/cart.tsx` | TaxExempt sync + buyer email |
| `docs/rebuild/vat-relief-function.md` | Legacy discount docs (still valid until step 6) |
