import {useLoaderData, data, type HeadersFunction} from 'react-router';
import type {Route} from './+types/cart';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {CartMain} from '~/components/CartMain';
import {
  finalizeCartWithVatRelief,
  syncVatReliefDiscount,
} from '~/lib/vat-relief-discount';
import {syncVatExemptionCustomersFromCart} from '~/lib/shopify-admin-vat';
import {NOINDEX_HEADERS, noindexMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  noindexMeta({
    title: 'Your Cart',
    description: 'Review your XSTO wheelchair order before checkout.',
    path: '/cart',
  });

export const headers: HeadersFunction = () => NOINDEX_HEADERS;

export async function action({request, context}: Route.ActionArgs) {
  const {cart, env} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await finalizeCartWithVatRelief(
        cart,
        await cart.addLines(inputs.lines),
      );
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await finalizeCartWithVatRelief(
        cart,
        await cart.updateLines(inputs.lines),
      );
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await finalizeCartWithVatRelief(
        cart,
        await cart.removeLines(inputs.lineIds),
      );
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await finalizeCartWithVatRelief(
        cart,
        await cart.updateDiscountCodes(discountCodes),
      );
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesAdd: {
      const formGiftCardCode = inputs.giftCardCode;

      const giftCardCodes = (
        formGiftCardCode ? [formGiftCardCode] : []
      ) as string[];

      result = await cart.addGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const appliedGiftCardIds = inputs.giftCardCodes as string[];
      result = await cart.removeGiftCardCodes(appliedGiftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  if (cartResult?.lines?.nodes?.length) {
    await syncVatExemptionCustomersFromCart(env, cartResult.lines.nodes);
  }

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  await syncVatReliefDiscount(cart);
  return await cart.get();
}

export default function Cart() {
  const cart = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold text-foreground">Your cart</h1>
      <CartMain layout="page" cart={cart} />
    </div>
  );
}
