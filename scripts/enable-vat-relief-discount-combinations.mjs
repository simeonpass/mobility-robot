#!/usr/bin/env node
/**
 * Update live "VAT Relief (exact)" so it can stack with discount codes.
 *
 * - Sets discountClasses to ORDER (product codes like JENNI10 can stack on Basic)
 * - Enables combinesWith for product / order / shipping discounts
 *
 * Usage:
 *   node scripts/enable-vat-relief-discount-combinations.mjs
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

const clientId =
  process.env.XSTO_VAT_RELIEF_CLIENT_ID?.trim() ||
  'd0589c6e7756aea84becc989391f687d';
const clientSecret = process.env.XSTO_VAT_RELIEF_CLIENT_SECRET?.trim();
const storeDomain = process.env.PUBLIC_STORE_DOMAIN?.trim();

if (!clientSecret || !storeDomain) {
  console.error(
    'Missing XSTO_VAT_RELIEF_CLIENT_SECRET or PUBLIC_STORE_DOMAIN in .env',
  );
  process.exit(1);
}

const COMBINES_WITH = {
  orderDiscounts: true,
  productDiscounts: true,
  shippingDiscounts: true,
};

async function getToken() {
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
    console.error('Could not get app access token:');
    console.error(JSON.stringify(tokenPayload, null, 2));
    process.exit(1);
  }
  return tokenPayload.access_token;
}

async function adminGraphql(token, query, variables = {}) {
  const response = await fetch(
    `https://${storeDomain}/admin/api/2025-10/graphql.json`,
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

const token = await getToken();

const listData = await adminGraphql(
  token,
  `#graphql
  query ListVatReliefDiscount {
    discountNodes(first: 50) {
      nodes {
        id
        discount {
          __typename
          ... on DiscountAutomaticApp {
            title
            status
            discountClasses
            combinesWith {
              orderDiscounts
              productDiscounts
              shippingDiscounts
            }
          }
        }
      }
    }
  }
`,
);

const vatNode = listData.discountNodes.nodes.find((node) => {
  const discount = node.discount;
  return (
    discount?.__typename === 'DiscountAutomaticApp' &&
    String(discount.title || '').includes('VAT Relief')
  );
});

if (!vatNode) {
  console.error('Could not find automatic discount titled VAT Relief*');
  console.error(JSON.stringify(listData, null, 2));
  process.exit(1);
}

console.log('Found:', vatNode.id, vatNode.discount);

const updateVat = await adminGraphql(
  token,
  `#graphql
  mutation UpdateVatRelief(
    $id: ID!
    $automaticAppDiscount: DiscountAutomaticAppInput!
  ) {
    discountAutomaticAppUpdate(
      id: $id
      automaticAppDiscount: $automaticAppDiscount
    ) {
      automaticAppDiscount {
        title
        status
        discountClasses
        combinesWith {
          orderDiscounts
          productDiscounts
          shippingDiscounts
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`,
  {
    id: vatNode.id,
    automaticAppDiscount: {
      discountClasses: ['ORDER'],
      combinesWith: COMBINES_WITH,
    },
  },
);

if (updateVat.discountAutomaticAppUpdate.userErrors?.length) {
  console.error(
    'VAT update errors:',
    JSON.stringify(updateVat.discountAutomaticAppUpdate.userErrors, null, 2),
  );
  process.exit(1);
}

console.log(
  'Updated VAT Relief:',
  JSON.stringify(updateVat.discountAutomaticAppUpdate.automaticAppDiscount, null, 2),
);
console.log(`
Deploy the function first if you have not already:
  shopify app deploy --config shopify.app.xsto-vat-relief.toml
`);
