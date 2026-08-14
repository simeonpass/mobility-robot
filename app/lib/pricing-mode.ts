import {UK_VAT_MULTIPLIER, grossFromNet, roundMoney} from '~/lib/vat-math';

/**
 * When true, Shopify catalog / cart amounts are net (ex VAT).
 *
 * Default is OFF (tax-inclusive catalog) after rolling back the exclusive
 * cutover. Set PUBLIC_SHOPIFY_PRICES_EX_VAT=true in Oxygen only if Admin prices
 * are switched to net again.
 * See docs/rebuild/vat-tax-exclusive-cutover.md
 */
let runtimePricesExVat: boolean | null = null;

/** Apply the Oxygen/runtime flag from the root loader (client + SSR). */
export function setShopifyPricesExVat(value: boolean | null) {
  runtimePricesExVat = value;
}

function parseFlag(raw: string | undefined | null): boolean | null {
  if (raw == null) return null;
  const value = raw.trim().toLowerCase();
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return null;
}

export function isShopifyPricesExVat(
  env?: {PUBLIC_SHOPIFY_PRICES_EX_VAT?: string} | null,
): boolean {
  // Explicit env argument wins (tests / server call sites).
  const fromArg = parseFlag(env?.PUBLIC_SHOPIFY_PRICES_EX_VAT);
  if (fromArg !== null) return fromArg;

  if (runtimePricesExVat !== null) return runtimePricesExVat;

  try {
    const fromMeta = parseFlag(
      (import.meta as ImportMeta & {env?: Record<string, string>}).env
        ?.PUBLIC_SHOPIFY_PRICES_EX_VAT,
    );
    if (fromMeta !== null) return fromMeta;
  } catch {
    // ignore
  }

  // Inclusive catalog (pre / post rollback of tax-exclusive cutover).
  return false;
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

/** Catalog unit → ex-VAT amount (HMRC relief / hero price). */
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
