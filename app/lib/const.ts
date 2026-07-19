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
 * Numeric Shopify shop ID for Shop Chat / inbox widgets.
 * Public via `https://{shop}.myshopify.com/meta.json` — used as a fallback when
 * Oxygen env `PUBLIC_SHOP_ID` is unset.
 */
export const DEFAULT_SHOP_ID = '90445414778';

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
