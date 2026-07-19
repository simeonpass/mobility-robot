/**
 * UK VAT helpers for a **tax-exclusive** Shopify catalog.
 *
 * Line `cost.subtotalAmount` from the Discount Function is the catalog (ex VAT)
 * amount before taxes. Relief customers pay that amount because they are marked
 * `taxExempt` in Admin (see shopify-admin-vat) — **not** via a product discount.
 *
 * This function always returns discount **0**. Applying catalog/6 (or catalog×0.2)
 * on an exclusive catalog under-charges when Shopify does not add VAT afterward
 * (e.g. £1000 → £833).
 */
export const VAT_RELIEF_ATTRIBUTE_KEY = 'VAT Relief';
export const VAT_RELIEF_ATTRIBUTE_VALUE = 'Yes';
export const UK_VAT_MULTIPLIER = 1.2;

export function roundMoney(amount) {
  return Math.round(Number(amount) * 100) / 100;
}

/** Catalog / line subtotal is already ex VAT. */
export function exVatFromCatalog(amount) {
  return roundMoney(Number(amount));
}

/**
 * Product discount for VAT relief — always 0. Tax exemption handles relief.
 */
export function vatReliefCheckoutDiscountFromCatalog(_amount) {
  return 0;
}

/** @deprecated Prefer vatReliefCheckoutDiscountFromCatalog. */
export function vatPortionFromGross(gross) {
  return vatReliefCheckoutDiscountFromCatalog(gross);
}

/** @deprecated Prefer exVatFromCatalog. */
export function exVatFromGross(gross) {
  return exVatFromCatalog(gross);
}

export function lineQualifiesForVatRelief(line) {
  return line?.attribute?.value === VAT_RELIEF_ATTRIBUTE_VALUE;
}
