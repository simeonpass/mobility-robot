import {useId} from 'react';
import {Image} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {Check} from 'lucide-react';
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

export function ProductAccessoryAddons({
  products,
  selectedIds,
  onToggle,
  chairLabel,
}: ProductAccessoryAddonsProps) {
  const headingId = useId();

  if (!products.length) return null;

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-2xl border border-border bg-secondary/20 p-4 md:p-5"
    >
      <header className="mb-4">
        <h2
          className="text-sm font-semibold text-foreground"
          id={headingId}
        >
          Recommended add-ons
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {chairLabel
            ? `Optional accessories that fit the ${chairLabel}. Tick any to add with your chair.`
            : 'Optional accessories for this chair. Tick any to add with your order.'}
        </p>
      </header>

      <ul className="space-y-2.5">
        {products.map((product) => {
          const variant = product.selectedOrFirstAvailableVariant;
          if (!variant?.id || !variant.availableForSale) return null;

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
                  'flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-3 transition-colors',
                  checked
                    ? 'border-foreground/40 shadow-soft'
                    : 'border-border hover:border-foreground/25',
                ].join(' ')}
              >
                <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
                  <input
                    checked={checked}
                    className="peer sr-only"
                    onChange={() => onToggle(variant.id)}
                    type="checkbox"
                  />
                  <span
                    aria-hidden
                    className={[
                      'flex size-5 items-center justify-center rounded-md border transition-colors',
                      checked
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-background',
                    ].join(' ')}
                  >
                    {checked ? (
                      <Check className="size-3.5" strokeWidth={2.5} />
                    ) : null}
                  </span>
                </span>

                {image?.url ? (
                  <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-cream p-1.5">
                    <Image
                      alt={image.altText || product.title}
                      className="max-h-full w-full object-contain"
                      data={{
                        url: image.url,
                        altText: image.altText ?? product.title,
                        width: 112,
                        height: 112,
                      }}
                      sizes="56px"
                    />
                  </span>
                ) : null}

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-snug text-foreground">
                    {product.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {formatCompatibilityLabel(slots)}
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-gold">
                    {exVat}{' '}
                    <span className="font-normal text-muted-foreground">
                      ex VAT
                    </span>
                  </span>
                  <Link
                    className="mt-1 inline-block text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
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
    </section>
  );
}
