#!/usr/bin/env node
/**
 * One-time setup: create the automatic "VAT Relief (exact)" discount on Bentech.
 *
 * Requires a custom app Admin API token with write_discounts scope in .env:
 *   SHOPIFY_ADMIN_API_ACCESS_TOKEN=...
 *   PUBLIC_STORE_DOMAIN=f7vjea-hq.myshopify.com
 *
 * Usage: node scripts/create-vat-relief-discount.mjs
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
    // .env optional if vars already exported
  }
}

loadEnv();

const token = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN?.trim();
const storeDomain = process.env.PUBLIC_STORE_DOMAIN?.trim();

if (!token || !storeDomain) {
  console.error(
    'Missing SHOPIFY_ADMIN_API_ACCESS_TOKEN or PUBLIC_STORE_DOMAIN in .env',
  );
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
      'X-Shopify-Access-Token': token,
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
