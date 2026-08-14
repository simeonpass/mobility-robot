#!/usr/bin/env node
/**
 * Compare the XSTO accessories CSV against Shopify and create missing products.
 *
 * Images prefer xstomobility.com (XSTO’s public catalogue). Similar in-store
 * photos are reused when the manufacturer page has no dedicated shot.
 *
 * Auth (first match wins):
 *   1. SHOPIFY_ADMIN_API_ACCESS_TOKEN starting with shpat_
 *   2. SHOPIFY_DEPOSIT_CLIENT_ID + SHOPIFY_DEPOSIT_CLIENT_SECRET
 *
 * Usage:
 *   node scripts/sync-xsto-csv-accessories.mjs --dry-run
 *   node scripts/sync-xsto-csv-accessories.mjs
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

const dryRun = process.argv.includes('--dry-run');
const ACCESSORIES_COLLECTION_HANDLE = 'accessories';

const IMG = {
  battery:
    'https://cdn.shopify.com/s/files/1/0904/4541/4778/files/replacement-battery-for-xsto-m4.png?v=1750334663',
  x12Battery:
    'https://cdn.shopify.com/s/files/1/0674/6266/0313/files/lQLPKIHftJTFuIPNA97NA96w05yCsJkmKMAKBVtg3pWNAQ_990_990.png?v=1781591334',
  seatS:
    'https://cdn.shopify.com/s/files/1/0904/4541/4778/files/1772057846224-Accessories_-_Seat_Cushion_M-_2.webp?v=1783981247',
  seatL:
    'https://cdn.shopify.com/s/files/1/0904/4541/4778/files/1772057845108-Accessories_-_Seat_Cushion_L-_1.webp?v=1783981213',
  backS:
    'https://cdn.shopify.com/s/files/1/0904/4541/4778/files/1772057838911-Accessories_-_Backrest_cushion_M_-_2.webp?v=1783980207',
  backL:
    'https://cdn.shopify.com/s/files/1/0904/4541/4778/files/1772057837907-Accessories_-_Backrest_cushion_L-_1.webp?v=1783978447',
  phonePro:
    'https://cdn.shopify.com/s/files/1/0674/6266/0313/files/1_4136879c-2003-4f55-af83-167f1fb2d145.png?v=1782723817',
  phonePro2:
    'https://cdn.shopify.com/s/files/1/0674/6266/0313/files/2_c611d7d7-72dd-4d45-87aa-149bd4da183e.png?v=1782723817',
  umbrellaPro:
    'https://cdn.shopify.com/s/files/1/0674/6266/0313/files/2_08465527-ac96-4ab7-9ab9-6133635172ad.png?v=1782723839',
  umbrellaPro2:
    'https://cdn.shopify.com/s/files/1/0674/6266/0313/files/1_7b0cc9c7-c345-4ec3-9422-5687fbe3ff26.png?v=1782723839',
  mirror:
    'https://cdn.shopify.com/s/files/1/0674/6266/0313/files/rearview-mirror-media-image.webp?v=1766568191',
  mirror2:
    'https://cdn.shopify.com/s/files/1/0674/6266/0313/files/rearview-mirror-media-image_2.webp?v=1766568191',
  trunk:
    'https://cdn.shopify.com/s/files/1/0904/4541/4778/files/1772057852670-Trunk_Support-1.webp?v=1783981869',
  joystick:
    'https://cdn.shopify.com/s/files/1/0904/4541/4778/files/1772057835793-Accessories_-_Auxiliary_Controller_-_Connector_-_1.webp?v=1783977291',
};

const M4 = ['compatible-m4', 'compatible-m4b'];
const M4_FAMILY = ['compatible-m4', 'compatible-m4b', 'compatible-m4-pro'];
const PRO_X12 = ['compatible-m4-pro', 'compatible-x12', 'compatible-x12-pro'];
const X12 = ['compatible-x12', 'compatible-x12-pro'];
const PRO = ['compatible-m4-pro'];

/** CSV rows that already exist as Shopify products (matched by SKU or title). */
const EXISTING = [
  {sku: 'SPA-XST-01', handle: 'travel-cushion-seat-with-pump'},
  {sku: 'SPA-XST-02', handle: 'armrest-bag'},
  {sku: 'SPA-XST-03', handle: 'ergonomic-chairs-for-back-support'},
  {sku: 'SPA-XST-04', handle: 'flashlight-holder'},
  {sku: 'SPA-XST-05', handle: 'wheelchair-battery-charger'},
  {sku: 'SPA-XST-06', handle: 'rear-cover-m4', note: 'colour variants SPA-XST-06–12'},
  {sku: 'SPA-XST-13', handle: 'lithium-10-4ah-battery-batteries-lithium-battery'},
  {sku: 'SPA-XST-14', handle: 'universal-wheels-for-xsto-m4'},
  {sku: 'SPA-XST-15', handle: 'batteries-lithium-battery-15-6ah-battery'},
  {sku: 'SPA-XST-16', handle: 'buy-universal-phone-holder'},
  {sku: 'SPA-XST-17', handle: 'umbrella-bracket-m4-m4-pro'},
  {sku: 'SPA-XST-22', handle: 'auxiliary-joystick-m4-m4-pro'},
  {sku: 'SPA-XST-23', handle: 'adjustable-headrest-for-x12-x12-pro'},
  {sku: 'SPA-XST-23b', handle: 'adjustable-headrest-m4-pro'},
  {sku: 'SPA-XST-25', handle: 'lateral-side-guard-m4-pro'},
  {sku: 'SPA-XST-26', handle: 'backrest-cushion-small-m4-pro'},
  {sku: 'SPA-XST-27', handle: 'backrest-cushion-large-m4-pro'},
  {sku: 'SPA-XST-28', handle: 'seat-cushion-small-m4-pro'},
  {sku: 'SPA-XST-29', handle: 'seat-cushion-large-m4-pro'},
  {sku: 'SPA-XST-30', handle: 'rearview-mirror-m4-pro'},
  {sku: 'SPA-XST-32', handle: 'universal-wheels-for-xsto-m4', note: 'duplicate of SPA-XST-14'},
  {sku: 'SPA-XST-43', handle: 'trunk-support-m4-pro', note: 'left+right sold as one listing'},
  {sku: 'SPA-XST-44', handle: 'trunk-support-m4-pro'},
  {sku: 'SPA-XST-52', handle: 'bluetooth-controller-for-m4-m4h-m4-pro-x12-x12-pro'},
  {sku: 'SPA-XST-56', handle: 'black-backpack-for-m4-pro'},
  {sku: 'SPA-XST-57', handle: 'cup-holder-for-all-models'},
];

/** Set SPA-XST SKU on existing products that were missing it. */
const SKU_UPDATES = [
  {handle: 'buy-universal-phone-holder', sku: 'SPA-XST-16'},
  {handle: 'umbrella-bracket-m4-m4-pro', sku: 'SPA-XST-17'},
  {handle: 'auxiliary-joystick-m4-m4-pro', sku: 'SPA-XST-22'},
  {handle: 'adjustable-headrest-for-x12-x12-pro', sku: 'SPA-XST-23'},
  {handle: 'lateral-side-guard-m4-pro', sku: 'SPA-XST-25'},
  {handle: 'rearview-mirror-m4-pro', sku: 'SPA-XST-30'},
  {handle: 'batteries-lithium-battery-15-6ah-battery', sku: 'SPA-XST-15'},
  {handle: 'bluetooth-controller-for-m4-m4h-m4-pro-x12-x12-pro', sku: 'SPA-XST-52'},
  {handle: 'black-backpack-for-m4-pro', sku: 'SPA-XST-56'},
  {handle: 'cup-holder-for-all-models', sku: 'SPA-XST-57'},
];

const NEW_PRODUCTS = [
  {
    sku: 'SPA-XST-18',
    handle: 'm4-spare-seat-connector-female-socket',
    title: 'M4 Spare — Seat Connector Female Socket',
    price: '36.00',
    tags: [...M4, 'spare'],
    mpn: null,
    images: [],
    overview:
      'Replacement female seat-connector socket for the XSTO M4 / M4B. A genuine spare for service and repairs.',
  },
  {
    sku: 'SPA-XST-19',
    handle: 'm4-spare-right-front-mud-cover',
    title: 'M4 Spare — Right Front Wheel Mud Cover',
    price: '10.00',
    tags: [...M4, 'spare'],
    mpn: null,
    images: [],
    overview:
      'Right-hand front wheel mud cover spare for the XSTO M4 / M4B.',
  },
  {
    sku: 'SPA-XST-20',
    handle: 'm4-spare-left-front-mud-cover',
    title: 'M4 Spare — Left Front Wheel Mud Cover',
    price: '10.00',
    tags: [...M4, 'spare'],
    mpn: null,
    images: [],
    overview:
      'Left-hand front wheel mud cover spare for the XSTO M4 / M4B.',
  },
  {
    sku: 'SPA-XST-21',
    handle: 'm4-pro-handle-fixing-plate',
    title: 'M4 Pro Handle Fixing Plate for Rear Controller',
    price: '15.00',
    tags: [...PRO, 'spare'],
    mpn: 'C101002790',
    images: [],
    overview:
      'Handle fixing plate for the M4 Pro rear / attendant controller (C101002790).',
  },
  {
    sku: 'SPA-XST-33',
    handle: 'm4-m4-pro-battery-25-2v-23-8ah',
    title: 'M4 & M4 Pro Battery — 25.2V 23.8Ah',
    price: '399.00',
    tags: [...M4_FAMILY, 'battery'],
    mpn: 'B202000008',
    images: [IMG.battery],
    overview:
      'High-capacity 25.2V 23.8Ah lithium battery for the XSTO M4 family (M4, M4B and M4 Pro). Swap in as a spare or range upgrade.',
  },
  {
    sku: 'SPA-XST-34',
    handle: 'x12-x12-pro-battery-25-2v-25-6ah',
    title: 'X12 & X12 Pro Battery — 25.2V 25.6Ah',
    price: '799.00',
    tags: [...X12, 'battery'],
    mpn: 'B202000025',
    images: [IMG.x12Battery],
    overview:
      '25.2V 25.6Ah lithium battery for the XSTO X12 and X12 Pro stair-climbing chairs. Official XSTO spare.',
  },
  {
    sku: 'SPA-XST-35',
    handle: 'straight-backrest-cushion-s-m4-pro-x12',
    title: 'Straight Backrest Cushion (S) — M4 Pro & X12',
    price: '99.00',
    tags: [...PRO_X12, 'cushion'],
    mpn: 'C101003060',
    images: [IMG.backS],
    overview:
      'Small straight backrest cushion for the XSTO M4 Pro, X12 and X12 Pro seating system.',
  },
  {
    sku: 'SPA-XST-36',
    handle: 'straight-backrest-cushion-m-m4-pro-x12',
    title: 'Straight Backrest Cushion (M) — M4 Pro & X12',
    price: '99.00',
    tags: [...PRO_X12, 'cushion'],
    mpn: 'C101003061',
    images: [IMG.backS],
    overview:
      'Medium straight backrest cushion for the XSTO M4 Pro, X12 and X12 Pro seating system.',
  },
  {
    sku: 'SPA-XST-37',
    handle: 'straight-seat-cushion-s-m4-pro-x12',
    title: 'Straight Seat Cushion (S) — M4 Pro & X12',
    price: '79.00',
    tags: [...PRO_X12, 'cushion'],
    mpn: 'C101002986',
    images: [IMG.seatS],
    overview:
      'Small straight seat cushion for the XSTO M4 Pro, X12 and X12 Pro.',
  },
  {
    sku: 'SPA-XST-38',
    handle: 'straight-seat-cushion-m-m4-pro-x12',
    title: 'Straight Seat Cushion (M) — M4 Pro & X12',
    price: '89.00',
    tags: [...PRO_X12, 'cushion'],
    mpn: 'C101002987',
    images: [IMG.seatS],
    overview:
      'Medium straight seat cushion for the XSTO M4 Pro, X12 and X12 Pro.',
  },
  {
    sku: 'SPA-XST-39',
    handle: 'straight-backrest-cushion-l-m4-pro-x12',
    title: 'Straight Backrest Cushion (L) — M4 Pro & X12',
    price: '99.00',
    tags: [...PRO_X12, 'cushion'],
    mpn: 'C101003062',
    images: [IMG.backL],
    overview:
      'Large straight backrest cushion for the XSTO M4 Pro, X12 and X12 Pro seating system.',
  },
  {
    sku: 'SPA-XST-40',
    handle: 'straight-seat-cushion-l-m4-pro-x12',
    title: 'Straight Seat Cushion (L) — M4 Pro & X12',
    price: '79.00',
    tags: [...PRO_X12, 'cushion'],
    mpn: 'C101002988',
    images: [IMG.seatL],
    overview:
      'Large straight seat cushion for the XSTO M4 Pro, X12 and X12 Pro.',
  },
  {
    sku: 'SPA-XST-41',
    handle: 'phone-holder-m4-pro-x12',
    title: 'Mobile Phone Holder — M4 Pro & X12',
    price: '49.00',
    tags: [...PRO_X12],
    mpn: 'A402000010',
    images: [IMG.phonePro, IMG.phonePro2],
    overview:
      'Clamp-on mobile phone holder designed for the XSTO M4 Pro, X12 and X12 Pro control area. Keep navigation and calls in easy reach.',
  },
  {
    sku: 'SPA-XST-45',
    handle: 'rear-view-mirror-m4-pro-x12',
    title: 'Rear-view Mirror — M4 Pro & X12',
    price: '39.00',
    tags: [...PRO_X12],
    mpn: 'A402000012',
    images: [IMG.mirror, IMG.mirror2],
    overview:
      'Handle-mounted rear-view mirror for the XSTO M4 Pro, X12 and X12 Pro. 360° adjustment with a convex lens for a wider field of view.',
  },
  {
    sku: 'SPA-XST-46',
    handle: 'umbrella-holder-m4-pro-x12',
    title: 'Umbrella Holder — M4 Pro & X12',
    price: '89.00',
    tags: [...PRO_X12],
    mpn: 'A402000009',
    images: [IMG.umbrellaPro, IMG.umbrellaPro2],
    overview:
      'Umbrella holder for the XSTO M4 Pro, X12 and X12 Pro — keep rain cover attached while you drive.',
  },
  {
    sku: 'SPA-XST-47',
    handle: 'cooling-seat-cushion-m4-pro-x12',
    title: 'Cooling Seat Cushion — M4 Pro & X12',
    price: '89.00',
    tags: [...PRO_X12, 'cushion'],
    mpn: 'B601000178',
    images: [IMG.seatL],
    overview:
      'Cooling seat cushion for longer sessions on the XSTO M4 Pro, X12 and X12 Pro. Helps airflow and comfort in warm weather.',
  },
  {
    sku: 'SPA-XST-58',
    handle: 'ct420-handle-joystick-knob',
    title: 'CT420 Handle Joystick Knob',
    price: '99.00',
    tags: ['spare', 'ct420'],
    mpn: 'C101001681',
    images: [IMG.joystick],
    overview:
      'Replacement joystick knob for the XSTO CT420 handle. Spare part for CT420 stair-climbing trolleys.',
  },
  {
    sku: 'SPA-XST-59',
    handle: 'cane-holder-m4',
    title: 'Cane Holder — M4',
    price: '59.00',
    tags: [...M4],
    mpn: 'B601000187',
    images: [],
    overview:
      'Cane / walking-stick holder for the XSTO M4 and M4B, so a stick travels with the chair instead of on the user’s lap.',
  },
  {
    sku: 'SPA-XST-60',
    handle: 'rear-push-handles-m4',
    title: 'Rear Push Handles — M4',
    price: '59.00',
    tags: [...M4],
    mpn: 'B601000175',
    images: [],
    overview:
      'Rear attendant push handles for the XSTO M4 and M4B — useful when a helper needs to guide the chair.',
  },
  {
    sku: 'SPA-XST-61',
    handle: 'straight-quick-release-backboard-m4-pro',
    title: 'Straight Quick-Release Backboard — M4 Pro',
    price: '189.00',
    tags: [...PRO],
    mpn: 'C101003023',
    images: [IMG.backL],
    overview:
      'Straight quick-release backboard for the XSTO M4 Pro seating system. Swap or service the backrest without tools.',
  },
];

const storeDomain = process.env.PUBLIC_STORE_DOMAIN?.trim();
if (!storeDomain) {
  console.error('Missing PUBLIC_STORE_DOMAIN');
  process.exit(1);
}

function descriptionHtml(item) {
  const mpn = item.mpn ? `<li>Manufacturer part: ${item.mpn}</li>` : '';
  const chairs = item.tags
    .filter((tag) => tag.startsWith('compatible-'))
    .map((tag) => tag.replace('compatible-', '').replace(/-/g, ' ').toUpperCase());
  const fit =
    chairs.length > 0
      ? `<li>Fits ${chairs.join(', ')}</li>`
      : '<li>Spare / other XSTO equipment</li>';
  return `
<p>${item.overview}</p>
<ul>
  <li>UK list price (inc VAT): £${item.price}</li>
  <li>SKU: ${item.sku}</li>
  ${mpn}
  ${fit}
  <li>Official XSTO accessory from the UK distributor</li>
</ul>
`.trim();
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
    console.log('Using SHOPIFY_ADMIN_API_ACCESS_TOKEN.');
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
  console.error('No Admin API credentials available.');
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

function assertNoUserErrors(label, userErrors) {
  if (userErrors?.length) {
    throw new Error(`${label}: ${JSON.stringify(userErrors, null, 2)}`);
  }
}

async function findProductByHandle(token, handle) {
  const data = await adminGraphql(
    token,
    `#graphql
      query ProductByHandle($query: String!) {
        products(first: 1, query: $query) {
          nodes {
            id
            handle
            title
            status
            variants(first: 30) { nodes { id sku } }
          }
        }
      }
    `,
    {query: `handle:${handle}`},
  );
  return data?.products?.nodes?.[0] ?? null;
}

async function findAccessoriesCollection(token) {
  const data = await adminGraphql(
    token,
    `#graphql
      query AccessoriesCollection($query: String!) {
        collections(first: 5, query: $query) {
          nodes { id handle title }
        }
      }
    `,
    {query: `handle:${ACCESSORIES_COLLECTION_HANDLE}`},
  );
  return (
    data?.collections?.nodes?.find(
      (collection) => collection.handle === ACCESSORIES_COLLECTION_HANDLE,
    ) ?? null
  );
}

async function createProduct(token, item) {
  const existing = await findProductByHandle(token, item.handle);
  if (existing) {
    console.log(`Exists: ${item.handle} (${existing.id})`);
    return existing;
  }

  if (dryRun) {
    console.log(`Would create: ${item.sku} ${item.handle} @ £${item.price}`);
    return {id: `dry-run://${item.handle}`, handle: item.handle};
  }

  const createData = await adminGraphql(
    token,
    `#graphql
      mutation CreateAccessory($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            handle
            title
            variants(first: 1) { nodes { id } }
          }
          userErrors { field message }
        }
      }
    `,
    {
      product: {
        title: item.title,
        handle: item.handle,
        descriptionHtml: descriptionHtml(item),
        vendor: 'XSTO',
        productType: 'Accessory',
        status: 'ACTIVE',
        tags: ['Accessories', item.sku, ...item.tags],
      },
    },
  );
  assertNoUserErrors('productCreate', createData?.productCreate?.userErrors);
  const product = createData.productCreate.product;
  console.log(`Created: ${product.handle} (${product.id})`);

  const variantId = product.variants?.nodes?.[0]?.id;
  if (variantId) {
    const priceData = await adminGraphql(
      token,
      `#graphql
        mutation SetPrice($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
          productVariantsBulkUpdate(productId: $productId, variants: $variants) {
            productVariants { id price sku }
            userErrors { field message }
          }
        }
      `,
      {
        productId: product.id,
        variants: [
          {
            id: variantId,
            price: item.price,
            sku: item.sku,
            inventoryPolicy: 'CONTINUE',
          },
        ],
      },
    );
    assertNoUserErrors(
      'productVariantsBulkUpdate',
      priceData?.productVariantsBulkUpdate?.userErrors,
    );
    console.log(`  Price £${item.price} SKU ${item.sku}`);
  }

  if (item.images?.length) {
    const mediaData = await adminGraphql(
      token,
      `#graphql
        mutation AddImage($productId: ID!, $media: [CreateMediaInput!]!) {
          productCreateMedia(productId: $productId, media: $media) {
            mediaUserErrors { field message }
            userErrors { field message }
          }
        }
      `,
      {
        productId: product.id,
        media: item.images.map((src, index) => ({
          originalSource: src,
          alt: `${item.title}${index ? ` (${index + 1})` : ''}`,
          mediaContentType: 'IMAGE',
        })),
      },
    );
    const mediaErrors = [
      ...(mediaData?.productCreateMedia?.mediaUserErrors ?? []),
      ...(mediaData?.productCreateMedia?.userErrors ?? []),
    ];
    if (mediaErrors.length) {
      console.warn(`  Image warning:`, mediaErrors);
    } else {
      console.log(`  Attached ${item.images.length} image(s)`);
    }
  } else {
    console.log('  No manufacturer image found — created without media');
  }

  return product;
}

async function addToAccessoriesCollection(token, collectionId, productIds) {
  if (!collectionId || !productIds.length) return;
  const unique = [...new Set(productIds)].filter(
    (id) => id && !String(id).startsWith('dry-run://'),
  );
  for (let i = 0; i < unique.length; i += 50) {
    const batch = unique.slice(i, i + 50);
    if (dryRun) {
      console.log(`Would add ${batch.length} product(s) to Accessories`);
      continue;
    }
    const data = await adminGraphql(
      token,
      `#graphql
        mutation AddToAccessories($id: ID!, $productIds: [ID!]!) {
          collectionAddProducts(id: $id, productIds: $productIds) {
            userErrors { field message }
          }
        }
      `,
      {id: collectionId, productIds: batch},
    );
    assertNoUserErrors(
      'collectionAddProducts',
      data?.collectionAddProducts?.userErrors,
    );
    console.log(`Added ${batch.length} product(s) to Accessories collection.`);
  }
}

async function publishToAvailableChannels(token, productId) {
  if (dryRun || String(productId).startsWith('dry-run://')) return;
  try {
    const pubs = await adminGraphql(
      token,
      `#graphql
        query Publications {
          publications(first: 20) { nodes { id name } }
        }
      `,
    );
    for (const publication of pubs?.publications?.nodes ?? []) {
      try {
        const data = await adminGraphql(
          token,
          `#graphql
            mutation Publish($id: ID!, $input: [PublicationInput!]!) {
              publishablePublish(id: $id, input: $input) {
                userErrors { field message }
              }
            }
          `,
          {id: productId, input: [{publicationId: publication.id}]},
        );
        const errors = data?.publishablePublish?.userErrors ?? [];
        if (!errors.length) console.log(`  Published to ${publication.name}`);
      } catch (error) {
        console.warn(`  Publish skipped:`, error.message ?? error);
      }
    }
  } catch (error) {
    console.warn('  Could not list publications.', error.message ?? error);
  }
}

async function applySkuUpdates(token) {
  for (const row of SKU_UPDATES) {
    const product = await findProductByHandle(token, row.handle);
    if (!product) {
      console.warn(`SKU skip (missing): ${row.handle}`);
      continue;
    }
    const variants = (product.variants?.nodes ?? []).filter(Boolean);
    const needs = variants.filter((variant) => variant.sku !== row.sku);
    if (!needs.length) {
      console.log(`SKU ok: ${row.handle} = ${row.sku}`);
      continue;
    }
    if (dryRun) {
      console.log(`Would set SKU ${row.sku} on ${row.handle} (${needs.length} variants)`);
      continue;
    }
    const priceData = await adminGraphql(
      token,
      `#graphql
        mutation SetSku($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
          productVariantsBulkUpdate(productId: $productId, variants: $variants) {
            userErrors { field message }
          }
        }
      `,
      {
        productId: product.id,
        variants: needs.map((variant) => ({id: variant.id, sku: row.sku})),
      },
    );
    assertNoUserErrors(
      'productVariantsBulkUpdate SKU',
      priceData?.productVariantsBulkUpdate?.userErrors,
    );
    console.log(`SKU set: ${row.handle} → ${row.sku}`);
  }
}

const token = await getAccessToken();
const collection = await findAccessoriesCollection(token);
if (!collection) {
  console.warn('Accessories collection not found');
} else {
  console.log(`Accessories collection: ${collection.title} (${collection.id})`);
}

console.log('\n=== Existing CSV matches (not recreated) ===');
for (const row of EXISTING) {
  console.log(`  ${row.sku} → ${row.handle}${row.note ? ` (${row.note})` : ''}`);
}

console.log('\n=== SKU backfill ===');
await applySkuUpdates(token);

console.log('\n=== Create missing products ===');
const createdIds = [];
for (const item of NEW_PRODUCTS) {
  const product = await createProduct(token, item);
  createdIds.push(product.id);
  await publishToAvailableChannels(token, product.id);
}

const existingIds = [];
for (const row of EXISTING) {
  const product = await findProductByHandle(token, row.handle);
  if (product?.id) existingIds.push(product.id);
}

if (collection?.id) {
  console.log('\n=== Accessories collection ===');
  await addToAccessoriesCollection(token, collection.id, [
    ...existingIds,
    ...createdIds,
  ]);
}

console.log(`
Done${dryRun ? ' (dry-run)' : ''}.

New product URLs:
${NEW_PRODUCTS.map((item) => `  https://mobilityrobot.co.uk/products/${item.handle}`).join('\n')}

Next: node scripts/setup-vat-relief-variants.mjs --accessories
`);
