import {
  getProductContent,
  mergeProductVideos,
  type ProductContent,
} from '~/lib/product-content';
import {getHomepageProductSlot} from '~/lib/homepage-data';

export type {ProductContent, ProductSpec, ProductDimension, ProductVideo} from '~/lib/product-content';

/**
 * Static product specs, FAQs, and tab content keyed by Shopify handle.
 * Source of truth: docs/rebuild/product-copy-*.ts (via product-content.ts).
 */
export function getProductSpecs(shopifyHandle: string): ProductContent | undefined {
  return getProductContent(shopifyHandle);
}

export function buildProductTabContent({
  shopifyHandle,
  shopifyDescription,
  metafieldEmbedUrl,
}: {
  shopifyHandle: string;
  shopifyDescription: string;
  metafieldEmbedUrl?: string | null;
}): ProductContent {
  const staticContent = getProductSpecs(shopifyHandle);
  const slot = getHomepageProductSlot(shopifyHandle);

  if (staticContent) {
    return {
      ...staticContent,
      videos: mergeProductVideos(staticContent, metafieldEmbedUrl),
    };
  }

  return {
    overview: shopifyDescription,
    highlights: [],
    specs: [],
    dimensions: [],
    inBox: [],
    deliveryWarranty:
      'Free UK mainland delivery on all XSTO wheelchairs. Contact us for warranty and delivery details.',
    faqs: [],
    videos: metafieldEmbedUrl
      ? [{title: 'Product video', embedUrl: metafieldEmbedUrl}]
      : [],
  };
}

export function isXstoRangeProduct(shopifyHandle: string): boolean {
  return Boolean(getHomepageProductSlot(shopifyHandle));
}
