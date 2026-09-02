#!/usr/bin/env node
/**
 * Put X12 and X12 Pro on one Shopify product as Edition × VAT variants.
 *
 * Result on x12-all-terrain-mobility-robot:
 *   X12 / Standard          £15,000  (inc VAT, taxable)
 *   X12 / VAT Relief        £12,500  (ex VAT, not taxable)
 *   X12 Pro / Standard      £18,000  (inc VAT, taxable)
 *   X12 Pro / VAT Relief    £15,000  (ex VAT, not taxable)
 *
 * The standalone X12 Pro product is then drafted so it is no longer a
 * second catalogue listing. Hydrogen still 301s the old Pro URL.
 *
 * Auth: SHOPIFY_DEPOSIT_CLIENT_ID/SECRET or SHOPIFY_ADMIN_API_ACCESS_TOKEN
 *
 *   node scripts/merge-x12-edition-variants.mjs --dry-run
 *   node scripts/merge-x12-edition-variants.mjs
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

const X12_HANDLE = 'x12-all-terrain-mobility-robot';
const X12_PRO_HANDLE =
  'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition';

const EDITION = 'Edition';
const EDITION_X12 = 'X12';
const EDITION_PRO = 'X12 Pro';
const VAT = 'VAT';
const VAT_STANDARD = 'Standard';
const VAT_RELIEF = 'VAT Relief';

const TARGETS = [
  {
    edition: EDITION_X12,
    vat: VAT_STANDARD,
    price: '15000.00',
    sku: 'XSTO-12',
    taxable: true,
  },
  {
    edition: EDITION_X12,
    vat: VAT_RELIEF,
    price: '12500.00',
    sku: 'XSTO-12',
    taxable: false,
  },
  {
    edition: EDITION_PRO,
    vat: VAT_STANDARD,
    price: '18000.00',
    sku: 'XSTO-X12-PRO',
    taxable: true,
  },
  {
    edition: EDITION_PRO,
    vat: VAT_RELIEF,
    price: '15000.00',
    sku: 'XSTO-X12-PRO',
    taxable: false,
  },
];

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
    const tokenPayload = await tokenResponse.json();
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

const PRODUCT_QUERY = `#graphql
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      status
      options {
        id
        name
        values
      }
      variants(first: 50) {
        nodes {
          id
          title
          price
          sku
          taxable
          inventoryPolicy
          selectedOptions { name value }
        }
      }
    }
  }
`;

function optionValue(variant, name) {
  return (
    variant.selectedOptions?.find(
      (option) => option.name.trim().toLowerCase() === name.toLowerCase(),
    )?.value ?? null
  );
}

function hasEditionOption(product) {
  return (product.options ?? []).some(
    (option) => option.name.trim().toLowerCase() === 'edition',
  );
}

async function fetchProduct(token, handle) {
  const data = await adminGraphql(token, PRODUCT_QUERY, {handle});
  return data?.productByHandle ?? null;
}

function describeVariants(product) {
  for (const variant of product.variants.nodes) {
    const opts = variant.selectedOptions
      .map((option) => `${option.name}:${option.value}`)
      .join(', ');
    console.log(
      `  ${variant.price} ${variant.sku || '(no sku)'} | ${variant.title} | ${opts} | tax=${variant.taxable} | ${variant.inventoryPolicy}`,
    );
  }
}

async function createEditionOption(token, product) {
  console.log('Creating Edition option (X12, X12 Pro) with new Pro variants…');
  if (dryRun) {
    console.log('  Dry run — would call productOptionsCreate CREATE.');
    return product;
  }

  const result = await adminGraphql(
    token,
    `#graphql
      mutation CreateEditionOption(
        $productId: ID!
        $options: [OptionCreateInput!]!
        $variantStrategy: ProductOptionCreateVariantStrategy
      ) {
        productOptionsCreate(
          productId: $productId
          options: $options
          variantStrategy: $variantStrategy
        ) {
          userErrors { field message }
          product {
            id
            handle
            status
            options { id name values }
            variants(first: 50) {
              nodes {
                id
                title
                price
                sku
                taxable
                inventoryPolicy
                selectedOptions { name value }
              }
            }
          }
        }
      }
    `,
    {
      productId: product.id,
      variantStrategy: 'CREATE',
      options: [
        {
          name: EDITION,
          position: 1,
          values: [{name: EDITION_X12}, {name: EDITION_PRO}],
        },
      ],
    },
  );

  const errors = result?.productOptionsCreate?.userErrors ?? [];
  if (errors.length) {
    throw new Error(`productOptionsCreate: ${JSON.stringify(errors, null, 2)}`);
  }
  return result.productOptionsCreate.product;
}

async function syncVariantTargets(token, product) {
  const nodes = product.variants.nodes;
  const updates = [];

  for (const target of TARGETS) {
    const variant = nodes.find(
      (node) =>
        optionValue(node, EDITION) === target.edition &&
        optionValue(node, VAT) === target.vat,
    );
    if (!variant) {
      throw new Error(
        `Missing variant ${target.edition} / ${target.vat} after option create`,
      );
    }

    const patch = {id: variant.id};
    let changed = false;

    if (String(variant.price) !== target.price) {
      patch.price = target.price;
      changed = true;
    }
    if (variant.taxable !== target.taxable) {
      patch.taxable = target.taxable;
      changed = true;
    }
    if (variant.inventoryPolicy !== 'CONTINUE') {
      patch.inventoryPolicy = 'CONTINUE';
      changed = true;
    }
    if ((variant.sku || '') !== target.sku) {
      patch.inventoryItem = {sku: target.sku};
      changed = true;
    }

    if (changed) {
      console.log(
        `  Update ${target.edition} / ${target.vat} → £${target.price} sku=${target.sku} tax=${target.taxable}`,
      );
      updates.push(patch);
    } else {
      console.log(`  OK ${target.edition} / ${target.vat}`);
    }
  }

  if (!updates.length) return product;
  if (dryRun) {
    console.log('  Dry run — would productVariantsBulkUpdate.');
    return product;
  }

  const result = await adminGraphql(
    token,
    `#graphql
      mutation UpdateX12EditionVariants(
        $productId: ID!
        $variants: [ProductVariantsBulkInput!]!
      ) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          userErrors { field message }
          product {
            id
            handle
            status
            options { id name values }
            variants(first: 50) {
              nodes {
                id
                title
                price
                sku
                taxable
                inventoryPolicy
                selectedOptions { name value }
              }
            }
          }
        }
      }
    `,
    {productId: product.id, variants: updates},
  );

  const errors = result?.productVariantsBulkUpdate?.userErrors ?? [];
  if (errors.length) {
    throw new Error(
      `productVariantsBulkUpdate: ${JSON.stringify(errors, null, 2)}`,
    );
  }
  return result.productVariantsBulkUpdate.product;
}

async function draftStandalonePro(token, product) {
  if (!product) {
    console.log('Standalone X12 Pro product not found — nothing to draft.');
    return;
  }
  if (product.status === 'DRAFT') {
    console.log(`Standalone X12 Pro already DRAFT (${product.handle}).`);
    return;
  }
  console.log(
    `Drafting standalone X12 Pro (${product.handle}, ${product.status} → DRAFT)…`,
  );
  if (dryRun) {
    console.log('  Dry run — would productChangeStatus DRAFT.');
    return;
  }

  const result = await adminGraphql(
    token,
    `#graphql
      mutation DraftX12Pro($productId: ID!, $status: ProductStatus!) {
        productChangeStatus(productId: $productId, status: $status) {
          userErrors { field message }
          product { id handle status }
        }
      }
    `,
    {productId: product.id, status: 'DRAFT'},
  );
  const errors = result?.productChangeStatus?.userErrors ?? [];
  if (errors.length) {
    throw new Error(`productChangeStatus: ${JSON.stringify(errors, null, 2)}`);
  }
  console.log(`  Status: ${result.productChangeStatus.product.status}`);
}

const token = await getToken();
console.log(dryRun ? 'Dry run\n' : 'Applying Shopify catalogue merge\n');

let x12 = await fetchProduct(token, X12_HANDLE);
if (!x12) {
  console.error(`Product not found: ${X12_HANDLE}`);
  process.exit(1);
}

console.log(`${x12.title} (${x12.handle}) before:`);
describeVariants(x12);

if (!hasEditionOption(x12)) {
  x12 = await createEditionOption(token, x12);
} else {
  console.log('Edition option already present.');
}

x12 = await syncVariantTargets(token, x12);

console.log(`\n${x12.title} after:`);
describeVariants(x12);

const standalonePro = await fetchProduct(token, X12_PRO_HANDLE);
await draftStandalonePro(token, standalonePro);

console.log('\nDone. Admin should show four variants on the X12 product.');
console.log(
  'Hydrogen 301s /products/xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition to the X12 page.',
);
