import {formatProductPrice} from '~/lib/product-pricing';
import {exVatFromGross, vatPortionFromGross} from '~/lib/vat-math';
import {getHomepageProductSlot} from '~/lib/homepage-data';

const VAT_RELIEF_KEY = 'VAT Relief';
const VAT_RELIEF_VALUE = 'Yes';

export function isAccessoryProduct(handle: string): boolean {
  return !getHomepageProductSlot(handle);
}

export function lineHasVatRelief(
  attributes?: Array<{key: string; value?: string | null}> | null,
): boolean {
  return (
    attributes?.some(
      (attribute) =>
        attribute.key === VAT_RELIEF_KEY && attribute.value === VAT_RELIEF_VALUE,
    ) ?? false
  );
}

export function getLineDisplayAmount({
  amount,
  currencyCode,
  vatRelief,
}: {
  amount: string;
  currencyCode: string;
  vatRelief: boolean;
}) {
  const numeric = Number(amount);
  const displayAmount = vatRelief ? exVatFromGross(amount) : numeric;
  return formatProductPrice(
    displayAmount,
    currencyCode,
    vatRelief ? {fractionDigits: 2} : undefined,
  );
}

export function getVatSavingsAmount(
  lines: Array<{
    quantity: number;
    cost?: {totalAmount?: {amount: string} | null} | null;
    attributes?: Array<{key: string; value?: string | null}> | null;
  }>,
): number {
  return lines.reduce((total, line) => {
    if (!lineHasVatRelief(line.attributes)) return total;
    const inc = Number(line.cost?.totalAmount?.amount ?? 0);
    return total + vatPortionFromGross(inc);
  }, 0);
}

/** Ensure Shopify-hosted checkout includes the online store channel. */
export function withOnlineStoreChannel(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    if (!url.searchParams.has('channel')) {
      url.searchParams.set('channel', 'online_store');
    }
    return url.toString();
  } catch {
    if (checkoutUrl.includes('channel=')) return checkoutUrl;
    const separator = checkoutUrl.includes('?') ? '&' : '?';
    return `${checkoutUrl}${separator}channel=online_store`;
  }
}
