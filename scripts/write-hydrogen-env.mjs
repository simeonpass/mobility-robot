#!/usr/bin/env node
/**
 * Materialize a gitignored `.env` from process environment (Cursor Cloud secrets).
 * Never prints secret values. Safe to run on every boot.
 */
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const REQUIRED = [
  'SESSION_SECRET',
  'PUBLIC_STOREFRONT_API_TOKEN',
  'PRIVATE_STOREFRONT_API_TOKEN',
  'PUBLIC_STORE_DOMAIN',
  'PUBLIC_STOREFRONT_ID',
  'PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID',
  'PUBLIC_CUSTOMER_ACCOUNT_API_URL',
  'SHOP_ID',
];

const OPTIONAL = [
  'PUBLIC_CHECKOUT_DOMAIN',
  'PUBLIC_SHOP_ID',
  'SHOPIFY_ADMIN_API_ACCESS_TOKEN',
  'PUBLIC_GA4_ID',
  'PUBLIC_SHOPIFY_INBOX_EXTERNAL_ID',
  'PUBLIC_SHOPIFY_PRICES_EX_VAT',
  'JUDGEME_SHOP_DOMAIN',
  'JUDGEME_PUBLIC_TOKEN',
  'JUDGEME_CDN_HOST',
  'RESEND_API_KEY',
  'FORMSPREE_ENDPOINT',
  'FORMS_TO_EMAIL',
  'FORMS_FROM_EMAIL',
];

const DEFAULTS = {
  PUBLIC_CHECKOUT_DOMAIN: 'checkout.shopify.com',
};

function quote(value) {
  if (/^[A-Za-z0-9_./:@+-]+$/.test(value)) return value;
  return JSON.stringify(value);
}

const missing = REQUIRED.filter((key) => !process.env[key]?.trim());
if (missing.length) {
  console.error(
    `write-hydrogen-env: missing required secrets: ${missing.join(', ')}`,
  );
  process.exit(1);
}

const lines = ['# Generated from environment secrets. Do not commit.'];

for (const key of [...REQUIRED, ...OPTIONAL]) {
  const value = process.env[key]?.trim() || DEFAULTS[key];
  if (!value) continue;
  lines.push(`${key}=${quote(value)}`);
}

const dest = resolve(process.cwd(), '.env');
writeFileSync(dest, `${lines.join('\n')}\n`, {mode: 0o600});
console.log(`write-hydrogen-env: wrote ${dest} (${lines.length - 1} keys)`);
