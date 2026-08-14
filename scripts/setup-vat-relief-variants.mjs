#!/usr/bin/env node
/**
 * Create dual VAT variants on products: Standard (inc VAT) + VAT Relief (ex VAT).
 *
 * With tax-inclusive Shopify pricing, the customer pays the listed variant price.
 * The Hydrogen storefront hides the VAT option and selects "VAT Relief" when
 * the shopper completes the HMRC declaration.
 *
 * Tax flags (critical for clean checkout):
 *   - Standard  → taxable: true  ("Charge tax" ticked)
 *   - VAT Relief → taxable: false ("Charge tax" unticked)
 * Unticking tax on the Relief SKU stops Shopify showing "Including £X in taxes"
 * on the net price.
 *
 * Auth (first match wins):
 *   1. SHOPIFY_ADMIN_API_ACCESS_TOKEN (shpat_) with write_products
 *   2. SHOPIFY_DEPOSIT_CLIENT_ID + SHOPIFY_DEPOSIT_CLIENT_SECRET
 *
 * Usage:
 *   node scripts/setup-vat-relief-variants.mjs
 *   node scripts/setup-vat-relief-variants.mjs --accessories
 *   node scripts/setup-vat-relief-variants.mjs --all
 *   node scripts/setup-vat-relief-variants.mjs --handles=armrest-bag,rear-cover-m4
 *   node scripts/setup-vat-relief-variants.mjs --dry-run
 *   node scripts/setup-vat-relief-variants.mjs --accessories --dry-run
 *
 * Also copies Standard → VAT Relief inventoryPolicy and available qty so
 * newly created Relief SKUs are not stuck "out of stock".
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

const CHAIR_HANDLES = [
  'buy-robot-wheelchair',
  'xsto-m4-pro',
  'xsto-m4b-1',
  'x12-all-terrain-mobility-robot',
  'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
];

/** Known accessory handles from the storefront catalogue map. */
const ACCESSORY_HANDLES = [
  'adjustable-headrest-m4-pro',
  'adjustable-headrest-for-x12-x12-pro',
  'armrest-bag',
  'auxiliary-joystick-m4-pro',
  'auxiliary-joystick-m4-m4-pro',
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
  'lateral-side-guard-m4-pro',
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
  'rearview-mirror-m4-pro',
  'right-lateral-support-m4-pro',
  'seat-cushion-large-m4-pro',
  'seat-cushion-small-m4-pro',
  'travel-cushion-seat-with-pump',
  'travel-cushion-with-pump',
  'trunk-support',
  'trunk-support-m4-pro',
  'umbrella-attachment',
  'umbrella-bracket-m4-m4-pro',
  'universal-wheels-for-xsto-m4',
  'wheelchair-battery-charger',
];

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const wantAccessories = args.includes('--accessories');
const wantAll = args.includes('--all');
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

/** Base product payload — works with write_products only (no inventory scopes). */
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
          availableForSale
          inventoryPolicy
          inventoryQuantity
          selectedOptions { name value }
          inventoryItem {
            id
            tracked
          }
        }
      }
    }
  }
`;

/**
 * Optional levels query — needs read_inventory. Used only when qty sync is attempted.
 * Keep separate so missing scopes do not abort VAT option / policy sync.
 */
const PRODUCT_INVENTORY_LEVELS_QUERY = `#graphql
  query ProductInventoryLevels($handle: String!) {
    productByHandle(handle: $handle) {
      handle
      variants(first: 100) {
        nodes {
          id
          selectedOptions { name value }
          inventoryItem {
            id
            tracked
            inventoryLevels(first: 20) {
              nodes {
                location { id name }
                quantities(names: ["available"]) {
                  name
                  quantity
                }
              }
            }
          }
        }
      }
    }
  }
`;

const COLLECTION_PRODUCTS_QUERY = `#graphql
  query AccessoriesCollection($handle: String!) {
    collectionByHandle(handle: $handle) {
      id
      title
      products(first: 100) {
        nodes { id handle title }
      }
    }
  }
`;

const ALL_PRODUCTS_QUERY = `#graphql
  query AllRetailProducts($cursor: String) {
    products(first: 100, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        handle
        title
        status
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
            inventoryPolicy
            selectedOptions { name value }
          }
        }
      }
    }
  }
`;

const INVENTORY_SET = `#graphql
  mutation SetVatReliefInventory($input: InventorySetQuantitiesInput!) {
    inventorySetQuantities(input: $input) {
      userErrors { field message code }
    }
  }
`;

const INVENTORY_ACTIVATE = `#graphql
  mutation ActivateVatReliefInventory($inventoryItemId: ID!, $locationId: ID!, $available: Int) {
    inventoryActivate(
      inventoryItemId: $inventoryItemId
      locationId: $locationId
      available: $available
    ) {
      userErrors { field message }
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

function desiredTaxable(vatValue) {
  if (vatValue === VAT_RELIEF) return false;
  if (vatValue === VAT_STANDARD) return true;
  // Pre-migration / unknown → leave taxable unless we know it's relief.
  return true;
}

/**
 * Desired inventoryPolicy for a VAT Relief sibling.
 * Prefer matching Standard. If Standard is sellable but Relief is stuck at
 * qty 0 with DENY (common when write_inventory is unavailable), use CONTINUE
 * so Relief stays availableForSale.
 */
function desiredReliefInventoryPolicy(relief, standard) {
  let want = standard.inventoryPolicy || relief.inventoryPolicy || 'DENY';
  const standardSellable =
    standard.availableForSale === true || standard.inventoryPolicy === 'CONTINUE';
  const reliefQty = Number(relief.inventoryQuantity ?? 0);
  if (standardSellable && reliefQty === 0 && want === 'DENY') {
    return 'CONTINUE';
  }
  return want;
}

/**
 * Build bulk updates for relief prices + Standard/Relief taxable flags.
 */
function buildSyncUpdates(nodes) {
  const updates = [];

  for (const variant of nodes) {
    const vat = getVatValue(variant);
    if (vat !== VAT_RELIEF && vat !== VAT_STANDARD) continue;

    const patch = {id: variant.id};
    let changed = false;

    const wantTaxable = desiredTaxable(vat);
    if (variant.taxable !== wantTaxable) {
      patch.taxable = wantTaxable;
      changed = true;
    }

    if (vat === VAT_RELIEF) {
      const standard = nodes.find(
        (other) =>
          getVatValue(other) === VAT_STANDARD &&
          nonVatKey(other) === nonVatKey(variant),
      );
      if (standard) {
        const target = exVatFromGross(standard.price);
        if (roundMoney(variant.price) !== target) {
          patch.price = target;
          changed = true;
        }
        const wantPolicy = desiredReliefInventoryPolicy(variant, standard);
        if (wantPolicy && variant.inventoryPolicy !== wantPolicy) {
          patch.inventoryPolicy = wantPolicy;
          changed = true;
        }
      }
    }

    if (changed) updates.push(patch);
  }

  return updates;
}

function availableQty(level) {
  const row = (level.quantities ?? []).find((q) => q.name === 'available');
  return Number(row?.quantity ?? 0);
}

/**
 * Merge inventoryLevels from an optional levels query onto base variant nodes.
 */
function mergeInventoryLevels(baseNodes, levelNodes) {
  const byId = new Map((levelNodes ?? []).map((node) => [node.id, node]));
  return baseNodes.map((node) => {
    const extra = byId.get(node.id);
    if (!extra?.inventoryItem) return node;
    return {
      ...node,
      inventoryItem: {
        ...node.inventoryItem,
        ...extra.inventoryItem,
      },
    };
  });
}

/**
 * Copy Standard inventory levels onto matching VAT Relief siblings.
 * New Relief variants often start at qty 0 with DENY → look "out of stock".
 * Requires read_inventory + write_inventory; on scope errors we skip and rely
 * on inventoryPolicy CONTINUE fallback in buildSyncUpdates.
 */
async function syncReliefInventory(token, handle, baseNodes) {
  let nodes = baseNodes;
  try {
    const levelsData = await adminGraphql(
      token,
      PRODUCT_INVENTORY_LEVELS_QUERY,
      {handle},
    );
    const levelNodes =
      levelsData?.productByHandle?.variants?.nodes ?? [];
    nodes = mergeInventoryLevels(baseNodes, levelNodes);
  } catch (error) {
    const message = String(error?.message ?? error);
    if (
      message.includes('read_inventory') ||
      message.includes('ACCESS_DENIED') ||
      message.includes('inventoryLevels')
    ) {
      console.log(
        '  Inventory qty sync skipped (missing read_inventory) — relying on inventoryPolicy sync.',
      );
      return {activated: 0, updated: 0, skippedScope: true};
    }
    throw error;
  }

  const quantities = [];
  const activates = [];

  for (const relief of nodes) {
    if (getVatValue(relief) !== VAT_RELIEF) continue;
    const standard = nodes.find(
      (other) =>
        getVatValue(other) === VAT_STANDARD &&
        nonVatKey(other) === nonVatKey(relief),
    );
    if (!standard?.inventoryItem?.id || !relief.inventoryItem?.id) continue;

    // Untracked inventory: policy copy (in bulk update) is enough.
    if (!standard.inventoryItem.tracked) {
      if (relief.inventoryItem.tracked) {
        console.log(
          `  ${relief.title}: Standard untracked — ensure CONTINUE via policy sync`,
        );
      }
      continue;
    }

    const standardLevels = standard.inventoryItem.inventoryLevels?.nodes ?? [];
    const reliefLevels = relief.inventoryItem.inventoryLevels?.nodes ?? [];
    if (!standardLevels.length) {
      console.log(
        `  ${relief.title}: no Standard inventory levels to copy.`,
      );
      continue;
    }
    const reliefByLocation = new Map(
      reliefLevels.map((level) => [level.location.id, level]),
    );

    for (const level of standardLevels) {
      const locationId = level.location.id;
      const qty = availableQty(level);
      const existing = reliefByLocation.get(locationId);
      if (!existing) {
        activates.push({
          inventoryItemId: relief.inventoryItem.id,
          locationId,
          available: qty,
          title: relief.title,
          locationName: level.location.name,
        });
        continue;
      }
      const current = availableQty(existing);
      if (current === qty) continue;
      quantities.push({
        inventoryItemId: relief.inventoryItem.id,
        locationId,
        quantity: qty,
        title: relief.title,
        locationName: level.location.name,
        from: current,
      });
    }
  }

  if (!activates.length && !quantities.length) {
    console.log('  Inventory: already matches Standard (or untracked).');
    return {activated: 0, updated: 0, skippedScope: false};
  }

  for (const row of activates) {
    console.log(
      `  Activate ${row.title} @ ${row.locationName} → available ${row.available}`,
    );
  }
  for (const row of quantities) {
    console.log(
      `  Qty ${row.title} @ ${row.locationName}: ${row.from} → ${row.quantity}`,
    );
  }

  if (dryRun) {
    console.log(
      `  Dry run — would activate ${activates.length} and set ${quantities.length} qty row(s).`,
    );
    return {
      activated: activates.length,
      updated: quantities.length,
      skippedScope: false,
      dryRun: true,
    };
  }

  let activateOk = 0;
  let qtyOk = 0;
  let scopeError = false;

  for (const row of activates) {
    try {
      const result = await adminGraphql(token, INVENTORY_ACTIVATE, {
        inventoryItemId: row.inventoryItemId,
        locationId: row.locationId,
        available: row.available,
      });
      const errors = result?.inventoryActivate?.userErrors ?? [];
      if (errors.length) {
        console.error(errors);
        const joined = JSON.stringify(errors);
        if (joined.includes('write_inventory') || joined.includes('ACCESS_DENIED')) {
          scopeError = true;
        }
      } else {
        activateOk += 1;
      }
    } catch (error) {
      const message = String(error?.message ?? error);
      console.error(`  inventoryActivate failed: ${message}`);
      if (
        message.includes('write_inventory') ||
        message.includes('ACCESS_DENIED')
      ) {
        scopeError = true;
        break;
      }
    }
  }

  if (!scopeError) {
    const chunkSize = 25;
    for (let i = 0; i < quantities.length; i += chunkSize) {
      const chunk = quantities.slice(i, i + chunkSize);
      try {
        const result = await adminGraphql(token, INVENTORY_SET, {
          input: {
            name: 'available',
            reason: 'correction',
            ignoreCompareQuantity: true,
            quantities: chunk.map((row) => ({
              inventoryItemId: row.inventoryItemId,
              locationId: row.locationId,
              quantity: row.quantity,
            })),
          },
        });
        const errors = result?.inventorySetQuantities?.userErrors ?? [];
        if (errors.length) {
          console.error(errors);
          const joined = JSON.stringify(errors);
          if (
            joined.includes('write_inventory') ||
            joined.includes('ACCESS_DENIED')
          ) {
            scopeError = true;
            break;
          }
        } else {
          qtyOk += chunk.length;
        }
      } catch (error) {
        const message = String(error?.message ?? error);
        console.error(`  inventorySetQuantities failed: ${message}`);
        if (
          message.includes('write_inventory') ||
          message.includes('ACCESS_DENIED')
        ) {
          scopeError = true;
          break;
        }
      }
    }
  }

  if (scopeError) {
    console.log(
      '  Inventory qty sync incomplete (missing write_inventory) — inventoryPolicy CONTINUE fallback applies.',
    );
  } else {
    console.log(
      `  Inventory sync: activated ${activateOk}, updated ${qtyOk}.`,
    );
  }

  return {
    activated: activateOk,
    updated: qtyOk,
    skippedScope: scopeError,
  };
}

async function applyBulkUpdates(token, productId, updates, label) {
  if (!updates.length) {
    console.log(`  ${label}: nothing to change.`);
    return;
  }

  for (const update of updates) {
    const bits = [];
    if (update.price != null) bits.push(`price=${update.price}`);
    if (update.taxable != null) {
      bits.push(`taxable=${update.taxable ? 'yes' : 'no'}`);
    }
    if (update.inventoryPolicy != null) {
      bits.push(`inventoryPolicy=${update.inventoryPolicy}`);
    }
    console.log(`  ${update.id} → ${bits.join(', ')}`);
  }

  if (dryRun) {
    console.log(`  Dry run — not applying ${updates.length} update(s).`);
    return;
  }

  const result = await adminGraphql(token, BULK_UPDATE, {
    productId,
    variants: updates,
  });
  const errors = result?.productVariantsBulkUpdate?.userErrors ?? [];
  if (errors.length) console.error(errors);
  else console.log(`  Applied ${updates.length} update(s).`);
}

async function ensureVatVariants(token, handle, summary) {
  const data = await adminGraphql(token, PRODUCT_QUERY, {handle});
  const product = data?.productByHandle;
  if (!product) {
    console.warn(`Skip ${handle}: not found`);
    summary.notFound.push(handle);
    return;
  }

  console.log(`\n=== ${product.title} (${handle}) ===`);

  if (hasVatOption(product)) {
    console.log(
      'VAT option already exists — syncing prices, taxable flags, inventory.',
    );
    summary.alreadyHadVat.push(handle);
    const updates = buildSyncUpdates(product.variants.nodes);
    const policyUpdates = updates.filter((u) => u.inventoryPolicy != null);
    await applyBulkUpdates(token, product.id, updates, 'Sync');
    if (policyUpdates.length) {
      summary.policyUpdated.push(handle);
    }
    const inv = await syncReliefInventory(
      token,
      handle,
      product.variants.nodes,
    );
    if (inv?.skippedScope) summary.inventoryScopeSkipped.push(handle);
    if ((inv?.activated ?? 0) + (inv?.updated ?? 0) > 0) {
      summary.inventoryUpdated.push(handle);
    }
    return;
  }

  console.log(
    `Creating option ${VAT_OPTION}: ${VAT_STANDARD} / ${VAT_RELIEF}`,
  );
  if (dryRun) {
    for (const variant of product.variants.nodes) {
      console.log(
        `  Would add Relief sibling for ${variant.title} @ ${exVatFromGross(variant.price)} (from ${variant.price}); Standard taxable=yes, Relief taxable=no`,
      );
    }
    summary.createdVat.push(`${handle} (dry-run)`);
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
    variantStrategy: 'CREATE',
  });

  const createErrors = createResult?.productOptionsCreate?.userErrors ?? [];
  if (createErrors.length) {
    console.error(createErrors);
    summary.failures.push({handle, error: createErrors});
    return;
  }

  console.log(
    `  Created VAT option — reloading product for inventory sync.`,
  );
  summary.createdVat.push(handle);

  // Reload full variant + inventory payload (create payload is incomplete).
  const reloaded = await adminGraphql(token, PRODUCT_QUERY, {handle});
  const nodes = reloaded?.productByHandle?.variants?.nodes ?? [];
  console.log(`  Now ${nodes.length} variants.`);

  const updates = buildSyncUpdates(nodes);
  const policyUpdates = updates.filter((u) => u.inventoryPolicy != null);
  await applyBulkUpdates(token, product.id, updates, 'Post-create sync');
  if (policyUpdates.length) {
    summary.policyUpdated.push(handle);
  }
  const inv = await syncReliefInventory(token, handle, nodes);
  if (inv?.skippedScope) summary.inventoryScopeSkipped.push(handle);
  if ((inv?.activated ?? 0) + (inv?.updated ?? 0) > 0) {
    summary.inventoryUpdated.push(handle);
  }
}

async function resolveHandles(token) {
  if (handlesArg) {
    return handlesArg
      .slice('--handles='.length)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  const handles = new Set();
  const includeChairs = wantAll || !wantAccessories;
  const includeAccessories = wantAll || wantAccessories;

  if (includeChairs) {
    for (const handle of CHAIR_HANDLES) handles.add(handle);
  }

  if (includeAccessories) {
    for (const handle of ACCESSORY_HANDLES) handles.add(handle);

    // Also pull whatever is in the accessories collection (covers new SKUs).
    try {
      const data = await adminGraphql(token, COLLECTION_PRODUCTS_QUERY, {
        handle: 'accessories',
      });
      const nodes = data?.collectionByHandle?.products?.nodes ?? [];
      for (const product of nodes) {
        if (product?.handle) handles.add(product.handle);
      }
      console.log(
        `Accessories collection: ${nodes.length} product(s) (merged with known handles).`,
      );
    } catch (error) {
      console.warn(
        'Could not load accessories collection — using known handles only.',
        error.message ?? error,
      );
    }
  }

  // --all: also scan every ACTIVE product so renamed handles are not missed.
  if (wantAll) {
    let cursor = null;
    let scanned = 0;
    do {
      const data = await adminGraphql(token, ALL_PRODUCTS_QUERY, {cursor});
      const conn = data?.products;
      for (const product of conn?.nodes ?? []) {
        scanned += 1;
        if (product?.status === 'ACTIVE' && product.handle) {
          handles.add(product.handle);
        }
      }
      cursor = conn?.pageInfo?.hasNextPage ? conn.pageInfo.endCursor : null;
    } while (cursor);
    console.log(
      `Active catalogue scan: ${scanned} product(s) considered (ACTIVE handles merged).`,
    );
  }

  return [...handles];
}

const token = await getToken();
const HANDLES = await resolveHandles(token);

const summary = {
  createdVat: [],
  alreadyHadVat: [],
  policyUpdated: [],
  inventoryUpdated: [],
  inventoryScopeSkipped: [],
  notFound: [],
  failures: [],
};

console.log(
  dryRun
    ? `Dry run — no Admin writes (${HANDLES.length} product(s)).`
    : `Updating ${HANDLES.length} product(s) on ${storeDomain}`,
);

for (const handle of HANDLES) {
  try {
    await ensureVatVariants(token, handle, summary);
  } catch (error) {
    console.error(`Failed ${handle}:`, error.message ?? error);
    summary.failures.push({handle, error: error.message ?? String(error)});
  }
}

console.log('\nDone.');
console.log(
  'Tax: Standard = Charge tax ON; VAT Relief = Charge tax OFF (no “Including £X” on net).',
);
console.log(
  'Inventory: VAT Relief copies Standard inventoryPolicy + available qty per location when scopes allow; otherwise Relief uses CONTINUE if Standard is sellable at qty 0.',
);
console.log(
  'Storefront: claim VAT relief → ATC / cart swap uses the VAT Relief variant.',
);

console.log('\n=== SUMMARY ===');
console.log(`Created VAT option: ${summary.createdVat.length}`, summary.createdVat);
console.log(
  `Already had VAT: ${summary.alreadyHadVat.length}`,
  summary.alreadyHadVat,
);
console.log(
  `inventoryPolicy updated: ${summary.policyUpdated.length}`,
  summary.policyUpdated,
);
console.log(
  `Inventory qty activated/updated: ${summary.inventoryUpdated.length}`,
  summary.inventoryUpdated,
);
console.log(
  `Inventory qty skipped (scope): ${summary.inventoryScopeSkipped.length}`,
  summary.inventoryScopeSkipped,
);
console.log(`Not found: ${summary.notFound.length}`, summary.notFound);
console.log(`Failures: ${summary.failures.length}`);
for (const row of summary.failures) {
  console.log(`  - ${row.handle}:`, row.error);
}
