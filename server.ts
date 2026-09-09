import * as serverBuild from 'virtual:react-router/server-build';
import {createRequestHandler, storefrontRedirect} from '@shopify/hydrogen';
import {createHydrogenRouterContext} from '~/lib/context';
import {SITE_URL} from '~/lib/const';

/**
 * Export a fetch handler in module format.
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    executionContext: ExecutionContext,
  ): Promise<Response> {
    try {
      const hydrogenContext = await createHydrogenRouterContext(
        request,
        env,
        executionContext,
      );

      /**
       * Create a Hydrogen request handler that internally
       * delegates to React Router for routing and rendering.
       */
      const handleRequest = createRequestHandler({
        build: serverBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => hydrogenContext,
      });

      const response = await handleRequest(request);

      if (hydrogenContext.session.isPending) {
        response.headers.append(
          'Set-Cookie',
          await hydrogenContext.session.commit(),
        );
      }

      // Session-selected market prices must not be shared across visitors.
      if (
        !new URL(request.url).pathname.startsWith('/feeds/') &&
        hydrogenContext.session.get('marketCountry')
      ) {
        response.headers.set('Cache-Control', 'private, no-store');
      }

      // Review and local hosts should not compete with the public storefront.
      if (new URL(request.url).hostname !== new URL(SITE_URL).hostname) {
        response.headers.set('X-Robots-Tag', 'noindex, nofollow');
      }

      if (response.status === 404) {
        /**
         * Check for redirects only when there's a 404 from the app.
         * If the redirect doesn't exist, then `storefrontRedirect`
         * will pass through the 404 response.
         */
        return storefrontRedirect({
          request,
          response,
          storefront: hydrogenContext.storefront,
        });
      }

      return response;
    } catch (error) {
      console.error(error);
      return new Response('An unexpected error occurred', {status: 500});
    }
  },
};
