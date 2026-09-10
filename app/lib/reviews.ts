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
