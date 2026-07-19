#!/usr/bin/env node
/**
 * Generates a supplemental sitemap XML for static content routes and blog articles.
 * Run: npx tsx scripts/generate-sitemap.ts
 *
 * Output: public/sitemap-content.xml (for reference / CI validation)
 */

import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const SITE_URL = 'https://mobilityrobot.co.uk';

const STATIC_ROUTES = [
  {path: '/', changefreq: 'weekly', priority: 1.0},
  {path: '/stockists', changefreq: 'monthly', priority: 0.8},
  {path: '/faq', changefreq: 'monthly', priority: 0.8},
  {path: '/warranty', changefreq: 'monthly', priority: 0.7},
  {path: '/returns', changefreq: 'monthly', priority: 0.7},
  {path: '/privacy', changefreq: 'yearly', priority: 0.5},
  {path: '/terms', changefreq: 'yearly', priority: 0.5},
  {path: '/about', changefreq: 'monthly', priority: 0.7},
  {path: '/contact', changefreq: 'monthly', priority: 0.7},
  {path: '/demo', changefreq: 'monthly', priority: 0.8},
  {path: '/quote', changefreq: 'monthly', priority: 0.8},
  {path: '/vat-relief', changefreq: 'monthly', priority: 0.7},
  {path: '/blog', changefreq: 'weekly', priority: 0.7},
  {path: '/collections', changefreq: 'weekly', priority: 0.6},
  {path: '/collections/all', changefreq: 'weekly', priority: 0.8},
  {path: '/collections/accessories', changefreq: 'weekly', priority: 0.7},
];

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function fetchBlogArticlePaths(): Promise<string[]> {
  const token = process.env.PUBLIC_STOREFRONT_API_TOKEN;
  const storeDomain =
    process.env.PUBLIC_STORE_DOMAIN || 'f7vjea-hq.myshopify.com';

  if (!token) {
    console.warn('PUBLIC_STOREFRONT_API_TOKEN not set — skipping blog URLs');
    return [];
  }

  const response = await fetch(
    `https://${storeDomain}/api/2025-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({
        query: `query BlogArticles($blogHandle: String!) {
          blog(handle: $blogHandle) {
            articles(first: 250) {
              nodes { handle }
            }
          }
        }`,
        variables: {blogHandle: 'news'},
      }),
    },
  );

  if (!response.ok) return [];

  const json = (await response.json()) as {
    data?: {blog?: {articles?: {nodes?: Array<{handle: string}>}}};
  };

  return (
    json.data?.blog?.articles?.nodes?.map((node) => `/blog/${node.handle}`) ?? []
  );
}

async function main() {
  const blogPaths = await fetchBlogArticlePaths();
  const urls = [
    ...STATIC_ROUTES.map((route) => ({...route, loc: `${SITE_URL}${route.path}`})),
    ...blogPaths.map((path) => ({
      path,
      loc: `${SITE_URL}${path}`,
      changefreq: 'monthly',
      priority: 0.6,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  const outputPath = resolve(process.cwd(), 'public/sitemap-content.xml');
  writeFileSync(outputPath, xml, 'utf8');
  console.log(`Wrote ${urls.length} URLs to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
