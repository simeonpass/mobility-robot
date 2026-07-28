import type {Route} from './+types/[sitemap.xml]';
import {getSitemapIndex} from '@shopify/hydrogen';
import {canonicalSitemapRequest} from '~/lib/seo';
import {SITEMAP_INDEX_TYPES} from '~/lib/sitemap-utils';

export async function loader({
  request,
  context: {storefront},
}: Route.LoaderArgs) {
  const response = await getSitemapIndex({
    storefront,
    request: canonicalSitemapRequest(request),
    // Omit pages/articles/blogs — those Hydrogen paths 301 or 404 after the
    // xsto.co.uk → mobilityrobot.co.uk cutover and inflate GSC "Page with redirect".
    // Canonical static + /blog URLs live in sitemap.content.xml instead.
    types: [...SITEMAP_INDEX_TYPES],
    customChildSitemaps: ['/sitemap.content.xml'],
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}
