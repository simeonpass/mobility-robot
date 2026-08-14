#!/usr/bin/env node
/**
 * Create dual VAT variants on products: Standard (inc VAT) + VAT Relief (ex VAT).
 *
 * With tax-inclusive Shopify pricing, the customer pays the listed variant price.
 * The Hydrogen storefront hides the VAT option and selects "VAT Relief" when
 * the shopper completes the HMRC declaration.
 *
 * Also syncs taxable flags:
 *   Standard → taxable: true
 *   VAT Relief → taxable: false
 *
 * Auth (first match wins):
 *   1. SHOPIFY_ADMIN_API_ACCESS_TOKEN (shpat_) with write_products
 *   2. SHOPIFY_DEPOSIT_CLIENT_ID + SHOPIFY_DEPOSIT_CLIENT_SECRET
 *
 * Usage:
 *   node scripts/setup-vat-relief-variants.mjs
 *   node scripts/setup-vat-relief-variants.mjs --chairs
 *   node scripts/setup-vat-relief-variants.mjs --accessories
 *   node scripts/setup-vat-relief-variants.mjs --all
 *   node scripts/setup-vat-relief-variants.mjs --handles=buy-robot-wheelchair,armrest-bag
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
const ACCESSORIES_COLLECTION_HANDLE = 'accessories';

const CHAIR_HANDLES = [
  'buy-robot-wheelchair',
  'xsto-m4-pro',
  'xsto-m4b-1',
  'x12-all-terrain-mobility-robot',
  'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
];

/** Curated fallback when the Accessories collection is missing / empty. */
const ACCESSORY_HANDLES_FALLBACK = [
  'adjustable-headrest-m4-pro',
  'adjustable-headrest-for-x12-x12-pro',
  'armrest-bag',
  'auxiliary-joystick-m4-pro',
  'backrest-cushion-large-m4-pro',
  'backrest-cushion-small-m4-pro',
  'batteries-lithium-battery-15-6ah-battery',
  'black-backpack-for-m4-pro',
  'bluetooth-controller-for-m4-m4h-m4-pro-x12-x12-pro',
  'buy-universal-phone-holder',
  'calf-support-set-for-x12-x12pro',
  'cup-holder-for-all-models',
  'ergonomic-chairs-for-back-support',
  'ergonomic-raised-backrest-neck-support',
  'flashlight-holder',
  'left-lateral-support-m4-pro',
  'lithium-10-4-ah-battery',
  'lithium-10-4ah-battery-batteries-lithium-battery',
  'lithium-15-6-ah-battery',
  'phone-holder-for-m4',
  'power-chair-battery-charger',
  'rear-cover-m4',
  'rear-cover-barbie-pink',
  'rear-cover-blue-enamel',
  'rear-cover-burgundy-red',
  'rear-cover-pearl-white',
  'rear-cover-sparkling-yellow',
  'rear-cover-superior-purple',
  'rear-cover-tiffany-blue',
  'rear-view-mirror-m4-pro',
  'right-lateral-support-m4-pro',
  'seat-cushion-large-m4-pro',
  'seat-cushion-small-m4-pro',
  'travel-cushion-seat-with-pump',
  'travel-cushion-with-pump',
  'trunk-support',
  'umbrella-attachment',
  'universal-wheels-for-xsto-m4',
  'wheelchair-battery-charger',
];

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const wantAll = args.includes('--all');
const wantAccessories = args.includes('--accessories');
const wantChairs = args.includes('--chairs');
const handlesArg = args.find((arg) => arg.startsWith('--handles='));

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
    console.log(
      `Auth: client_credentials scopes=${tokenPayload.scope ?? '(unknown)'}`,
    );
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
          taxable
          selectedOptions { name value }
          inventoryPolicy
        }
      }
    }
  }
`;

const COLLECTION_PRODUCTS_QUERY = `#graphql
  query AccessoriesCollection($handle: String!, $cursor: String) {
    collectionByHandle(handle: $handle) {
      id
      title
      products(first: 100, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes { handle title }
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
            taxable
            selectedOptions { name value }
          }
        }
      }
    }
  }
`;

const BULK_UPDATE = `#graphql
  mutation UpdateVatVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      userErrors { field message }
      product {
        variants(first: 100) {
          nodes {
            id
            title
            price
            taxable
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

function targetTaxable(vatValue) {
  if (vatValue === VAT_RELIEF) return false;
  if (vatValue === VAT_STANDARD) return true;
  return null;
}

async function fetchAccessoryHandles(token) {
  const handles = [];
  let cursor = null;
  let collection = null;
  do {
    const data = await adminGraphql(token, COLLECTION_PRODUCTS_QUERY, {
      handle: ACCESSORIES_COLLECTION_HANDLE,
      cursor,
    });
    collection = data?.collectionByHandle;
    if (!collection) break;
    for (const node of collection.products?.nodes ?? []) {
      if (node?.handle) handles.push(node.handle);
    }
    const pageInfo = collection.products?.pageInfo;
    cursor = pageInfo?.hasNextPage ? pageInfo.endCursor : null;
  } while (cursor);

  if (!handles.length) {
    console.warn(
      `Accessories collection "${ACCESSORIES_COLLECTION_HANDLE}" missing or empty — using curated fallback (${ACCESSORY_HANDLES_FALLBACK.length}).`,
    );
    return [...ACCESSORY_HANDLES_FALLBACK];
  }

  console.log(
    `Accessories collection "${ACCESSORIES_COLLECTION_HANDLE}": ${handles.length} product(s)`,
  );
  return handles;
}

async function resolveHandles(token) {
  if (handlesArg) {
    return handlesArg
      .slice('--handles='.length)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  const includeChairs = wantAll || wantChairs || (!wantAccessories && !wantAll);
  const includeAccessories = wantAll || wantAccessories;

  // Default (no flags): chairs only — preserves prior behaviour.
  if (!wantAll && !wantAccessories && !wantChairs) {
    return [...CHAIR_HANDLES];
  }

  const handles = [];
  if (includeChairs) handles.push(...CHAIR_HANDLES);
  if (includeAccessories) {
    const accessories = await fetchAccessoryHandles(token);
    handles.push(...accessories);
  }

  // De-dupe while preserving order.
  const seen = new Set();
  return handles.filter((handle) => {
    if (seen.has(handle)) return false;
    seen.add(handle);
    return true;
  });
}

async function applyBulkUpdates(token, productId, updates, label) {
  if (!updates.length) return {ok: true, count: 0};
  if (dryRun) {
    console.log(`  Dry run — not applying ${updates.length} ${label}.`);
    return {ok: true, count: updates.length, dryRun: true};
  }
  const result = await adminGraphql(token, BULK_UPDATE, {
    productId,
    variants: updates,
  });
  const errors = result?.productVariantsBulkUpdate?.userErrors ?? [];
  if (errors.length) {
    console.error(errors);
    return {ok: false, count: 0, errors};
  }
  console.log(`  Updated ${updates.length} ${label}.`);
  return {ok: true, count: updates.length};
}

/**
 * Sync Relief prices (gross/1.2) and taxable flags on an existing dual-VAT product.
 */
function buildSyncUpdates(product) {
  const priceUpdates = [];
  const taxableUpdates = [];

  for (const variant of product.variants.nodes) {
    const vatValue = getVatValue(variant);
    if (!vatValue) continue;

    const wantedTaxable = targetTaxable(vatValue);
    if (wantedTaxable !== null && variant.taxable !== wantedTaxable) {
      taxableUpdates.push({
        id: variant.id,
        taxable: wantedTaxable,
      });
      console.log(
        `  Taxable ${variant.title}: ${variant.taxable} → ${wantedTaxable}`,
      );
    }

    if (vatValue !== VAT_RELIEF) continue;
    const standard = product.variants.nodes.find(
      (other) =>
        getVatValue(other) === VAT_STANDARD &&
        nonVatKey(other) === nonVatKey(variant),
    );
    if (!standard) continue;
    const target = exVatFromGross(standard.price);
    if (roundMoney(variant.price) === target) continue;
    priceUpdates.push({id: variant.id, price: target});
    console.log(
      `  Price ${variant.title}: ${variant.price} → ${target} (from Standard ${standard.price})`,
    );
  }

  // Merge price + taxable onto the same variant id when both change.
  const byId = new Map();
  for (const update of [...priceUpdates, ...taxableUpdates]) {
    byId.set(update.id, {...(byId.get(update.id) ?? {}), ...update});
  }
  return [...byId.values()];
}

async function ensureVatVariants(token, handle) {
  const data = await adminGraphql(token, PRODUCT_QUERY, {handle});
  const product = data?.productByHandle;
  if (!product) {
    console.warn(`Skip ${handle}: not found`);
    return {handle, status: 'not_found'};
  }

  console.log(`\n=== ${product.title} (${handle}) ===`);

  if (hasVatOption(product)) {
    console.log('VAT option already exists — syncing prices + taxable.');
    const updates = buildSyncUpdates(product);
    if (!updates.length) {
      console.log('  Prices and taxable flags already correct.');
      return {handle, status: 'ok', action: 'noop'};
    }
    const result = await applyBulkUpdates(
      token,
      product.id,
      updates,
      'variant field(s)',
    );
    return {
      handle,
      status: result.ok ? 'ok' : 'error',
      action: 'synced',
      updates: result.count,
    };
  }

  console.log(
    `Creating option ${VAT_OPTION}: ${VAT_STANDARD} / ${VAT_RELIEF}`,
  );
  if (dryRun) {
    for (const variant of product.variants.nodes) {
      console.log(
        `  Would add Relief sibling for ${variant.title} @ ${exVatFromGross(variant.price)} (from ${variant.price}); Standard taxable=true, Relief taxable=false`,
      );
    }
    return {handle, status: 'ok', action: 'would_create'};
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
    return {handle, status: 'error', action: 'create_option', errors: createErrors};
  }

  const updated = createResult?.productOptionsCreate?.product;
  const nodes = updated?.variants?.nodes ?? [];
  console.log(`  Now ${nodes.length} variants.`);

  // After CREATE, Shopify often copies the original price onto both values.
  // Set VAT Relief variants to net and apply taxable flags.
  const fieldUpdates = [];
  for (const variant of nodes) {
    const vatValue = getVatValue(variant);
    if (!vatValue) continue;

    const patch = {id: variant.id};
    let changed = false;

    const wantedTaxable = targetTaxable(vatValue);
    if (wantedTaxable !== null && variant.taxable !== wantedTaxable) {
      patch.taxable = wantedTaxable;
      changed = true;
    }

    if (vatValue === VAT_RELIEF) {
      const standard = nodes.find(
        (other) =>
          getVatValue(other) === VAT_STANDARD &&
          nonVatKey(other) === nonVatKey(variant),
      );
      const basePrice = standard?.price ?? variant.price;
      const target = exVatFromGross(basePrice);
      if (roundMoney(variant.price) !== target) {
        patch.price = target;
        changed = true;
      }
      console.log(
        `  Set ${variant.title || variant.id} → price ${patch.price ?? variant.price}, taxable=${patch.taxable ?? variant.taxable} (Standard ${basePrice})`,
      );
    } else if (changed) {
      console.log(
        `  Set ${variant.title || variant.id} → taxable=${patch.taxable}`,
      );
    }

    if (changed) fieldUpdates.push(patch);
  }

  const result = await applyBulkUpdates(
    token,
    product.id,
    fieldUpdates,
    'variant field(s)',
  );

  console.log(
    '  Next: confirm inventory / selling plans on new variants in Admin if needed.',
  );

  return {
    handle,
    status: result.ok ? 'ok' : 'error',
    action: 'created',
    updates: result.count,
  };
}

const token = await getToken();
const HANDLES = await resolveHandles(token);

console.log(
  dryRun
    ? `Dry run — would process ${HANDLES.length} product(s) on ${storeDomain}`
    : `Updating ${HANDLES.length} product(s) on ${storeDomain}`,
);

const summary = {
  ok: 0,
  error: 0,
  not_found: 0,
  created: 0,
  synced: 0,
  noop: 0,
  failures: [],
};

for (const handle of HANDLES) {
  try {
    const result = await ensureVatVariants(token, handle);
    if (!result) continue;
    if (result.status === 'ok') summary.ok += 1;
    else if (result.status === 'not_found') summary.not_found += 1;
    else {
      summary.error += 1;
      summary.failures.push(handle);
    }
    if (result.action === 'created' || result.action === 'would_create') {
      summary.created += 1;
    } else if (result.action === 'synced') {
      summary.synced += 1;
    } else if (result.action === 'noop') {
      summary.noop += 1;
    }
  } catch (error) {
    summary.error += 1;
    summary.failures.push(handle);
    console.error(`Failed ${handle}:`, error.message ?? error);
  }
}

console.log('\nDone.');
console.log(
  `Summary: ok=${summary.ok} created=${summary.created} synced=${summary.synced} noop=${summary.noop} not_found=${summary.not_found} error=${summary.error}`,
);
if (summary.failures.length) {
  console.log(`Failures: ${summary.failures.join(', ')}`);
}
console.log(
  'Storefront: claim VAT relief → ATC uses the VAT Relief variant (no checkout discount on those lines).',
);
console.log(
  'Optional: deactivate automatic "VAT Relief (exact)" after all products are migrated, or leave it for any unmigrated SKUs.',
);

if (summary.error > 0) process.exitCode = 1;
