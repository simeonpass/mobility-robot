import {UK_VAT_MULTIPLIER, grossFromNet, roundMoney} from '~/lib/vat-math';

/**
 * When true, Shopify catalog / cart amounts are net (ex VAT).
 * The storefront still shows UK VAT-inclusive prices to shoppers.
 *
 * Set PUBLIC_SHOPIFY_PRICES_EX_VAT=true in Oxygen **only after** Admin prices
 * are switched to tax-exclusive and products are repriced to net amounts.
 * See docs/rebuild/vat-tax-exclusive-cutover.md
 */
export function isShopifyPricesExVat(
  env?: {PUBLIC_SHOPIFY_PRICES_EX_VAT?: string} | null,
): boolean {
  const fromArg = env?.PUBLIC_SHOPIFY_PRICES_EX_VAT?.trim().toLowerCase();
  if (fromArg === 'true' || fromArg === '1') return true;
  if (fromArg === 'false' || fromArg === '0') return false;

  try {
    const fromMeta = (
      import.meta as ImportMeta & {env?: Record<string, string>}
    ).env?.PUBLIC_SHOPIFY_PRICES_EX_VAT?.trim()
      .toLowerCase();
    return fromMeta === 'true' || fromMeta === '1';
  } catch {
    return false;
  }
}

/** Catalog unit → UK VAT-inclusive display amount. */
export function catalogToIncVatAmount(
  catalogAmount: number | string,
  exVatCatalog = isShopifyPricesExVat(),
): number {
  const amount = Number(catalogAmount);
  if (!Number.isFinite(amount)) return 0;
  return exVatCatalog ? grossFromNet(amount) : roundMoney(amount);
}

/** Catalog unit → ex-VAT amount (HMRC relief / “with VAT relief” copy). */
export function catalogToExVatAmount(
  catalogAmount: number | string,
  exVatCatalog = isShopifyPricesExVat(),
): number {
  const amount = Number(catalogAmount);
  if (!Number.isFinite(amount)) return 0;
  if (exVatCatalog) return roundMoney(amount);
  return roundMoney(amount / UK_VAT_MULTIPLIER);
}

/** VAT portion of a catalog unit (for “save £X” copy). */
export function catalogVatPortion(
  catalogAmount: number | string,
  exVatCatalog = isShopifyPricesExVat(),
): number {
  const inc = catalogToIncVatAmount(catalogAmount, exVatCatalog);
  const ex = catalogToExVatAmount(catalogAmount, exVatCatalog);
  return roundMoney(inc - ex);
}
