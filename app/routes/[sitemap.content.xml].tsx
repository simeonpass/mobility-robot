import type {Route} from './+types/[sitemap.content.xml]';
import {getAllLocalBlogPosts} from '~/lib/local-blog';
import {STATIC_SITEMAP_ROUTES} from '~/lib/static-routes';
import {SITE_URL} from '~/lib/seo';

export async function loader(_args: Route.LoaderArgs) {
  const blogArticles = getAllLocalBlogPosts().map((post) => ({
    handle: post.slug,
    publishedAt: post.publishedAt,
  }));

  const urls: Array<{
    loc: string;
    changefreq: string;
    priority: number;
    lastmod?: string;
  }> = [
    ...STATIC_SITEMAP_ROUTES.map((entry) => ({
      loc: `${SITE_URL}${entry.path}`,
      changefreq: entry.changefreq,
      priority: entry.priority,
    })),
    ...blogArticles.map((article) => ({
      loc: `${SITE_URL}/blog/${article.handle}`,
      changefreq: 'monthly',
      priority: 0.6,
      lastmod: article.publishedAt,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod.split('T')[0]}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Sitemap-Canonical-Origin': SITE_URL,
    },
  });
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
