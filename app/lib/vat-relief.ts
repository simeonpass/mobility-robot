import {lineHasVatRelief} from '~/lib/cart-utils';
import {roundMoney, vatPortionFromGross} from '~/lib/vat-math';

type MoneyLike = {amount?: string | null} | null | undefined;

export type VatReliefCartLine = {
  quantity?: number;
  cost?: {
    totalAmount?: MoneyLike;
    amountPerQuantity?: MoneyLike;
  } | null;
  merchandise?: {price?: MoneyLike} | null;
  attributes?: Array<{key: string; value?: string | null}> | null;
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
};

export function cartHasVatReliefLines(cart: VatReliefCart): boolean {
  return (cart?.lines?.nodes ?? []).some((line) =>
    lineHasVatRelief(line.attributes),
  );
}

/** Inc-VAT catalog line total — never use discounted cart line cost for VAT math. */
export function getLineCatalogGross(line: VatReliefCartLine): number {
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

export function getVatReliefLineTotals(cart: VatReliefCart) {
  let grossTotal = 0;
  let vatRemoved = 0;

  for (const line of cart?.lines?.nodes ?? []) {
    if (!lineHasVatRelief(line.attributes)) continue;
    const gross = getLineCatalogGross(line);
    if (gross <= 0) continue;
    grossTotal += gross;
    vatRemoved += vatPortionFromGross(gross);
  }

  vatRemoved = roundMoney(vatRemoved);

  return {
    grossTotal: roundMoney(grossTotal),
    vatRemoved,
    netTotal: roundMoney(grossTotal - vatRemoved),
  };
}

export function sumLineGrossSubtotal(cart: VatReliefCart): number {
  return roundMoney(
    (cart?.lines?.nodes ?? []).reduce(
      (sum, line) => sum + getLineCatalogGross(line),
      0,
    ),
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

/** True when Shopify has already applied the VAT relief discount to cart totals. */
export function isVatReliefDiscountApplied(cart: VatReliefCart): boolean {
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

export function getCartTotals(cart: VatReliefCart): CartTotals | null {
  const lines = cart?.lines?.nodes ?? [];
  if (!lines.length) return null;

  const hasVatRelief = cartHasVatReliefLines(cart);
  const {vatRemoved, netTotal} = getVatReliefLineTotals(cart);
  const subtotalIncVat = sumLineGrossSubtotal(cart);
  const apiTotal = Number(cart?.cost?.totalAmount?.amount ?? 0);
  const vatReliefApplied = isVatReliefDiscountApplied(cart);

  if (!hasVatRelief || vatRemoved <= 0) {
    return {
      subtotalIncVat,
      vatRemoved: 0,
      total: apiTotal || subtotalIncVat,
      vatReliefApplied: false,
      hasVatRelief: false,
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
  };
}

/** @deprecated Use getCartTotals().total */
export function getEstimatedCartTotal(cart: VatReliefCart): number | null {
  return getCartTotals(cart)?.total ?? null;
}
