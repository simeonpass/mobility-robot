import {Link} from 'react-router';
import {ReviewCard} from '~/components/reviews/ReviewCard';
import {StarRating} from '~/components/reviews/StarRating';
import {
  JudgemeAllReviewsRating,
  JudgemeCarousel,
  useJudgemeConfig,
} from '~/components/reviews/Judgeme';
import {SectionIntro} from '~/components/home/SectionIntro';
import {
  getAllReviews,
  getHomepageFeaturedReviews,
  summarizeReviews,
} from '~/lib/reviews';
import {SHOPIFY_HOME_PRODUCT_HANDLES} from '~/lib/homepage-data';

export function ReviewsSection() {
  const judgeme = useJudgemeConfig();
  const featured = getHomepageFeaturedReviews(6);
  const summary = summarizeReviews(getAllReviews());
  const m4Path = `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4']}`;

  if (judgeme) {
    return (
      <section
        aria-label="Customer reviews"
        className="xsto-section bg-[#f5f7fa]"
      >
        <div className="xsto-container">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionIntro
              accent="fantastic reviews."
              align="left"
              description="So many happy customers — real experiences from people who chose XSTO."
              label="Happy customers"
              title="Look at our"
            />
            <div className="min-h-[2.5rem] shrink-0 md:pb-1 md:text-right">
              <JudgemeAllReviewsRating />
            </div>
          </div>
          <div className="mt-8 min-h-[10rem]">
            <JudgemeCarousel />
          </div>
          <p className="mt-8 text-center">
            <Link
              className="text-sm font-semibold text-gold underline-offset-4 hover:underline"
              prefetch="intent"
              to={m4Path}
            >
              Read product reviews →
            </Link>
          </p>
        </div>
      </section>
    );
  }

  if (summary.count === 0) return null;

  return (
    <section aria-label="Customer reviews" className="xsto-section bg-[#f5f7fa]">
      <div className="xsto-container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionIntro
            accent="fantastic reviews."
            align="left"
            description="So many happy customers — real experiences from people who chose XSTO."
            label="Happy customers"
            title="Look at our"
          />
          <div className="shrink-0 md:pb-1 md:text-right">
            <div className="flex items-center gap-2 md:justify-end">
              <StarRating rating={summary.average} size="md" />
              <span className="font-display text-2xl font-semibold tracking-tight text-navy">
                {summary.averageDisplay}
              </span>
            </div>
            <p className="mt-1 text-sm text-navy/55">
              Based on {summary.count.toLocaleString('en-GB')} reviews
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {featured.map((review) => (
            <ReviewCard compact key={review.id} review={review} />
          ))}
        </div>

        <p className="mt-8 text-center">
          <Link
            className="text-sm font-semibold text-gold underline-offset-4 hover:underline"
            prefetch="intent"
            to={m4Path}
          >
            Read M4 reviews on the product page →
          </Link>
        </p>
      </div>
    </section>
  );
}
