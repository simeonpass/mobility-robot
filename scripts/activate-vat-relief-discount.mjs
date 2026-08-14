#!/usr/bin/env node
/**
 * Activate (or recreate) the automatic "VAT Relief (exact)" discount.
 *
 * With tax-exclusive catalog prices this discount must stay Active — it is
 * what makes guest checkout totals land on the ex-VAT amount on non-Plus.
 *
 * Usage:
 *   node scripts/activate-vat-relief-discount.mjs
 *
 * Needs either:
 *   SHOPIFY_ADMIN_API_ACCESS_TOKEN + PUBLIC_STORE_DOMAIN
 * or:
 *   XSTO_VAT_RELIEF_CLIENT_ID + XSTO_VAT_RELIEF_CLIENT_SECRET + PUBLIC_STORE_DOMAIN
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

const storeDomain = process.env.PUBLIC_STORE_DOMAIN?.trim();
const adminToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN?.trim();
const clientId =
  process.env.XSTO_VAT_RELIEF_CLIENT_ID?.trim() ||
  'd0589c6e7756aea84becc989391f687d';
const clientSecret = process.env.XSTO_VAT_RELIEF_CLIENT_SECRET?.trim();

if (!storeDomain) {
  console.error('Missing PUBLIC_STORE_DOMAIN in .env');
  process.exit(1);
}

async function getToken() {
  if (adminToken) return adminToken;
  if (!clientSecret) {
    console.error(
      'Need SHOPIFY_ADMIN_API_ACCESS_TOKEN or XSTO_VAT_RELIEF_CLIENT_SECRET',
    );
    process.exit(1);
  }

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
    console.error(JSON.stringify(payload, null, 2));
    process.exit(1);
  }
  return payload.data;
}

const LIST_QUERY = `#graphql
  query VatReliefDiscounts {
    discountNodes(first: 25, query: "title:VAT Relief*") {
      nodes {
        id
        discount {
          __typename
          ... on DiscountAutomaticApp {
            title
            status
            discountId
          }
        }
      }
    }
  }
`;

const ACTIVATE_MUTATION = `#graphql
  mutation ActivateVatRelief($id: ID!) {
    discountAutomaticActivate(id: $id) {
      automaticDiscountNode {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const token = await getToken();
const data = await adminGraphql(token, LIST_QUERY);
const nodes = data?.discountNodes?.nodes ?? [];

const matches = nodes.filter((node) => {
  const discount = node.discount;
  return (
    discount?.__typename === 'DiscountAutomaticApp' &&
    typeof discount.title === 'string' &&
    discount.title.toLowerCase().includes('vat relief')
  );
});

if (!matches.length) {
  console.error(
    'No "VAT Relief" automatic app discount found. Create it first:',
  );
  console.error('  node scripts/create-vat-relief-discount-with-app.mjs');
  process.exit(1);
}

for (const node of matches) {
  const discount = node.discount;
  console.log(`Found: ${discount.title} (${discount.status}) id=${node.id}`);
  if (discount.status === 'ACTIVE') {
    console.log('Already Active — nothing to do.');
    continue;
  }

  const result = await adminGraphql(token, ACTIVATE_MUTATION, {
    id: node.id,
  });
  const errors = result?.discountAutomaticActivate?.userErrors ?? [];
  if (errors.length) {
    console.error(JSON.stringify(errors, null, 2));
    process.exit(1);
  }
  console.log(`Activated ${discount.title}`);
}

console.log('Done. Re-test checkout with VAT relief claimed.');
