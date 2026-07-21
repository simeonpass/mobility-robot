// @ts-check
import {
  DiscountClass,
  OrderDiscountSelectionStrategy,
} from '../generated/api';
import {
  lineQualifiesForVatRelief,
  UK_VAT_ORDER_PERCENT,
} from './vat-math.js';

/**
 * @typedef {import('../generated/api').Input} RunInput
 * @typedef {import('../generated/api').CartLinesDiscountsGenerateRunResult} CartLinesDiscountsGenerateRunResult
 */

/**
 * VAT relief as an ORDER-class percentage (~16.6667% = VAT share of a UK
 * inc-VAT price). That lets product discount codes (e.g. JENNI10) stack on
 * Basic Shopify plans, and the % applies to the post–product-discount
 * subtotal so HMRC-style VAT removal stays correct after promos.
 *
 * @param {RunInput} input
 * @returns {CartLinesDiscountsGenerateRunResult}
 */
export function cartLinesDiscountsGenerateRun(input) {
  const hasOrderDiscountClass = input.discount.discountClasses.includes(
    DiscountClass.Order,
  );

  if (!hasOrderDiscountClass) {
    return {operations: []};
  }

  const excludedCartLineIds = [];
  let hasQualifyingLine = false;

  for (const line of input.cart.lines) {
    if (lineQualifiesForVatRelief(line)) {
      hasQualifyingLine = true;
    } else {
      excludedCartLineIds.push(line.id);
    }
  }

  if (!hasQualifyingLine) {
    return {operations: []};
  }

  return {
    operations: [
      {
        orderDiscountsAdd: {
          candidates: [
            {
              message: 'VAT relief',
              targets: [
                {
                  orderSubtotal: {
                    excludedCartLineIds,
                  },
                },
              ],
              value: {
                percentage: {
                  value: UK_VAT_ORDER_PERCENT,
                },
              },
            },
          ],
          selectionStrategy: OrderDiscountSelectionStrategy.First,
        },
      },
    ],
  };
}
