import {describe, expect, it} from 'vitest';
import {
  getReviewsForProduct,
  summarizeReviews,
  resolveReviewProductSlot,
} from '~/lib/reviews';

describe('reviews', () => {
  it('maps Shopify M4 handle to the review catalogue', () => {
    expect(resolveReviewProductSlot('buy-robot-wheelchair')).toBe('xsto-m4');
    expect(resolveReviewProductSlot('xsto-m4')).toBe('xsto-m4');
  });

  it('returns M4 reviews for the live Shopify handle', () => {
    const reviews = getReviewsForProduct('buy-robot-wheelchair');
    expect(reviews.length).toBeGreaterThan(300);
    expect(reviews.every((review) => review.productSlug === 'xsto-m4')).toBe(
      true,
    );
  });

  it('summarises ratings', () => {
    const summary = summarizeReviews(getReviewsForProduct('xsto-m4'));
    expect(summary.count).toBe(369);
    expect(summary.average).toBeGreaterThan(4.5);
    expect(summary.averageDisplay).toMatch(/^\d\.\d$/);
  });

  it('returns no reviews for products without a catalogue yet', () => {
    expect(getReviewsForProduct('xsto-m4-pro')).toEqual([]);
  });
});
