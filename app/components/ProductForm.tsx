import {Link, useNavigate} from 'react-router';
import {
  type MappedProductOptions,
  type OptimisticCartLineInput,
} from '@shopify/hydrogen';
import type {
  AttributeInput,
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import {isAccessoryProduct} from '~/lib/cart-utils';
import {withOptimisticSellingPlanAllocation} from '~/lib/selling-plans';
import type {ProductFragment} from 'storefrontapi.generated';

export function ProductForm({
  productHandle,
  productOptions,
  selectedVariant,
  cartAttributes = [],
  addonLines = [],
  sellingPlanId,
  disabled,
  soldOutLabel = 'Sold out',
  addToCartLabel = 'Add to cart',
  addToCartClassName = 'btn-accent',
}: {
  productHandle?: string;
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  cartAttributes?: AttributeInput[];
  addonLines?: OptimisticCartLineInput[];
  /** When set, line is added with this Shopify selling plan (e.g. 10% deposit). */
  sellingPlanId?: string | null;
  disabled?: boolean;
  soldOutLabel?: string;
  addToCartLabel?: string;
  addToCartClassName?: string;
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  const silentAdd = productHandle ? isAccessoryProduct(productHandle) : false;

  const addDisabled =
    disabled ??
    (!selectedVariant || !selectedVariant.availableForSale);

  const lines: OptimisticCartLineInput[] = selectedVariant
    ? [
        {
          merchandiseId: selectedVariant.id,
          quantity: 1,
          selectedVariant: withOptimisticSellingPlanAllocation(
            selectedVariant,
            sellingPlanId,
          ),
          attributes: cartAttributes,
          ...(sellingPlanId ? {sellingPlanId} : {}),
        },
        ...addonLines.map((line) => ({
          ...line,
          parent: line.parent ?? {merchandiseId: selectedVariant.id},
        })),
      ]
    : [];

  return (
    <div className="space-y-6">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

        return (
          <fieldset className="space-y-3" key={option.name}>
            <legend className="text-sm font-medium text-foreground">
              {option.name}
            </legend>
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                const optionClassName = [
                  'inline-flex items-center gap-2 rounded-md border px-3.5 py-2 text-sm transition-colors',
                  selected
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-foreground hover:border-foreground/40',
                  !available ? 'opacity-40' : '',
                ].join(' ');

                if (isDifferentProduct) {
                  return (
                    <Link
                      className={optionClassName}
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                }

                return (
                  <button
                    className={optionClassName}
                    disabled={!exists}
                    key={option.name + name}
                    onClick={() => {
                      if (!selected) {
                        void navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                    type="button"
                  >
                    <ProductOptionSwatch swatch={swatch} name={name} />
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      <AddToCartButton
        className={addToCartClassName}
        disabled={addDisabled}
        onClick={() => {
          if (!silentAdd) {
            open('cart');
          }
        }}
        lines={lines}
      >
        {!selectedVariant?.availableForSale
          ? soldOutLabel
          : addDisabled && disabled
            ? soldOutLabel
            : addToCartLabel}
      </AddToCartButton>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return <span>{name}</span>;

  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className="size-4 shrink-0 overflow-hidden rounded-full border border-border"
        style={{backgroundColor: color || 'transparent'}}
      >
        {image ? (
          <img alt="" className="size-full object-cover" src={image} />
        ) : null}
      </span>
      <span>{name}</span>
    </span>
  );
}
