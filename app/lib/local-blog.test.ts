import {describe, expect, it} from 'vitest';
import {
  filterLocalBlogPosts,
  getAllLocalBlogPosts,
  getLocalBlogPost,
  getRelatedLocalBlogPosts,
} from './local-blog';

describe('local-blog', () => {
  it('loads exported and new SEO posts', () => {
    const posts = getAllLocalBlogPosts();
    expect(posts.length).toBeGreaterThanOrEqual(14);
    expect(getLocalBlogPost('vat-relief-explained')?.title).toMatch(/VAT Relief/i);
    expect(getLocalBlogPost('foldable-power-wheelchair-uk-guide')).toBeTruthy();
    expect(getLocalBlogPost('m4-vs-m4-pro-comparison')).toBeTruthy();
    expect(getLocalBlogPost('lightweight-carbon-fibre-wheelchair-ezgo2')).toBeTruthy();
  });

  it('sorts newest first and filters by category', () => {
    const posts = getAllLocalBlogPosts();
    expect(posts[0].publishedAt >= posts[1].publishedAt).toBe(true);
    const guides = filterLocalBlogPosts('product-guides');
    expect(guides.every((post) => post.category === 'product-guides')).toBe(true);
  });

  it('returns related posts excluding the current slug', () => {
    const related = getRelatedLocalBlogPosts('vat-relief-explained', 3);
    expect(related).toHaveLength(3);
    expect(related.every((post) => post.slug !== 'vat-relief-explained')).toBe(
      true,
    );
  });
});
