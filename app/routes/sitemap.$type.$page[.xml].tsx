import type {Route} from './+types/sitemap.$type.$page[.xml]';
import {getSitemap} from '@shopify/hydrogen';
import {canonicalSitemapRequest} from '~/lib/seo';
import {
  buildSitemapResourceUrl,
  filterSitemapXml,
  shouldIncludeSitemapResource,
} from '~/lib/sitemap-utils';

export async function loader({
  request,
  params,
  context: {storefront},
}: Route.LoaderArgs) {
  const response = await getSitemap({
    storefront,
    request: canonicalSitemapRequest(request),
    params,
    locales: [],
    getLink: ({type, handle, locale}) => {
      if (!handle || !shouldIncludeSitemapResource(type, handle)) {
        // Hydrogen still emits a <url>; filterSitemapXml strips these.
        return buildSitemapResourceUrl(type, `__excluded__${handle ?? ''}`, locale);
      }
      return buildSitemapResourceUrl(type, handle, locale);
    },
  });

  const xml = filterSitemapXml(await response.text());

  return new Response(xml, {
    status: response.status,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}
