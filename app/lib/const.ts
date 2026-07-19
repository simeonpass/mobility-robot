/**
 * Canonical production origin — used for canonical URLs, OG, JSON-LD, sitemap.
 * Public storefront domain is mobilityrobot.co.uk (XSTO brand retained).
 * xsto.co.uk should 301 to this origin, preserving path.
 */
export const SITE_URL = 'https://mobilityrobot.co.uk';

/** Public storefront brand (title suffix, WebSite schema). Products remain XSTO. */
export const SITE_NAME = 'Mobility Robot';

/** Default Open Graph share image (true 1200×630). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.jpg`;

export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

/**
 * Numeric Shopify shop ID (meta.json → id). Used by analytics / Shop widgets.
 * Public via `https://{shop}.myshopify.com/meta.json`.
 */
export const DEFAULT_SHOP_ID = '90445414778';

/**
 * Shopify Inbox storefront auth id (`data-external-identifier` on the Liquid
 * theme embed). Numeric shop id is rejected by messaging-api — copy this from
 * Online Store theme HTML if Inbox is reinstalled.
 */
export const DEFAULT_SHOPIFY_INBOX_EXTERNAL_ID =
  '0LePiN80P-zoypskCNcNW443I327GeKq0WN_XNP9gr0';

/** Current Inbox app-extension asset base (versioned; refresh from theme if chat breaks). */
export const SHOPIFY_INBOX_BUNDLE_SELECTOR_SRC =
  'https://cdn.shopify.com/extensions/019f6b79-ce23-71b4-b954-65d455fad0e8/shopify-inbox-1291/assets/shopify-chat-bundle-selector.js';

export const HTML_LANG = 'en-GB';

/**
 * Legacy public hosts that should 301 to SITE_URL if the Hydrogen app
 * receives them. Prefer Shopify/DNS domain redirects at the edge when possible.
 */
export const LEGACY_PUBLIC_HOSTS = [
  'xsto.co.uk',
  'www.xsto.co.uk',
  'www.mobilityrobot.co.uk',
] as const;
