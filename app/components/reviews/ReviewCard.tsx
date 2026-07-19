import type {CustomerReview} from '~/lib/reviews';
import {formatReviewDate, reviewAuthorInitials} from '~/lib/reviews';
import {StarRating} from '~/components/reviews/StarRating';

type ReviewCardProps = {
  review: CustomerReview;
  compact?: boolean;
};

export function ReviewCard({review, compact = false}: ReviewCardProps) {
  return (
    <article
      className={[
        'flex h-full flex-col border-t border-border/80 pt-5',
        compact ? '' : 'md:pt-6',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy/[0.06] text-[0.6875rem] font-semibold tracking-wide text-navy"
        >
          {reviewAuthorInitials(review.author)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-sm font-semibold text-navy">{review.author}</p>
            <StarRating rating={review.rating} />
          </div>
          {review.title ? (
            <h3 className="mt-1.5 text-[0.9375rem] font-medium leading-snug text-navy">
              {review.title}
            </h3>
          ) : null}
          <p
            className={[
              'mt-1.5 text-sm leading-relaxed text-navy/70',
              compact ? 'line-clamp-4' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {review.body}
          </p>
          <p className="mt-2 text-xs text-navy/40">
            {formatReviewDate(review.createdAt)}
            {review.productName ? ` · ${review.productName}` : ''}
          </p>
        </div>
      </div>
    </article>
  );
}
