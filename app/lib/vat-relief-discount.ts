import {lineHasVatRelief} from '~/lib/cart-utils';

/**
 * Shopify discount code that removes the VAT element from VAT-inclusive prices.
 *
 * Create in Shopify Admin → Discounts:
 * - Code: VATRELIEF
 * - Type: Percentage
 * - Value: 16.67% (exactly 1/6 — removes 20% VAT from gross prices)
 * - Applies to: wheelchair products / collections only (not accessories)
 * - Customer eligibility: all customers
 * - Combinations: configure per your referral-code policy
 */
export const VAT_RELIEF_DISCOUNT_CODE = 'VATRELIEF';

export type CartDiscountEntry = {
  code: string;
  applicable?: boolean | null;
};

export type CartDiscountAllocation = {
  discountedAmount?: {amount: string; currencyCode: string} | null;
  code?: string | null;
};

export type VatReliefCart = {
  lines?: {
    nodes?: Array<{
      attributes?: Array<{key: string; value?: string | null}> | null;
    }>;
  } | null;
  discountCodes?: Array<CartDiscountEntry> | null;
  discountAllocations?: Array<CartDiscountAllocation> | null;
} | null;

export function isVatReliefDiscountCode(code: string): boolean {
  return code.trim().toUpperCase() === VAT_RELIEF_DISCOUNT_CODE;
}

export function cartNeedsVatReliefDiscount(cart: VatReliefCart): boolean {
  const lines = cart?.lines?.nodes ?? [];
  return lines.some((line) => lineHasVatRelief(line.attributes));
}

export function getApplicableDiscountCodes(cart: VatReliefCart): string[] {
  return (
    cart?.discountCodes
      ?.filter((entry) => entry.applicable !== false)
      .map((entry) => entry.code) ?? []
  );
}

export function getVatReliefDiscountStatus(cart: VatReliefCart) {
  const hasLine = cartNeedsVatReliefDiscount(cart);
  const codeEntry = cart?.discountCodes?.find((entry) =>
    isVatReliefDiscountCode(entry.code),
  );

  return {
    hasLine,
    codeApplied: Boolean(codeEntry),
    codeApplicable: codeEntry?.applicable === true,
  };
}

export function getVatReliefDiscountAmount(cart: VatReliefCart): number {
  const allocations = cart?.discountAllocations ?? [];
  const vatAllocationTotal = allocations.reduce((total, allocation) => {
    if (allocation.code && !isVatReliefDiscountCode(allocation.code)) {
      return total;
    }
    return total + Number(allocation.discountedAmount?.amount ?? 0);
  }, 0);

  if (vatAllocationTotal > 0) return vatAllocationTotal;

  const status = getVatReliefDiscountStatus(cart);
  if (status.codeApplicable) {
    return allocations.reduce(
      (total, allocation) =>
        total + Number(allocation.discountedAmount?.amount ?? 0),
      0,
    );
  }

  return 0;
}

type CartDiscountSyncHandler = {
  get: () => Promise<VatReliefCart>;
  updateDiscountCodes: (
    codes: string[],
  ) => Promise<{cart: VatReliefCart | null}>;
};

/**
 * Keeps the VATRELIEF discount code in sync with cart line declarations.
 * Shopify checkout totals only change when a real discount code is applied.
 */
export async function syncVatReliefDiscount(
  cart: CartDiscountSyncHandler,
  cartAfterMutation?: VatReliefCart,
): Promise<{cart: VatReliefCart | null} | null> {
  const currentCart = cartAfterMutation ?? (await cart.get());
  if (!currentCart) return null;

  const needsCode = cartNeedsVatReliefDiscount(currentCart);
  const existingCodes = getApplicableDiscountCodes(currentCart);
  const hasCode = existingCodes.some(isVatReliefDiscountCode);

  if (needsCode && !hasCode) {
    return cart.updateDiscountCodes([
      ...existingCodes,
      VAT_RELIEF_DISCOUNT_CODE,
    ]);
  }

  if (!needsCode && hasCode) {
    return cart.updateDiscountCodes(
      existingCodes.filter((code) => !isVatReliefDiscountCode(code)),
    );
  }

  return null;
}

/**
 * Apply VAT relief discount sync after a cart mutation and return the latest cart.
 */
export async function finalizeCartWithVatRelief<
  T extends {cart: VatReliefCart | null},
>(cart: CartDiscountSyncHandler, result: T): Promise<T> {
  if (!result.cart) return result;

  const syncResult = await syncVatReliefDiscount(cart, result.cart);
  if (syncResult?.cart) {
    return {...result, cart: syncResult.cart};
  }

  return result;
}
