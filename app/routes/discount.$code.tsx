import {redirect} from 'react-router';
import type {Route} from './+types/discount.$code';
import {getCartErrors, safeStorefrontRedirect} from '~/lib/cart-feedback';

/**
 * Automatically applies a discount found on the url
 * If a cart exists it's updated with the discount, otherwise a cart is created with the discount already applied
 *
 * @example
 * Example path applying a discount and optional redirecting (defaults to the home page)
 * ```js
 * /discount/FREESHIPPING?redirect=/products
 *
 * ```
 */
export async function loader({request, context, params}: Route.LoaderArgs) {
  const {cart} = context;
  const {code} = params;

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const redirectParam =
    safeStorefrontRedirect(
      searchParams.get('redirect') || searchParams.get('return_to'),
      request.url,
    ) || '/';

  searchParams.delete('redirect');
  searchParams.delete('return_to');

  const destination = new URL(redirectParam, request.url);
  searchParams.forEach((value, key) =>
    destination.searchParams.set(key, value),
  );
  const redirectUrl = `${destination.pathname}${destination.search}${destination.hash}`;

  if (!code) {
    return redirect(redirectUrl);
  }

  const result = await cart.updateDiscountCodes([code]);
  if (!result.cart || getCartErrors(result).length) {
    throw new Response(
      'We could not apply this discount. Please try again from your basket.',
      {status: 503},
    );
  }
  const headers = cart.setCartId(result.cart.id);

  // Using set-cookie on a 303 redirect will not work if the domain origin have port number (:3000)
  // If there is no cart id and a new cart id is created in the progress, it will not be set in the cookie
  // on localhost:3000
  return redirect(redirectUrl, {
    status: 303,
    headers,
  });
}
