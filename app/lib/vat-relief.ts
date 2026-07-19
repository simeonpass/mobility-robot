import {lineHasVatRelief} from '~/lib/cart-utils';
import {
  getLineAmountDueToday,
  isDepositCartLine,
  type CartLineSellingPlanSource,
} from '~/lib/selling-plans';
import {
  exVatFromCatalog,
  incVatFromCatalog,
  roundMoney,
  vatFromCatalog,
} from '~/lib/vat-math';

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
  merchandise?: {price?: MoneyLike} | null;
  attributes?: Array<{key: string; value?: string | null}> | null;
  sellingPlanAllocation?: CartLineSellingPlanSource['sellingPlanAllocation'];
};

export type VatReliefCart = {
  lines?: {nodes?: VatReliefCartLine[] | null} | null;
  cost?: {
    subtotalAmount?: MoneyLike;
    totalAmount?: MoneyLike;
    totalTaxAmount?: MoneyLike;
  } | null;
  discountAllocations?: Array<{discountedAmount?: MoneyLike}> | null;
} | null;

export type CartTotals = {
  /** Payable without VAT relief (catalog × 1.2), or deposit due today. */
  subtotalIncVat: number;
  /** Customer-facing VAT savings on relief lines (catalog × 0.2). */
  vatRemoved: number;
  total: number;
  vatReliefApplied: boolean;
  hasVatRelief: boolean;
  /** True when any line has a deposit / pre-order selling plan. */
  hasDeposit: boolean;
  /**
   * True when Hydrogen cart has no tax yet and we estimated inc VAT (× 1.2)
   * for non-relief lines. False when using Shopify `cost.totalAmount` with tax.
   */
  isEstimated: boolean;
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

/**
 * Tax-exclusive catalog line total — never use discounted cart line cost for VAT math.
 */
export function getLineCatalogNet(line: VatReliefCartLine): number {
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

/** @deprecated Use getLineCatalogNet — catalog is tax-exclusive. */
export function getLineCatalogGross(line: VatReliefCartLine): number {
  return getLineCatalogNet(line);
}

export function getVatReliefLineTotals(cart: VatReliefCart) {
  let netTotal = 0;
  let vatRemoved = 0;

  for (const line of cart?.lines?.nodes ?? []) {
    if (!lineHasVatRelief(line.attributes)) continue;
    const net = getLineCatalogNet(line);
    if (net <= 0) continue;
    netTotal += net;
    vatRemoved += vatFromCatalog(net);
  }

  return {
    netTotal: roundMoney(netTotal),
    vatRemoved: roundMoney(vatRemoved),
    /** Product discount is always 0 — relief is via taxExempt. */
    checkoutDiscount: 0,
    /** Inc-VAT comparison subtotal for relief lines only. */
    grossTotal: roundMoney(incVatFromCatalog(netTotal)),
  };
}

export function sumLineNetSubtotal(cart: VatReliefCart): number {
  return roundMoney(
    (cart?.lines?.nodes ?? []).reduce(
      (sum, line) => sum + getLineCatalogNet(line),
      0,
    ),
  );
}

/** @deprecated Use sumLineNetSubtotal. */
export function sumLineGrossSubtotal(cart: VatReliefCart): number {
  return sumLineNetSubtotal(cart);
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

/**
 * True when the cart has VAT relief declarations. Payable estimate is already
 * catalog (ex VAT); checkout applies taxExempt (no product discount).
 */
export function isVatReliefDiscountApplied(cart: VatReliefCart): boolean {
  return cartHasVatReliefLines(cart);
}

/**
 * Pay-now totals. Deposit lines use Shopify `checkoutChargeAmount` (cart `cost`
 * stays at full catalog for PRE_ORDER plans). Charges are % of tax-exclusive catalog.
 */
function getDepositCartTotals(cart: VatReliefCart): CartTotals {
  const lines = cart?.lines?.nodes ?? [];
  let subtotalIncVat = 0;
  let vatRemoved = 0;
  let total = 0;
  let hasVatRelief = false;

  for (const line of lines) {
    const dueNet = getLineAmountDueToday(line as CartLineSellingPlanSource);
    if (lineHasVatRelief(line.attributes)) {
      hasVatRelief = true;
      const vat = vatFromCatalog(dueNet);
      vatRemoved += vat;
      // Relief: pay ex-VAT deposit (catalog %).
      total += exVatFromCatalog(dueNet);
      subtotalIncVat += incVatFromCatalog(dueNet);
    } else {
      // Non-relief: estimate due today inc VAT (Shopify adds tax at checkout).
      const dueInc = incVatFromCatalog(dueNet);
      subtotalIncVat += dueInc;
      total += dueInc;
    }
  }

  return {
    subtotalIncVat: roundMoney(subtotalIncVat),
    vatRemoved: roundMoney(vatRemoved),
    total: roundMoney(total),
    vatReliefApplied: hasVatRelief,
    hasVatRelief,
    hasDeposit: true,
    // Deposit charges are catalog-net; we always estimate tax for display.
    isEstimated: true,
  };
}

/**
 * Prefer Shopify cart totals when Storefront has already calculated tax.
 * Hydrogen often returns totalTaxAmount = 0 until checkout — then we estimate.
 */
function getShopifyTaxInclusiveTotal(cart: VatReliefCart): number | null {
  const apiTax = Number(cart?.cost?.totalTaxAmount?.amount ?? 0);
  const apiTotal = Number(cart?.cost?.totalAmount?.amount ?? 0);
  if (apiTax > 0 && apiTotal > 0) {
    return roundMoney(apiTotal);
  }
  return null;
}

export function getCartTotals(cart: VatReliefCart): CartTotals | null {
  const lines = cart?.lines?.nodes ?? [];
  if (!lines.length) return null;

  const hasDeposit = cartHasDepositLines(cart);
  if (hasDeposit) {
    return getDepositCartTotals(cart);
  }

  const hasVatRelief = cartHasVatReliefLines(cart);
  const {vatRemoved} = getVatReliefLineTotals(cart);
  const catalogNet = sumLineNetSubtotal(cart);
  const estimatedIncVat = roundMoney(incVatFromCatalog(catalogNet));
  const vatReliefApplied = isVatReliefDiscountApplied(cart);

  if (!hasVatRelief || vatRemoved <= 0) {
    const shopifyTotal = getShopifyTaxInclusiveTotal(cart);
    if (shopifyTotal != null) {
      return {
        subtotalIncVat: shopifyTotal,
        vatRemoved: 0,
        total: shopifyTotal,
        vatReliefApplied: false,
        hasVatRelief: false,
        hasDeposit: false,
        isEstimated: false,
      };
    }
    // Tax-exclusive cart API omits VAT until checkout — estimate payable × 1.2.
    return {
      subtotalIncVat: estimatedIncVat,
      vatRemoved: 0,
      total: estimatedIncVat,
      vatReliefApplied: false,
      hasVatRelief: false,
      hasDeposit: false,
      isEstimated: true,
    };
  }

  // Mixed / relief cart: never trust API total (may still include VAT before
  // taxExempt applies at checkout). Relief → net; other lines → × 1.2.
  let estimatedTotal = 0;
  for (const line of lines) {
    const net = getLineCatalogNet(line);
    if (lineHasVatRelief(line.attributes)) {
      estimatedTotal += exVatFromCatalog(net);
    } else {
      estimatedTotal += incVatFromCatalog(net);
    }
  }
  estimatedTotal = roundMoney(estimatedTotal);

  return {
    subtotalIncVat: estimatedIncVat,
    vatRemoved,
    total: estimatedTotal,
    vatReliefApplied,
    hasVatRelief,
    hasDeposit: false,
    isEstimated: true,
  };
}

/** @deprecated Use getCartTotals().total */
export function getEstimatedCartTotal(cart: VatReliefCart): number | null {
  return getCartTotals(cart)?.total ?? null;
}
