import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';

function applySecurityHeaders(headers: Headers) {
  headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  );
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self)',
  );
}

function applyCacheHeaders(pathname: string, headers: Headers) {
  if (
    pathname.startsWith('/build/') ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/images/')
  ) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return;
  }

  if (pathname === '/robots.txt' || pathname.endsWith('.xml')) {
    headers.set('Cache-Control', 'public, max-age=3600');
    return;
  }

  headers.set(
    'Cache-Control',
    'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
  );
}

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    scriptSrc: [
      "'self'",
      'https://www.googletagmanager.com',
      'https://cdn.shopify.com',
    ],
    connectSrc: [
      'https://nominatim.openstreetmap.org',
      'https://www.google-analytics.com',
      'https://region1.google-analytics.com',
      'https://cdn.shopify.com',
      'https://shop.app',
    ],
    imgSrc: [
      "'self'",
      'data:',
      'https://cdn.shopify.com',
      'https://i.ytimg.com',
      'https://img.youtube.com',
      'https://tile.openstreetmap.org',
      'https://*.tile.openstreetmap.org',
      'https://pub-b6593f4aaa3143c4b018c61c953c56f7.r2.dev',
    ],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    frameSrc: [
      "'self'",
      'https://www.youtube.com',
      'https://www.youtube-nocookie.com',
      'https://www.openstreetmap.org',
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  const pathname = new URL(request.url).pathname;

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);
  applySecurityHeaders(responseHeaders);
  applyCacheHeaders(pathname, responseHeaders);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
