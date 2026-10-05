import {describe, expect, it} from 'vitest';
import {getVariantCompareAtPrice, sumMoneyV2} from '~/lib/product-pricing';

describe('sumMoneyV2', () => {
  it('sums amounts in the same currency', () => {
    expect(
      sumMoneyV2([
        {amount: '2999.00', currencyCode: 'GBP'},
        {amount: '60.00', currencyCode: 'GBP'},
        {amount: '45.50', currencyCode: 'GBP'},
      ]),
    ).toEqual({amount: '3104.50', currencyCode: 'GBP'});
  });

  it('ignores nullish entries', () => {
    expect(
      sumMoneyV2([null, {amount: '10.00', currencyCode: 'GBP'}, undefined]),
    ).toEqual({amount: '10.00', currencyCode: 'GBP'});
  });

  it('returns null when nothing to sum', () => {
    expect(sumMoneyV2([])).toBeNull();
    expect(sumMoneyV2([null, undefined])).toBeNull();
  });
});

describe('VAT-consistent sale comparisons', () => {
  const standard = {
    id: 'standard',
    price: {amount: '3900', currencyCode: 'GBP' as const},
    compareAtPrice: {amount: '4500', currencyCode: 'GBP' as const},
    selectedOptions: [{name: 'VAT', value: 'Standard'}],
  };
  const relief = {
    id: 'relief',
    price: {amount: '3250', currencyCode: 'GBP' as const},
    compareAtPrice: {amount: '3750', currencyCode: 'GBP' as const},
    selectedOptions: [{name: 'VAT', value: 'VAT Relief'}],
  };
  it('compares VAT-relief prices with the VAT-relief was price', () => {
    expect(
      getVariantCompareAtPrice(standard, [standard, relief], true)?.amount,
    ).toBe('3750.00');
  });
  it('compares VAT-inclusive prices with the VAT-inclusive was price', () => {
    expect(
      getVariantCompareAtPrice(relief, [standard, relief], false)?.amount,
    ).toBe('4500.00');
  });
  it('does not invent a comparison when the matching variant has none', () => {
    const withoutComparison = {...relief, compareAtPrice: null};
    expect(
      getVariantCompareAtPrice(standard, [standard, withoutComparison], true),
    ).toBeNull();
  });
  it('does not show a sale for an equal or lower comparison price', () => {
    const notOnSale = {...relief, compareAtPrice: relief.price};
    expect(
      getVariantCompareAtPrice(standard, [standard, notOnSale], true),
    ).toBeNull();
  });
});
