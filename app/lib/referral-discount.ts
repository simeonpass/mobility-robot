/** Referral query params mapped to Shopify discount codes. */
export const REFERRAL_DISCOUNT_CODES: Record<string, string> = {
  JENNI10: 'JENNI10',
};

export function getReferralDiscountCode(
  searchParams: URLSearchParams,
): string | null {
  const ref = searchParams.get('ref')?.trim().toUpperCase();
  if (!ref) return null;
  return REFERRAL_DISCOUNT_CODES[ref] ?? null;
}

type CartWithDiscounts = {
  discountCodes?: Array<{code: string; applicable?: boolean}> | null;
} | null;

/**
 * Applies a referral discount from ?ref= when present.
 * Safe to call on every request — skips if already applied.
 */
export async function applyReferralDiscount(
  request: Request,
  cart: {
    get: () => Promise<CartWithDiscounts>;
    updateDiscountCodes: (
      codes: string[],
    ) => Promise<{cart: CartWithDiscounts}>;
  },
): Promise<void> {
  const discountCode = getReferralDiscountCode(new URL(request.url).searchParams);
  if (!discountCode) return;

  const currentCart = await cart.get();
  const existingCodes =
    currentCart?.discountCodes
      ?.filter((entry) => entry.applicable !== false)
      .map((entry) => entry.code) ?? [];

  if (existingCodes.includes(discountCode)) return;

  await cart.updateDiscountCodes([...existingCodes, discountCode]);
}
