/**
 * Exact HMRC VAT relief calculations for UK 20% VAT-inclusive prices.
 */
export const UK_VAT_MULTIPLIER = 1.2;

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function exVatFromGross(gross: number | string): number {
  return roundMoney(Number(gross) / UK_VAT_MULTIPLIER);
}

export function vatPortionFromGross(gross: number | string): number {
  const grossRounded = roundMoney(Number(gross));
  return roundMoney(grossRounded - exVatFromGross(grossRounded));
}
