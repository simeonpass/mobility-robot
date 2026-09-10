import {
  getHomepageProductSlot,
  type HomepageProductHandle,
} from '~/lib/homepage-data';
import {getProductContent} from '~/lib/product-content';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {getVariantDisplayPrice} from '~/lib/product-pricing';
import {
  resolveVatPurchaseVariant,
  type VatPricedVariant,
} from '~/lib/product-vat-variants';

/** Resolve the public, VAT-inclusive offer for the edition actually displayed. */
export function resolveProductOffer<
  T extends VatPricedVariant<MoneyV2['currencyCode']>,
>({
  selectedVariant,
  variants,
  proVariant,
  proVariants = [],
  isPro = false,
}: {
  selectedVariant: T | null;
  variants: T[];
  proVariant?: T | null;
  proVariants?: T[];
  isPro?: boolean;
}) {
  const active = isPro && proVariant ? proVariant : selectedVariant;
  const choices = isPro && proVariant ? proVariants : variants;
  const availableChoices = choices.length ? choices : active ? [active] : [];
  const variant = resolveVatPurchaseVariant(active, availableChoices, false);
  const price = getVariantDisplayPrice(variant, availableChoices, false);
  return variant && price && Number(price.amount) > 0 ? {variant, price} : null;
}

/**
 * Reviewed search copy for the flagship range; catalogue SEO remains the fallback
 * for accessories. Older flagship Admin descriptions contain obsolete claims.
 * Titles stay descriptive and concise, with the brand appended by `buildMeta`.
 */
const PRODUCT_SEO: Record<
  HomepageProductHandle,
  {title: string; description: string}
> = {
  'xsto-m4': {
    title: 'XSTO M4 Self-Levelling Wheelchair',
    description:
      'Explore the XSTO M4 self-levelling powered wheelchair with electric seat lifting. UK advice, demonstrations and support from Bentech Medical.',
  },
  'xsto-m4-pro': {
    title: 'XSTO M4 Pro Powered Wheelchair',
    description:
      'Discover the XSTO M4 Pro powered wheelchair with adjustable seating and electric folding. Compare options and book a demonstration with our UK team.',
  },
  'xsto-m4b': {
    title: 'XSTO M4B Powered Wheelchair',
    description:
      'Explore the XSTO M4B powered wheelchair with redesigned front wheels and a folding footrest. Compare prices and book a UK demonstration.',
  },
  'xsto-x12': {
    title: 'XSTO X12 Stair-Climbing Wheelchair',
    description:
      'Compare the XSTO X12 and X12 Pro stair-climbing wheelchairs. Explore prices, suitable stairs, assessment and training with the official UK distributor.',
  },
  'xsto-x12-pro': {
    title: 'XSTO X12 Pro Stair-Climbing Wheelchair',
    description:
      'Explore the XSTO X12 Pro with an electric elevating leg rest. Ask our UK team about suitable stairs, assessment, training and current prices.',
  },
};

export type ResolveProductSeoInput = {
  handle: string;
  productTitle: string;
  productDescription?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export function resolveProductSeo({
  handle,
  productTitle,
  productDescription,
  seoTitle,
  seoDescription,
}: ResolveProductSeoInput): {title: string; description: string} {
  const slot = getHomepageProductSlot(handle);
  const curated = slot ? PRODUCT_SEO[slot] : undefined;
  const content = getProductContent(handle);

  const title =
    curated?.title || seoTitle?.trim() || content?.displayName || productTitle;

  const description =
    curated?.description ||
    seoDescription?.trim() ||
    content?.overview ||
    productDescription?.trim() ||
    `Buy ${productTitle} from Mobility Robot by Bentech Medical, the official UK distributor for XSTO. UK delivery and support.`;

  return {title, description};
}
