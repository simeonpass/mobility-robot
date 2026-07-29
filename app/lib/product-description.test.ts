import {describe, expect, it} from 'vitest';
import {buildAccessoryOverviewHtml} from '~/lib/accessory-content';
import {
  buildDescriptionHtmlFromPlain,
  formatPlainDescription,
  isThinProductDescription,
  normalizeDescriptionHtml,
} from '~/lib/product-description';
import {buildProductTabContent} from '~/lib/product-specs';

describe('product-description', () => {
  it('detects thin title-only Shopify bodies', () => {
    expect(isThinProductDescription('<p>Cup Holder for All Models</p>', 'Cup Holder for All Models')).toBe(
      true,
    );
    expect(
      isThinProductDescription(
        '<p>Enhance your mobility experience with the XSTO M4 Armrest Storage Bag.</p><ul><li>Durable</li></ul>',
        'Armrest Storage Bag',
      ),
    ).toBe(false);
  });

  it('normalises Shopify HTML and keeps lists', () => {
    const html = normalizeDescriptionHtml(
      '<h1 style="text-align:center" class="x">Title</h1><p data-start="1">Hello</p><ul><li><strong>One</strong>: a</li></ul>',
    );
    expect(html).toContain('<h2>Title</h2>');
    expect(html).not.toContain('style=');
    expect(html).toContain('<ul>');
  });

  it('splits run-on plain text into paragraphs', () => {
    const {paragraphs} = formatPlainDescription(
      'First sentence is here. Second sentence continues the story. Third sentence adds more detail for buyers who need clarity. Fourth sentence wraps up the thought.',
    );
    expect(paragraphs.length).toBeGreaterThan(1);
    expect(buildDescriptionHtmlFromPlain('Line one\n- Bullet A\n- Bullet B')).toContain('<ul>');
  });
});

describe('accessory overview layout', () => {
  it('uses rich Shopify HTML instead of flattening to one paragraph', () => {
    const result = buildAccessoryOverviewHtml({
      handle: 'armrest-bag',
      title: 'Armrest Storage Bag',
      descriptionHtml:
        '<h2 style="text-align: center;">XSTO M4 Armrest Storage Bag</h2><p>Enhance your mobility.</p><ul><li><strong>Durable</strong>: Built well.</li></ul>',
      description:
        'XSTO M4 Armrest Storage Bag Enhance your mobility. Durable: Built well.',
    });

    expect(result.overviewHtml).toContain('<h2>');
    expect(result.overviewHtml).toContain('<ul>');
    expect(result.usedFallback).toBe(false);
  });

  it('fills curated copy for title-only accessories', () => {
    const result = buildAccessoryOverviewHtml({
      handle: 'cup-holder-for-all-models',
      title: 'Cup Holder for All Models',
      descriptionHtml: '<p>Cup Holder for All Models</p>',
      description: 'Cup Holder for All Models',
    });

    expect(result.usedFallback).toBe(true);
    expect(result.overviewHtml).toContain('<ul>');
    expect(result.overview.length).toBeGreaterThan(80);
  });

  it('buildProductTabContent wires accessory compatibility + html', () => {
    const content = buildProductTabContent({
      shopifyHandle: 'armrest-bag',
      shopifyTitle: 'Armrest Storage Bag',
      shopifyDescription: 'Plain flattened text only.',
      shopifyDescriptionHtml:
        '<h2>Armrest Storage Bag</h2><p>Keep essentials close.</p><ul><li>Zip pocket</li><li>Easy fit</li></ul>',
    });

    expect(content.overviewHtml).toContain('<ul>');
    expect(content.compatibilityLabel).toMatch(/Fits/i);
    expect(content.compatibilityChairs?.length).toBeGreaterThan(0);
    expect(content.deliveryWarranty).toMatch(/Accessories/i);
  });
});
