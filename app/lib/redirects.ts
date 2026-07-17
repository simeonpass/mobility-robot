import {redirect} from 'react-router';

/** Legacy path → new path (301). Sourced from docs/rebuild/redirects.csv. */
export const LEGACY_REDIRECTS: Record<string, string> = {
  '/pages/stockists': '/stockists',
  '/pages/dealers': '/stockists',
  '/pages/faq': '/faq',
  '/pages/warranty': '/warranty',
  '/pages/returns': '/returns',
  '/pages/privacy': '/privacy',
  '/pages/terms': '/terms',
  '/pages/about': '/about',
  '/pages/contact': '/contact',
  '/pages/distributor-disclaimer': '/terms',
  '/collections/mobility-scooters': '/collections/all',
  '/blogs/news': '/blog',
  '/track-order': '/account/orders',
  '/index.html': '/',
  '/videos': '/blog',
};

/**
 * Returns a redirect Response when the request path matches a legacy URL.
 * Call from the root loader before rendering.
 */
export function legacyRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  const target = LEGACY_REDIRECTS[pathname];
  if (!target) return null;

  const destination = new URL(target, url.origin);
  destination.search = url.search;

  throw redirect(destination.toString(), 301);
}
