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
  'xsto-m8': {title: 'XSTO M8 All-Terrain Powered Wheelchair', description: 'Explore the XSTO M8 four-wheel-drive powered wheelchair with self-balancing and seat elevation. UK pre-orders: 10% deposit, estimated 12-week delivery.'},
  'xsto-m8-pro': {title: 'XSTO M8 Pro All-Terrain Powered Wheelchair', description: 'Discover the XSTO M8 Pro powered wheelchair with electric reclining and leg rest. UK pre-orders: 10% deposit, estimated 12-week delivery.'},
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
      'Explore the XSTO M4B powered wheelchair with an improved folding footrest and new front suspension. October launch price: £500 off. Compare prices and book a UK demonstration.',
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

const ACCESSORY_SEO: Record<string, {title: string; description: string}> = {
  'm4-m4-pro-battery-25-2v-23-8ah': {
    title: 'XSTO M4, M4B & M4 Pro Battery | 25.2V 23.8Ah',
    description: 'Replacement 25.2V 23.8Ah battery for XSTO M4, M4B and M4 Pro powered wheelchairs. Sold individually. Confirm compatibility with our UK team.',
  },
  'x12-x12-pro-battery-25-2v-25-6ah': {
    title: 'XSTO X12 & X12 Pro Battery | 25.2V 25.6Ah',
    description: 'Replacement 25.2V 25.6Ah battery for XSTO X12 and X12 Pro wheelchairs. Sold individually; select quantity 2 for a pair. UK compatibility advice.',
  },
  'black-backpack-for-m4-pro': {
    title: 'XSTO M4 Pro Wheelchair Backpack | Black',
    description: 'Black backpack accessory for the XSTO M4 Pro powered wheelchair. Contact Bentech Medical for fitting advice and help choosing the right accessory.',
  },
  'bluetooth-controller-for-m4-m4h-m4-pro-x12-x12-pro': {
    title: 'XSTO Wheelchair Bluetooth Controller | M4 & X12 Series',
    description: 'Bluetooth controller for XSTO M4, M4B, M4 Pro, X12 and X12 Pro wheelchairs. Ask our UK team about compatibility and setup before ordering.',
  },
  'calf-support-set-for-x12-x12pro': {
    title: 'XSTO X12 & X12 Pro Calf Support Set',
    description: 'Calf support set for XSTO X12 and X12 Pro stair-climbing wheelchairs. Get UK advice on compatibility with your chair and leg-rest configuration.',
  },
  'cup-holder-for-all-models': {
    title: 'XSTO Wheelchair Cup Holder | M4 Pro, X12 & X12 Pro',
    description: 'Cup holder for XSTO M4 Pro, X12 and X12 Pro powered wheelchairs. Contact our UK team to check fitting and cup size before ordering.',
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
  const curated = slot ? PRODUCT_SEO[slot] : ACCESSORY_SEO[handle];
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
