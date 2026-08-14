# XSTO accessories CSV vs storefront

Source: merchant `XSTO accessories.csv` (SPA-XST SKUs and UK RRPs).

## Already on the website

| SKU | CSV title | Shopify handle |
|-----|-----------|----------------|
| SPA-XST-01 | M4 inflatable cushion with inflator | `travel-cushion-seat-with-pump` |
| SPA-XST-02 | Arm hanging cloth bag | `armrest-bag` |
| SPA-XST-03 | M4 headrest with backrest assembly | `ergonomic-chairs-for-back-support` |
| SPA-XST-04 | M4 Flashlight holder | `flashlight-holder` |
| SPA-XST-05 | M4 Battery Charger | `wheelchair-battery-charger` |
| SPA-XST-06–12 | Rear Cover colours | `rear-cover-m4` (7 colour variants) |
| SPA-XST-13 | M4 24V 10.4AH battery | `lithium-10-4ah-battery-batteries-lithium-battery` |
| SPA-XST-14 / 32 | Universal wheels | `universal-wheels-for-xsto-m4` |
| SPA-XST-15 | M4 24V 15.6AH battery | `batteries-lithium-battery-15-6ah-battery` |
| SPA-XST-16 | M4 Mobile Phone holder | `buy-universal-phone-holder` |
| SPA-XST-17 | M4 Umbrella Attachment | `umbrella-bracket-m4-m4-pro` |
| SPA-XST-22 | Rear Auxiliary joystick M4 Pro | `auxiliary-joystick-m4-m4-pro` |
| SPA-XST-23 | Adjustable headrest M4 Pro & X12 | `adjustable-headrest-m4-pro` and `adjustable-headrest-for-x12-x12-pro` |
| SPA-XST-25 | Right lateral support M4 Pro | `lateral-side-guard-m4-pro` |
| SPA-XST-26–29 | M4 Pro seat / backrest cushions | matching `*-cushion-*-m4-pro` products |
| SPA-XST-30 | Rear-view mirror M4 | `rearview-mirror-m4-pro` |
| SPA-XST-43 / 44 | Trunk Support Left / Right | `trunk-support-m4-pro` (sold as one listing) |
| SPA-XST-52 | Bluetooth remote | `bluetooth-controller-for-m4-m4h-m4-pro-x12-x12-pro` |
| SPA-XST-56 | Backpack M4 Pro | `black-backpack-for-m4-pro` |
| SPA-XST-57 | Cup holder M4 Pro | `cup-holder-for-all-models` |

Existing M4 Pro items that were not in the Accessories collection are added by `scripts/sync-xsto-csv-accessories.mjs`.

## Created from the CSV

New Shopify products. CSV RRPs are **ex-VAT**. Standard price = CSV × 1.2, then rounded up to the next clean retail price point (£15, £20, £50, £75, £100, £120, £250, £500, £1000). VAT Relief = Standard ÷ 1.2. Images from [xstomobility.com](https://www.xstomobility.com/collections/accessories) where a matching listing exists; otherwise a closely related in-store photo, or no image for small spares.

| SKU | Handle |
|-----|--------|
| SPA-XST-18 | `m4-spare-seat-connector-female-socket` |
| SPA-XST-19 | `m4-spare-right-front-mud-cover` |
| SPA-XST-20 | `m4-spare-left-front-mud-cover` |
| SPA-XST-21 | `m4-pro-handle-fixing-plate` |
| SPA-XST-33 | `m4-m4-pro-battery-25-2v-23-8ah` |
| SPA-XST-34 | `x12-x12-pro-battery-25-2v-25-6ah` |
| SPA-XST-35–40 | `straight-*-cushion-*-m4-pro-x12` |
| SPA-XST-41 | `phone-holder-m4-pro-x12` |
| SPA-XST-45 | `rear-view-mirror-m4-pro-x12` |
| SPA-XST-46 | `umbrella-holder-m4-pro-x12` |
| SPA-XST-47 | `cooling-seat-cushion-m4-pro-x12` |
| SPA-XST-58 | `ct420-handle-joystick-knob` |
| SPA-XST-59 | `cane-holder-m4` |
| SPA-XST-60 | `rear-push-handles-m4` |
| SPA-XST-61 | `straight-quick-release-backboard-m4-pro` |

Rounded inc-VAT list prices (CSV net × 1.2, then lifted to a round retail figure):

| SKU | CSV net | Standard (inc VAT) | VAT Relief |
|-----|--------:|-------------------:|-----------:|
| SPA-XST-18 | £36 | £50 | £41.67 |
| SPA-XST-19 / 20 | £10 | £15 | £12.50 |
| SPA-XST-21 | £15 | £20 | £16.67 |
| SPA-XST-33 | £399 | £500 | £416.67 |
| SPA-XST-34 | £799 | £1,000 | £833.33 |
| SPA-XST-35 / 36 / 39 / 58 | £99 | £120 | £100 |
| SPA-XST-37 / 40 | £79 | £100 | £83.33 |
| SPA-XST-38 / 46 / 47 | £89 | £120 | £100 |
| SPA-XST-41 | £49 | £60 | £50 |
| SPA-XST-45 | £39 | £50 | £41.67 |
| SPA-XST-59 / 60 | £59 | £75 | £62.50 |
| SPA-XST-61 | £189 | £250 | £208.33 |

CSV gaps (no rows): SPA-XST-24, 31, 42, 48–51, 53–55.

## Hydrogen sales channel

The Admin app used to create products has `write_products` but not `write_publications`. New listings are **Active in Shopify Admin** immediately; they only appear on mobilityrobot.co.uk / localhost after you include them in the **Hydrogen** sales channel:

1. Shopify Admin → **Products**
2. Filter by created today or search `SPA-XST-34`
3. Select the new accessories
4. **More actions** → **Include in sales channels** → Hydrogen / Headless

Existing CSV matches that were already on Hydrogen were added to the Accessories collection and show on `/collections/accessories` without that step.

## Re-run

```bash
node scripts/sync-xsto-csv-accessories.mjs --dry-run
node scripts/sync-xsto-csv-accessories.mjs
node scripts/setup-vat-relief-variants.mjs --accessories
```
