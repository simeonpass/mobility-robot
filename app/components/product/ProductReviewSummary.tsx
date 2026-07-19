import {Link} from 'react-router';
import {StarRating} from '~/components/reviews/StarRating';
import {getReviewsForProduct, summarizeReviews} from '~/lib/reviews';

type ProductReviewSummaryProps = {
  productHandle: string;
};

export function ProductReviewSummary({productHandle}: ProductReviewSummaryProps) {
  const summary = summarizeReviews(getReviewsForProduct(productHandle));
  if (summary.count === 0) return null;

  return (
    <Link
      className="mt-2 inline-flex items-center gap-2 text-sm text-navy/70 no-underline hover:text-navy hover:no-underline"
      to="#reviews"
    >
      <StarRating rating={summary.average} />
      <span className="font-medium text-navy">{summary.averageDisplay}</span>
      <span className="text-navy/45">
        ({summary.count.toLocaleString('en-GB')} reviews)
      </span>
    </Link>
  );
}
