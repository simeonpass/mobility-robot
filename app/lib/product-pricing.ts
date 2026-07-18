import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

const VAT_RATE = 1.2;

export function toExVatAmount(incVatAmount: string): number {
  return Number(incVatAmount) / VAT_RATE;
}

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
  return formatProductPrice(toExVatAmount(price.amount), price.currencyCode);
}

export function getVatSavingsDisplay(price?: MoneyV2 | null) {
  if (!price) return null;
  const inc = Number(price.amount);
  const ex = toExVatAmount(price.amount);
  const savings = inc - ex;
  return formatProductPrice(savings, price.currencyCode);
}

export function getKlarnaInstallmentDisplay(price?: MoneyV2 | null) {
  if (!price) return null;
  const monthly = toExVatAmount(price.amount) / 12;
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
