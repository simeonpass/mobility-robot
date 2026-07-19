import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {ArrowUpRight} from 'lucide-react';
import {
  ACCESSORY_CHAIR_SECTIONS,
  formatCompatibilityLabel,
  groupAccessoriesByChair,
  resolveAccessoryCompatibility,
  type AccessoryChairSlot,
} from '~/lib/accessories';
import {formatExVatPrice, formatIncVatPrice} from '~/lib/homepage-data';

export type AccessoryListProduct = {
  id: string;
  handle: string;
  title: string;
  tags?: string[];
  featuredImage?: {
    id?: string | null;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
};

type AccessoriesCatalogProps = {
  products: AccessoryListProduct[];
  activeSlot?: AccessoryChairSlot | 'all';
};

export function AccessoriesCatalog({
  products,
  activeSlot = 'all',
}: AccessoriesCatalogProps) {
  const grouped = groupAccessoriesByChair(products);
  const sections =
    activeSlot === 'all'
      ? ACCESSORY_CHAIR_SECTIONS
      : ACCESSORY_CHAIR_SECTIONS.filter((section) => section.slot === activeSlot);

  return (
    <div className="space-y-14 md:space-y-16">
      <nav
        aria-label="Filter by chair"
        className="flex flex-wrap gap-2 border-b border-border pb-4"
      >
        <FilterChip
          active={activeSlot === 'all'}
          count={products.length}
          label="All"
          to="/collections/accessories"
        />
        {ACCESSORY_CHAIR_SECTIONS.map((section) => (
          <FilterChip
            active={activeSlot === section.slot}
            count={grouped[section.slot].length}
            key={section.id}
            label={section.shortLabel}
            to={`/collections/accessories?chair=${section.id}`}
          />
        ))}
      </nav>

      {sections.map((section) => {
        const items = grouped[section.slot];
        return (
          <section
            aria-labelledby={`accessories-${section.id}`}
            id={`accessories-${section.id}`}
            key={section.id}
          >
            <header className="mb-6 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Compatible with
              </p>
              <h2
                className="mt-1 text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
                id={`accessories-${section.id}`}
              >
                {section.label}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                {section.description}
              </p>
            </header>

            {items.length ? (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((product) => (
                  <li key={`${section.slot}-${product.id}`}>
                    <AccessoryCard product={product} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl border border-dashed border-border bg-secondary/20 px-5 py-8 text-sm text-muted-foreground">
                No accessories listed for the {section.shortLabel} yet. Browse{' '}
                <Link
                  className="font-medium text-gold underline-offset-2 hover:underline"
                  to="/collections/accessories"
                >
                  all accessories
                </Link>{' '}
                or{' '}
                <Link
                  className="font-medium text-gold underline-offset-2 hover:underline"
                  to="/contact"
                >
                  contact us
                </Link>{' '}
                if you need a specific part.
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

function FilterChip({
  label,
  count,
  to,
  active,
}: {
  label: string;
  count: number;
  to: string;
  active: boolean;
}) {
  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium no-underline transition-colors',
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-background text-foreground hover:border-foreground/40 hover:no-underline',
      ].join(' ')}
      prefetch="intent"
      to={to}
    >
      {label}
      <span
        className={[
          'tabular-nums text-xs',
          active ? 'text-background/70' : 'text-muted-foreground',
        ].join(' ')}
      >
        {count}
      </span>
    </Link>
  );
}

function AccessoryCard({product}: {product: AccessoryListProduct}) {
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
