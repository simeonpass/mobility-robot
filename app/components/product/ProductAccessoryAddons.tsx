import {useId, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {ChevronDown, Check} from 'lucide-react';
import {accessoryFitsX12} from '~/lib/accessories';
import {X12_ACCESSORY_PREORDER_LABEL} from '~/lib/product-delivery';
import {
  formatProductPrice,
  getVariantDisplayPrice,
} from '~/lib/product-pricing';
import {resolveVatPurchaseVariant} from '~/lib/product-vat-variants';
import {
  getAccessoryChoices,
  getAccessoryVariants,
  type AddonProduct,
  type AddonVariant,
} from '~/lib/product-accessories';
export type {AddonProduct, AddonVariant} from '~/lib/product-accessories';

type Props = {
  products: AddonProduct[];
  selectedIds: Set<string>;
  onToggle: (variantId: string) => void;
  onSelectVariant: (
    previousVariantId: string | null,
    nextVariantId: string,
  ) => void;
  chairLabel?: string;
  vatReliefActive: boolean;
};

function optionLabel(variant: AddonVariant): string {
  const options = variant.selectedOptions?.filter(
    (option) =>
      option.name.toLowerCase() !== 'vat' && option.value !== 'Default Title',
  );
  return options?.length
    ? options.map((option) => option.value).join(' / ')
    : 'Standard';
}

export function ProductAccessoryAddons({
  products,
  selectedIds,
  onToggle,
  onSelectVariant,
  chairLabel,
  vatReliefActive,
}: Props) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const available = products.filter(
    (product) => getAccessoryChoices(product).length,
  );
  if (!available.length) return null;
  const selectedCount = available.filter((product) =>
    getAccessoryChoices(product).some((variant) => selectedIds.has(variant.id)),
  ).length;
  // Selected extras remain visible if the customer collapses the full list.
  const visible = showAll
    ? available
    : available.filter(
        (product, index) =>
          index < 3 ||
          getAccessoryChoices(product).some((variant) =>
            selectedIds.has(variant.id),
          ),
      );

  return (
    <section className="mr-addons" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>
        <button
          type="button"
          className="mr-addons-trigger"
          aria-expanded={expanded}
          aria-controls={`${id}-list`}
          onClick={() => setExpanded(!expanded)}
        >
          <span>
            Add accessories{' '}
            <small>
              Optional{selectedCount ? ` · ${selectedCount} selected` : ''}
            </small>
          </span>
          <ChevronDown
            size={20}
            aria-hidden
            className={expanded ? 'is-open' : ''}
          />
        </button>
      </h2>
      <div id={`${id}-list`} hidden={!expanded}>
        <p className="mr-addons-intro">
          {chairLabel
            ? `Compatible with your ${chairLabel}.`
            : 'Compatible with this chair.'}{' '}
          Selected extras are added with your chair.
        </p>
        <ul className="mr-addons-list">
          {visible.map((product) => {
            const variants = getAccessoryChoices(product);
            const selected = variants.find((variant) =>
              selectedIds.has(variant.id),
            );
            const variant =
              selected ??
              variants.find((item) => item.id === choices[product.id]) ??
              variants[0];
            const allVariants = getAccessoryVariants(product);
            const purchase =
              resolveVatPurchaseVariant(
                variant,
                allVariants,
                vatReliefActive,
              ) ?? variant;
            const checked = Boolean(selected);
            const displayPrice = getVariantDisplayPrice(
              variant,
              allVariants,
              vatReliefActive,
            );
            const price = displayPrice
              ? formatProductPrice(
                  Number(displayPrice.amount),
                  displayPrice.currencyCode,
                  {fractionDigits: 2},
                )
              : null;
            const image = variant.image ?? product.featuredImage;
            const unavailable = !purchase.availableForSale;
            return (
              <li
                className={`mr-addon${checked ? ' is-selected' : ''}`}
                key={product.id}
              >
                <label className="mr-addon-select">
                  {image ? (
                    <Image
                      data={{...image, width: 128, height: 128}}
                      alt=""
                      sizes="56px"
                      className="mr-addon-image"
                    />
                  ) : (
                    <span className="mr-addon-image" />
                  )}
                  <span className="mr-addon-copy">
                    <span className="mr-addon-title">{product.title}</span>
                    <span className="mr-addon-price">
                      + {price}{' '}
                      <small>
                        {vatReliefActive ? 'with VAT relief' : 'incl. VAT'}
                      </small>
                    </span>
                    {accessoryFitsX12(
                      product.handle,
                      product.title,
                      product.tags,
                    ) ? (
                      <small className="mr-addon-delivery">
                        Pre-order · {X12_ACCESSORY_PREORDER_LABEL}
                      </small>
                    ) : null}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={unavailable && !checked}
                    onChange={() => onToggle(variant.id)}
                    aria-label={`Add ${product.title}`}
                  />
                </label>
                {checked && variants.length > 1 ? (
                  <label className="mr-addon-options">
                    <span>Choose an option</span>
                    <select
                      aria-label={`Option for ${product.title}`}
                      value={variant.id}
                      onChange={(event) => {
                        const next = event.target.value;
                        setChoices({...choices, [product.id]: next});
                        onSelectVariant(selected?.id ?? null, next);
                      }}
                    >
                      {variants.map((option) => (
                        <option value={option.id} key={option.id}>
                          {optionLabel(option)}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                {unavailable ? (
                  <p className="mr-addon-unavailable">
                    Unavailable with your current VAT selection. Remove this
                    extra or choose another option.
                  </p>
                ) : null}
                <Link
                  className="mr-addon-details"
                  to={`/products/${product.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Details{' '}
                  <span className="sr-only">
                    for {product.title} (opens in a new tab)
                  </span>
                </Link>
                {checked ? (
                  <span className="mr-addon-added">
                    <Check size={13} aria-hidden /> Added to your selection
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
        {available.length > 3 ? (
          <button
            type="button"
            className="mr-addons-more"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll
              ? 'Show fewer accessories'
              : `View all ${available.length} compatible accessories`}
          </button>
        ) : null}
      </div>
      {!expanded && selectedCount ? (
        <p className="mr-addons-collapsed-note">
          {selectedCount} selected · included in your total below.
        </p>
      ) : null}
    </section>
  );
}
