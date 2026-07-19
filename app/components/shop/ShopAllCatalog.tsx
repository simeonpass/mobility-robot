import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {ArrowUpRight} from 'lucide-react';
import {SectionIntro} from '~/components/home/SectionIntro';
import {
  formatCompatibilityLabel,
  resolveAccessoryCompatibility,
} from '~/lib/accessories';
import {
  formatExVatPrice,
  formatIncVatPrice,
  getHomepageFromPrices,
  getHomepageProductSlot,
  HOMEPAGE_PRODUCT_BADGES,
  type HomepageFlagshipHandle,
} from '~/lib/homepage-data';
import {isForcedPreorder} from '~/lib/product-delivery';
import {type ShopAllProduct} from '~/lib/shop-all';

type ShopAllCatalogProps = {
  chairs: ShopAllProduct[];
  accessories: ShopAllProduct[];
};

export function ShopAllCatalog({chairs, accessories}: ShopAllCatalogProps) {
  return (
    <div className="space-y-16 md:space-y-20">
      <section aria-label="Power chairs" id="power-chairs">
        <SectionIntro
          accent="power chairs"
          align="left"
          description="From ultra-light carbon fibre to self-levelling daily use and stair-climbing all-terrain — ordered from the most accessible price point upward. Free UK delivery on every model."
          label="Flagship range"
          title="XSTO"
        />

        {chairs.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {chairs.map((product, index) => (
              <li key={product.id}>
                <ChairCard index={index} product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-secondary/20 px-5 py-8 text-sm text-muted-foreground">
            Chair models are loading. Please check back shortly.
          </p>
        )}
      </section>

      <section
        aria-labelledby="shop-all-accessories-heading"
        className="border-t border-border/70 pt-14 md:pt-16"
        id="accessories"
      >
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Parts &amp; upgrades
            </p>
            <h2
              className="font-display mt-2.5 text-[1.65rem] font-semibold leading-tight tracking-tight text-foreground sm:mt-3 sm:text-3xl md:text-4xl"
              id="shop-all-accessories-heading"
            >
              Chair <span className="text-gold">accessories</span>
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground sm:mt-4 sm:text-base md:text-lg">
              Bags, batteries, cushions, covers and mounts — organised to fit
              the XSTO chair you ride.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 self-start text-sm font-semibold text-gold underline-offset-4 hover:underline sm:mb-1 sm:self-auto"
            prefetch="intent"
            to="/collections/accessories"
          >
            Browse by chair
            <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.75} />
          </Link>
        </div>

        {accessories.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {accessories.map((product) => (
              <li key={product.id}>
                <AccessoryCard product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-secondary/20 px-5 py-8 text-sm text-muted-foreground">
            No accessories listed yet. See{' '}
            <Link
              className="font-medium text-gold underline-offset-2 hover:underline"
              to="/collections/accessories"
            >
              accessories by chair
            </Link>{' '}
            or{' '}
            <Link
              className="font-medium text-gold underline-offset-2 hover:underline"
              to="/contact"
            >
              contact us
            </Link>
            .
          </p>
        )}
      </section>
    </div>
  );
}

function ChairCard({
  product,
  index,
}: {
  product: ShopAllProduct;
  index: number;
}) {
  const slot = getHomepageProductSlot(product.handle) as
    | HomepageFlagshipHandle
    | undefined;
  const meta = slot ? HOMEPAGE_PRODUCT_BADGES[slot] : null;
  const preorder = isForcedPreorder(product.handle);
  const prices = getHomepageFromPrices(
    slot,
    product.priceRange.minVariantPrice.amount,
    product.priceRange.minVariantPrice.currencyCode,
  );

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-medium animate-fade-in-up"
      style={{animationDelay: `${index * 70}ms`}}
    >
      <Link
        className="relative flex h-full flex-col no-underline hover:no-underline"
        prefetch="intent"
        to={`/products/${product.handle}`}
      >
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5 sm:left-4 sm:top-4">
          {meta ? (
            <span className="rounded-full bg-background/95 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-foreground shadow-soft backdrop-blur-sm sm:px-3 sm:text-xs">
              {meta.badge}
            </span>
          ) : null}
          {preorder ? (
            <span className="rounded-full bg-navy px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white shadow-soft sm:px-3 sm:text-xs">
              Pre-order · 10% deposit
            </span>
          ) : null}
        </div>

        <div className="flex aspect-[16/11] items-center justify-center bg-gradient-cream p-4 sm:aspect-[4/3] sm:p-6">
          {product.featuredImage ? (
            <Image
              alt={product.featuredImage.altText || product.title}
              className="max-h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              data={product.featuredImage}
              sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : (
            <span className="text-sm text-muted-foreground">No image</span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <h3 className="text-base font-semibold text-foreground sm:text-lg">
            {meta?.shortName ?? product.title}
          </h3>
          <p className="mt-1.5 text-lg font-semibold text-gold sm:mt-2 sm:text-xl">
            From {prices.exVat}{' '}
            <span className="text-sm font-medium text-gold/90">ex VAT</span>
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {prices.incVat} inc VAT
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
}

function AccessoryCard({product}: {product: ShopAllProduct}) {
  const slots = resolveAccessoryCompatibility(product);
  const amount = product.priceRange.minVariantPrice.amount;
  const currency = product.priceRange.minVariantPrice.currencyCode;
  const exVat = formatExVatPrice(amount, currency);
  const incVat = formatIncVatPrice(amount, currency);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-medium">
      <Link
        className="flex h-full flex-col no-underline hover:no-underline"
        prefetch="intent"
        to={`/products/${product.handle}`}
      >
        <div className="flex aspect-square items-center justify-center bg-gradient-cream p-5">
          {product.featuredImage ? (
            <Image
              alt={product.featuredImage.altText || product.title}
              className="max-h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              data={product.featuredImage}
              sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 90vw"
            />
          ) : (
            <span className="text-sm text-muted-foreground">No image</span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {formatCompatibilityLabel(slots)}
          </p>
          <h3 className="mt-1.5 text-base font-semibold leading-snug text-foreground">
            {product.title}
          </h3>
          <p className="mt-2 text-lg font-semibold text-gold">
            From {exVat}{' '}
            <span className="text-sm font-medium text-gold/90">ex VAT</span>
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">{incVat} inc VAT</p>
          <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-foreground transition-colors group-hover:text-gold">
            View details
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
}
