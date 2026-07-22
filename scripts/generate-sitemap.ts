#!/usr/bin/env node
/**
 * Generates a supplemental sitemap XML for static content routes and blog articles.
 * Run: npx tsx scripts/generate-sitemap.ts
 *
 * Output: public/sitemap-content.xml (for reference / CI validation)
 */

import {readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const SITE_URL = 'https://mobilityrobot.co.uk';

const STATIC_ROUTES = [
  {path: '/', changefreq: 'weekly', priority: 1.0},
  {path: '/stockists', changefreq: 'monthly', priority: 0.8},
  {path: '/faq', changefreq: 'monthly', priority: 0.8},
  {path: '/warranty', changefreq: 'monthly', priority: 0.7},
  {path: '/delivery', changefreq: 'monthly', priority: 0.7},
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

function localBlogPaths() {
  const dir = resolve(process.cwd(), 'app/content/blog');
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => {
      const raw = readFileSync(resolve(dir, name), 'utf8');
      const slugMatch = raw.match(/^slug:\s*["']?([^"'\n]+)["']?/m);
      const slug = slugMatch?.[1]?.trim() || name.replace(/\.md$/, '');
      return `/blog/${slug}`;
    });
}

async function main() {
  const blogPaths = localBlogPaths();
  const urls = [
    ...STATIC_ROUTES.map((route) => ({
      ...route,
      loc: `${SITE_URL}${route.path}`,
    })),
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
