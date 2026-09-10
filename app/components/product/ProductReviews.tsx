import {useFetcher} from 'react-router';
import type {loader} from '~/routes/api.reviews';
import {
  JudgemeReviewWidget,
  useJudgemeConfig,
} from '~/components/reviews/Judgeme';
import {ReviewCard} from '~/components/reviews/ReviewCard';
import {StarRating} from '~/components/reviews/StarRating';
import type {CustomerReview, ReviewSummary} from '~/lib/reviews';

const PAGE_SIZE = 8;

type ProductReviewsProps = {
  productHandle: string;
  productId?: string;
  productTitle?: string;
  initialReviews: CustomerReview[];
  summary: ReviewSummary;
};

export function ProductReviews({
  productHandle,
  productId,
  productTitle,
  initialReviews,
  summary,
}: ProductReviewsProps) {
  const judgeme = useJudgemeConfig();
  const fetcher = useFetcher<typeof loader>();
  const visible = fetcher.data?.handle === productHandle
    ? fetcher.data.reviews
    : initialReviews;

  if (judgeme && productId) {
    return (
      <section
        aria-label={`${productTitle ?? 'Product'} reviews`}
        className="mt-12 border-t border-border pt-10 md:mt-14 md:pt-12"
        id="reviews"
      >
        <div className="mb-6">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-navy/45">
            Customer reviews
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.02em] text-navy md:text-[1.75rem]">
            What owners say
          </h2>
        </div>
        <div className="min-h-[12rem]">
          <JudgemeReviewWidget productId={productId} />
        </div>
      </section>
    );
  }

  if (summary.count === 0) return null;

  const hasMore = visible.length < summary.count;

  return (
    <section
      aria-label={`${productTitle ?? 'Product'} reviews`}
      className="mt-12 border-t border-border pt-10 md:mt-14 md:pt-12"
      id="reviews"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-navy/45">
            Customer reviews
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.02em] text-navy md:text-[1.75rem]">
            What owners say
          </h2>
        </div>
        <div className="sm:text-right">
          <div className="flex items-center gap-2 sm:justify-end">
            <StarRating rating={summary.average} size="md" />
            <span className="font-display text-xl font-semibold text-navy">
              {summary.averageDisplay}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-navy/70">
            {summary.count.toLocaleString('en-GB')} reviews
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-x-10">
        {visible.map((review: CustomerReview) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {hasMore ? (
        <div className="mt-8 text-center">
          <button
            className="inline-flex h-11 items-center justify-center rounded-lg border border-navy/20 bg-white px-5 text-sm font-semibold text-navy transition-colors hover:border-navy/40 hover:bg-navy/[0.02]"
            disabled={fetcher.state !== 'idle'}
            onClick={() => {
              const query = new URLSearchParams({
                product: productHandle,
                limit: String(visible.length + PAGE_SIZE),
              });
              void fetcher.load(`/api/reviews?${query}`);
            }}
            type="button"
          >
            {fetcher.state === 'idle' ? 'Show more reviews' : 'Loading reviews…'}
          </button>
        </div>
      ) : null}
    </section>
  );
}
