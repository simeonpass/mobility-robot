import type {Route} from './+types/[sitemap.xml]';
import {getSitemapIndex} from '@shopify/hydrogen';
import {canonicalSitemapRequest} from '~/lib/seo';

export async function loader({
  request,
  context: {storefront},
}: Route.LoaderArgs) {
  const response = await getSitemapIndex({
    storefront,
    request: canonicalSitemapRequest(request),
    // Blog articles use /blog/:handle in the custom content sitemap. There
    // are no /articles or metaobject pages in this storefront.
    types: ['products', 'collections', 'pages'],
    customChildSitemaps: ['/sitemap.content.xml'],
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}
