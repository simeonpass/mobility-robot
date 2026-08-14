#!/usr/bin/env node
/**
 * Create dual VAT variants on products: Standard (inc VAT) + VAT Relief (ex VAT).
 *
 * With tax-inclusive Shopify pricing, the customer pays the listed variant price.
 * The Hydrogen storefront hides the VAT option and selects "VAT Relief" when
 * the shopper completes the HMRC declaration.
 *
 * Auth (first match wins):
 *   1. SHOPIFY_ADMIN_API_ACCESS_TOKEN (shpat_) with write_products
 *   2. SHOPIFY_DEPOSIT_CLIENT_ID + SHOPIFY_DEPOSIT_CLIENT_SECRET
 *
 * Usage:
 *   node scripts/setup-vat-relief-variants.mjs
 *   node scripts/setup-vat-relief-variants.mjs --handles=buy-robot-wheelchair,xsto-m4b-1
 *   node scripts/setup-vat-relief-variants.mjs --dry-run
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

const VAT_OPTION = 'VAT';
const VAT_STANDARD = 'Standard';
const VAT_RELIEF = 'VAT Relief';

const DEFAULT_HANDLES = [
  'buy-robot-wheelchair',
  'xsto-m4-pro',
  'xsto-m4b-1',
  'x12-all-terrain-mobility-robot',
  'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
];

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const handlesArg = args.find((arg) => arg.startsWith('--handles='));
const HANDLES = handlesArg
  ? handlesArg
      .slice('--handles='.length)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  : DEFAULT_HANDLES;

const storeDomain = process.env.PUBLIC_STORE_DOMAIN?.trim();
const adminToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN?.trim();
const depositClientId = process.env.SHOPIFY_DEPOSIT_CLIENT_ID?.trim();
const depositClientSecret = process.env.SHOPIFY_DEPOSIT_CLIENT_SECRET?.trim();

if (!storeDomain) {
  console.error('Missing PUBLIC_STORE_DOMAIN');
  process.exit(1);
}

function roundMoney(amount) {
  return (Math.round(Number(amount) * 100) / 100).toFixed(2);
}

function exVatFromGross(gross) {
  return roundMoney(Number(gross) / 1.2);
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
      options {
        id
        name
        values
        optionValues { id name }
      }
      variants(first: 100) {
        nodes {
          id
          title
          price
          sku
          selectedOptions { name value }
          inventoryPolicy
        }
      }
    }
  }
`;

const CREATE_OPTION = `#graphql
  mutation CreateVatOption($productId: ID!, $options: [OptionCreateInput!]!, $variantStrategy: ProductOptionCreateVariantStrategy) {
    productOptionsCreate(productId: $productId, options: $options, variantStrategy: $variantStrategy) {
      userErrors { field message }
      product {
        id
        options { id name values }
        variants(first: 100) {
          nodes {
            id
            title
            price
            selectedOptions { name value }
          }
        }
      }
    }
  }
`;

const BULK_UPDATE = `#graphql
  mutation UpdateVatVariantPrices($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      userErrors { field message }
      product {
        variants(first: 100) {
          nodes {
            id
            title
            price
            selectedOptions { name value }
          }
        }
      }
    }
  }
`;

function hasVatOption(product) {
  return (product.options ?? []).some(
    (option) => option.name.trim().toLowerCase() === 'vat',
  );
}

function getVatValue(variant) {
  return (
    variant.selectedOptions?.find(
      (option) => option.name.trim().toLowerCase() === 'vat',
    )?.value ?? null
  );
}

function nonVatKey(variant) {
  return (variant.selectedOptions ?? [])
    .filter((option) => option.name.trim().toLowerCase() !== 'vat')
    .map((option) => `${option.name}=${option.value}`)
    .sort()
    .join('|')
    .toLowerCase();
}

async function ensureVatVariants(token, handle) {
  const data = await adminGraphql(token, PRODUCT_QUERY, {handle});
  const product = data?.productByHandle;
  if (!product) {
    console.warn(`Skip ${handle}: not found`);
    return;
  }

  console.log(`\n=== ${product.title} (${handle}) ===`);

  if (hasVatOption(product)) {
    console.log('VAT option already exists — syncing prices only.');
    const updates = [];
    for (const variant of product.variants.nodes) {
      if (getVatValue(variant) !== VAT_RELIEF) continue;
      const standard = product.variants.nodes.find(
        (other) =>
          getVatValue(other) === VAT_STANDARD &&
          nonVatKey(other) === nonVatKey(variant),
      );
      if (!standard) continue;
      const target = exVatFromGross(standard.price);
      if (roundMoney(variant.price) === target) continue;
      updates.push({id: variant.id, price: target});
      console.log(
        `  Price ${variant.title}: ${variant.price} → ${target} (from Standard ${standard.price})`,
      );
    }
    if (!updates.length) {
      console.log('  Prices already correct.');
      return;
    }
    if (dryRun) {
      console.log('  Dry run — not updating.');
      return;
    }
    const result = await adminGraphql(token, BULK_UPDATE, {
      productId: product.id,
      variants: updates,
    });
    const errors = result?.productVariantsBulkUpdate?.userErrors ?? [];
    if (errors.length) console.error(errors);
    else console.log(`  Updated ${updates.length} relief price(s).`);
    return;
  }

  // Create VAT option. CREATE strategy duplicates existing variants across new values.
  console.log(
    `Creating option ${VAT_OPTION}: ${VAT_STANDARD} / ${VAT_RELIEF}`,
  );
  if (dryRun) {
    for (const variant of product.variants.nodes) {
      console.log(
        `  Would add Relief sibling for ${variant.title} @ ${exVatFromGross(variant.price)} (from ${variant.price})`,
      );
    }
    return;
  }

  const createResult = await adminGraphql(token, CREATE_OPTION, {
    productId: product.id,
    options: [
      {
        name: VAT_OPTION,
        values: [{name: VAT_STANDARD}, {name: VAT_RELIEF}],
      },
    ],
    // CREATE duplicates existing variants for each new option value.
    variantStrategy: 'CREATE',
  });

  const createErrors = createResult?.productOptionsCreate?.userErrors ?? [];
  if (createErrors.length) {
    console.error(createErrors);
    return;
  }

  const updated = createResult?.productOptionsCreate?.product;
  const nodes = updated?.variants?.nodes ?? [];
  console.log(`  Now ${nodes.length} variants.`);

  // After CREATE, Shopify often copies the original price onto both values.
  // Set VAT Relief variants to net.
  const priceUpdates = [];
  for (const variant of nodes) {
    if (getVatValue(variant) !== VAT_RELIEF) continue;
    const standard = nodes.find(
      (other) =>
        getVatValue(other) === VAT_STANDARD &&
        nonVatKey(other) === nonVatKey(variant),
    );
    const basePrice = standard?.price ?? variant.price;
    const target = exVatFromGross(basePrice);
    priceUpdates.push({id: variant.id, price: target});
    console.log(
      `  Set ${variant.title || variant.id} → ${target} (Standard ${basePrice})`,
    );
  }

  if (priceUpdates.length) {
    const result = await adminGraphql(token, BULK_UPDATE, {
      productId: product.id,
      variants: priceUpdates,
    });
    const errors = result?.productVariantsBulkUpdate?.userErrors ?? [];
    if (errors.length) console.error(errors);
    else console.log(`  Updated ${priceUpdates.length} relief price(s).`);
  }

  console.log(
    '  Next: confirm inventory / selling plans on new variants in Admin if needed.',
  );
}

const token = await getToken();
console.log(
  dryRun
    ? 'Dry run — no Admin writes.'
    : `Updating ${HANDLES.length} product(s) on ${storeDomain}`,
);

for (const handle of HANDLES) {
  try {
    await ensureVatVariants(token, handle);
  } catch (error) {
    console.error(`Failed ${handle}:`, error.message ?? error);
  }
}

console.log('\nDone.');
console.log(
  'Storefront: claim VAT relief → ATC uses the VAT Relief variant (no checkout discount on those lines).',
);
console.log(
  'Optional: deactivate automatic "VAT Relief (exact)" after all products are migrated, or leave it for any unmigrated SKUs.',
);
