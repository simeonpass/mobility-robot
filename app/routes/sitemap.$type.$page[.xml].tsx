import type {Route} from './+types/sitemap.$type.$page[.xml]';
import {getSitemap} from '@shopify/hydrogen';
import {isUkUnavailableProductHandle} from '~/lib/homepage-data';
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

  if (params.type !== 'products') {
    return response;
  }

  const xml = await response.text();
  const filtered = xml.replace(/<url>[\s\S]*?<\/url>/g, (block) => {
    const match = block.match(/\/products\/([^/<"\s]+)/);
    if (match && isUkUnavailableProductHandle(match[1])) {
      return '';
    }
    return block;
  });

  return new Response(filtered, {
    status: response.status,
    headers: response.headers,
  });
}
