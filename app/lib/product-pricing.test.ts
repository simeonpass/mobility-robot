import {describe, expect, it} from 'vitest';
import {sumMoneyV2} from '~/lib/product-pricing';

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
