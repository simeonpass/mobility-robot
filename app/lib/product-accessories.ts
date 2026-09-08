import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {
  filterStandardVatVariants,
  resolveVatPurchaseVariant,
} from '~/lib/product-vat-variants';

export type AddonVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Pick<MoneyV2, 'amount' | 'currencyCode'>;
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
    minVariantPrice: Pick<MoneyV2, 'amount' | 'currencyCode'>;
  };
  variants?: {
    nodes: AddonVariant[];
  } | null;
  selectedOrFirstAvailableVariant?: AddonVariant | null;
};

/** Shared choices for the accessory picker, totals and cart payload. */
export function getAccessoryVariants(product: AddonProduct): AddonVariant[] {
  if (product.variants?.nodes?.length) return product.variants.nodes;
  return product.selectedOrFirstAvailableVariant
    ? [product.selectedOrFirstAvailableVariant]
    : [];
}

export function getAccessoryChoices(product: AddonProduct): AddonVariant[] {
  return filterStandardVatVariants(getAccessoryVariants(product)).filter(
    (variant) => variant.availableForSale,
  );
}

export function getSelectedAccessories(
  products: AddonProduct[],
  selectedIds: Set<string>,
  vatRelief: boolean,
) {
  return products.flatMap((product) => {
    const standardVariant = getAccessoryChoices(product).find((variant) =>
      selectedIds.has(variant.id),
    );
    if (!standardVariant) return [];
    const purchaseVariant =
      resolveVatPurchaseVariant(
        standardVariant,
        getAccessoryVariants(product),
        vatRelief,
      ) ?? standardVariant;
    return [{product, standardVariant, purchaseVariant}];
  });
}
