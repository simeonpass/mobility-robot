import {lineHasVatRelief} from '~/lib/cart-utils';
import {
  catalogToExVatAmount,
  catalogToIncVatAmount,
  catalogVatPortion,
  isShopifyPricesExVat,
} from '~/lib/pricing-mode';
import {isVatReliefVariant} from '~/lib/product-vat-variants';
import {
  getLineAmountDueToday,
  isDepositCartLine,
  type CartLineSellingPlanSource,
} from '~/lib/selling-plans';
import {roundMoney} from '~/lib/vat-math';

type MoneyLike = {
  amount?: string | null;
  currencyCode?: string | null;
} | null | undefined;

export type VatReliefCartLine = {
  quantity?: number;
  cost?: {
    totalAmount?: MoneyLike;
    amountPerQuantity?: MoneyLike;
  } | null;
  merchandise?: {
    price?: MoneyLike;
    selectedOptions?: Array<{name: string; value: string}> | null;
  } | null;
  attributes?: Array<{key: string; value?: string | null}> | null;
  sellingPlanAllocation?: CartLineSellingPlanSource['sellingPlanAllocation'];
};

export type VatReliefCart = {
  lines?: {nodes?: VatReliefCartLine[] | null} | null;
  cost?: {
    subtotalAmount?: MoneyLike;
    totalAmount?: MoneyLike;
  } | null;
  discountAllocations?: Array<{discountedAmount?: MoneyLike}> | null;
} | null;

export type CartTotals = {
  subtotalIncVat: number;
  vatRemoved: number;
  total: number;
  vatReliefApplied: boolean;
  hasVatRelief: boolean;
  /** True when any line has a deposit / pre-order selling plan. */
  hasDeposit: boolean;
};

export function cartHasVatReliefLines(cart: VatReliefCart): boolean {
  return (cart?.lines?.nodes ?? []).some((line) =>
    lineHasVatRelief(line.attributes),
  );
}

export function cartHasDepositLines(cart: VatReliefCart): boolean {
  return (cart?.lines?.nodes ?? []).some((line) =>
    isDepositCartLine(line as CartLineSellingPlanSource),
  );
}

/** Catalog line total in Shopify's native units (gross today, net after cutover). */
export function getLineCatalogAmount(line: VatReliefCartLine): number {
  const quantity = line.quantity ?? 1;
  const unitPrice = Number(
    line.merchandise?.price?.amount ??
      line.cost?.amountPerQuantity?.amount ??
      0,
  );
  if (unitPrice <= 0) {
    return Number(line.cost?.totalAmount?.amount ?? 0);
  }
  return roundMoney(unitPrice * quantity);
}

/** @deprecated Prefer getLineCatalogAmount — name kept for call sites. */
export function getLineCatalogGross(line: VatReliefCartLine): number {
  return getLineCatalogAmount(line);
}

export function getVatReliefLineTotals(cart: VatReliefCart) {
  const exVatCatalog = isShopifyPricesExVat();
  let grossTotal = 0;
  let vatRemoved = 0;

  for (const line of cart?.lines?.nodes ?? []) {
    if (!lineHasVatRelief(line.attributes)) continue;
    const catalog = getLineCatalogAmount(line);
    if (catalog <= 0) continue;

    // Dual-variant path: line is already the net "VAT Relief" SKU.
    if (isVatReliefVariant(line.merchandise?.selectedOptions)) {
      // Without the Standard sibling here, show net as both sides; cart UI
      // still shows the paid price correctly as catalog.
      grossTotal += catalog;
      continue;
    }

    const lineGross = catalogToIncVatAmount(catalog, exVatCatalog);
    grossTotal += lineGross;
    vatRemoved += catalogVatPortion(catalog, exVatCatalog);
  }

  vatRemoved = roundMoney(vatRemoved);

  return {
    grossTotal: roundMoney(grossTotal),
    vatRemoved,
    netTotal: roundMoney(grossTotal - vatRemoved),
  };
}

export function sumLineGrossSubtotal(cart: VatReliefCart): number {
  const exVatCatalog = isShopifyPricesExVat();
  return roundMoney(
    (cart?.lines?.nodes ?? []).reduce((sum, line) => {
      const catalog = getLineCatalogAmount(line);
      return sum + catalogToIncVatAmount(catalog, exVatCatalog);
    }, 0),
  );
}

export function getCartDiscountTotal(cart: VatReliefCart): number {
  return roundMoney(
    (cart?.discountAllocations ?? []).reduce(
      (sum, allocation) =>
        sum + Number(allocation.discountedAmount?.amount ?? 0),
      0,
    ),
  );
}

function amountsMatch(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.02;
}

/**
 * True when Shopify has already applied the legacy VAT relief *discount*
 * (tax-inclusive + function mode). Not used once prices are tax-exclusive
 * and relief is via customer taxExempt.
 */
export function isVatReliefDiscountApplied(cart: VatReliefCart): boolean {
  if (isShopifyPricesExVat()) return false;

  const {vatRemoved, netTotal} = getVatReliefLineTotals(cart);
  if (vatRemoved <= 0) return false;

  const discountTotal = getCartDiscountTotal(cart);
  if (discountTotal > 0 && amountsMatch(discountTotal, vatRemoved)) {
    return true;
  }

  const apiSubtotal = Number(cart?.cost?.subtotalAmount?.amount ?? 0);
  const apiTotal = Number(cart?.cost?.totalAmount?.amount ?? 0);
  const lineSubtotal = sumLineGrossSubtotal(cart);

  if (apiTotal > 0 && amountsMatch(apiTotal, netTotal)) return true;
  if (apiTotal > 0 && apiTotal < lineSubtotal && amountsMatch(apiTotal, netTotal)) {
    return true;
  }
  if (
    apiSubtotal > 0 &&
    lineSubtotal > apiSubtotal &&
    amountsMatch(apiSubtotal, netTotal)
  ) {
    return true;
  }

  return false;
}

function getDepositCartTotals(cart: VatReliefCart): CartTotals {
  const exVatCatalog = isShopifyPricesExVat();
  const lines = cart?.lines?.nodes ?? [];
  let subtotalIncVat = 0;
  let vatRemoved = 0;
  let total = 0;
  let hasVatRelief = false;

  for (const line of lines) {
    const dueCatalog = getLineAmountDueToday(line as CartLineSellingPlanSource);
    if (
      lineHasVatRelief(line.attributes) &&
      isVatReliefVariant(line.merchandise?.selectedOptions)
    ) {
      // Dual-variant deposit: due amount is already net.
      hasVatRelief = true;
      subtotalIncVat += dueCatalog;
      total += dueCatalog;
      continue;
    }
    const dueInc = catalogToIncVatAmount(dueCatalog, exVatCatalog);
    const dueEx = catalogToExVatAmount(dueCatalog, exVatCatalog);
    subtotalIncVat += dueInc;
    if (lineHasVatRelief(line.attributes)) {
      hasVatRelief = true;
      vatRemoved += roundMoney(dueInc - dueEx);
      total += dueEx;
    } else {
      total += dueInc;
    }
  }

  return {
    subtotalIncVat: roundMoney(subtotalIncVat),
    vatRemoved: roundMoney(vatRemoved),
    total: roundMoney(total),
    vatReliefApplied: false,
    hasVatRelief,
    hasDeposit: true,
  };
}

export function getCartTotals(cart: VatReliefCart): CartTotals | null {
  const lines = cart?.lines?.nodes ?? [];
  if (!lines.length) return null;

  const hasDeposit = cartHasDepositLines(cart);
  if (hasDeposit) {
    return getDepositCartTotals(cart);
  }

  const hasVatRelief = cartHasVatReliefLines(cart);
  const dualVatRelief = (cart?.lines?.nodes ?? []).some(
    (line) =>
      lineHasVatRelief(line.attributes) &&
      isVatReliefVariant(line.merchandise?.selectedOptions),
  );
  const {vatRemoved, netTotal} = getVatReliefLineTotals(cart);
  const subtotalIncVat = sumLineGrossSubtotal(cart);
  const apiTotal = Number(cart?.cost?.totalAmount?.amount ?? 0);
  const vatReliefApplied = isVatReliefDiscountApplied(cart);
  const exVatCatalog = isShopifyPricesExVat();

  // Dual-variant cart: paid price is already the VAT Relief SKU amount.
  if (dualVatRelief) {
    const total = roundMoney(
      (cart?.lines?.nodes ?? []).reduce(
        (sum, line) => sum + getLineCatalogAmount(line),
        0,
      ),
    );
    return {
      subtotalIncVat: total,
      vatRemoved: 0,
      total,
      vatReliefApplied: true,
      hasVatRelief: true,
      hasDeposit: false,
    };
  }

  if (!hasVatRelief || vatRemoved <= 0) {
    // Tax-exclusive Storefront cart totals are often net-only; show inc-VAT.
    const total = exVatCatalog
      ? subtotalIncVat
      : apiTotal || subtotalIncVat;
    return {
      subtotalIncVat,
      vatRemoved: 0,
      total,
      vatReliefApplied: false,
      hasVatRelief: false,
      hasDeposit: false,
    };
  }

  // Exclusive + taxExempt: customer pays net (no discount line needed).
  if (exVatCatalog) {
    return {
      subtotalIncVat,
      vatRemoved,
      total: netTotal,
      vatReliefApplied: true,
      hasVatRelief: true,
      hasDeposit: false,
    };
  }

  const total = vatReliefApplied
    ? apiTotal || netTotal
    : roundMoney(subtotalIncVat - vatRemoved);

  return {
    subtotalIncVat,
    vatRemoved,
    total,
    vatReliefApplied,
    hasVatRelief,
    hasDeposit: false,
  };
}

/** @deprecated Use getCartTotals().total */
export function getEstimatedCartTotal(cart: VatReliefCart): number | null {
  return getCartTotals(cart)?.total ?? null;
}
