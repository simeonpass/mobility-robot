#!/usr/bin/env node
/**
 * Regenerates app/data/blog-posts.ts from app/content/blog/*.md
 * Run: node scripts/generate-blog-posts.mjs
 */
import {readdirSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {resolve} from 'node:path';

function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return {data: {}, body: raw};
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key === 'tags') {
      try {
        data.tags = JSON.parse(value.replace(/'/g, '"'));
      } catch {
        data.tags = value
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((part) => part.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      }
      continue;
    }
    data[key] = value;
  }
  return {data, body: match[2].trim()};
}

const dir = resolve(process.cwd(), 'app/content/blog');
const posts = readdirSync(dir)
  .filter((name) => name.endsWith('.md'))
  .map((name) => {
    const raw = readFileSync(resolve(dir, name), 'utf8');
    const {data, body} = parseFrontMatter(raw);
    const markdown = body.replace(/^#\s+.+\n+/, '');
    const slug = data.slug || name.replace(/\.md$/, '');
    return {
      slug,
      title: data.title || slug,
      excerpt: data.excerpt || '',
      author: data.author || 'XSTO Team',
      publishedAt: data.publishedAt || '2026-01-01',
      readTime: Number(data.readTime || 5),
      category: data.category || 'product-guides',
      categoryLabel: data.categoryLabel || 'Product Guides',
      featuredImage: data.featuredImage || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      contentMarkdown: markdown,
    };
  })
  .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

const outDir = resolve(process.cwd(), 'app/data');
mkdirSync(outDir, {recursive: true});
const outPath = resolve(outDir, 'blog-posts.ts');
const file = `export type BlogPostSource = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readTime: number;
  category: string;
  categoryLabel: string;
  featuredImage: string;
  tags: string[];
  contentMarkdown: string;
};

export const BLOG_POSTS = ${JSON.stringify(posts, null, 2)} satisfies BlogPostSource[];
`;
writeFileSync(outPath, file);
console.log(`Wrote ${posts.length} posts to ${outPath}`);
