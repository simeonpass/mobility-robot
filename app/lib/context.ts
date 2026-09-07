import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {requestCountry, storeCountry} from '~/lib/market';

// Define the additional context object
const additionalContext = {
  // Additional context for custom properties, CMS clients, 3P SDKs, etc.
  // These will be available as both context.propertyName and context.get(propertyContext)
  // Example of complex objects that could be added:
  // cms: await createCMSClient(env),
  // reviews: await createReviewsClient(env),
} as const;

// Automatically augment HydrogenAdditionalContext with the additional context type
type AdditionalContextType = typeof additionalContext;

declare global {
  interface HydrogenAdditionalContext extends AdditionalContextType {}

  // Augment HydrogenCustomCartFragment with the codegen'd cart fragment type so
  // that context.cart.get() and all cart mutations return the extended cart type.
  interface HydrogenCustomCartFragment extends CartApiQueryFragment {}
}

/**
 * Creates Hydrogen context for React Router 7.9.x
 * Returns HydrogenRouterContextProvider with hybrid access patterns
 * */
export async function createHydrogenRouterContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext,
) {
  /**
   * Open a cache instance in the worker and a custom session instance.
   */
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session] = await Promise.all([
    caches.open('hydrogen'),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  const url = new URL(request.url);
  const country = requestCountry(url, session.get('marketCountry'));
  const requestedCountry = storeCountry(url.searchParams.get('country'));
  const isFeed = url.pathname.startsWith('/feeds/');
  if (!isFeed && requestedCountry && session.get('marketCountry') !== country) {
    session.set('marketCountry', country);
  }

  const hydrogenContext = createHydrogenContext(
    {
      env,
      request,
      cache,
      waitUntil,
      session,
      i18n: {language: 'EN', country},
      buyerIdentity: {countryCode: country},
      cart: {
        queryFragment: CART_QUERY_FRAGMENT,
      },
    },
    additionalContext,
  );

  // A Google market link can also be opened by someone with an existing cart.
  // Update it before loaders read totals; new carts use buyerIdentity above.
  if (!isFeed && requestedCountry && hydrogenContext.cart.getCartId()) {
    const cart = await hydrogenContext.cart.get();
    if (cart && cart.buyerIdentity.countryCode !== country) {
      const result = await hydrogenContext.cart.updateBuyerIdentity({
        countryCode: country,
      });
      if (result.errors?.length || result.userErrors?.length) {
        throw new Error('Unable to update cart market');
      }
    }
  }

  return hydrogenContext;
}
