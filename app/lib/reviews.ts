import reviewsJson from '~/data/reviews.json';
import {getHomepageProductSlot} from '~/lib/homepage-data';

export type CustomerReview = {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  productSlug: string;
  productName: string;
  createdAt: string;
};

/** Lovable export slug → canonical slot used across the storefront. */
const PRODUCT_SLUG_ALIASES: Record<string, string> = {
  'xsto-m4': 'xsto-m4',
  'buy-robot-wheelchair': 'xsto-m4',
};

const ALL_REVIEWS = reviewsJson as CustomerReview[];

export function getAllReviews(): CustomerReview[] {
  return ALL_REVIEWS;
}

export function resolveReviewProductSlot(
  productSlugOrHandle: string,
): string | null {
  const slot = getHomepageProductSlot(productSlugOrHandle);
  if (slot) return slot;
  return PRODUCT_SLUG_ALIASES[productSlugOrHandle] ?? null;
}

export function getReviewsForProduct(
  productSlugOrHandle: string,
): CustomerReview[] {
  const slot = resolveReviewProductSlot(productSlugOrHandle);
  if (!slot) return [];

  return ALL_REVIEWS.filter((review) => {
    const reviewSlot =
      PRODUCT_SLUG_ALIASES[review.productSlug] ?? review.productSlug;
    return reviewSlot === slot;
  });
}

export type ReviewSummary = {
  count: number;
  average: number;
  /** Rounded to 1 decimal for display, e.g. 4.8 */
  averageDisplay: string;
};

export function summarizeReviews(reviews: CustomerReview[]): ReviewSummary {
  const count = reviews.length;
  if (count === 0) {
    return {count: 0, average: 0, averageDisplay: '0.0'};
  }

  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / count;
  return {
    count,
    average,
    averageDisplay: average.toFixed(1),
  };
}

export function getHomepageFeaturedReviews(limit = 6): CustomerReview[] {
  // Prefer recent 5-star reviews with a title for the homepage strip.
  const fiveStar = ALL_REVIEWS.filter(
    (review) => review.rating >= 5 && review.title && review.body,
  );
  return fiveStar.slice(0, limit);
}

export function formatReviewDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function reviewAuthorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`.toUpperCase();
}
