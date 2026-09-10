import reviewsJson from '~/data/reviews.json';
import {getHomepageProductSlot} from '~/lib/homepage-data';
import type {CustomerReview} from '~/lib/reviews';

const ALL_REVIEWS = reviewsJson as CustomerReview[];
const PRODUCT_SLUG_ALIASES: Record<string, string> = {
  'xsto-m4': 'xsto-m4',
  'buy-robot-wheelchair': 'xsto-m4',
};

export function getAllReviews(): CustomerReview[] {
  return ALL_REVIEWS;
}

export function resolveReviewProductSlot(handle: string): string | null {
  return getHomepageProductSlot(handle) ?? PRODUCT_SLUG_ALIASES[handle] ?? null;
}

export function getReviewsForProduct(handle: string): CustomerReview[] {
  const slot = resolveReviewProductSlot(handle);
  if (!slot) return [];
  return ALL_REVIEWS.filter(
    (review) => (PRODUCT_SLUG_ALIASES[review.productSlug] ?? review.productSlug) === slot,
  );
}

export function getHomepageFeaturedReviews(limit = 6): CustomerReview[] {
  return ALL_REVIEWS.filter(
    (review) => review.rating >= 5 && review.title && review.body,
  ).slice(0, limit);
}
