import {describe, expect, it} from 'vitest';
import {
  filterSitemapXml,
  SITEMAP_INDEX_TYPES,
  shouldIncludeSitemapResource,
} from '~/lib/sitemap-utils';

describe('sitemap-utils', () => {
  it('only indexes products + collections in the Hydrogen sitemap index', () => {
    expect([...SITEMAP_INDEX_TYPES]).toEqual(['products', 'collections']);
  });

  it('excludes test product and duplicate collections', () => {
    expect(shouldIncludeSitemapResource('products', 'test-product')).toBe(
      false,
    );
    expect(shouldIncludeSitemapResource('collections', 'frontpage')).toBe(
      false,
    );
    expect(shouldIncludeSitemapResource('collections', 'accessories')).toBe(
      true,
    );
    expect(
      shouldIncludeSitemapResource('products', 'buy-robot-wheelchair'),
    ).toBe(true);
  });

  it('filters excluded URLs from sitemap XML', () => {
    const xml = `<?xml version="1.0"?>
<urlset>
  <url><loc>https://mobilityrobot.co.uk/products/buy-robot-wheelchair</loc></url>
  <url><loc>https://mobilityrobot.co.uk/products/test-product</loc></url>
  <url><loc>https://mobilityrobot.co.uk/collections/frontpage</loc></url>
  <url><loc>https://mobilityrobot.co.uk/collections/accessories</loc></url>
</urlset>`;

    const filtered = filterSitemapXml(xml);
    expect(filtered).toContain('/products/buy-robot-wheelchair');
    expect(filtered).toContain('/collections/accessories');
    expect(filtered).not.toContain('test-product');
    expect(filtered).not.toContain('frontpage');
  });
});
