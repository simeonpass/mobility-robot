import {isAccessoryProduct} from '~/lib/cart-utils';
import {
  ACCESSORY_COMPAT_BY_HANDLE,
} from '~/lib/accessories';
import {
  getHomepageProductSlot,
  HOMEPAGE_FLAGSHIP_HANDLES,
  type HomepageFlagshipHandle,
} from '~/lib/homepage-data';

export type ShopAllProduct = {
  id: string;
  handle: string;
  title: string;
  tags?: string[] | null;
  productType?: string | null;
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

function looksLikeAccessory(product: ShopAllProduct): boolean {
  if (product.handle in ACCESSORY_COMPAT_BY_HANDLE) return true;

  const type = product.productType?.toLowerCase() ?? '';
  if (/accessory|accessories|spare|part|battery|cushion|cover|bag/.test(type)) {
    return true;
  }

  const tags = (product.tags ?? []).map((tag) => tag.toLowerCase());
  if (tags.some((tag) => /accessory|accessories|compatible-/.test(tag))) {
    return true;
  }

  // Title heuristics aligned with accessories.ts fallbacks
  const title = product.title.toLowerCase();
  if (
    /rear cover|phone holder|armrest bag|flashlight|universal wheels|raised backrest|battery|charger|travel cushion|umbrella|headrest|cushion|joystick|lateral support|trunk support/.test(
      title,
    )
  ) {
    return true;
  }

  return false;
}

function isDepositOrNonRetailSku(handle: string): boolean {
  return /deposit|pre-order-deposit|selling-plan/i.test(handle);
}

/**
 * Split the catalogue into flagship chairs (price order) and accessories.
 * Prefer the accessories collection when available; otherwise fall back to
 * handle / productType / tag / title heuristics (excluding deposit SKUs).
 */
export function partitionShopAllProducts<T extends ShopAllProduct>(
  products: T[],
  accessoriesFromCollection?: T[] | null,
): {chairs: T[]; accessories: T[]} {
  const chairs = HOMEPAGE_FLAGSHIP_HANDLES.map((slot) =>
    products.find((product) => getHomepageProductSlot(product.handle) === slot),
  ).filter(Boolean) as T[];

  const chairHandles = new Set(chairs.map((product) => product.handle));

  if (accessoriesFromCollection?.length) {
    const accessories = accessoriesFromCollection.filter(
      (product) =>
        !chairHandles.has(product.handle) &&
        !getHomepageProductSlot(product.handle) &&
        !isDepositOrNonRetailSku(product.handle),
    );
    return {chairs, accessories};
  }

  const accessories = products.filter((product) => {
    if (chairHandles.has(product.handle)) return false;
    if (getHomepageProductSlot(product.handle)) return false;
    if (isDepositOrNonRetailSku(product.handle)) return false;
    if (!isAccessoryProduct(product.handle)) return false;
    return looksLikeAccessory(product);
  });

  return {chairs, accessories};
}

export function isShopAllChairSlot(
  handle: string,
): handle is HomepageFlagshipHandle {
  const slot = getHomepageProductSlot(handle);
  return (
    slot != null &&
    (HOMEPAGE_FLAGSHIP_HANDLES as readonly string[]).includes(slot)
  );
}
