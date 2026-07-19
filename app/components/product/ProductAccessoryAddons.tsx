import {useId, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {Check, ChevronDown} from 'lucide-react';
import {formatCompatibilityLabel, resolveAccessoryCompatibility} from '~/lib/accessories';
import {formatExVatPrice} from '~/lib/homepage-data';

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
  selectedOrFirstAvailableVariant?: {
    id: string;
    availableForSale: boolean;
    price: {
      amount: string;
      currencyCode: string;
    };
    image?: {
      url: string;
      altText?: string | null;
    } | null;
    product?: {
      title: string;
      handle: string;
    };
  } | null;
};

type ProductAccessoryAddonsProps = {
  products: AddonProduct[];
  selectedIds: Set<string>;
  onToggle: (variantId: string) => void;
  chairLabel?: string;
};

const INITIAL_VISIBLE = 4;

export function ProductAccessoryAddons({
  products,
  selectedIds,
  onToggle,
  chairLabel,
}: ProductAccessoryAddonsProps) {
  const headingId = useId();
  const [expanded, setExpanded] = useState(false);

  const available = products.filter(
    (product) => product.selectedOrFirstAvailableVariant?.availableForSale,
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
              ? `Optional extras that fit ${chairLabel}`
              : 'Optional extras for this chair'}
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
          const variant = product.selectedOrFirstAvailableVariant;
          if (!variant?.id) return null;

          const checked = selectedIds.has(variant.id);
          const exVat = formatExVatPrice(
            variant.price.amount,
            variant.price.currencyCode,
          );
          const slots = resolveAccessoryCompatibility(product);
          const image = product.featuredImage ?? variant.image;

          return (
            <li key={product.id}>
              <label
                className={[
                  'flex cursor-pointer items-center gap-2.5 px-3 py-2.5 transition-colors',
                  checked ? 'bg-navy/[0.03]' : 'hover:bg-secondary/40',
                ].join(' ')}
              >
                <span className="relative flex size-4 shrink-0 items-center justify-center">
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
                </span>

                {image?.url ? (
                  <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded bg-white ring-1 ring-border/70">
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

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.8125rem] font-medium leading-snug text-navy">
                    {product.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[0.65rem] text-slate">
                    {formatCompatibilityLabel(slots)}
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span className="block text-[0.8125rem] font-semibold tabular-nums text-navy">
                    {exVat}
                  </span>
                  <Link
                    className="mt-0.5 block text-[0.65rem] font-medium text-slate underline-offset-2 hover:text-navy hover:underline"
                    onClick={(event) => event.stopPropagation()}
                    prefetch="intent"
                    to={`/products/${product.handle}`}
                  >
                    Details
                  </Link>
                </span>
              </label>
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
