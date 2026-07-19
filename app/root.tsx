import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type {Route} from './+types/root';
import favicon from '~/assets/favicon.png';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import {PageLayout} from './components/PageLayout';
import {applyReferralDiscount} from '~/lib/referral-discount';
import {legacyRedirect} from '~/lib/redirects';
import {ConsentProvider} from '~/components/ConsentBanner';
import {VatReliefProvider} from '~/components/vat-relief/VatReliefProvider';
import {Ga4Tracker} from '~/components/Ga4Tracker';
import {ShopChat} from '~/components/ShopChat';
import {JsonLd} from '~/components/content/PageShell';
import {sitewideJsonLdGraph} from '~/lib/seo';
import {DEFAULT_SHOP_ID, HTML_LANG} from '~/lib/const';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap',
    },
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/png', href: favicon},
    {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
    {rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png'},
  ];
}

export async function loader(args: Route.LoaderArgs) {
  legacyRedirect(args.request);

  const deferredData = loadDeferredData(args);
  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ga4Id: env.PUBLIC_GA4_ID ?? null,
    shopId: env.PUBLIC_SHOP_ID || DEFAULT_SHOP_ID,
    shopDomain: env.PUBLIC_STORE_DOMAIN || null,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

function loadDeferredData({context, request}: Route.LoaderArgs) {
  const {customerAccount, cart} = context;

  return {
    cart: (async () => {
      await applyReferralDiscount(request, cart);
      return cart.get();
    })(),
    isLoggedIn: customerAccount.isLoggedIn(),
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();

  return (
    <html lang={HTML_LANG}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <JsonLd data={sitewideJsonLdGraph(true)} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <ConsentProvider ga4Id={data.ga4Id}>
        <VatReliefProvider>
          <Ga4Tracker ga4Id={data.ga4Id} />
          <ShopChat shopDomain={data.shopDomain} shopId={data.shopId} />
          <PageLayout {...data}>
            <Outlet />
          </PageLayout>
        </VatReliefProvider>
      </ConsentProvider>
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="xsto-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {errorStatus}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-foreground">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        We couldn&apos;t load this page. Please try again or return to the homepage.
      </p>
      {errorMessage && errorStatus >= 500 ? (
        <p className="mt-4 max-w-lg text-xs text-muted-foreground">{errorMessage}</p>
      ) : null}
      <a className="btn-atc mt-8" href="/">
        Back to homepage
      </a>
    </div>
  );
}
