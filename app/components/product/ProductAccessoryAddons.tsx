import {useId, useMemo, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {Check, ChevronDown} from 'lucide-react';
import {
  FEATURED_ADDON_HANDLES,
  formatCompatibilityLabel,
  resolveAccessoryCompatibility,
} from '~/lib/accessories';
import {formatExVatPrice} from '~/lib/homepage-data';

export type AddonVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
  image?: {
    url: string;
    altText?: string | null;
  } | null;
  selectedOptions?: Array<{
    name: string;
    value: string;
  }> | null;
  product?: {
    title: string;
    handle: string;
  };
};

export type AddonProduct = {
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
  variants?: {
    nodes: AddonVariant[];
  } | null;
  selectedOrFirstAvailableVariant?: AddonVariant | null;
};

type ProductAccessoryAddonsProps = {
  products: AddonProduct[];
  selectedIds: Set<string>;
  onToggle: (variantId: string) => void;
  onSelectVariant: (previousVariantId: string | null, nextVariantId: string) => void;
  chairLabel?: string;
};

const INITIAL_VISIBLE = 5;

function colourLabel(variant: AddonVariant): string {
  const colourOption = variant.selectedOptions?.find((option) =>
    /colour|color/i.test(option.name),
  );
  if (colourOption?.value) return colourOption.value;
  if (variant.title && variant.title !== 'Default Title') return variant.title;
  return 'Standard';
}

function availableVariants(product: AddonProduct): AddonVariant[] {
  const nodes = product.variants?.nodes?.filter(
    (variant) => variant.availableForSale,
  );
  if (nodes?.length) return nodes;
  const fallback = product.selectedOrFirstAvailableVariant;
  return fallback?.availableForSale ? [fallback] : [];
}

export function ProductAccessoryAddons({
  products,
  selectedIds,
  onToggle,
  onSelectVariant,
  chairLabel,
}: ProductAccessoryAddonsProps) {
  const headingId = useId();
  const [expanded, setExpanded] = useState(false);
  const [colourByProduct, setColourByProduct] = useState<Record<string, string>>(
    {},
  );

  const available = useMemo(
    () => products.filter((product) => availableVariants(product).length > 0),
    [products],
  );

  if (!available.length) return null;

  const visible = expanded ? available : available.slice(0, INITIAL_VISIBLE);
  const hiddenCount = Math.max(0, available.length - INITIAL_VISIBLE);

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-lg border border-border/80 bg-background"
    >
      <header className="flex items-baseline justify-between gap-3 border-b border-border/70 px-3 py-2.5">
        <div>
          <h2
            className="text-xs font-semibold uppercase tracking-[0.14em] text-navy"
            id={headingId}
          >
            Frequently bought with
          </h2>
          <p className="mt-0.5 text-[0.7rem] text-slate">
            {chairLabel
              ? `Add a colour cover or other extras that fit ${chairLabel}`
              : 'Add a colour cover or other optional extras'}
          </p>
        </div>
        {selectedIds.size > 0 ? (
          <span className="shrink-0 text-[0.7rem] font-semibold tabular-nums text-primary">
            {selectedIds.size} selected
          </span>
        ) : null}
      </header>

      <ul className="divide-y divide-border/60">
        {visible.map((product) => {
          const variants = availableVariants(product);
          const selectedVariantFromSet = variants.find((variant) =>
            selectedIds.has(variant.id),
          );
          const preferredVariantId =
            colourByProduct[product.id] ??
            selectedVariantFromSet?.id ??
            variants[0]?.id;
          const variant =
            variants.find((item) => item.id === preferredVariantId) ??
            variants[0];
          if (!variant?.id) return null;

          const checked = selectedIds.has(variant.id);
          const isFeatured = FEATURED_ADDON_HANDLES.includes(
            product.handle as (typeof FEATURED_ADDON_HANDLES)[number],
          );
          const hasColours = variants.length > 1;
          const exVat = formatExVatPrice(
            variant.price.amount,
            variant.price.currencyCode,
          );
          const slots = resolveAccessoryCompatibility(product);
          const image = variant.image ?? product.featuredImage;

          return (
            <li
              className={isFeatured ? 'bg-navy/[0.02]' : undefined}
              key={product.id}
            >
              <div
                className={[
                  'flex items-start gap-2.5 px-3 py-2.5 transition-colors',
                  checked ? 'bg-navy/[0.03]' : 'hover:bg-secondary/40',
                ].join(' ')}
              >
                <label className="relative mt-0.5 flex size-4 shrink-0 cursor-pointer items-center justify-center">
                  <input
                    checked={checked}
                    className="peer sr-only"
                    onChange={() => onToggle(variant.id)}
                    type="checkbox"
                  />
                  <span
                    aria-hidden
                    className={[
                      'flex size-4 items-center justify-center rounded border transition-colors',
                      checked
                        ? 'border-navy bg-navy text-white'
                        : 'border-border bg-white',
                    ].join(' ')}
                  >
                    {checked ? (
                      <Check className="size-2.5" strokeWidth={3} />
                    ) : null}
                  </span>
                </label>

                {image?.url ? (
                  <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded bg-white ring-1 ring-border/70">
                    <Image
                      alt={image.altText || product.title}
                      className="max-h-full w-full object-contain p-0.5"
                      data={{
                        url: image.url,
                        altText: image.altText ?? product.title,
                        width: 80,
                        height: 80,
                      }}
                      sizes="40px"
                    />
                  </span>
                ) : null}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[0.8125rem] font-medium leading-snug text-navy">
                        {product.title}
                      </p>
                      <p className="mt-0.5 truncate text-[0.65rem] text-slate">
                        {isFeatured
                          ? 'Popular colour upgrade · '
                          : ''}
                        {formatCompatibilityLabel(slots)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[0.8125rem] font-semibold tabular-nums text-navy">
                        {exVat}
                      </p>
                      <Link
                        className="mt-0.5 block text-[0.65rem] font-medium text-slate underline-offset-2 hover:text-navy hover:underline"
                        prefetch="intent"
                        to={`/products/${product.handle}`}
                      >
                        Details
                      </Link>
                    </div>
                  </div>

                  {hasColours ? (
                    <label className="mt-2 block">
                      <span className="sr-only">Colour for {product.title}</span>
                      <select
                        className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-[0.75rem] font-medium text-navy outline-none focus:border-navy"
                        onChange={(event) => {
                          const nextId = event.target.value;
                          const previousId = selectedVariantFromSet?.id ?? null;
                          setColourByProduct((prev) => ({
                            ...prev,
                            [product.id]: nextId,
                          }));
                          if (checked) {
                            onSelectVariant(previousId, nextId);
                          }
                        }}
                        value={variant.id}
                      >
                        {variants.map((option) => (
                          <option key={option.id} value={option.id}>
                            {colourLabel(option)}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {hiddenCount > 0 ? (
        <button
          className="flex w-full items-center justify-center gap-1 border-t border-border/70 px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-navy transition-colors hover:bg-secondary/50"
          onClick={() => setExpanded((value) => !value)}
          type="button"
        >
          {expanded ? 'Show fewer' : `Show ${hiddenCount} more`}
          <ChevronDown
            aria-hidden
            className={[
              'size-3.5 transition-transform',
              expanded ? 'rotate-180' : '',
            ].join(' ')}
          />
        </button>
      ) : null}
    </section>
  );
}
