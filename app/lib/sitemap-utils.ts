import {SITE_URL} from '~/lib/const';

/** Handles that must never appear in product sitemaps. */
export const SITEMAP_EXCLUDED_PRODUCT_HANDLES = new Set([
  'test-product',
]);

/** Collections that duplicate /collections/all or other canonical routes. */
export const SITEMAP_EXCLUDED_COLLECTION_HANDLES = new Set([
  'frontpage',
  'our-products',
  'vat-relief-eligible',
]);

/**
 * After a domain cutover, Google Search Console reports "Page with redirect"
 * for any sitemap URL that 301s. Keep child sitemaps limited to final 200 URLs
 * on mobilityrobot.co.uk — never /pages/*, /articles/*, or /blogs/*.
 */
export const SITEMAP_INDEX_TYPES = ['products', 'collections'] as const;

export function shouldIncludeSitemapResource(
  type: string,
  handle?: string | null,
): boolean {
  if (!handle) return true;
  if (type === 'products' && SITEMAP_EXCLUDED_PRODUCT_HANDLES.has(handle)) {
    return false;
  }
  if (
    type === 'collections' &&
    SITEMAP_EXCLUDED_COLLECTION_HANDLES.has(handle)
  ) {
    return false;
  }
  return true;
}

export function buildSitemapResourceUrl(
  type: string,
  handle: string,
  locale?: string,
): string {
  const path = locale
    ? `/${locale}/${type}/${handle}`
    : `/${type}/${handle}`;
  return `${SITE_URL}${path}`;
}

/** Strip excluded product/collection URL entries from Hydrogen sitemap XML. */
export function filterSitemapXml(xml: string): string {
  return xml
    .replace(/<url>[\s\S]*?<\/url>/g, (block) => {
      if (block.includes('/__excluded__')) return '';
      for (const handle of SITEMAP_EXCLUDED_PRODUCT_HANDLES) {
        if (block.includes(`/products/${handle}`)) return '';
      }
      for (const handle of SITEMAP_EXCLUDED_COLLECTION_HANDLES) {
        if (block.includes(`/collections/${handle}`)) return '';
      }
      return block;
    })
    .replace(/\n{3,}/g, '\n\n');
}
