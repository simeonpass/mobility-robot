import {describe, expect, it} from 'vitest';
import {SITE_URL} from './const';
import {
  googleShoppingOfferId,
  numericShopifyId,
  shopifyVariantGidFromSearch,
  storefrontProductUrl,
  withRequestedShopifyVariant,
} from './product-variant-url';

const standard = {
  id: 'gid://shopify/ProductVariant/56507462189434',
  title: 'Standard',
};
const relief = {
  id: 'gid://shopify/ProductVariant/57163988533626',
  title: 'VAT Relief',
};

describe('shopify variant URL helpers', () => {
  it('parses numeric and gid variant query params', () => {
    expect(
      shopifyVariantGidFromSearch(
        `${SITE_URL}/products/xsto-m4-pro?variant=56507462189434`,
      ),
    ).toBe(standard.id);
    expect(
      shopifyVariantGidFromSearch(
        `${SITE_URL}/products/xsto-m4-pro?variant=${encodeURIComponent(relief.id)}`,
      ),
    ).toBe(relief.id);
    expect(
      shopifyVariantGidFromSearch(`${SITE_URL}/products/xsto-m4-pro`),
    ).toBeNull();
  });

  it('selects the requested variant for Google / Online Store links', () => {
    const product = {
      selectedOrFirstAvailableVariant: standard,
      variants: {nodes: [standard, relief]},
    };
    const updated = withRequestedShopifyVariant(
      product,
      `${SITE_URL}/products/xsto-m4-pro?variant=57163988533626`,
    );
    expect(updated.selectedOrFirstAvailableVariant).toEqual(relief);
  });

  it('builds the Shopify Google Shopping offer id and Hydrogen link', () => {
    expect(
      googleShoppingOfferId(
        'gid://shopify/Product/15648931250554',
        standard.id,
      ),
    ).toBe('shopify_ZZ_15648931250554_56507462189434');
    expect(storefrontProductUrl('xsto-m4-pro', standard.id)).toBe(
      '/products/xsto-m4-pro?variant=56507462189434',
    );
    expect(numericShopifyId(standard.id)).toBe('56507462189434');
  });
});
