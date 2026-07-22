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
    expect(posts.length).toBeGreaterThanOrEqual(18);
    expect(getLocalBlogPost('vat-relief-explained')?.title).toMatch(/VAT Relief/i);
    expect(getLocalBlogPost('foldable-power-wheelchair-uk-guide')).toBeTruthy();
    expect(getLocalBlogPost('m4-vs-m4-pro-comparison')).toBeTruthy();
    expect(getLocalBlogPost('lightweight-carbon-fibre-wheelchair-ezgo2')).toBeTruthy();
    expect(getLocalBlogPost('x12-stair-climbing-wheelchair-uk-guide')).toBeTruthy();
    expect(
      getLocalBlogPost('self-balancing-vs-traditional-power-wheelchair'),
    ).toBeTruthy();
    expect(getLocalBlogPost('power-wheelchair-for-elderly-uk')).toBeTruthy();
    expect(getLocalBlogPost('flying-with-power-wheelchair-uk')).toBeTruthy();
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
