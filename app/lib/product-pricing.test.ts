import {describe, expect, it} from 'vitest';
import {
  getDualVariantPriceDisplays,
  getExVatDisplay,
  getVatSavingsDisplay,
  sumMoneyV2,
} from '~/lib/product-pricing';

const m4Standard = {amount: '4200.00', currencyCode: 'GBP' as const};
const m4Relief = {amount: '3500.00', currencyCode: 'GBP' as const};

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
      sumMoneyV2([
        null,
        {amount: '10.00', currencyCode: 'GBP'},
        undefined,
      ]),
    ).toEqual({amount: '10.00', currencyCode: 'GBP'});
  });

  it('returns null when nothing to sum', () => {
    expect(sumMoneyV2([])).toBeNull();
    expect(sumMoneyV2([null, undefined])).toBeNull();
  });
});

describe('getDualVariantPriceDisplays', () => {
  it('uses the listed M4 VAT Relief sibling, not the selected Standard variant', () => {
    expect(getDualVariantPriceDisplays(m4Standard, m4Relief, true)).toEqual({
      incVatDisplay: '£4,200',
      exVatDisplay: '£3,500.00',
      vatSavings: '£700.00',
    });
  });

  it('uses the listed Relief price even when it differs from ÷1.2 of Standard', () => {
    const listed = {amount: '3499.00', currencyCode: 'GBP' as const};
    expect(getExVatDisplay(m4Standard)).toBe('£3,500.00');
    expect(getDualVariantPriceDisplays(m4Standard, listed, true)).toEqual({
      incVatDisplay: '£4,200',
      exVatDisplay: '£3,499.00',
      vatSavings: '£701.00',
    });
  });

  it('does not treat the selected Standard SKU as the relief price', () => {
    expect(
      getDualVariantPriceDisplays(m4Standard, m4Standard, true),
    ).toEqual({
      incVatDisplay: '£4,200',
      exVatDisplay: getExVatDisplay(m4Standard),
      vatSavings: getVatSavingsDisplay(m4Standard),
    });
  });

  it('falls back to ÷1.2 of Standard when the Relief sibling is missing', () => {
    expect(getDualVariantPriceDisplays(m4Standard, null, false)).toEqual({
      incVatDisplay: '£4,200',
      exVatDisplay: '£3,500.00',
      vatSavings: '£700.00',
    });
  });
});
