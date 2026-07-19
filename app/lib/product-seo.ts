import {
  getHomepageProductSlot,
  type HomepageProductHandle,
} from '~/lib/homepage-data';
import {getProductContent} from '~/lib/product-content';

/**
 * Curated PDP meta when Shopify Admin SEO fields are empty.
 * Titles stay short so `buildMeta` can append `| Mobility Robot` under 60 chars.
 */
const PRODUCT_SEO: Record<
  HomepageProductHandle,
  {title: string; description: string}
> = {
  'xsto-m4': {
    title: 'XSTO M4 Powered Wheelchair',
    description:
      'Buy the XSTO M4 foldable powered wheelchair. Self-balancing chassis, electric height adjustment, free UK delivery and VAT relief eligible.',
  },
  'xsto-m4-pro': {
    title: 'XSTO M4 Pro Wheelchair',
    description:
      'Buy the XSTO M4 Pro powered wheelchair. Seat tilt, recline, LED lighting, longer range — free UK delivery from the official distributor.',
  },
  'xsto-m4b': {
    title: 'XSTO M4B Powered Wheelchair',
    description:
      'Buy the XSTO M4B powered wheelchair with redesigned front wheels and folding footrest. Self-balancing, free UK delivery, VAT relief eligible.',
  },
  'xsto-ezgo2': {
    title: 'XSTO EzGo2 Carbon Wheelchair',
    description:
      'Buy the ultra-light XSTO EzGo2 carbon fibre powered wheelchair. From 11.5 kg, 3-step fold, free UK delivery from Mobility Robot.',
  },
  'xsto-x12': {
    title: 'XSTO X12 Stair Climber',
    description:
      'Buy the XSTO X12 all-terrain stair-climbing mobility robot. Climbs steps up to 40°, AI mode switching, free UK delivery.',
  },
  'xsto-x12-pro': {
    title: 'XSTO X12 Pro Stair Climber',
    description:
      'Buy the XSTO X12 Pro AI stair-climbing wheelchair. Fully configurable comfort, all-terrain capability, free UK delivery.',
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
    seoTitle?.trim() ||
    curated?.title ||
    content?.displayName ||
    productTitle;

  const description =
    seoDescription?.trim() ||
    curated?.description ||
    content?.overview ||
    productDescription?.trim() ||
    `Buy ${productTitle} from Mobility Robot, the official UK XSTO store. Free UK delivery and full warranty.`;

  return {title, description};
}
