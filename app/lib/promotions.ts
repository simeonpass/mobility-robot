import {useRouteLoaderData} from 'react-router';
import {
  HOMEPAGE_FLAGSHIP_LABELS,
  getHomepageProductSlot,
  type HomepageFlagshipHandle,
} from '~/lib/homepage-data';
import {formatProductPrice} from '~/lib/product-pricing';
import {UK_VAT_MULTIPLIER} from '~/lib/vat-math';

/**
 * Time-boxed promotions. The saving itself is applied by the Shopify price
 * (sale price + compare-at on the product), so nothing here changes what is
 * charged: this drives the messaging in the hero, announcement bar, range
 * grid and product page, and switches it off again when the window closes.
 * Add `?promo=preview` to any URL to see an upcoming promotion early.
 */
export type Promotion = {
  id: string;
  slot: HomepageFlagshipHandle;
  /** Short badge text. */
  label: string;
  /** Name of the offer for sentences ("October launch price"). */
  offerName: string;
  /** Saving off the ex-VAT (VAT-relief) price, in GBP. */
  savingExVat: number;
  /** ISO instants (UTC). */
  startsAt: string;
  endsAt: string;
  headline: string;
  description: string;
  /** What is new on the model, in the order to say it. */
  highlights: string[];
  terms: string;
};

export const PROMOTIONS: readonly Promotion[] = [
  {
    id: 'm4b-october-2026',
    slot: 'xsto-m4b',
    label: 'Special offer · £500 off',
    offerName: 'October launch price',
    savingExVat: 500,
    // Live from launch evening (30 Sept) → 31 October 2026 23:59:59 GMT
    startsAt: '2026-09-30T21:30:00Z',
    endsAt: '2026-10-31T23:59:59Z',
    headline: 'Special offer: save £500 on the new XSTO M4B.',
    description:
      'The M4 you know, with an improved folding footrest and new front suspension for a smoother ride over kerbs and rough paving.',
    highlights: ['Improved folding footrest', 'New front suspension'],
    terms:
      'October launch price: £3,250 with VAT relief (was £3,750), or £3,900 including VAT (was £4,500). Applies to XSTO M4B orders placed by 31 October 2026, while stocks last.',
  },
];

/** A promotion the client can render, with prices already formatted. */
export type ActivePromotion = Promotion & {
  modelLabel: string;
  savingExVatDisplay: string;
  savingIncVatDisplay: string;
  previewing: boolean;
};

function decorate(promotion: Promotion, previewing: boolean): ActivePromotion {
  return {
    ...promotion,
    modelLabel: HOMEPAGE_FLAGSHIP_LABELS[promotion.slot],
    savingExVatDisplay: formatProductPrice(promotion.savingExVat, 'GBP'),
    savingIncVatDisplay: formatProductPrice(
      Math.round(promotion.savingExVat * UK_VAT_MULTIPLIER),
      'GBP',
    ),
    previewing,
  };
}

export function isPromotionLive(promotion: Promotion, now: Date): boolean {
  const time = now.getTime();
  return (
    time >= new Date(promotion.startsAt).getTime() &&
    time <= new Date(promotion.endsAt).getTime()
  );
}

/**
 * Promotions live right now. With `?promo=preview` on the request, the next
 * upcoming promotion is shown as well so it can be checked before it starts.
 */
export function getActivePromotions(
  request?: Request | null,
  now = new Date(),
): ActivePromotion[] {
  const preview = request
    ? new URL(request.url).searchParams.get('promo') === 'preview'
    : false;
  return PROMOTIONS.flatMap((promotion) => {
    if (isPromotionLive(promotion, now)) return [decorate(promotion, false)];
    if (preview && new Date(promotion.endsAt).getTime() >= now.getTime()) {
      return [decorate(promotion, true)];
    }
    return [];
  });
}

export function promotionForSlot(
  promotions: readonly ActivePromotion[] | null | undefined,
  slot: string | undefined,
): ActivePromotion | null {
  if (!slot || !promotions) return null;
  return promotions.find((promotion) => promotion.slot === slot) ?? null;
}

export function promotionForHandle(
  promotions: readonly ActivePromotion[] | null | undefined,
  shopifyHandle: string | undefined,
): ActivePromotion | null {
  if (!shopifyHandle) return null;
  return promotionForSlot(promotions, getHomepageProductSlot(shopifyHandle));
}

/** The root loader publishes live promotions; any component can read them. */
export function useActivePromotions(): ActivePromotion[] {
  let data: {promotions?: ActivePromotion[]} | undefined;
  try {
    data = useRouteLoaderData('root') as typeof data;
  } catch {
    // Rendered outside the app's data router (component tests): no promotions.
    data = undefined;
  }
  return data?.promotions ?? [];
}
