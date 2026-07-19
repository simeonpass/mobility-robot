import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {ArrowUpRight} from 'lucide-react';
import {SectionIntro} from '~/components/home/SectionIntro';
import type {HomeProductFragment} from 'storefrontapi.generated';
import {
  formatHomepageFromPrice,
  getHomepageProductSlot,
  HOMEPAGE_FLAGSHIP_HANDLES,
  HOMEPAGE_PRODUCT_BADGES,
  SHOPIFY_HOME_PRODUCT_HANDLES,
  type HomepageFlagshipHandle,
} from '~/lib/homepage-data';

export type HomeProduct = HomeProductFragment;

type ProductRangeGridProps = {
  products: HomeProduct[];
};

export function ProductRangeGrid({products}: ProductRangeGridProps) {
  const flagshipProducts = HOMEPAGE_FLAGSHIP_HANDLES.map((slot) => {
    const handle = SHOPIFY_HOME_PRODUCT_HANDLES[slot];
    return products.find((product) => product.handle === handle) ?? null;
  }).filter(Boolean) as HomeProduct[];

  if (!flagshipProducts.length) {
    return (
      <section className="xsto-section bg-background" id="product-range">
        <div className="xsto-container">
          <SectionIntro
            accent="XSTO"
          description="Flagship models across the XSTO range — from ultra-light carbon fibre to stair-climbing. Every chair ships with full UK warranty and free delivery."
          label="Shop the range"
          suffix="for you."
          title="Find the"
        />
          <p className="text-center text-muted-foreground">
            Product details are loading. Please check back shortly.
          </p>
        </div>
      </section>
    );
  }

  const modelCountLabel =
    flagshipProducts.length === 1
      ? 'One model'
      : `${flagshipProducts.length} models`;

  return (
    <section className="xsto-section bg-background" id="product-range">
      <div className="xsto-container">
        <SectionIntro
          accent="XSTO"
          description={`${modelCountLabel} across the XSTO range — from ultra-light carbon fibre to stair-climbing. Every chair ships with full UK warranty and free delivery.`}
          label="Shop the range"
          suffix="for you."
          title="Find the"
        />

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {flagshipProducts.map((product, index) => {
            const slot = getHomepageProductSlot(product.handle) as
              | HomepageFlagshipHandle
              | undefined;
            const meta = slot ? HOMEPAGE_PRODUCT_BADGES[slot] : null;
            const exVatPrice = formatHomepageFromPrice(
              slot,
              product.priceRange.minVariantPrice.amount,
              product.priceRange.minVariantPrice.currencyCode,
            );

            return (
              <article
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-medium animate-fade-in-up"
                key={product.id}
                style={{animationDelay: `${index * 80}ms`}}
              >
                <Link
                  className="relative flex flex-1 flex-col"
                  prefetch="intent"
                  to={`/products/${product.handle}`}
                >
                  {meta ? (
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-background/95 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-foreground shadow-soft backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3 sm:text-xs">
                      {meta.badge}
                    </span>
                  ) : null}

                  <div className="flex aspect-[16/11] items-center justify-center bg-gradient-cream p-4 sm:aspect-[4/3] sm:p-6">
                    {product.featuredImage ? (
                      <Image
                        alt={product.featuredImage.altText || product.title}
                        className="max-h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                        data={product.featuredImage}
                        sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <h3 className="text-base font-semibold text-foreground sm:text-lg">
                      {meta?.shortName ?? product.title}
                    </h3>
                    <p className="mt-1.5 text-lg font-semibold text-gold sm:mt-2 sm:text-xl">
                      From {exVatPrice}
                    </p>
                    <span className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-foreground transition-colors group-hover:text-gold sm:mt-5 sm:min-h-0">
                      {meta?.exploreLabel ?? 'View details'}
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        strokeWidth={1.75}
                      />
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>

        <p className="mt-10 text-center">
          <Link
            className="text-sm font-semibold text-gold underline-offset-4 hover:underline"
            prefetch="intent"
            to="/quote"
          >
            Need help choosing?
          </Link>
        </p>
      </div>
    </section>
  );
}
