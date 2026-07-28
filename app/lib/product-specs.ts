import {buildAccessoryTabExtras} from '~/lib/accessory-content';
import {isAccessoryProduct} from '~/lib/cart-utils';
import {
  getProductContent,
  mergeProductVideos,
  type ProductContent,
} from '~/lib/product-content';
import {
  buildDescriptionHtmlFromPlain,
  formatPlainDescription,
} from '~/lib/product-description';
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
  shopifyTitle,
  shopifyDescription,
  shopifyDescriptionHtml,
  shopifyTags,
  metafieldEmbedUrl,
}: {
  shopifyHandle: string;
  shopifyTitle?: string;
  shopifyDescription: string;
  shopifyDescriptionHtml?: string | null;
  shopifyTags?: readonly string[] | null;
  metafieldEmbedUrl?: string | null;
}): ProductContent {
  const staticContent = getProductSpecs(shopifyHandle);

  if (staticContent) {
    return {
      ...staticContent,
      videos: mergeProductVideos(staticContent, metafieldEmbedUrl),
    };
  }

  if (isAccessoryProduct(shopifyHandle)) {
    const extras = buildAccessoryTabExtras({
      handle: shopifyHandle,
      title: shopifyTitle || shopifyHandle,
      tags: shopifyTags,
      descriptionHtml: shopifyDescriptionHtml,
      description: shopifyDescription,
    });

    return {
      overview: extras.overview,
      overviewHtml: extras.overviewHtml,
      highlights: extras.highlights,
      specs: [],
      dimensions: [],
      inBox: [],
      deliveryWarranty: extras.deliveryWarranty,
      faqs: [],
      videos: metafieldEmbedUrl
        ? [{title: 'Product video', embedUrl: metafieldEmbedUrl}]
        : [],
      downloads: [],
      compatibilityLabel: extras.compatibilityLabel,
      compatibilityChairs: extras.compatibilityChairs,
      tagline: extras.compatibilityLabel,
    };
  }

  const plain = shopifyDescription?.trim() || '';
  const html =
    shopifyDescriptionHtml?.trim() ||
    (plain ? buildDescriptionHtmlFromPlain(plain) : '');
  const {bullets} = formatPlainDescription(plain);

  return {
    overview: plain,
    overviewHtml: html || undefined,
    highlights: bullets,
    specs: [],
    dimensions: [],
    inBox: [],
    deliveryWarranty:
      'Free UK mainland delivery on eligible XSTO products. Contact us for warranty and delivery details.',
    faqs: [],
    videos: metafieldEmbedUrl
      ? [{title: 'Product video', embedUrl: metafieldEmbedUrl}]
      : [],
    downloads: [],
  };
}

export function isXstoRangeProduct(shopifyHandle: string): boolean {
  return Boolean(getHomepageProductSlot(shopifyHandle));
}
