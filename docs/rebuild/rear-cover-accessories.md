# M4 / M4B colour rear covers (accessories)

Hydrogen already maps these handles to **M4 + M4B** in `app/lib/accessories.ts`.
They were missing from the UK Shopify catalogue — create them with:

```bash
node scripts/setup-rear-cover-accessories.mjs
```

## Colours (from XSTO Mobility)

Source product: [Customized Color Backplate for M4/M4H](https://www.xstomobility.com/products/customized-color-backplate-for-m4-m4h)

| Colour | Handle | UK URL |
|--------|--------|--------|
| Tiffany Blue | `rear-cover-tiffany-blue` | `/products/rear-cover-tiffany-blue` |
| Sparkling Yellow | `rear-cover-sparkling-yellow` | `/products/rear-cover-sparkling-yellow` |
| Barbie Pink | `rear-cover-barbie-pink` | `/products/rear-cover-barbie-pink` |
| Pearl White | `rear-cover-pearl-white` | `/products/rear-cover-pearl-white` |
| Burgundy Red | `rear-cover-burgundy-red` | `/products/rear-cover-burgundy-red` |
| Blue Enamel | `rear-cover-blue-enamel` | `/products/rear-cover-blue-enamel` |
| Superior Purple | `rear-cover-superior-purple` | `/products/rear-cover-superior-purple` |

Default price: **£129.00** (override with `REAR_COVER_PRICE_GBP=...` when running the script).

## Credentials

Same pattern as deposit setup — put in `.env`:

```bash
PUBLIC_STORE_DOMAIN=f7vjea-hq.myshopify.com
SHOPIFY_DEPOSIT_CLIENT_ID=...
SHOPIFY_DEPOSIT_CLIENT_SECRET=shpss_...
# scopes: read_products, write_products (+ write_publications if available)
```

Or a legacy `SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_...`.

## After the script

1. Confirm each product is **Active** and on the **Hydrogen / Headless** sales channel
2. Confirm they appear under **Collections → Accessories**
3. Spot-check `/collections/accessories` and an M4 PDP add-on list
4. Adjust inventory / price in Admin if needed
