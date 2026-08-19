# Pre-order + 10% deposit (Shopify Admin checklist)

Hydrogen supports **pay in full** vs **pay 10% deposit** when variants expose `sellingPlanAllocations`, and shows per-product delivery ETAs.

**X12 / X12 Pro (current):** both models are **in stock** with a **10-day** lead time. They are not forced pre-order. If a 10% deposit selling plan is still assigned in Shopify Admin, the PDP may still offer it — remove the purchase option from those products if deposits should no longer appear.

| Product | Handle | ETA |
|---------|--------|-----|
| X12 | `x12-all-terrain-mobility-robot` | In stock · 10 days |
| X12 Pro | `xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition` | In stock · 10 days |

The checklist below is for **future** pre-order products that need continue-selling + a deposit plan. Without those Admin steps, OOS chairs stay **Sold out**, and the deposit radio stays hidden.

## 1. Continue selling when out of stock (required for pre-order)

For any product that should stay buyable at quantity 0:

1. Shopify Admin → **Products** → open the product
2. **Inventory** → set quantity to **0** (so checkout cannot ship from phantom stock)
3. Enable **Continue selling when out of stock** (per variant if multi-variant)
4. Save

Storefront rule: `availableForSale && quantityAvailable === 0` maps products to pre-order, except X12 / X12 Pro which stay **In stock · 10 days**. If continue-selling is off and qty is 0, ATC stays sold out.

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

The script (legacy X12 setup — do not re-run unless those models go back on pre-order):

1. Finds X12 and X12 Pro by handle
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

- Cart line **VAT Relief** attributes are unchanged when adding with a selling plan
- Shopify’s checkout charge % is usually calculated on the **catalog / pre-discount** price; the VAT Relief function still runs on checkout lines
- **Verify** a deposit + VAT relief order end-to-end: deposit amount and remaining balance should look right after VAT removal
- If the deposit % looks like it was taken on the inc-VAT price while the customer claimed relief, adjust merchant process or pricing policy (document for ops)

## 4. Klarna / BNPL

- PDP hides Klarna installment copy when **Pay 10% deposit** is selected
- Do not promise Klarna on deposits until confirmed in Shopify Payments for deferred purchase options

## 5. How to test (local)

```bash
npm run dev
```

| URL | Expect |
|-----|--------|
| `/products/x12-all-terrain-mobility-robot` | In stock · Delivers in 10 days |
| `/products/xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition` | Same as X12 |
| `/cart` | Slowest in-stock ETA (10 days if an X12 is in the cart); deposit badge only on deposit lines |

Checkout still uses Shopify `checkoutUrl` (selling plans ride along).
