import {redirect} from 'react-router';
import {LEGACY_PUBLIC_HOSTS, SITE_URL} from '~/lib/const';
import {
  isUkUnavailableProductHandle,
  SHOPIFY_HOME_PRODUCT_HANDLES,
} from '~/lib/homepage-data';

/**
 * Host / domain cutover notes (merchant checklist in docs/rebuild/phase-8-deploy.md):
 *
 * Preferred: Shopify Admin custom domains + DNS so xsto.co.uk 301s to
 * mobilityrobot.co.uk before traffic hits Oxygen.
 *
 * Google Search Console "Page with redirect" after the cutover:
 * - Expected for the OLD property (xsto.co.uk URLs → mobilityrobot.co.uk).
 * - On the NEW property, avoid listing redirecting URLs in sitemaps
 *   (/pages/*, /articles/*, /blogs/*, duplicate collections). Use Change of
 *   Address from xsto.co.uk → mobilityrobot.co.uk and submit the cleaned
 *   sitemap.xml.
 *
 * Fallback: if this Hydrogen app still receives a legacy host below,
 * `resolveHostRedirect` / `legacyRedirect` issue a 301 to SITE_URL.
 *
 * Common path mappings (also in LEGACY_REDIRECTS):
 *   /pages/about → /about
 *   /pages/contact → /contact
 *   /pages/faq → /faq
 *   /pages/warranty → /warranty
 *   /pages/returns → /returns
 *   /pages/privacy → /privacy
 *   /pages/terms → /terms
 *   /pages/stockists|/pages/dealers|/pages/store-locator → /stockists
 *   /pages/request-a-demo → /demo
 *   /blogs/news → /blog
 *   /articles/:handle → /blog/:handle
 *   /products/xsto-* short handles → current Shopify product handles
 */

/** Exact legacy path → new path (301). */
export const LEGACY_REDIRECTS: Record<string, string> = {
  // Shopify Online Store /pages/* legacy paths
  '/pages/about': '/about',
  '/pages/warranty': '/warranty',
  '/pages/faq': '/faq',
  '/pages/contact': '/contact',
  '/pages/returns': '/returns',
  '/pages/delivery': '/delivery',
  '/pages/shipping': '/delivery',
  '/pages/shipping-policy': '/delivery',
  '/pages/privacy': '/privacy',
  '/pages/privacy-policy': '/privacy',
  '/pages/terms': '/terms',
  '/pages/terms-of-service': '/terms',
  '/pages/stockists': '/stockists',
  '/pages/dealers': '/stockists',
  '/pages/find-a-dealer': '/stockists',
  '/pages/store-locator': '/stockists',
  '/pages/request-a-demo': '/demo',
  '/pages/distributor-disclaimer': '/terms',
  '/collections/mobility-scooters': '/collections/all',
  '/collections/all-products': '/collections/all',
  '/collections/frontpage': '/collections/all',
  '/collections/our-products': '/collections/all',
  '/collections/vat-relief-eligible': '/vat-relief',
  '/blogs/news': '/blog',
  '/track-order': '/account/orders',
  '/index.html': '/',
  '/products/test-product': '/collections/all',

  // Lovable xsto.co.uk sitemap paths (pre-Hydrogen)
  '/accessories': '/collections/accessories',
  '/find-dealer': '/stockists',
  '/pages/videos': '/videos',
  '/pages/how-to': '/videos',
  '/reviews': '/',
  '/trade': '/quote',
  '/official-uk-distributor': '/about',
  '/warranty-registration': '/warranty',
  '/returns-policy': '/returns',
  '/shipping': '/delivery',
  '/shipping-policy': '/delivery',
  '/privacy-policy': '/privacy',
  '/terms-of-service': '/terms',

  // Short / alternate product handles
  '/products/xsto-m4': `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4']}`,
  '/products/xsto-m4-pro': `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4-pro']}`,
  '/products/xsto-m4b': `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4b']}`,
  // EzGo2 is not authorised for UK sale — send all legacy URLs to the range page
  '/products/xsto-ezgo2': '/collections/all',
  '/products/xsto-ezgo2-carbon-fiber-power-wheelchair': '/collections/all',
  '/products/ezgo2-mobility-robot': '/collections/all',
  '/products/xsto-x12': `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-x12']}`,
  '/products/xsto-x12-pro': `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-x12-pro']}`,

  // Lovable accessory handles → current Shopify accessory handles / catalogue
  '/products/phone-holder': '/products/phone-holder-for-m4',
  '/products/battery-charger': '/products/power-chair-battery-charger',
  '/products/headrest': '/products/adjustable-headrest-m4-pro',
  '/products/backrest-headrest': '/products/adjustable-headrest-m4-pro',
  '/products/battery-24v': '/products/lithium-15-6-ah-battery',
  '/products/spare-battery-24v': '/products/lithium-15-6-ah-battery',
  '/products/sidebag': '/collections/accessories',
  '/products/aux-controller': '/collections/accessories',
  '/products/rearview-mirror': '/collections/accessories',
  '/products/trunk-support': '/collections/accessories',
  '/products/umbrella-holder': '/collections/accessories',
  '/products/side-guard': '/collections/accessories',
  '/products/seat-cushion-m': '/collections/accessories',
  '/products/seat-cushion-l': '/collections/accessories',
  '/products/backrest-cushion-m': '/collections/accessories',
  '/products/backrest-cushion-l': '/collections/accessories',
};

const PRODUCT_PREFIX_REDIRECTS: Array<{prefix: string; target: string}> = [
  {
    prefix: '/products/xsto-ezgo2',
    target: '/collections/all',
  },
  {
    prefix: '/products/xsto-m4-pro',
    target: `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4-pro']}`,
  },
  {
    prefix: '/products/xsto-x12-pro',
    target: `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-x12-pro']}`,
  },
  {
    prefix: '/products/xsto-x12',
    target: `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-x12']}`,
  },
  {
    prefix: '/products/xsto-m4',
    target: `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4']}`,
  },
];

export const LEGACY_REDIRECT_CACHE_CONTROL = 'public, max-age=3600';

export type LegacyRedirectResult = {
  destination: string;
  cacheControl: string;
};

/**
 * Resolve a legacy URL to its new path, or null if no redirect applies.
 */
const CANONICAL_PRODUCT_PATHS = new Set(
  Object.values(SHOPIFY_HOME_PRODUCT_HANDLES).map((handle) => `/products/${handle}`),
);

export function resolveLegacyRedirect(request: Request): LegacyRedirectResult | null {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  if (pathname.startsWith('/products/') && url.searchParams.has('variant')) {
    url.searchParams.delete('variant');
    const destination = `${pathname}${url.search}`;
    return {destination, cacheControl: LEGACY_REDIRECT_CACHE_CONTROL};
  }

  const blogMatch = pathname.match(/^\/blogs\/news\/([^/]+)$/);
  if (blogMatch) {
    return {
      destination: `/blog/${blogMatch[1]}`,
      cacheControl: LEGACY_REDIRECT_CACHE_CONTROL,
    };
  }

  // Shopify Online Store article URLs → Hydrogen /blog/:handle
  const articleMatch = pathname.match(/^\/articles\/([^/]+)$/);
  if (articleMatch) {
    return {
      destination: `/blog/${articleMatch[1]}`,
      cacheControl: LEGACY_REDIRECT_CACHE_CONTROL,
    };
  }

  // Thin local SEO doorway pages from the previous Online Store
  if (
    /^\/pages\/(?:mobility-wheelchair-in-|heavy-duty-power-chair-in-|electric-wheelchair-with-elevating-seat-in-)/.test(
      pathname,
    )
  ) {
    return {
      destination: '/stockists',
      cacheControl: LEGACY_REDIRECT_CACHE_CONTROL,
    };
  }

  const exact = LEGACY_REDIRECTS[pathname];
  if (exact && exact !== pathname) {
    return {destination: exact, cacheControl: LEGACY_REDIRECT_CACHE_CONTROL};
  }

  const productMatch = pathname.match(/^\/products\/([^/]+)$/);
  if (productMatch && isUkUnavailableProductHandle(productMatch[1])) {
    return {
      destination: '/collections/all',
      cacheControl: LEGACY_REDIRECT_CACHE_CONTROL,
    };
  }

  // Never prefix-redirect a live Shopify product URL. Handles like
  // xsto-x12-pro-ai-... start with the short xsto-x12- legacy prefix.
  if (!CANONICAL_PRODUCT_PATHS.has(pathname)) {
    for (const {prefix, target} of PRODUCT_PREFIX_REDIRECTS) {
      if (pathname === target) continue;
      if (pathname === prefix || pathname.startsWith(`${prefix}-`)) {
        return {destination: target, cacheControl: LEGACY_REDIRECT_CACHE_CONTROL};
      }
    }
  }

  return null;
}

/**
 * 301 legacy public hosts (xsto.co.uk, www.*) → canonical SITE_URL.
 * Skips localhost and Oxygen/preview hosts that are not in LEGACY_PUBLIC_HOSTS.
 */
export function resolveHostRedirect(request: Request): LegacyRedirectResult | null {
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const canonicalHost = new URL(SITE_URL).hostname;

  if (host === canonicalHost) return null;
  if (host === 'localhost' || host === '127.0.0.1') return null;
  if (!(LEGACY_PUBLIC_HOSTS as readonly string[]).includes(host)) return null;

  const destination = new URL(`${url.pathname}${url.search}`, SITE_URL).toString();
  return {destination, cacheControl: LEGACY_REDIRECT_CACHE_CONTROL};
}

/**
 * Throws a 301 redirect when the request matches a legacy host and/or path.
 * Host + path are combined into a single hop to SITE_URL when possible.
 * Call from the root loader before rendering.
 */
export function legacyRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const hostResolved = resolveHostRedirect(request);
  const pathResolved = resolveLegacyRedirect(request);

  if (!hostResolved && !pathResolved) return null;

  let destPath: string;
  if (pathResolved) {
    destPath = pathResolved.destination;
    if (!pathResolved.destination.includes('?')) {
      destPath = `${pathResolved.destination}${url.search}`;
    }
  } else {
    destPath = `${url.pathname}${url.search}`;
  }

  const destination = new URL(destPath, SITE_URL).toString();

  throw redirect(destination, {
    status: 301,
    headers: {
      'Cache-Control':
        pathResolved?.cacheControl ??
        hostResolved?.cacheControl ??
        LEGACY_REDIRECT_CACHE_CONTROL,
    },
  });
}
