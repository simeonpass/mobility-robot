import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {
  exVatFromCatalog,
  incVatFromCatalog,
  vatFromCatalog,
} from '~/lib/vat-math';

export function formatProductPrice(
  amount: number,
  currencyCode: string,
  options?: {fractionDigits?: number},
): string {
  const fractionDigits = options?.fractionDigits ?? 0;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

/** Inc VAT = catalog × 1.2 (catalog is tax-exclusive). */
export function getIncVatDisplay(price?: MoneyV2 | null) {
  if (!price) return null;
  return formatProductPrice(
    incVatFromCatalog(price.amount),
    price.currencyCode,
    {fractionDigits: 2},
  );
}

/** Ex VAT = catalog amount (tax-exclusive). */
export function getExVatDisplay(price?: MoneyV2 | null) {
  if (!price) return null;
  return formatProductPrice(
    exVatFromCatalog(price.amount),
    price.currencyCode,
    {fractionDigits: 2},
  );
}

/** VAT savings vs paying inc VAT (= catalog × 0.2). */
export function getVatSavingsDisplay(price?: MoneyV2 | null) {
  if (!price) return null;
  return formatProductPrice(
    vatFromCatalog(price.amount),
    price.currencyCode,
    {fractionDigits: 2},
  );
}

export function getKlarnaInstallmentDisplay(price?: MoneyV2 | null) {
  if (!price) return null;
  // Klarna marketing uses the VAT-relief (ex VAT / catalog) price.
  const monthly = exVatFromCatalog(price.amount) / 12;
  return formatProductPrice(monthly, price.currencyCode, {fractionDigits: 2});
}

export function getActiveCartPriceDisplay(
  price: MoneyV2 | null | undefined,
  vatReliefEnabled: boolean,
) {
  if (!price) return null;
  return vatReliefEnabled ? getExVatDisplay(price) : getIncVatDisplay(price);
}

export function buildVatCartAttributes(declaration: {
  email: string;
  name: string;
  address: string;
  condition: string;
}) {
  return [
    {key: 'VAT Relief', value: 'Yes'},
    {key: 'VAT Declaration Email', value: declaration.email.trim()},
    {key: 'VAT Declaration Name', value: declaration.name.trim()},
    {key: 'VAT Declaration Address', value: declaration.address.trim()},
    {key: 'VAT Declaration Condition', value: declaration.condition.trim()},
  ];
}
