/** HMRC VAT relief: remove 20% VAT from a gross (inc-VAT) amount. */
export const VAT_RELIEF_ATTRIBUTE_KEY = 'VAT Relief';
export const VAT_RELIEF_ATTRIBUTE_VALUE = 'Yes';
export const UK_VAT_MULTIPLIER = 1.2;
/** Order-discount % equal to the VAT share of a UK inc-VAT price (1 − 1/1.2). */
export const UK_VAT_ORDER_PERCENT = ((1 - 1 / UK_VAT_MULTIPLIER) * 100).toFixed(
  10,
);

export function roundMoney(amount) {
  return Math.round(Number(amount) * 100) / 100;
}

export function exVatFromGross(gross) {
  return roundMoney(Number(gross) / UK_VAT_MULTIPLIER);
}

/** Exact VAT portion removed from a gross line total. */
export function vatPortionFromGross(gross) {
  const grossRounded = roundMoney(gross);
  const exVat = exVatFromGross(grossRounded);
  return roundMoney(grossRounded - exVat);
}

export function lineQualifiesForVatRelief(line) {
  return line?.attribute?.value === VAT_RELIEF_ATTRIBUTE_VALUE;
}
