import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {ArrowUpRight} from 'lucide-react';
import {
  ACCESSORY_CHAIR_SECTIONS,
  accessoryFitsX12,
  formatCompatibilityLabel,
  groupAccessoriesByChair,
  resolveAccessoryCompatibility,
  type AccessoryChairSlot,
} from '~/lib/accessories';
import {formatProductPrice} from '~/lib/product-pricing';
import {catalogToIncVatAmount} from '~/lib/pricing-mode';
import {formatExVatPrice} from '~/lib/homepage-data';
import {getProductListPrice} from '~/lib/product-vat-variants';
import {X12_ACCESSORY_PREORDER_LABEL} from '~/lib/product-delivery';

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
    maxVariantPrice?: {
      amount: string;
      currencyCode: string;
    } | null;
  };
  variants?: {
    nodes?: Array<{
      id: string;
      price?: {amount: string; currencyCode: string} | null;
      selectedOptions?: Array<{name: string; value: string}> | null;
    }> | null;
  } | null;
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
  const section = ACCESSORY_CHAIR_SECTIONS.find(
    (item) => item.slot === activeSlot,
  );
  const items = activeSlot === 'all' ? products : grouped[activeSlot];
  return (
    <div className="mr-accessory-catalog">
      <p className="mr-accessory-tip">
        Buying a wheelchair? You can add compatible extras directly on its
        product page.
      </p>
      <nav
        aria-label="Filter accessories by wheelchair"
        className="mr-accessory-filters"
      >
        <FilterChip
          active={activeSlot === 'all'}
          count={products.length}
          label="All"
          to="/collections/accessories"
        />
        {ACCESSORY_CHAIR_SECTIONS.map((item) => (
          <FilterChip
            active={activeSlot === item.slot}
            count={grouped[item.slot].length}
            label={item.shortLabel}
            key={item.id}
            to={`/collections/accessories?chair=${item.id}`}
          />
        ))}
      </nav>
      <div className="mr-accessory-results">
        <h2>
          {section ? `Accessories for ${section.label}` : 'All accessories'}
        </h2>
        <span>{items.length} items</span>
      </div>
      {items.length ? (
        <ul className="mr-accessory-grid">
          {items.map((product) => (
            <li key={product.id}>
              <AccessoryCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <p>
          No accessories are currently listed for this model.{' '}
          <Link to="/contact">Ask our team for help</Link>.
        </p>
      )}
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
  const listPrice = getProductListPrice(product);
  const exVat = formatExVatPrice(listPrice.amount, listPrice.currencyCode);

  return (
    <article className="mr-accessory-card group flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card">
      <Link
        className="flex h-full flex-col no-underline hover:no-underline"
        prefetch="intent"
        to={`/products/${product.handle}`}
      >
        <div className="mr-accessory-photo flex aspect-square items-center justify-center bg-gradient-cream p-2">
          {product.featuredImage ? (
            <Image
              alt={product.featuredImage.altText || product.title}
              className="max-h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              data={product.featuredImage}
              sizes="(min-width: 768px) 31vw, 46vw"
            />
          ) : (
            <span className="text-sm text-muted-foreground">No image</span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {formatCompatibilityLabel(slots)}
            {accessoryFitsX12(product.handle, product.title, product.tags)
              ? ` · Pre-order ${X12_ACCESSORY_PREORDER_LABEL}`
              : ''}
          </p>
          <h3 className="mt-1.5 text-base font-semibold leading-snug text-foreground">
            {product.title}
          </h3>
          <p className="mt-2 text-lg font-semibold text-navy">From {exVat}</p>
          <p className="mr-accessory-tax">
            With VAT relief, if eligible
            <br />
            {formatProductPrice(
              catalogToIncVatAmount(listPrice.amount),
              listPrice.currencyCode,
            )}{' '}
            incl. VAT
          </p>
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
