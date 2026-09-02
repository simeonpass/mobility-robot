#!/usr/bin/env node
/**
 * Keep X12 accessories buyable while they are on a ~4 week backorder.
 *
 * Sets inventoryPolicy CONTINUE on every variant of accessories that fit
 * the X12 (including shared M4 Pro & X12 parts). Hydrogen shows the
 * 4-week pre-order copy; sold-out DENY SKUs would otherwise hide Add to cart.
 *
 * Auth: SHOPIFY_DEPOSIT_CLIENT_ID/SECRET or SHOPIFY_ADMIN_API_ACCESS_TOKEN
 *
 *   node scripts/x12-accessories-backorder.mjs --dry-run
 *   node scripts/x12-accessories-backorder.mjs
 */

import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
        continue;
      }
      const eq = trimmed.indexOf('=');
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

const dryRun = process.argv.includes('--dry-run');
const storeDomain = process.env.PUBLIC_STORE_DOMAIN?.trim();
const adminToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN?.trim();
const depositClientId = process.env.SHOPIFY_DEPOSIT_CLIENT_ID?.trim();
const depositClientSecret = process.env.SHOPIFY_DEPOSIT_CLIENT_SECRET?.trim();

/** Handles that fit X12 even when the handle does not contain "x12". */
const X12_HANDLE_EXTRAS = new Set([
  'adjustable-headrest-m4-pro',
  'bluetooth-controller-for-m4-m4h-m4-pro-x12-x12-pro',
  'cup-holder-for-all-models',
  'trunk-support',
  'trunk-support-m4-pro',
]);

if (!storeDomain) {
  console.error('Missing PUBLIC_STORE_DOMAIN');
  process.exit(1);
}

async function getToken() {
  if (adminToken?.startsWith('shpat_')) return adminToken;
  if (depositClientId && depositClientSecret) {
    const tokenResponse = await fetch(
      `https://${storeDomain}/admin/oauth/access_token`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: depositClientId,
          client_secret: depositClientSecret,
        }),
      },
    );
    const raw = await tokenResponse.text();
    let tokenPayload;
    try {
      tokenPayload = JSON.parse(raw);
    } catch {
      console.error(raw.slice(0, 400));
      process.exit(1);
    }
    if (!tokenResponse.ok || !tokenPayload.access_token) {
      console.error(JSON.stringify(tokenPayload, null, 2));
      process.exit(1);
    }
    return tokenPayload.access_token;
  }
  console.error(
    'Need SHOPIFY_ADMIN_API_ACCESS_TOKEN or SHOPIFY_DEPOSIT_CLIENT_ID/SECRET',
  );
  process.exit(1);
}

async function adminGraphql(token, query, variables = {}) {
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
  if (!response.ok || payload.errors?.length) {
    throw new Error(JSON.stringify(payload, null, 2));
  }
  return payload.data;
}

function fitsX12(product) {
  const handle = (product.handle ?? '').toLowerCase();
  const title = (product.title ?? '').toLowerCase();
  const tags = (product.tags ?? []).map((tag) => String(tag).toLowerCase());
  if (!handle) return false;
  if (handle.includes('x12') && !handle.startsWith('x12-all-terrain')) {
    return true;
  }
  if (X12_HANDLE_EXTRAS.has(handle)) return true;
  if (tags.some((tag) => tag.includes('x12'))) return true;
  if (/\bx12\b/.test(title)) return true;
  return false;
}

async function fetchAccessoryProducts(token) {
  const products = [];
  let cursor = null;
  let hasNext = true;

  while (hasNext) {
    const data = await adminGraphql(
      token,
      `#graphql
        query Accessories($cursor: String) {
          collectionByHandle(handle: "accessories") {
            products(first: 50, after: $cursor) {
              pageInfo { hasNextPage endCursor }
              nodes {
                id
                handle
                title
                status
                tags
                variants(first: 50) {
                  nodes {
                    id
                    title
                    sku
                    inventoryPolicy
                  }
                }
              }
            }
          }
        }
      `,
      {cursor},
    );

    const connection = data?.collectionByHandle?.products;
    products.push(...(connection?.nodes ?? []));
    hasNext = Boolean(connection?.pageInfo?.hasNextPage);
    cursor = connection?.pageInfo?.endCursor ?? null;
  }

  return products;
}

async function setContinueSelling(token, productId, variantIds) {
  const variants = variantIds.map((id) => ({
    id,
    inventoryPolicy: 'CONTINUE',
  }));
  const result = await adminGraphql(
    token,
    `#graphql
      mutation ContinueSelling(
        $productId: ID!
        $variants: [ProductVariantsBulkInput!]!
      ) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          userErrors { field message }
          product {
            handle
            variants(first: 50) {
              nodes { id title inventoryPolicy }
            }
          }
        }
      }
    `,
    {productId, variants},
  );
  const errors = result?.productVariantsBulkUpdate?.userErrors ?? [];
  if (errors.length) {
    throw new Error(JSON.stringify(errors, null, 2));
  }
}

async function activateProduct(token, productId) {
  const result = await adminGraphql(
    token,
    `#graphql
      mutation Activate($productId: ID!, $status: ProductStatus!) {
        productChangeStatus(productId: $productId, status: $status) {
          userErrors { field message }
          product { id handle status }
        }
      }
    `,
    {productId, status: 'ACTIVE'},
  );
  const errors = result?.productChangeStatus?.userErrors ?? [];
  if (errors.length) {
    throw new Error(JSON.stringify(errors, null, 2));
  }
  return result.productChangeStatus.product.status;
}

const token = await getToken();
console.log(dryRun ? 'Dry run\n' : 'Applying CONTINUE selling on X12 accessories\n');

const products = await fetchAccessoryProducts(token);
const x12Accessories = products.filter(fitsX12);

if (!x12Accessories.length) {
  console.error('No X12 accessories found in the accessories collection.');
  process.exit(1);
}

let updated = 0;
let activated = 0;
for (const product of x12Accessories) {
  const deny = product.variants.nodes.filter(
    (variant) => variant.inventoryPolicy !== 'CONTINUE',
  );
  console.log(
    `${product.handle} [${product.status}] (${product.variants.nodes.length} variants, ${deny.length} not CONTINUE)`,
  );
  if (product.status === 'DRAFT') {
    console.log('  DRAFT → ACTIVE so it can be purchased');
    if (!dryRun) {
      const status = await activateProduct(token, product.id);
      console.log(`  Status: ${status}`);
      activated += 1;
    }
  }
  if (!deny.length) continue;
  for (const variant of deny) {
    console.log(
      `  ${variant.title} ${variant.sku || ''} ${variant.inventoryPolicy} → CONTINUE`,
    );
  }
  if (dryRun) continue;
  await setContinueSelling(
    token,
    product.id,
    deny.map((variant) => variant.id),
  );
  updated += deny.length;
}

console.log(
  dryRun
    ? `\nDry run complete. ${x12Accessories.length} X12 accessory products.`
    : `\nDone. Updated ${updated} variant(s), activated ${activated} draft(s) across ${x12Accessories.length} X12 accessory products.`,
);
