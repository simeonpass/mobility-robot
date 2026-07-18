import {lineHasVatRelief} from '~/lib/cart-utils';
import {roundMoney, vatPortionFromGross} from '~/lib/vat-math';

type MoneyLike = {amount?: string | null} | null | undefined;

export type VatReliefCartLine = {
  quantity?: number;
  cost?: {totalAmount?: MoneyLike} | null;
  attributes?: Array<{key: string; value?: string | null}> | null;
};

export type VatReliefCart = {
  lines?: {nodes?: VatReliefCartLine[] | null} | null;
  cost?: {
    subtotalAmount?: MoneyLike;
    totalAmount?: MoneyLike;
  } | null;
} | null;

export function cartHasVatReliefLines(cart: VatReliefCart): boolean {
  return (cart?.lines?.nodes ?? []).some((line) =>
    lineHasVatRelief(line.attributes),
  );
}

export function getVatReliefLineTotals(cart: VatReliefCart) {
  let grossTotal = 0;
  let vatRemoved = 0;

  for (const line of cart?.lines?.nodes ?? []) {
    if (!lineHasVatRelief(line.attributes)) continue;
    const gross = Number(line.cost?.totalAmount?.amount ?? 0);
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

export function getEstimatedCartTotal(cart: VatReliefCart): number | null {
  const lines = cart?.lines?.nodes ?? [];
  if (!lines.length) return null;

  const subtotal = Number(cart?.cost?.subtotalAmount?.amount ?? 0);
  const {vatRemoved} = getVatReliefLineTotals(cart);
  if (vatRemoved <= 0) return subtotal;

  return roundMoney(subtotal - vatRemoved);
}
