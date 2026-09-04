import {describe, expect, it} from 'vitest';
import {SITE_URL} from './const';
import {
  googleMerchantFeedRows,
  googleMerchantTsv,
  VAT_RELIEF_EXCLUDED_DESTINATIONS,
} from './google-merchant-feed';

describe('google merchant supplemental feed', () => {
  it('uses Hydrogen links, excludes checkout-only VAT variants, and maps X12 Pro', () => {
    const rows = googleMerchantFeedRows([
      {
        id: 'gid://shopify/Product/15648931250554',
        handle: 'xsto-m4-pro',
        variants: {
          nodes: [
            {
              id: 'gid://shopify/ProductVariant/56507462189434',
              selectedOptions: [{name: 'VAT', value: 'Standard'}],
            },
            {
              id: 'gid://shopify/ProductVariant/57163988533626',
              selectedOptions: [{name: 'VAT', value: 'VAT Relief'}],
            },
          ],
        },
      },
      {
        id: 'gid://shopify/Product/1',
        handle: 'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
        variants: {
          nodes: [
            {
              id: 'gid://shopify/ProductVariant/2',
              selectedOptions: [{name: 'VAT', value: 'Standard'}],
            },
          ],
        },
      },
      {
        id: 'gid://shopify/Product/3',
        handle: 'xsto-ezgo2-carbon-fiber-power-wheelchair',
        variants: {nodes: [{id: 'gid://shopify/ProductVariant/4'}]},
      },
    ]);

    expect(rows).toEqual([
      {
        id: 'shopify_ZZ_15648931250554_56507462189434',
        link: `${SITE_URL}/products/xsto-m4-pro?variant=56507462189434`,
        excludedDestination: undefined,
      },
      {
        id: 'shopify_GB_15648931250554_56507462189434',
        link: `${SITE_URL}/products/xsto-m4-pro?variant=56507462189434`,
        excludedDestination: undefined,
      },
      {
        id: 'shopify_ZZ_15648931250554_57163988533626',
        link: `${SITE_URL}/products/xsto-m4-pro?variant=57163988533626`,
        excludedDestination: VAT_RELIEF_EXCLUDED_DESTINATIONS,
      },
      {
        id: 'shopify_GB_15648931250554_57163988533626',
        link: `${SITE_URL}/products/xsto-m4-pro?variant=57163988533626`,
        excludedDestination: VAT_RELIEF_EXCLUDED_DESTINATIONS,
      },
      {
        id: 'shopify_ZZ_1_2',
        link: `${SITE_URL}/products/x12-all-terrain-mobility-robot?legrest=electric&variant=2`,
        excludedDestination: undefined,
      },
      {
        id: 'shopify_GB_1_2',
        link: `${SITE_URL}/products/x12-all-terrain-mobility-robot?legrest=electric&variant=2`,
        excludedDestination: undefined,
      },
    ]);

    const tsv = googleMerchantTsv(rows);
    expect(tsv).toContain('id\tlink\texcluded_destination');
    expect(tsv).toContain(
      `shopify_GB_15648931250554_57163988533626\t${SITE_URL}/products/xsto-m4-pro?variant=57163988533626\t${VAT_RELIEF_EXCLUDED_DESTINATIONS}`,
    );
    expect(tsv).toContain(
      `shopify_GB_1_2\t${SITE_URL}/products/x12-all-terrain-mobility-robot?legrest=electric&variant=2\t`,
    );
    expect(tsv).not.toContain('xsto-ezgo2');
  });
});
