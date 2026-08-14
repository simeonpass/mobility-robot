import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {syncVatExemptionCustomersFromCart} from '~/lib/shopify-admin-vat';

type CartLike = {
  lines?: {
    nodes?: Array<{
      attributes?: Array<{key: string; value?: string | null}> | null;
    }> | null;
  } | null;
} | null;

type CartHandler = {
  updateBuyerIdentity: (
    buyerIdentity: Record<string, unknown>,
  ) => Promise<CartQueryDataReturn>;
};

/**
 * Before Shopify checkout: ensure tax-exempt customer records exist and lock
 * the cart buyer email (+ GB market) to the VAT declaration email.
 *
 * On non-Plus stores, `taxExempt` alone is unreliable for guests — keep the
 * VAT Relief (exact) automatic discount Active as the primary checkout mechanism.
 * This sync still helps when the customer is recognized, and prefills email.
 */
export async function prepareVatReliefForCheckout(
  env: Env,
  cart: CartHandler,
  cartData: CartLike,
): Promise<{
  cart: CartQueryDataReturn['cart'] | null;
  errors: CartQueryDataReturn['errors'];
  warnings: CartQueryDataReturn['warnings'];
  vatEmail: string | null;
}> {
  const lines = cartData?.lines?.nodes ?? [];
  if (!lines.length) {
    return {cart: null, errors: undefined, warnings: undefined, vatEmail: null};
  }

  await syncVatExemptionCustomersFromCart(env, lines);

  const vatEmail =
    lines
      .map((line) =>
        line.attributes?.find((attr) => attr.key === 'VAT Declaration Email')
          ?.value,
      )
      .find((value) => Boolean(value?.trim()))
      ?.trim()
      .toLowerCase() ?? null;

  if (!vatEmail) {
    return {cart: null, errors: undefined, warnings: undefined, vatEmail: null};
  }

  try {
    const identityResult = await cart.updateBuyerIdentity({
      email: vatEmail,
      countryCode: 'GB',
    });
    return {
      cart: identityResult?.cart ?? null,
      errors: identityResult?.errors,
      warnings: identityResult?.warnings,
      vatEmail,
    };
  } catch (error) {
    console.error('VAT buyer identity update failed', error);
    return {cart: null, errors: undefined, warnings: undefined, vatEmail};
  }
}
