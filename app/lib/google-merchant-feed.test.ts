import {describe, expect, it} from 'vitest';
import {SITE_URL} from './const';
import {
  googleMerchantFeedRows,
  googleMerchantTsv,
} from './google-merchant-feed';

describe('google merchant supplemental feed', () => {
  it('emits Hydrogen links for Shopify Google Shopping ids', () => {
    const rows = googleMerchantFeedRows([
      {
        id: 'gid://shopify/Product/15648931250554',
        handle: 'xsto-m4-pro',
        variants: {
          nodes: [{id: 'gid://shopify/ProductVariant/56507462189434'}],
        },
      },
      {
        id: 'gid://shopify/Product/1',
        handle: 'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
        variants: {nodes: [{id: 'gid://shopify/ProductVariant/2'}]},
      },
    ]);

    expect(rows).toEqual([
      {
        id: 'shopify_ZZ_15648931250554_56507462189434',
        link: `${SITE_URL}/products/xsto-m4-pro?variant=56507462189434`,
      },
      {
        id: 'shopify_GB_15648931250554_56507462189434',
        link: `${SITE_URL}/products/xsto-m4-pro?variant=56507462189434`,
      },
    ]);
    expect(googleMerchantTsv(rows)).toContain('id\tlink');
    expect(googleMerchantTsv(rows)).toContain(
      'shopify_ZZ_15648931250554_56507462189434',
    );
  });
});
