import {SITE_URL} from '~/lib/const';
import {resolveLegacyRedirect} from '~/lib/redirects';

// These legacy articles advertise the old storefront. Keep their editorial
// content and dates, but render the current brand and direct internal links.
const MIGRATED_ARTICLES = new Set([
  'discover-the-new-xsto-m4-wheelchair',
  'how-the-xsto-m4-became-the-mobility-solution',
]);

export function migrateBlogText(handle: string, text: string): string {
  if (!MIGRATED_ARTICLES.has(handle)) return text;
  return text.replace(/\bXSTO\.co\.uk\b/gi, 'Mobility Robot');
}

export function migrateBlogHtml(handle: string, html: string): string {
  if (!MIGRATED_ARTICLES.has(handle)) return html;
  const updatedLinks = html.replace(
    /(\bhref\s*=\s*)(["'])(https?:\/\/(?:www\.)?xsto\.co\.uk(?:[/?#][^"']*)?)\2/gi,
    (_match, attribute: string, quote: string, href: string) => {
      const oldUrl = new URL(href.replaceAll('&amp;', '&'));
      const redirect = resolveLegacyRedirect(new Request(oldUrl));
      const target = new URL(redirect?.destination ?? oldUrl.pathname, SITE_URL);
      for (const [key, value] of oldUrl.searchParams) {
        if (!target.searchParams.has(key)) target.searchParams.append(key, value);
      }
      target.hash = oldUrl.hash;
      const local = `${target.pathname}${target.search}${target.hash}`
        .replaceAll('&', '&amp;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
      return `${attribute}${quote}${local}${quote}`;
    },
  );
  // Only change visible text, never image URLs or other HTML attributes.
  return updatedLinks.replace(/(^|>)([^<]+)/g, (_match, prefix: string, text: string) =>
    `${prefix}${migrateBlogText(handle, text)}`,
  );
}
