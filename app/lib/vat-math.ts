/**
 * UK VAT helpers for a **tax-exclusive** Shopify catalog.
 *
 * Catalog / Storefront `price.amount` = ex VAT (net).
 * - Display ex VAT: catalog as-is
 * - Display inc VAT: catalog × 1.2
 * - Customer-facing VAT savings: catalog × 0.2
 *
 * Checkout VAT relief (see extensions/vat-relief-discount + shopify-admin-vat):
 * product discount is **£0**. Declarants are marked `taxExempt: true` so Shopify
 * does not add VAT — payable = catalog (ex VAT). Do **not** discount catalog/6
 * on a tax-exclusive catalog: if tax is not added after the discount, payable
 * collapses to ~83.3% of catalog (e.g. £833 on a £1000 item).
 */
export const UK_VAT_MULTIPLIER = 1.2;
export const UK_VAT_RATE = 0.2;

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** Catalog amount is already ex VAT. */
export function exVatFromCatalog(amount: number | string): number {
  return roundMoney(Number(amount));
}

/** Catalog × 1.2 (inc VAT). */
export function incVatFromCatalog(amount: number | string): number {
  return roundMoney(Number(amount) * UK_VAT_MULTIPLIER);
}

/** VAT that would be charged on a tax-exclusive amount (20% of catalog). */
export function vatFromCatalog(amount: number | string): number {
  const net = exVatFromCatalog(amount);
  return roundMoney(incVatFromCatalog(net) - net);
}

/**
 * Product discount for VAT relief lines. Always **0** for tax-exclusive catalogs:
 * relief is applied via customer `taxExempt`, not a line discount.
 */
export function vatReliefCheckoutDiscountFromCatalog(
  _amount: number | string,
): number {
  return 0;
}

/** @deprecated Use exVatFromCatalog — catalog is tax-exclusive. */
export function exVatFromGross(gross: number | string): number {
  return exVatFromCatalog(gross);
}

/** @deprecated Use vatFromCatalog for display savings. */
export function vatPortionFromGross(gross: number | string): number {
  return vatFromCatalog(gross);
}
