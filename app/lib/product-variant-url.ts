/** Shopify Online Store / Google Shopping variant query (`?variant=123`). */

const VARIANT_GID_PREFIX = 'gid://shopify/ProductVariant/';

export function numericShopifyId(gidOrNumeric: string | null | undefined): string | null {
  if (!gidOrNumeric) return null;
  const trimmed = gidOrNumeric.trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(\d+)\s*$/);
  return match?.[1] ?? null;
}

export function shopifyVariantGidFromSearch(
  url: string | URL,
): string | null {
  const parsed = typeof url === 'string' ? new URL(url) : url;
  const raw = parsed.searchParams.get('variant')?.trim();
  if (!raw) return null;
  const numeric = numericShopifyId(raw);
  return numeric ? `${VARIANT_GID_PREFIX}${numeric}` : null;
}

export function variantByShopifyId<T extends {id: string}>(
  variants: T[] | null | undefined,
  variantGid: string | null,
): T | undefined {
  if (!variantGid) return undefined;
  return variants?.find((variant) => variant.id === variantGid);
}

/**
 * Prefer the Shopify `?variant=` SKU Google Shopping and Online Store links use.
 */
export function withRequestedShopifyVariant<
  T extends {
    selectedOrFirstAvailableVariant?: V | null;
    variants?: {nodes?: V[] | null} | null;
  },
  V extends {id: string},
>(product: T, requestUrl: string): T {
  const requested = variantByShopifyId(
    product.variants?.nodes,
    shopifyVariantGidFromSearch(requestUrl),
  );
  if (!requested || requested.id === product.selectedOrFirstAvailableVariant?.id) {
    return product;
  }
  return {
    ...product,
    selectedOrFirstAvailableVariant: requested,
  };
}

export function googleShoppingOfferId(
  productGid: string,
  variantGid: string,
  countryCode = 'ZZ',
): string | null {
  const productId = numericShopifyId(productGid);
  const variantId = numericShopifyId(variantGid);
  if (!productId || !variantId) return null;
  return `shopify_${countryCode}_${productId}_${variantId}`;
}

export function storefrontProductUrl(handle: string, variantGid?: string | null) {
  const path = `/products/${handle}`;
  const variantId = numericShopifyId(variantGid ?? null);
  return variantId ? `${path}?variant=${variantId}` : path;
}
