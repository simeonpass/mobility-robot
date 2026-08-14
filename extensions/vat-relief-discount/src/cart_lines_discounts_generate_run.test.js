import {describe, expect, it} from 'vitest';
import {cartLinesDiscountsGenerateRun} from './cart_lines_discounts_generate_run.js';
import {DiscountClass, OrderDiscountSelectionStrategy} from '../generated/api';
import {UK_VAT_ORDER_PERCENT} from './vat-math.js';

describe('cartLinesDiscountsGenerateRun', () => {
  it('applies an order percentage when lines claim VAT relief', () => {
    const result = cartLinesDiscountsGenerateRun({
      cart: {
        lines: [
          {
            id: 'gid://shopify/CartLine/1',
            quantity: 1,
            cost: {subtotalAmount: {amount: '3995.00'}},
            attribute: {value: 'Yes'},
            merchandise: {
              __typename: 'ProductVariant',
              selectedOptions: [{name: 'VAT', value: 'Standard'}],
            },
          },
          {
            id: 'gid://shopify/CartLine/2',
            quantity: 1,
            cost: {subtotalAmount: {amount: '50.00'}},
            attribute: null,
            merchandise: {
              __typename: 'ProductVariant',
              selectedOptions: [{name: 'Title', value: 'Default Title'}],
            },
          },
        ],
      },
      discount: {discountClasses: [DiscountClass.Order]},
    });

    expect(result.operations).toHaveLength(1);
    const operation = result.operations[0].orderDiscountsAdd;
    expect(operation.selectionStrategy).toBe(
      OrderDiscountSelectionStrategy.First,
    );
    expect(operation.candidates).toEqual([
      {
        message: 'VAT relief',
        targets: [
          {
            orderSubtotal: {
              excludedCartLineIds: ['gid://shopify/CartLine/2'],
            },
          },
        ],
        value: {
          percentage: {
            value: UK_VAT_ORDER_PERCENT,
          },
        },
      },
    ]);
  });

  it('skips lines that are already VAT Relief variants', () => {
    const result = cartLinesDiscountsGenerateRun({
      cart: {
        lines: [
          {
            id: 'gid://shopify/CartLine/1',
            quantity: 1,
            cost: {subtotalAmount: {amount: '3500.00'}},
            attribute: {value: 'Yes'},
            merchandise: {
              __typename: 'ProductVariant',
              selectedOptions: [{name: 'VAT', value: 'VAT Relief'}],
            },
          },
        ],
      },
      discount: {discountClasses: [DiscountClass.Order]},
    });

    expect(result).toEqual({operations: []});
  });

  it('returns no operations without a qualifying line', () => {
    const result = cartLinesDiscountsGenerateRun({
      cart: {
        lines: [
          {
            id: 'gid://shopify/CartLine/1',
            quantity: 1,
            cost: {subtotalAmount: {amount: '50.00'}},
            attribute: null,
          },
        ],
      },
      discount: {discountClasses: [DiscountClass.Order]},
    });

    expect(result).toEqual({operations: []});
  });

  it('returns no operations when the discount is not ORDER class', () => {
    const result = cartLinesDiscountsGenerateRun({
      cart: {
        lines: [
          {
            id: 'gid://shopify/CartLine/1',
            quantity: 1,
            cost: {subtotalAmount: {amount: '3995.00'}},
            attribute: {value: 'Yes'},
          },
        ],
      },
      discount: {discountClasses: [DiscountClass.Product]},
    });

    expect(result).toEqual({operations: []});
  });
});
