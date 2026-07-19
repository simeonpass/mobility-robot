import type {Route} from './+types/sitemap.$type.$page[.xml]';
import {getSitemap} from '@shopify/hydrogen';
import {SITE_URL, canonicalSitemapRequest} from '~/lib/seo';

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
      if (!locale) return `${SITE_URL}/${type}/${handle}`;
      return `${SITE_URL}/${locale}/${type}/${handle}`;
    },
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}
