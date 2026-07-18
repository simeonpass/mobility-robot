#!/usr/bin/env node
/**
 * Set continue-selling + create/assign a 10% deposit PRE_ORDER selling plan
 * for EzGo2, X12, and X12 Pro.
 *
 * Auth (first match wins):
 *   1. SHOPIFY_ADMIN_API_ACCESS_TOKEN starting with shpat_ (legacy custom app)
 *   2. SHOPIFY_DEPOSIT_CLIENT_ID + SHOPIFY_DEPOSIT_CLIENT_SECRET
 *      (Dev Dashboard app — client_credentials; needs read_products, write_products,
 *      write_purchase_options)
 *   3. XSTO_VAT_RELIEF_CLIENT_ID + XSTO_VAT_RELIEF_CLIENT_SECRET (last resort;
 *      usually write_discounts only — will fail for products / selling plans)
 *
 * Usage: node scripts/setup-preorder-deposit.mjs
 */

import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env');
  try {
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

loadEnv();

const PRODUCT_HANDLES = [
  'xsto-ezgo2-carbon-fiber-power-wheelchair',
  'x12-all-terrain-mobility-robot',
  'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
];

const storeDomain = process.env.PUBLIC_STORE_DOMAIN?.trim();
if (!storeDomain) {
  console.error('Missing PUBLIC_STORE_DOMAIN in .env');
  process.exit(1);
}

async function fetchClientCredentialsToken(clientId, clientSecret, label) {
  const tokenResponse = await fetch(
    `https://${storeDomain}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    },
  );
  const tokenPayload = await tokenResponse.json();
  if (!tokenResponse.ok || !tokenPayload.access_token) {
    console.error(`Could not get ${label} access token:`);
    console.error(JSON.stringify(tokenPayload, null, 2));
    process.exit(1);
  }
  console.log(`Using ${label} client-credentials token. Scopes:`, tokenPayload.scope);
  return tokenPayload.access_token;
}

async function getAccessToken() {
  const adminToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN?.trim();
  if (adminToken?.startsWith('shpat_')) {
    console.log('Using SHOPIFY_ADMIN_API_ACCESS_TOKEN (legacy custom app).');
    return adminToken;
  }

  const depositClientId = process.env.SHOPIFY_DEPOSIT_CLIENT_ID?.trim();
  const depositClientSecret = process.env.SHOPIFY_DEPOSIT_CLIENT_SECRET?.trim();
  if (depositClientId && depositClientSecret) {
    return fetchClientCredentialsToken(
      depositClientId,
      depositClientSecret,
      'Deposit app',
    );
  }
  if (depositClientId || depositClientSecret) {
    console.error(`Incomplete Deposit app credentials.

Need both:
  SHOPIFY_DEPOSIT_CLIENT_ID=${depositClientId ? '(set)' : '(missing)'}
  SHOPIFY_DEPOSIT_CLIENT_SECRET=${depositClientSecret ? '(set)' : '(missing)'}

See docs/rebuild/preorder-deposit.md.
`);
    process.exit(1);
  }

  if (adminToken?.startsWith('shpss_')) {
    console.error(`SHOPIFY_ADMIN_API_ACCESS_TOKEN looks like a Client secret (shpss_), not an Admin API access token (shpat_).

Legacy custom apps with shpat_ tokens are no longer available on this store.

Use your Dev Dashboard deposit app credentials instead:

  SHOPIFY_DEPOSIT_CLIENT_ID=...
  SHOPIFY_DEPOSIT_CLIENT_SECRET=shpss_...

Copy them from Dev Dashboard → your Deposit app → Settings → Credentials.
See docs/rebuild/preorder-deposit.md.
`);
    process.exit(1);
  }

  if (adminToken) {
    // Unknown prefix — try it anyway
    console.log('Using SHOPIFY_ADMIN_API_ACCESS_TOKEN.');
    return adminToken;
  }

  const vatClientId =
    process.env.XSTO_VAT_RELIEF_CLIENT_ID?.trim() ||
    'd0589c6e7756aea84becc989391f687d';
  const vatClientSecret = process.env.XSTO_VAT_RELIEF_CLIENT_SECRET?.trim();
  if (vatClientSecret) {
    console.warn(
      'No deposit credentials found; falling back to VAT Relief app (usually lacks product / purchase-option scopes).',
    );
    return fetchClientCredentialsToken(
      vatClientId,
      vatClientSecret,
      'VAT Relief (fallback)',
    );
  }

  console.error(`No Admin API credentials available.

Add one of:

  # Preferred — Dev Dashboard deposit app (client credentials)
  SHOPIFY_DEPOSIT_CLIENT_ID=...
  SHOPIFY_DEPOSIT_CLIENT_SECRET=shpss_...
  # scopes: read_products, write_products, write_purchase_options

  # Or legacy custom app Admin token (if you still have one)
  SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_...

See docs/rebuild/preorder-deposit.md.
`);
  process.exit(1);
}

async function adminGraphql(token, query, variables) {
  const response = await fetch(
    `https://${storeDomain}/admin/api/2025-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({query, variables}),
    },
  );
  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(JSON.stringify(payload.errors, null, 2));
  }
  return payload.data;
}

const token = await getAccessToken();

const productsQuery = `#graphql
  query ProductsByHandles($query: String!) {
    products(first: 10, query: $query) {
      nodes {
        id
        handle
        title
        variants(first: 25) {
          nodes {
            id
            title
            inventoryPolicy
          }
        }
      }
    }
  }
`;

const handleQuery = PRODUCT_HANDLES.map((h) => `handle:${h}`).join(' OR ');
const productsData = await adminGraphql(token, productsQuery, {
  query: handleQuery,
});
const products = productsData?.products?.nodes ?? [];

console.log(
  `Found ${products.length}/${PRODUCT_HANDLES.length} products:`,
  products.map((p) => p.handle),
);

if (!products.length) {
  console.error('No matching products. Check handles / API scopes.');
  process.exit(1);
}

const missing = PRODUCT_HANDLES.filter(
  (h) => !products.some((p) => p.handle === h),
);
if (missing.length) {
  console.warn('Missing handles:', missing.join(', '));
}

const variantsToContinue = [];
for (const product of products) {
  for (const variant of product.variants.nodes) {
    if (variant.inventoryPolicy !== 'CONTINUE') {
      variantsToContinue.push({
        productId: product.id,
        variantId: variant.id,
        handle: product.handle,
      });
    }
  }
}

const updateVariantsMutation = `#graphql
  mutation SetContinueSelling($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      productVariants { id inventoryPolicy }
      userErrors { field message }
    }
  }
`;

const byProduct = new Map();
for (const row of variantsToContinue) {
  const list = byProduct.get(row.productId) ?? [];
  list.push({id: row.variantId, inventoryPolicy: 'CONTINUE'});
  byProduct.set(row.productId, list);
}

for (const [productId, variants] of byProduct) {
  try {
    const data = await adminGraphql(token, updateVariantsMutation, {
      productId,
      variants,
    });
    const errors = data?.productVariantsBulkUpdate?.userErrors ?? [];
    if (errors.length) {
      console.error('inventoryPolicy update errors:', errors);
    } else {
      console.log(`Set CONTINUE selling on ${variants.length} variant(s) for ${productId}`);
    }
  } catch (error) {
    console.error('Failed to set continue selling:', error.message ?? error);
    console.error('Do this manually in Admin → Product → Continue selling when out of stock.');
  }
}

const existingGroupsQuery = `#graphql
  query ExistingDepositGroups {
    sellingPlanGroups(first: 20, query: "deposit-10 OR title:10% Deposit") {
      nodes {
        id
        name
        merchantCode
        products(first: 20) {
          nodes { id handle }
        }
      }
    }
  }
`;

let existingGroup = null;
try {
  const groupsData = await adminGraphql(token, existingGroupsQuery);
  existingGroup =
    groupsData?.sellingPlanGroups?.nodes?.find(
      (g) =>
        g.merchantCode === 'deposit-10' ||
        /10%?\s*deposit/i.test(g.name ?? ''),
    ) ?? null;
} catch (error) {
  console.warn(
    'Could not list selling plan groups (likely missing read_purchase_options):',
    error.message ?? error,
  );
}

const productIds = products.map((p) => p.id);

if (existingGroup) {
  console.log('Found existing selling plan group:', existingGroup.id, existingGroup.name);
  const addMutation = `#graphql
    mutation AddProductsToGroup($id: ID!, $productIds: [ID!]!) {
      sellingPlanGroupAddProducts(id: $id, productIds: $productIds) {
        sellingPlanGroup { id }
        userErrors { field message }
      }
    }
  `;
  try {
    const data = await adminGraphql(token, addMutation, {
      id: existingGroup.id,
      productIds,
    });
    const errors = data?.sellingPlanGroupAddProducts?.userErrors ?? [];
    if (errors.length) console.error(errors);
    else console.log('Assigned products to existing deposit group.');
  } catch (error) {
    console.error('Failed to assign products:', error.message ?? error);
  }
} else {
  const createMutation = `#graphql
    mutation CreateDepositGroup($input: SellingPlanGroupInput!, $resources: SellingPlanGroupResourceInput) {
      sellingPlanGroupCreate(input: $input, resources: $resources) {
        sellingPlanGroup {
          id
          name
          sellingPlans(first: 1) {
            nodes { id name }
          }
        }
        userErrors { field message }
      }
    }
  `;

  const input = {
    name: '10% Deposit',
    merchantCode: 'deposit-10',
    options: ['Payment'],
    sellingPlansToCreate: [
      {
        name: 'Pay 10% deposit',
        options: ['10% deposit — balance before dispatch'],
        category: 'PRE_ORDER',
        billingPolicy: {
          fixed: {
            checkoutCharge: {
              type: 'PERCENTAGE',
              value: {percentage: 10.0},
            },
            remainingBalanceChargeTrigger: 'ON_FULFILLMENT',
          },
        },
        deliveryPolicy: {
          fixed: {fulfillmentTrigger: 'UNKNOWN'},
        },
        pricingPolicies: [
          {
            fixed: {
              adjustmentType: 'PERCENTAGE',
              adjustmentValue: {percentage: 0.0},
            },
          },
        ],
        inventoryPolicy: {reserve: 'ON_FULFILLMENT'},
      },
    ],
  };

  try {
    const data = await adminGraphql(token, createMutation, {
      input,
      resources: {productIds, productVariantIds: []},
    });
    const result = data?.sellingPlanGroupCreate;
    if (result?.userErrors?.length) {
      console.error('sellingPlanGroupCreate userErrors:', result.userErrors);
      process.exit(1);
    }
    console.log('Created selling plan group:');
    console.log(JSON.stringify(result?.sellingPlanGroup, null, 2));
  } catch (error) {
    console.error('Failed to create selling plan group:');
    console.error(error.message ?? error);
    console.error(`
Manual steps: docs/rebuild/preorder-deposit.md

Typical cause: app token lacks write_purchase_options, or store is not
eligible for deferred purchase options / deposits.
`);
    process.exit(1);
  }
}

console.log('\nDone. Verify on PDPs that Pay in full / Pay 10% deposit appears.');
console.log('See docs/rebuild/preorder-deposit.md for testing URLs.');
