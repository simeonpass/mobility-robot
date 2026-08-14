import {describe, expect, it, afterEach} from 'vitest';
import {
  catalogToExVatAmount,
  catalogToIncVatAmount,
  catalogVatPortion,
  isShopifyPricesExVat,
  setShopifyPricesExVat,
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
    setShopifyPricesExVat(null);
  });

  it('defaults to inclusive catalog mode', () => {
    expect(isShopifyPricesExVat()).toBe(false);
    expect(catalogToIncVatAmount(4200)).toBe(4200);
    expect(catalogToExVatAmount(4200)).toBe(3500);
  });

  it('respects explicit false override', () => {
    expect(isShopifyPricesExVat({PUBLIC_SHOPIFY_PRICES_EX_VAT: 'false'})).toBe(
      false,
    );
    expect(catalogToIncVatAmount(4200, false)).toBe(4200);
    expect(catalogToExVatAmount(4200, false)).toBe(3500);
    expect(catalogVatPortion(4200, false)).toBe(700);
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
