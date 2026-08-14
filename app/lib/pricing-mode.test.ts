import {describe, expect, it, afterEach} from 'vitest';
import {
  catalogToExVatAmount,
  catalogToIncVatAmount,
  catalogVatPortion,
  isShopifyPricesExVat,
} from '~/lib/pricing-mode';
import {grossFromNet, vatPortionFromNet} from '~/lib/vat-math';

describe('vat-math net helpers', () => {
  it('converts net to gross and VAT portion', () => {
    expect(grossFromNet(3750)).toBe(4500);
    expect(vatPortionFromNet(3750)).toBe(750);
  });
});

describe('pricing-mode', () => {
  afterEach(() => {
    // Reset any env override used in tests
    delete (import.meta as ImportMeta & {env?: Record<string, string>}).env
      ?.PUBLIC_SHOPIFY_PRICES_EX_VAT;
  });

  it('treats catalog as gross when flag is off', () => {
    expect(isShopifyPricesExVat({PUBLIC_SHOPIFY_PRICES_EX_VAT: 'false'})).toBe(
      false,
    );
    expect(catalogToIncVatAmount(4500, false)).toBe(4500);
    expect(catalogToExVatAmount(4500, false)).toBe(3750);
    expect(catalogVatPortion(4500, false)).toBe(750);
  });

  it('treats catalog as net when flag is on', () => {
    expect(isShopifyPricesExVat({PUBLIC_SHOPIFY_PRICES_EX_VAT: 'true'})).toBe(
      true,
    );
    expect(catalogToIncVatAmount(3750, true)).toBe(4500);
    expect(catalogToExVatAmount(3750, true)).toBe(3750);
    expect(catalogVatPortion(3750, true)).toBe(750);
  });
});
