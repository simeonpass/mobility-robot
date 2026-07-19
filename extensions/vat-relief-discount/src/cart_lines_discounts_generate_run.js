// @ts-check
import {
  DiscountClass,
  ProductDiscountSelectionStrategy,
} from '../generated/api';
import {
  lineQualifiesForVatRelief,
  vatPortionFromGross,
} from './vat-math.js';

/**
 * @typedef {import('../generated/api').Input} RunInput
 * @typedef {import('../generated/api').CartLinesDiscountsGenerateRunResult} CartLinesDiscountsGenerateRunResult
 */

/**
 * @param {RunInput} input
 * @returns {CartLinesDiscountsGenerateRunResult}
 */
export function cartLinesDiscountsGenerateRun(input) {
  const hasProductDiscountClass = input.discount.discountClasses.includes(
    DiscountClass.Product,
  );

  if (!hasProductDiscountClass) {
    return {operations: []};
  }

  /** @type {NonNullable<CartLinesDiscountsGenerateRunResult['operations'][number]['productDiscountsAdd']>['candidates']} */
  const candidates = [];

  for (const line of input.cart.lines) {
    if (!lineQualifiesForVatRelief(line)) continue;

    const gross = Number(line.cost?.subtotalAmount?.amount ?? 0);
    if (gross <= 0) continue;

    const vatAmount = vatPortionFromGross(gross);
    if (vatAmount <= 0) continue;

    candidates.push({
      message: 'VAT relief',
      targets: [{cartLine: {id: line.id}}],
      value: {
        fixedAmount: {
          amount: vatAmount.toFixed(2),
          appliesToEachItem: false,
        },
      },
    });
  }

  if (!candidates.length) {
    return {operations: []};
  }

  return {
    operations: [
      {
        productDiscountsAdd: {
          candidates,
          selectionStrategy: ProductDiscountSelectionStrategy.All,
        },
      },
    ],
  };
}
