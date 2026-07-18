#!/usr/bin/env node
/**
 * Create the VAT Relief automatic discount using XSTO VAT Relief app credentials.
 *
 * Why not `shopify store execute`? That uses a generic CLI app, which cannot
 * reference this function. Only XSTO VAT Relief can create this discount.
 *
 * Setup (one time):
 * 1. Dev Dashboard → XSTO VAT Relief → Settings → Credentials
 * 2. Copy Client ID + Client secret into .env:
 *
 *    XSTO_VAT_RELIEF_CLIENT_ID=d0589c6e7756aea84becc989391f687d
 *    XSTO_VAT_RELIEF_CLIENT_SECRET=shpss_...
 *    PUBLIC_STORE_DOMAIN=f7vjea-hq.myshopify.com
 *
 * Usage: node scripts/create-vat-relief-discount-with-app.mjs
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

const missing = [];
if (!clientSecret) missing.push('XSTO_VAT_RELIEF_CLIENT_SECRET');
if (!storeDomain) missing.push('PUBLIC_STORE_DOMAIN');

if (missing.length) {
  console.error(`Missing in .env: ${missing.join(', ')}\n`);
  console.error(`Add these lines to /Users/simeonpass/mobility-robot/.env :

PUBLIC_STORE_DOMAIN=f7vjea-hq.myshopify.com
XSTO_VAT_RELIEF_CLIENT_SECRET=shpss_paste_from_dev_dashboard

Get the secret: Dev Dashboard → XSTO VAT Relief → Settings → Credentials → Client secret

Or run once without editing .env:
XSTO_VAT_RELIEF_CLIENT_SECRET=shpss_... PUBLIC_STORE_DOMAIN=f7vjea-hq.myshopify.com node scripts/create-vat-relief-discount-with-app.mjs
`);
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
  console.error(`
If you see shop_not_permitted, client credentials may not work on this store.
Use the Dev Dashboard GraphQL explorer for app XSTO VAT Relief instead.
`);
  process.exit(1);
}

const mutation = `#graphql
  mutation CreateVatReliefDiscount($input: DiscountAutomaticAppInput!) {
    discountAutomaticAppCreate(automaticAppDiscount: $input) {
      automaticAppDiscount {
        discountId
        title
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const variables = {
  input: {
    title: 'VAT Relief (exact)',
    functionHandle: 'vat-relief-discount',
    discountClasses: ['PRODUCT'],
    startsAt: new Date().toISOString(),
  },
};

const response = await fetch(
  `https://${storeDomain}/admin/api/2025-01/graphql.json`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': tokenPayload.access_token,
    },
    body: JSON.stringify({query: mutation, variables}),
  },
);

const payload = await response.json();

if (payload.errors?.length) {
  console.error('GraphQL errors:', JSON.stringify(payload.errors, null, 2));
  process.exit(1);
}

const result = payload.data?.discountAutomaticAppCreate;
if (result?.userErrors?.length) {
  console.error('User errors:', JSON.stringify(result.userErrors, null, 2));
  process.exit(1);
}

console.log('Created automatic discount:');
console.log(JSON.stringify(result?.automaticAppDiscount, null, 2));
console.log('\nNext: Discounts → confirm "VAT Relief (exact)" is Active.');
console.log('Deactivate the old "VAT Exemption" automatic discount.');
