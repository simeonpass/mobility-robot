// @ts-check
import {DiscountApplicationStrategy} from '../generated/api';
import {
  lineQualifiesForVatRelief,
  vatPortionFromGross,
} from './vat-math.js';

/**
 * @typedef {import('../generated/api').RunInput} RunInput
 * @typedef {import('../generated/api').FunctionRunResult} FunctionRunResult
 */

/** @type {FunctionRunResult} */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  /** @type {FunctionRunResult['discounts']} */
  const discounts = [];

  for (const line of input.cart.lines) {
    if (!lineQualifiesForVatRelief(line)) continue;

    const gross = Number(line.cost?.totalAmount?.amount ?? 0);
    if (gross <= 0) continue;

    const vatAmount = vatPortionFromGross(gross);
    if (vatAmount <= 0) continue;

    discounts.push({
      targets: [
        {
          cartLine: {
            id: line.id,
            quantity: line.quantity,
          },
        },
      ],
      value: {
        fixedAmount: {
          amount: vatAmount.toFixed(2),
          appliesToEachItem: false,
        },
      },
      message: 'VAT relief',
    });
  }

  if (!discounts.length) return EMPTY_DISCOUNT;

  return {
    discountApplicationStrategy: DiscountApplicationStrategy.All,
    discounts,
  };
}
