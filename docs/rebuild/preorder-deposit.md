# Pre-order + 10% deposit (Shopify Admin checklist)

Hydrogen already supports **pay in full** vs **pay 10% deposit** when variants expose `sellingPlanAllocations`, and shows per-product pre-order ETAs:

| Product | Handle | ETA |
|---------|--------|-----|
| EzGo2 | `xsto-ezgo2-carbon-fiber-power-wheelchair` | ~2 weeks |
| X12 | `x12-all-terrain-mobility-robot` | ~10 weeks |
| X12 Pro | `xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition` | ~10 weeks |

Without the Admin steps below, OOS chairs stay **Sold out**, and the deposit radio stays hidden.

## 1. Continue selling when out of stock (required for X12 / X12 Pro)

For **X12** and **X12 Pro** (and EzGo2 if you want pre-order when stock hits 0):

1. Shopify Admin → **Products** → open the product
2. **Inventory** → enable **Continue selling when out of stock** (per variant if multi-variant)
3. Save

Storefront rule: `availableForSale && quantityAvailable === 0` → **Pre-order**. If continue-selling is off, ATC stays sold out.

## 2. Create a 10% deposit selling plan group

Native deposit / deferred checkout charges need a **Purchase options / selling plan** app with `write_purchase_options` (often Shopify Plus / deferred purchase options).

Store `f7vjea-hq` no longer offers legacy **Develop apps** custom apps with `shpat_` tokens — use a **Dev Dashboard** app instead.

### Option A — script via Dev Dashboard app (preferred)

#### One-time: create / configure the Deposit app

1. Open [Shopify Dev Dashboard](https://dev.shopify.com/dashboard) → your org → **Apps**
2. Open (or create) the app named **Deposit setup** / **Deposits**
3. Ensure access scopes include:
   - `read_products`
   - `write_products`
   - `write_purchase_options`
4. **Release** a version that includes those scopes (Versions → create/release)
5. **Install** the app on store `f7vjea-hq` if it is not already listed under Admin → **Apps**
6. Dev Dashboard → that app → **Settings** → **Credentials**
7. Copy **Client ID** and **Client secret** into `.env`:

```bash
SHOPIFY_DEPOSIT_CLIENT_ID=paste_client_id_here
SHOPIFY_DEPOSIT_CLIENT_SECRET=shpss_paste_client_secret_here
PUBLIC_STORE_DOMAIN=f7vjea-hq.myshopify.com
```

Do **not** put the Client secret in `SHOPIFY_ADMIN_API_ACCESS_TOKEN` — `shpss_` is a secret, not an Admin access token. The script exchanges Client ID + Secret for a short-lived token via `client_credentials` (same pattern as VAT Relief).

#### Run

```bash
node scripts/setup-preorder-deposit.mjs
```

Auth order (first match wins):

1. `SHOPIFY_ADMIN_API_ACCESS_TOKEN` only if it starts with `shpat_` (legacy)
2. `SHOPIFY_DEPOSIT_CLIENT_ID` + `SHOPIFY_DEPOSIT_CLIENT_SECRET` (Dev Dashboard)
3. VAT Relief client credentials (last resort — usually `write_discounts` only, will fail)

The script:

1. Finds EzGo2, X12, X12 Pro by handle
2. Sets variant `inventoryPolicy: CONTINUE` where needed
3. Creates a **10% deposit** `PRE_ORDER` selling plan group and assigns it to those products

If it fails with scope / permission errors, confirm the released version has the scopes above and the app is installed, then use Option B.

### Option B — Admin UI / GraphiQL

1. Install or open an app that can create selling plans (Shopify GraphiQL app, or your custom Admin app)
2. Run a mutation like:

```graphql
mutation {
  sellingPlanGroupCreate(
    input: {
      name: "10% Deposit"
      merchantCode: "deposit-10"
      options: ["Payment"]
      sellingPlansToCreate: [
        {
          name: "Pay 10% deposit"
          options: ["10% deposit — balance before dispatch"]
          category: PRE_ORDER
          billingPolicy: {
            fixed: {
              checkoutCharge: {type: PERCENTAGE, value: {percentage: 10.0}}
              remainingBalanceChargeTrigger: ON_FULFILLMENT
            }
          }
          deliveryPolicy: {fixed: {fulfillmentTrigger: UNKNOWN}}
          pricingPolicies: [
            {fixed: {adjustmentType: PERCENTAGE, adjustmentValue: {percentage: 0.0}}}
          ]
          inventoryPolicy: {reserve: ON_FULFILLMENT}
        }
      ]
    }
    resources: {
      productIds: [
        "gid://shopify/Product/EZGO2_ID",
        "gid://shopify/Product/X12_ID",
        "gid://shopify/Product/X12_PRO_ID"
      ]
    }
  ) {
    sellingPlanGroup { id }
    userErrors { field message }
  }
}
```

Replace the product GIDs with the real IDs from Admin.

3. Confirm on each product → **Purchase options** that the deposit plan is listed

## 3. VAT relief + deposits

- Catalog (and therefore the 10% selling-plan charge) is **tax-exclusive**
- Cart line **VAT Relief** attributes are unchanged when adding with a selling plan
- Storefront “due today” with relief = checkout charge (ex VAT); without relief ≈ charge × 1.2
- The VAT Relief function still runs on checkout lines (discount = charge base / 6 when tax is added after discounts)
- **Verify** a deposit + VAT relief order end-to-end: deposit due today should match 10% of the ex-VAT catalog

## 4. Klarna / BNPL

- PDP hides Klarna installment copy when **Pay 10% deposit** is selected
- Do not promise Klarna on deposits until confirmed in Shopify Payments for deferred purchase options

## 5. How to test (local)

```bash
npm run dev
```

| URL | Expect |
|-----|--------|
| `/products/xsto-ezgo2-carbon-fiber-power-wheelchair` | ETA ~2 weeks when preorder; payment radios if selling plan assigned |
| `/products/x12-all-terrain-mobility-robot` | Pre-order ~10 weeks (after continue-selling); deposit option if plan assigned |
| `/products/xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition` | Same as X12 |
| `/cart` | Pre-order ETA from longest lead-time line; deposit badge on deposit lines |

Checkout still uses Shopify `checkoutUrl` (selling plans ride along).
