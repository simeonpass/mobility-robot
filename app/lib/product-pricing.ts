import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {
  catalogToExVatAmount,
  catalogToIncVatAmount,
  catalogVatPortion,
  isShopifyPricesExVat,
} from '~/lib/pricing-mode';
import {roundMoney} from '~/lib/vat-math';

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

export function sumMoneyV2(
  amounts: Array<Pick<MoneyV2, 'amount' | 'currencyCode'> | null | undefined>,
): MoneyV2 | null {
  let total = 0;
  let currencyCode: string | null = null;

  for (const money of amounts) {
    if (!money?.amount || !money.currencyCode) continue;
    currencyCode ??= money.currencyCode;
    total = roundMoney(total + Number(money.amount));
  }

  if (!currencyCode) return null;
  return {amount: total.toFixed(2), currencyCode};
}

/** UK VAT-inclusive display for a Shopify catalog money amount. */
export function getIncVatDisplay(price?: MoneyV2 | null) {
  if (!price) return null;
  return formatProductPrice(
    catalogToIncVatAmount(price.amount),
    price.currencyCode,
  );
}

/** Ex-VAT display for a Shopify catalog money amount. */
export function getExVatDisplay(price?: MoneyV2 | null) {
  if (!price) return null;
  return formatProductPrice(
    catalogToExVatAmount(price.amount),
    price.currencyCode,
    {fractionDigits: 2},
  );
}

export function getVatSavingsDisplay(price?: MoneyV2 | null) {
  if (!price) return null;
  return formatProductPrice(
    catalogVatPortion(price.amount),
    price.currencyCode,
    {fractionDigits: 2},
  );
}

export function getKlarnaInstallmentDisplay(price?: MoneyV2 | null) {
  if (!price) return null;
  // Klarna Pay in 3 on the UK VAT-inclusive total shoppers expect to see.
  const installment = roundMoney(catalogToIncVatAmount(price.amount) / 3);
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

export {isShopifyPricesExVat};
