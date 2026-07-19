import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {exVatFromGross, roundMoney, vatPortionFromGross} from '~/lib/vat-math';

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

export function getIncVatDisplay(price?: MoneyV2 | null) {
  if (!price) return null;
  return formatProductPrice(Number(price.amount), price.currencyCode);
}

export function getExVatDisplay(price?: MoneyV2 | null) {
  if (!price) return null;
  return formatProductPrice(
    exVatFromGross(price.amount),
    price.currencyCode,
    {fractionDigits: 2},
  );
}

export function getVatSavingsDisplay(price?: MoneyV2 | null) {
  if (!price) return null;
  return formatProductPrice(
    vatPortionFromGross(price.amount),
    price.currencyCode,
    {fractionDigits: 2},
  );
}

export function getKlarnaInstallmentDisplay(price?: MoneyV2 | null) {
  if (!price) return null;
  // Klarna Pay in 3 = three interest-free payments of the checkout total.
  // Use the catalog (inc-VAT) amount — that is what Klarna finances unless VAT
  // relief is applied at checkout.
  const installment = roundMoney(Number(price.amount) / 3);
  return formatProductPrice(installment, price.currencyCode, {
    fractionDigits: 2,
  });
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
