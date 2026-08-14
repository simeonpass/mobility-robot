/**
 * Exact HMRC VAT relief calculations for UK 20% VAT.
 */
export const UK_VAT_MULTIPLIER = 1.2;

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** Gross (inc VAT) → net (ex VAT). */
export function exVatFromGross(gross: number | string): number {
  return roundMoney(Number(gross) / UK_VAT_MULTIPLIER);
}

/** Net (ex VAT) → gross (inc VAT). */
export function grossFromNet(net: number | string): number {
  return roundMoney(Number(net) * UK_VAT_MULTIPLIER);
}

/** VAT portion embedded in a gross (inc-VAT) amount. */
export function vatPortionFromGross(gross: number | string): number {
  const grossRounded = roundMoney(Number(gross));
  return roundMoney(grossRounded - exVatFromGross(grossRounded));
}

/** VAT that will be added to a net (ex-VAT) amount at 20%. */
export function vatPortionFromNet(net: number | string): number {
  const netRounded = roundMoney(Number(net));
  return roundMoney(grossFromNet(netRounded) - netRounded);
}
