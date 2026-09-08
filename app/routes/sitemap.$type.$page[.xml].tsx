import type {Route} from './+types/sitemap.$type.$page[.xml]';
import {getSitemap} from '@shopify/hydrogen';
import {isHiddenStorefrontProductHandle} from '~/lib/homepage-data';
import {SITE_URL, canonicalSitemapRequest} from '~/lib/seo';
import {resolveLegacyRedirect} from '~/lib/redirects';

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

  const xml = await response.text();
  const filtered = xml.replace(/<url>[\s\S]*?<\/url>/g, (block) => {
    const match = block.match(/<loc>(.*?)<\/loc>/);
    if (!match) return '';
    const loc = match[1].replaceAll('&amp;', '&');
    const url = new URL(loc);
    const handle = url.pathname.match(/^\/products\/([^/]+)$/)?.[1];
    if (handle && isHiddenStorefrontProductHandle(handle)) return '';
    // Redirected page and product aliases are not canonical sitemap entries.
    if (resolveLegacyRedirect(new Request(url))) return '';
    return block;
  });

  return new Response(filtered, {
    status: response.status,
    headers: response.headers,
  });
}
