import {formatProductPrice} from '~/lib/product-pricing';
import {
  exVatFromCatalog,
  incVatFromCatalog,
  vatFromCatalog,
} from '~/lib/vat-math';
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

/**
 * Line/catalog amounts are tax-exclusive.
 * VAT relief → show catalog (ex VAT); otherwise show inc VAT (× 1.2).
 */
export function getLineDisplayAmount({
  amount,
  currencyCode,
  vatRelief,
}: {
  amount: string;
  currencyCode: string;
  vatRelief: boolean;
}) {
  const displayAmount = vatRelief
    ? exVatFromCatalog(amount)
    : incVatFromCatalog(amount);
  return formatProductPrice(displayAmount, currencyCode, {
    fractionDigits: 2,
  });
}

/** Customer-facing VAT savings on relief lines (= catalog × 0.2 each). */
export function getVatSavingsAmount(
  lines: Array<{
    quantity: number;
    cost?: {totalAmount?: {amount: string} | null} | null;
    merchandise?: {price?: {amount: string} | null} | null;
    attributes?: Array<{key: string; value?: string | null}> | null;
  }>,
): number {
  return lines.reduce((total, line) => {
    if (!lineHasVatRelief(line.attributes)) return total;
    const unit = Number(
      line.merchandise?.price?.amount ??
        line.cost?.totalAmount?.amount ??
        0,
    );
    // Prefer unit × qty when available; cost.totalAmount may already be a line total.
    const catalog =
      line.merchandise?.price?.amount != null
        ? unit * (line.quantity ?? 1)
        : unit;
    return total + vatFromCatalog(catalog);
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
