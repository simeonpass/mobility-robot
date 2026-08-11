#!/usr/bin/env node
/**
 * Create M4 / M4B colour rear-cover accessories in Shopify (one product per colour)
 * and add them to the Accessories collection.
 *
 * Source catalogue (images + colour names):
 *   https://www.xstomobility.com/products/customized-color-backplate-for-m4-m4h
 *
 * Auth (first match wins):
 *   1. SHOPIFY_ADMIN_API_ACCESS_TOKEN starting with shpat_
 *   2. SHOPIFY_DEPOSIT_CLIENT_ID + SHOPIFY_DEPOSIT_CLIENT_SECRET
 *      (needs read_products, write_products, write_publications / write_channels
 *       if publishing fails, publish manually in Admin)
 *   3. XSTO_VAT_RELIEF_CLIENT_ID + XSTO_VAT_RELIEF_CLIENT_SECRET (last resort)
 *
 * Usage: node scripts/setup-rear-cover-accessories.mjs
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

/** UK list price (inc VAT). Adjust in Admin after create if needed. */
const PRICE_GBP = process.env.REAR_COVER_PRICE_GBP?.trim() || '129.00';

const REAR_COVERS = [
  {
    handle: 'rear-cover-tiffany-blue',
    colour: 'Tiffany Blue',
    image:
      'https://cdn.shopify.com/s/files/1/0674/6266/0313/files/Electric_Wheelchair_M4_2.jpg?v=1740728789',
  },
  {
    handle: 'rear-cover-sparkling-yellow',
    colour: 'Sparkling Yellow',
    image:
      'https://cdn.shopify.com/s/files/1/0674/6266/0313/files/Electric_Wheelchair_M4_7.jpg?v=1740728802',
  },
  {
    handle: 'rear-cover-barbie-pink',
    colour: 'Barbie Pink',
    image:
      'https://cdn.shopify.com/s/files/1/0674/6266/0313/files/Electric_Wheelchair_M4_1.jpg?v=1740728818',
  },
  {
    handle: 'rear-cover-pearl-white',
    colour: 'Pearl White',
    image:
      'https://cdn.shopify.com/s/files/1/0674/6266/0313/files/Electric_Wheelchair_M4_8.jpg?v=1740728832',
  },
  {
    handle: 'rear-cover-burgundy-red',
    colour: 'Burgundy Red',
    image:
      'https://cdn.shopify.com/s/files/1/0674/6266/0313/files/Electric_Wheelchair_M4_4.jpg?v=1740728848',
  },
  {
    handle: 'rear-cover-blue-enamel',
    colour: 'Blue Enamel',
    image:
      'https://cdn.shopify.com/s/files/1/0674/6266/0313/files/Electric_Wheelchair_M4_5.jpg?v=1740728861',
  },
  {
    handle: 'rear-cover-superior-purple',
    colour: 'Superior Purple',
    image:
      'https://cdn.shopify.com/s/files/1/0674/6266/0313/files/Electric_Wheelchair_M4_6.jpg?v=1740728872',
  },
];

const ACCESSORIES_COLLECTION_HANDLE = 'accessories';

const storeDomain = process.env.PUBLIC_STORE_DOMAIN?.trim();
if (!storeDomain) {
  console.error('Missing PUBLIC_STORE_DOMAIN in .env');
  process.exit(1);
}

function descriptionHtml(colour) {
  return `
<p>Personalise your XSTO M4 or M4B with the <strong>${colour}</strong> snap-on rear cover (colour backplate). A quick visual upgrade that fits the M4-platform back shell.</p>
<ul>
  <li>Colour: ${colour}</li>
  <li>Fits XSTO M4 and M4B</li>
  <li>Snap-on colour backplate for everyday personalisation</li>
  <li>Lightweight accessory — ships as a spare / add-on</li>
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

  const vatClientId =
    process.env.XSTO_VAT_RELIEF_CLIENT_ID?.trim() ||
    'd0589c6e7756aea84becc989391f687d';
  const vatClientSecret = process.env.XSTO_VAT_RELIEF_CLIENT_SECRET?.trim();
  if (vatClientSecret) {
    console.warn(
      'No deposit credentials found; falling back to VAT Relief app (may lack write_products).',
    );
    return fetchClientCredentialsToken(
      vatClientId,
      vatClientSecret,
      'VAT Relief (fallback)',
    );
  }

  console.error(`No Admin API credentials available.

Add one of:

  SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_...
  # or
  SHOPIFY_DEPOSIT_CLIENT_ID=...
  SHOPIFY_DEPOSIT_CLIENT_SECRET=shpss_...

Required scopes: read_products, write_products
Optional: write_publications (to auto-publish to sales channels)
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
          nodes { id handle title status }
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
  const exact = data?.collections?.nodes?.find(
    (c) => c.handle === ACCESSORIES_COLLECTION_HANDLE,
  );
  return exact ?? data?.collections?.nodes?.[0] ?? null;
}

async function createRearCover(token, cover) {
  const title = `XSTO M4 / M4B Rear Cover — ${cover.colour}`;
  const existing = await findProductByHandle(token, cover.handle);
  if (existing) {
    console.log(`Exists: ${cover.handle} (${existing.id})`);
    return existing;
  }

  const createData = await adminGraphql(
    token,
    `#graphql
      mutation CreateRearCover($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            handle
            title
            variants(first: 1) {
              nodes { id }
            }
          }
          userErrors { field message }
        }
      }
    `,
    {
      product: {
        title,
        handle: cover.handle,
        descriptionHtml: descriptionHtml(cover.colour),
        vendor: 'XSTO',
        productType: 'Accessory',
        status: 'ACTIVE',
        tags: [
          'Accessories',
          'compatible-m4',
          'compatible-m4b',
          'rear-cover',
          cover.colour,
        ],
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
            productVariants { id price }
            userErrors { field message }
          }
        }
      `,
      {
        productId: product.id,
        variants: [
          {
            id: variantId,
            price: PRICE_GBP,
            inventoryPolicy: 'CONTINUE',
          },
        ],
      },
    );
    assertNoUserErrors(
      'productVariantsBulkUpdate',
      priceData?.productVariantsBulkUpdate?.userErrors,
    );
    console.log(`  Price set to £${PRICE_GBP}`);
  }

  const mediaData = await adminGraphql(
    token,
    `#graphql
      mutation AddImage($productId: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $productId, media: $media) {
          media { ... on MediaImage { id } }
          mediaUserErrors { field message }
          userErrors { field message }
        }
      }
    `,
    {
      productId: product.id,
      media: [
        {
          originalSource: cover.image,
          alt: `${title} — colour rear cover for XSTO M4 and M4B`,
          mediaContentType: 'IMAGE',
        },
      ],
    },
  );
  const mediaErrors = [
    ...(mediaData?.productCreateMedia?.mediaUserErrors ?? []),
    ...(mediaData?.productCreateMedia?.userErrors ?? []),
  ];
  if (mediaErrors.length) {
    console.warn(`  Image warning for ${cover.handle}:`, mediaErrors);
  } else {
    console.log(`  Image attached from XSTO Mobility CDN`);
  }

  return product;
}

async function addToAccessoriesCollection(token, collectionId, productIds) {
  if (!collectionId || !productIds.length) return;
  const data = await adminGraphql(
    token,
    `#graphql
      mutation AddToAccessories($id: ID!, $productIds: [ID!]!) {
        collectionAddProducts(id: $id, productIds: $productIds) {
          collection { id title }
          userErrors { field message }
        }
      }
    `,
    {id: collectionId, productIds},
  );
  assertNoUserErrors(
    'collectionAddProducts',
    data?.collectionAddProducts?.userErrors,
  );
  console.log(`Added ${productIds.length} product(s) to Accessories collection.`);
}

async function publishToAvailableChannels(token, productId) {
  try {
    const pubs = await adminGraphql(
      token,
      `#graphql
        query Publications {
          publications(first: 20) {
            nodes { id name }
          }
        }
      `,
    );
    const nodes = pubs?.publications?.nodes ?? [];
    if (!nodes.length) {
      console.warn(
        '  No publications returned — publish the product to Hydrogen / Online Store in Admin.',
      );
      return;
    }

    for (const publication of nodes) {
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
          {
            id: productId,
            input: [{publicationId: publication.id}],
          },
        );
        const errors = data?.publishablePublish?.userErrors ?? [];
        if (errors.length) {
          console.warn(
            `  Publish to "${publication.name}" skipped:`,
            errors.map((e) => e.message).join('; '),
          );
        } else {
          console.log(`  Published to ${publication.name}`);
        }
      } catch (error) {
        console.warn(
          `  Publish to "${publication.name}" failed:`,
          error.message ?? error,
        );
      }
    }
  } catch (error) {
    console.warn(
      '  Could not list publications (missing scope?). Publish products manually in Admin.',
      error.message ?? error,
    );
  }
}

const token = await getAccessToken();
const collection = await findAccessoriesCollection(token);
if (!collection) {
  console.warn(
    `Accessories collection handle "${ACCESSORIES_COLLECTION_HANDLE}" not found — products will still be created.`,
  );
} else {
  console.log(`Accessories collection: ${collection.title} (${collection.id})`);
}

const createdIds = [];
for (const cover of REAR_COVERS) {
  const product = await createRearCover(token, cover);
  createdIds.push(product.id);
  await publishToAvailableChannels(token, product.id);
}

if (collection?.id) {
  await addToAccessoriesCollection(token, collection.id, createdIds);
}

console.log(`
Done. Rear covers on the storefront:

${REAR_COVERS.map(
  (c) =>
    `  https://mobilityrobot.co.uk/products/${c.handle}  (${c.colour})`,
).join('\n')}

If a product is missing on the Hydrogen site, open it in Shopify Admin →
Sales channels → enable the Hydrogen / Headless channel, and confirm it is
in the Accessories collection.
`);
