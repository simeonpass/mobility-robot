import {marked} from 'marked';
import {BLOG_POSTS, type BlogPostSource} from '~/data/blog-posts';

export type BlogCategory =
  | 'product-guides'
  | 'accessibility'
  | 'mobility-tips'
  | 'lifestyle';

export type LocalBlogPost = BlogPostSource & {
  contentHtml: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  'product-guides': 'Product Guides',
  accessibility: 'Accessibility',
  'mobility-tips': 'Mobility Tips',
  lifestyle: 'Lifestyle',
};

marked.setOptions({
  gfm: true,
  breaks: false,
});

let cachedPosts: LocalBlogPost[] | null = null;

function toPost(source: BlogPostSource): LocalBlogPost {
  return {
    ...source,
    categoryLabel:
      source.categoryLabel ||
      CATEGORY_LABELS[source.category] ||
      'Guides',
    contentHtml: marked.parse(source.contentMarkdown, {
      async: false,
    }) as string,
  };
}

export function getAllLocalBlogPosts(): LocalBlogPost[] {
  if (cachedPosts) return cachedPosts;
  cachedPosts = [...BLOG_POSTS]
    .map(toPost)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return cachedPosts;
}

export function getLocalBlogPost(slug: string): LocalBlogPost | undefined {
  return getAllLocalBlogPosts().find((post) => post.slug === slug);
}

export function getRelatedLocalBlogPosts(
  slug: string,
  limit = 3,
): LocalBlogPost[] {
  const current = getLocalBlogPost(slug);
  const all = getAllLocalBlogPosts().filter((post) => post.slug !== slug);
  if (!current) return all.slice(0, limit);

  const sameCategory = all.filter((post) => post.category === current.category);
  const rest = all.filter((post) => post.category !== current.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

export function getLocalBlogCategories(): Array<{
  id: string;
  label: string;
  count: number;
}> {
  const counts = new Map<string, {label: string; count: number}>();
  for (const post of getAllLocalBlogPosts()) {
    const existing = counts.get(post.category);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(post.category, {
        label: post.categoryLabel,
        count: 1,
      });
    }
  }
  return [...counts.entries()]
    .map(([id, value]) => ({id, label: value.label, count: value.count}))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function filterLocalBlogPosts(
  category?: string | null,
): LocalBlogPost[] {
  const posts = getAllLocalBlogPosts();
  if (!category || category === 'all') return posts;
  return posts.filter((post) => post.category === category);
}
