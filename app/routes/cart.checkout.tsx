import {redirect, type ActionFunctionArgs} from 'react-router';
import {withOnlineStoreChannel} from '~/lib/cart-utils';
import {prepareVatReliefForCheckout} from '~/lib/vat-relief-checkout';

/**
 * Checkout gate: sync VAT taxExempt + buyer email, then send the shopper to
 * Shopify-hosted checkout. Prefer this over a raw checkoutUrl link so relief
 * has a chance to land before tax is calculated.
 */
export async function action({context}: ActionFunctionArgs) {
  const {cart, env} = context as {
    cart: {
      get: () => Promise<{
        checkoutUrl?: string | null;
        lines?: {
          nodes?: Array<{
            attributes?: Array<{key: string; value?: string | null}> | null;
          }> | null;
        } | null;
      } | null>;
      updateBuyerIdentity: (
        buyerIdentity: Record<string, unknown>,
      ) => Promise<{
        cart?: {checkoutUrl?: string | null} | null;
        errors?: unknown;
        warnings?: unknown;
      }>;
    };
    env: Env;
  };
  const cartData = await cart.get();

  if (!cartData?.checkoutUrl) {
    throw redirect('/cart');
  }

  let checkoutUrl = cartData.checkoutUrl;

  if (cartData.lines?.nodes?.length) {
    const prepared = await prepareVatReliefForCheckout(env, cart, cartData);
    if (prepared.cart?.checkoutUrl) {
      checkoutUrl = prepared.cart.checkoutUrl;
    }
  }

  throw redirect(withOnlineStoreChannel(checkoutUrl));
}

export async function loader() {
  return redirect('/cart');
}

export default function CartCheckoutRoute() {
  return null;
}
