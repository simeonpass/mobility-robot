import {DiscountClass} from '../generated/api';

/**
 * @typedef {import('../generated/api').Input} RunInput
 * @typedef {import('../generated/api').CartLinesDiscountsGenerateRunResult} CartLinesDiscountsGenerateRunResult
 */

/**
 * Tax-exclusive catalog: do **not** apply a product discount for VAT relief.
 * Declarants are `taxExempt` so Shopify charges no VAT and payable = catalog.
 * Returning operations: [] keeps the automatic discount installed but inert.
 *
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

  // Intentionally no candidates — relief is via taxExempt, not a line discount.
  return {operations: []};
}
