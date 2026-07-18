import {getHomepageProductSlot} from '~/lib/homepage-data';

export type DeliveryStatus = 'in_stock' | 'preorder' | 'sold_out';

export type DeliveryInfo = {
  status: DeliveryStatus;
  headline: string;
  detail: string;
  etaLabel: string;
  /** Estimated lead time in weeks when status is preorder; null otherwise. */
  preorderWeeks: number | null;
};

/** Default pre-order lead time when a product has no per-handle override. */
export const DEFAULT_PREORDER_WEEKS = 12;

/**
 * Per-product pre-order ETA (weeks). Keys are Shopify product handles
 * and homepage slot aliases resolved via getHomepageProductSlot.
 */
export const PREORDER_WEEKS_BY_HANDLE: Record<string, number> = {
  'xsto-ezgo2-carbon-fiber-power-wheelchair': 2,
  'xsto-ezgo2': 2,
  'x12-all-terrain-mobility-robot': 10,
  'xsto-x12': 10,
  'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition': 10,
  'xsto-x12-pro': 10,
};

export function getPreorderWeeks(handle?: string | null): number {
  if (!handle) return DEFAULT_PREORDER_WEEKS;

  const direct = PREORDER_WEEKS_BY_HANDLE[handle];
  if (direct != null) return direct;

  const slot = getHomepageProductSlot(handle);
  if (slot && PREORDER_WEEKS_BY_HANDLE[slot] != null) {
    return PREORDER_WEEKS_BY_HANDLE[slot];
  }

  return DEFAULT_PREORDER_WEEKS;
}

export function getPreorderDeliveryDate(
  weeks: number = DEFAULT_PREORDER_WEEKS,
  from = new Date(),
): string {
  const deliveryDate = new Date(from);
  deliveryDate.setDate(deliveryDate.getDate() + weeks * 7);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(deliveryDate);
}

export function formatPreorderWeeksLabel(weeks: number): string {
  return weeks === 1 ? '~1 week' : `~${weeks} weeks`;
}

export function getDeliveryInfo({
  availableForSale,
  quantityAvailable,
  handle,
}: {
  availableForSale: boolean;
  quantityAvailable?: number | null;
  handle?: string | null;
}): DeliveryInfo {
  if (!availableForSale) {
    return {
      status: 'sold_out',
      headline: 'Currently unavailable',
      detail: 'This model is out of stock.',
      etaLabel: 'Contact us for availability',
      preorderWeeks: null,
    };
  }

  const inStock =
    availableForSale && (quantityAvailable == null || quantityAvailable > 0);

  if (inStock) {
    return {
      status: 'in_stock',
      headline: 'In stock',
      detail: 'Free UK mainland delivery',
      etaLabel: 'Delivers in 5–7 working days',
      preorderWeeks: null,
    };
  }

  const weeks = getPreorderWeeks(handle);
  const weeksLabel = formatPreorderWeeksLabel(weeks);

  return {
    status: 'preorder',
    headline: 'Pre-order',
    detail: `Estimated delivery ${weeksLabel}`,
    etaLabel: `Est. arrival around ${getPreorderDeliveryDate(weeks)}`,
    preorderWeeks: weeks,
  };
}

/**
 * Cart / order-summary delivery copy from line merchandise.
 * Prefers the longest pre-order lead time when mixed; falls back to in-stock.
 */
export function getCartDeliveryInfo(
  lines: Array<{
    merchandise?: {
      availableForSale?: boolean | null;
      quantityAvailable?: number | null;
      product?: {handle?: string | null} | null;
    } | null;
  }>,
): DeliveryInfo {
  if (!lines.length) {
    return getDeliveryInfo({availableForSale: true, quantityAvailable: 1});
  }

  let worstPreorder: DeliveryInfo | null = null;

  for (const line of lines) {
    const merchandise = line.merchandise;
    if (!merchandise) continue;

    const info = getDeliveryInfo({
      availableForSale: merchandise.availableForSale ?? true,
      quantityAvailable: merchandise.quantityAvailable,
      handle: merchandise.product?.handle,
    });

    if (info.status !== 'preorder') continue;

    if (
      !worstPreorder ||
      (info.preorderWeeks ?? 0) > (worstPreorder.preorderWeeks ?? 0)
    ) {
      worstPreorder = info;
    }
  }

  if (worstPreorder) return worstPreorder;

  return getDeliveryInfo({availableForSale: true, quantityAvailable: 1});
}

/** @deprecated Use getDeliveryInfo for structured UI */
export function getDeliveryEstimate({
  availableForSale,
  quantityAvailable,
  handle,
}: {
  availableForSale: boolean;
  quantityAvailable?: number | null;
  handle?: string | null;
}): string {
  const info = getDeliveryInfo({availableForSale, quantityAvailable, handle});
  if (info.status === 'sold_out') {
    return `${info.headline}. ${info.detail}`;
  }
  return `${info.headline}. ${info.etaLabel}.`;
}
