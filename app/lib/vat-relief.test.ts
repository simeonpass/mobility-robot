import {describe, expect, it} from 'vitest';
import {
  getCartTotals,
  isVatReliefDiscountApplied,
} from '~/lib/vat-relief';

const vatReliefAttributes = [{key: 'VAT Relief', value: 'Yes'}];

function makeCart({
  lineAmount = '3329.17',
  unitPrice = '3329.17',
  subtotalAmount = '3329.17',
  totalAmount = '3329.17',
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

describe('vat-relief cart totals (tax-exclusive catalog)', () => {
  it('estimates payable = catalog (ex VAT) when relief is declared', () => {
    const cart = makeCart();
    const totals = getCartTotals(cart);

    expect(isVatReliefDiscountApplied(cart)).toBe(true);
    expect(totals).toEqual({
      subtotalIncVat: 3995,
      vatRemoved: 665.83,
      total: 3329.17,
      vatReliefApplied: true,
      hasVatRelief: true,
      hasDeposit: false,
      isEstimated: true,
    });
  });

  it('£1000 ex VAT with relief → estimated payable £1000 (not £833)', () => {
    const cart = makeCart({
      lineAmount: '1000',
      unitPrice: '1000',
      subtotalAmount: '1000',
      totalAmount: '1000',
    });

    expect(getCartTotals(cart)).toEqual({
      subtotalIncVat: 1200,
      vatRemoved: 200,
      total: 1000,
      vatReliefApplied: true,
      hasVatRelief: true,
      hasDeposit: false,
      isEstimated: true,
    });
  });

  it('£1000 ex VAT without relief → estimated payable £1200', () => {
    const cart = {
      lines: {
        nodes: [
          {
            quantity: 1,
            attributes: [],
            merchandise: {price: {amount: '1000'}},
            cost: {
              totalAmount: {amount: '1000'},
              amountPerQuantity: {amount: '1000'},
            },
          },
        ],
      },
      cost: {
        subtotalAmount: {amount: '1000', currencyCode: 'GBP'},
        totalAmount: {amount: '1000', currencyCode: 'GBP'},
        totalTaxAmount: {amount: '0', currencyCode: 'GBP'},
      },
      discountAllocations: [],
    };

    expect(getCartTotals(cart)).toEqual({
      subtotalIncVat: 1200,
      vatRemoved: 0,
      total: 1200,
      vatReliefApplied: false,
      hasVatRelief: false,
      hasDeposit: false,
      isEstimated: true,
    });
  });

  it('uses Shopify cart total when tax is already calculated', () => {
    const cart = {
      lines: {
        nodes: [
          {
            quantity: 1,
            attributes: [],
            merchandise: {price: {amount: '1000'}},
            cost: {
              totalAmount: {amount: '1000'},
              amountPerQuantity: {amount: '1000'},
            },
          },
        ],
      },
      cost: {
        subtotalAmount: {amount: '1000', currencyCode: 'GBP'},
        totalAmount: {amount: '1200', currencyCode: 'GBP'},
        totalTaxAmount: {amount: '200', currencyCode: 'GBP'},
      },
      discountAllocations: [],
    };

    expect(getCartTotals(cart)).toEqual({
      subtotalIncVat: 1200,
      vatRemoved: 0,
      total: 1200,
      vatReliefApplied: false,
      hasVatRelief: false,
      hasDeposit: false,
      isEstimated: false,
    });
  });

  it('ignores legacy product discounts on cart — estimate stays catalog net', () => {
    const cart = makeCart({
      lineAmount: '2774.31',
      unitPrice: '3329.17',
      subtotalAmount: '2774.31',
      totalAmount: '2774.31',
      discountAllocations: [{discountedAmount: {amount: '554.86'}}],
    });

    expect(getCartTotals(cart)).toEqual({
      subtotalIncVat: 3995,
      vatRemoved: 665.83,
      total: 3329.17,
      vatReliefApplied: true,
      hasVatRelief: true,
      hasDeposit: false,
      isEstimated: true,
    });
  });

  it('estimates inc-VAT total when no VAT relief is claimed', () => {
    const cart = {
      lines: {
        nodes: [
          {
            quantity: 1,
            attributes: [],
            merchandise: {price: {amount: '3329.17'}},
            cost: {
              totalAmount: {amount: '3329.17'},
              amountPerQuantity: {amount: '3329.17'},
            },
          },
        ],
      },
      cost: {
        subtotalAmount: {amount: '3329.17', currencyCode: 'GBP'},
        totalAmount: {amount: '3329.17', currencyCode: 'GBP'},
      },
      discountAllocations: [],
    };

    expect(isVatReliefDiscountApplied(cart)).toBe(false);
    expect(getCartTotals(cart)).toEqual({
      subtotalIncVat: 3995,
      vatRemoved: 0,
      total: 3995,
      vatReliefApplied: false,
      hasVatRelief: false,
      hasDeposit: false,
      isEstimated: true,
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

    // Deposit charge is 10% of tax-exclusive catalog; show estimated inc VAT due today.
    expect(getCartTotals(cart)).toEqual({
      subtotalIncVat: 1919.4,
      vatRemoved: 0,
      total: 1919.4,
      vatReliefApplied: false,
      hasVatRelief: false,
      hasDeposit: true,
      isEstimated: true,
    });
  });

  it('deposit + VAT relief uses ex-VAT checkout charge', () => {
    const cart = {
      lines: {
        nodes: [
          {
            quantity: 1,
            attributes: vatReliefAttributes,
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
      subtotalIncVat: 1919.4,
      vatRemoved: 319.9,
      total: 1599.5,
      vatReliefApplied: true,
      hasVatRelief: true,
      hasDeposit: true,
      isEstimated: true,
    });
  });
});
