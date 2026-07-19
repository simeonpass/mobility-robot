import {describe, expect, it} from 'vitest';
import {
  getCartTotals,
  isVatReliefDiscountApplied,
} from '~/lib/vat-relief';

const vatReliefAttributes = [{key: 'VAT Relief', value: 'Yes'}];

function makeCart({
  lineAmount = '3995.00',
  unitPrice = '3995.00',
  subtotalAmount = '3995.00',
  totalAmount = '3995.00',
  discountAllocations = [],
}: {
  lineAmount?: string;
  unitPrice?: string;
  subtotalAmount?: string;
  totalAmount?: string;
  discountAllocations?: Array<{discountedAmount: {amount: string}}>;
} = {}) {
  return {
    lines: {
      nodes: [
        {
          quantity: 1,
          attributes: vatReliefAttributes,
          merchandise: {price: {amount: unitPrice}},
          cost: {
            totalAmount: {amount: lineAmount},
            amountPerQuantity: {amount: unitPrice},
          },
        },
      ],
    },
    cost: {
      subtotalAmount: {amount: subtotalAmount, currencyCode: 'GBP'},
      totalAmount: {amount: totalAmount, currencyCode: 'GBP'},
    },
    discountAllocations,
  };
}

describe('vat-relief cart totals', () => {
  it('estimates ex-VAT total before Shopify applies the automatic discount', () => {
    const cart = makeCart();
    const totals = getCartTotals(cart);

    expect(totals).toEqual({
      subtotalIncVat: 3995,
      vatRemoved: 665.83,
      total: 3329.17,
      vatReliefApplied: false,
      hasVatRelief: true,
      hasDeposit: false,
    });
  });

  it('does not subtract VAT twice when the discount is already in cart totals', () => {
    const cart = makeCart({
      subtotalAmount: '3329.17',
      totalAmount: '3329.17',
      discountAllocations: [{discountedAmount: {amount: '665.83'}}],
    });

    expect(isVatReliefDiscountApplied(cart)).toBe(true);
    expect(getCartTotals(cart)).toEqual({
      subtotalIncVat: 3995,
      vatRemoved: 665.83,
      total: 3329.17,
      vatReliefApplied: true,
      hasVatRelief: true,
      hasDeposit: false,
    });
  });

  it('uses catalog price for VAT even when line cost is already discounted', () => {
    const cart = makeCart({
      lineAmount: '3329.17',
      unitPrice: '3995.00',
      subtotalAmount: '3329.17',
      totalAmount: '3329.17',
      discountAllocations: [{discountedAmount: {amount: '665.83'}}],
    });

    expect(getCartTotals(cart)).toEqual({
      subtotalIncVat: 3995,
      vatRemoved: 665.83,
      total: 3329.17,
      vatReliefApplied: true,
      hasVatRelief: true,
      hasDeposit: false,
    });
  });

  it('uses deposit checkout charge as pay-now total (not full catalog)', () => {
    const cart = {
      lines: {
        nodes: [
          {
            quantity: 1,
            attributes: [],
            merchandise: {price: {amount: '15995.0'}},
            cost: {
              totalAmount: {amount: '15995.0'},
              amountPerQuantity: {amount: '15995.0'},
            },
            sellingPlanAllocation: {
              checkoutChargeAmount: {amount: '1599.5', currencyCode: 'GBP'},
              remainingBalanceChargeAmount: {
                amount: '14395.5',
                currencyCode: 'GBP',
              },
              sellingPlan: {
                id: 'gid://shopify/SellingPlan/1',
                name: 'Pay 10% deposit',
              },
            },
          },
        ],
      },
      cost: {
        subtotalAmount: {amount: '15995.0', currencyCode: 'GBP'},
        totalAmount: {amount: '15995.0', currencyCode: 'GBP'},
      },
      discountAllocations: [],
    };

    expect(getCartTotals(cart)).toEqual({
      subtotalIncVat: 1599.5,
      vatRemoved: 0,
      total: 1599.5,
      vatReliefApplied: false,
      hasVatRelief: false,
      hasDeposit: true,
    });
  });
});
