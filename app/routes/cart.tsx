import {useLoaderData, data, type HeadersFunction} from 'react-router';
import type {Route} from './+types/cart';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {CartMain} from '~/components/CartMain';
import {syncVatExemptionCustomersFromCart} from '~/lib/shopify-admin-vat';
import {NOINDEX_HEADERS, noindexMeta} from '~/lib/seo';
import {getCartErrors, safeStorefrontRedirect} from '~/lib/cart-feedback';

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
    return data(
      {errors: [{message: 'Choose a basket action and try again.'}]},
      {status: 400},
    );
  }

  let status = 200;
  let result: CartQueryDataReturn;

  try {
    switch (action) {
      case CartForm.ACTIONS.LinesAdd:
        result = await cart.addLines(inputs.lines);
        break;
      case CartForm.ACTIONS.LinesUpdate:
        result = await cart.updateLines(inputs.lines);
        break;
      case CartForm.ACTIONS.LinesRemove:
        result = await cart.removeLines(inputs.lineIds);
        break;
      case CartForm.ACTIONS.DiscountCodesUpdate: {
        const formDiscountCode = inputs.discountCode;

        const discountCodes = (
          formDiscountCode ? [formDiscountCode] : []
        ) as string[];

        discountCodes.push(...(inputs.discountCodes ?? []));

        result = await cart.updateDiscountCodes(discountCodes);
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
        return data(
          {action, errors: [{message: 'This basket action is not supported.'}]},
          {status: 400},
        );
    }
  } catch (error) {
    console.error('Cart update failed', error);
    return data(
      {
        action,
        errors: [
          {message: 'We could not update your basket. Please try again.'},
        ],
      },
      {status: 503},
    );
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  let {cart: cartResult, warnings} = result;
  let errors = getCartErrors(result);

  if (cartResult?.lines?.nodes?.length) {
    await syncVatExemptionCustomersFromCart(env, cartResult.lines.nodes);

    // Tax-exempt checkout only applies when the buyer email matches the
    // tax-exempt customer record — prefill cart buyer identity from the
    // VAT declaration.
    const vatEmail = cartResult.lines.nodes
      .map(
        (line) =>
          line.attributes?.find((attr) => attr.key === 'VAT Declaration Email')
            ?.value,
      )
      .find((value) => Boolean(value?.trim()));
    if (vatEmail?.trim()) {
      try {
        const identityResult = await cart.updateBuyerIdentity({
          email: vatEmail.trim().toLowerCase(),
        });
        if (identityResult?.cart) {
          cartResult = identityResult.cart;
        }
        errors = [...errors, ...getCartErrors(identityResult)];
        warnings = [...(warnings ?? []), ...(identityResult.warnings ?? [])];
      } catch (error) {
        console.error('VAT buyer identity update failed', error);
        errors.push({
          message:
            'Your basket was updated, but we could not apply your declaration email. Please retry your VAT declaration before checkout.',
        });
      }
    }
  }

  const redirectTo = safeStorefrontRedirect(
    formData.get('redirectTo'),
    request.url,
  );
  if (redirectTo && cartResult && !errors.length && !warnings?.length) {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      action,
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
