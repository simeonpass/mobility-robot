import {Link} from 'react-router';
import {
  JudgemePreviewBadge,
  useJudgemeConfig,
} from '~/components/reviews/Judgeme';
import {StarRating} from '~/components/reviews/StarRating';
import type {ReviewSummary} from '~/lib/reviews';

type ProductReviewSummaryProps = {
  summary: ReviewSummary;
  productId?: string;
};

export function ProductReviewSummary({
  summary,
  productId,
}: ProductReviewSummaryProps) {
  const judgeme = useJudgemeConfig();

  if (judgeme && productId) {
    return (
      <a
        className="mt-2 inline-flex min-h-[1.5rem] items-center no-underline"
        href="#reviews"
      >
        <JudgemePreviewBadge productId={productId} />
      </a>
    );
  }

  if (summary.count === 0) return null;

  return (
    <Link
      className="mt-2 inline-flex items-center gap-2 text-sm text-navy/70 no-underline hover:text-navy hover:no-underline"
      to="#reviews"
    >
      <StarRating rating={summary.average} />
      <span className="font-medium text-navy">{summary.averageDisplay}</span>
      <span className="text-navy/70">
        ({summary.count.toLocaleString('en-GB')} reviews)
      </span>
    </Link>
  );
}
