import {redirect} from 'react-router';
import {SHOPIFY_HOME_PRODUCT_HANDLES} from '~/lib/homepage-data';

/** Exact legacy path → new path (301). */
export const LEGACY_REDIRECTS: Record<string, string> = {
  '/pages/about': '/about',
  '/pages/warranty': '/warranty',
  '/pages/faq': '/faq',
  '/pages/contact': '/contact',
  '/pages/returns': '/returns',
  '/pages/privacy': '/privacy',
  '/pages/privacy-policy': '/privacy',
  '/pages/terms': '/terms',
  '/pages/terms-of-service': '/terms',
  '/pages/stockists': '/stockists',
  '/pages/dealers': '/stockists',
  '/pages/find-a-dealer': '/stockists',
  '/pages/distributor-disclaimer': '/terms',
  '/collections/mobility-scooters': '/collections/all',
  '/collections/all-products': '/collections/all',
  '/blogs/news': '/blog',
  '/track-order': '/account/orders',
  '/index.html': '/',
  '/videos': '/blog',
  '/demo': '/demo',
  '/quote': '/quote',
  '/account': '/account',
  '/products/xsto-m4': `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4']}`,
  '/products/xsto-m4-pro': `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4-pro']}`,
  '/products/xsto-m4b': `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4b']}`,
  '/products/xsto-x12': `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-x12']}`,
  '/products/xsto-x12-pro': `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-x12-pro']}`,
};

const PRODUCT_PREFIX_REDIRECTS: Array<{prefix: string; target: string}> = [
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

  const exact = LEGACY_REDIRECTS[pathname];
  if (exact) {
    return {destination: exact, cacheControl: LEGACY_REDIRECT_CACHE_CONTROL};
  }

  for (const {prefix, target} of PRODUCT_PREFIX_REDIRECTS) {
    if (pathname === prefix || pathname.startsWith(`${prefix}-`)) {
      return {destination: target, cacheControl: LEGACY_REDIRECT_CACHE_CONTROL};
    }
  }

  return null;
}

/**
 * Throws a 301 redirect when the request matches a legacy URL.
 * Call from the root loader before rendering.
 */
export function legacyRedirect(request: Request): Response | null {
  const resolved = resolveLegacyRedirect(request);
  if (!resolved) return null;

  const url = new URL(request.url);
  const destination = new URL(resolved.destination, url.origin);
  if (!resolved.destination.includes('?')) {
    destination.search = url.search;
  }

  throw redirect(destination.toString(), {
    status: 301,
    headers: {
      'Cache-Control': resolved.cacheControl,
    },
  });
}
