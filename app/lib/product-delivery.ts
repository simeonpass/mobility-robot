import {getHomepageProductSlot} from '~/lib/homepage-data';

export type DeliveryStatus =
  | 'in_stock'
  | 'low_stock'
  | 'preorder'
  | 'sold_out';

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
 * Used when a product is available for sale but qty is 0 (continue selling),
 * or when the handle is in FORCE_PREORDER_SLOTS.
 */
export const PREORDER_WEEKS_BY_HANDLE: Record<string, number> = {
  'xsto-ezgo2-carbon-fiber-power-wheelchair': 2,
  'xsto-ezgo2': 2,
  'x12-all-terrain-mobility-robot': 10,
  'xsto-x12': 10,
  'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition': 10,
  'xsto-x12-pro': 10,
};

/**
 * Slot handles that always show as pre-order, even with Shopify stock.
 * X12 is inventory-driven (in stock when qty > 0); X12 Pro stays forced.
 */
const FORCE_PREORDER_SLOTS = new Set(['xsto-ezgo2', 'xsto-x12-pro']);

/** Slot handles that show a "Very low stock" urgency alert when available. */
const FORCE_LOW_STOCK_SLOTS = new Set(['xsto-x12']);

export function isForcedPreorder(handle?: string | null): boolean {
  if (!handle) return false;
  const slot = getHomepageProductSlot(handle);
  if (slot != null && FORCE_PREORDER_SLOTS.has(slot)) return true;
  // Direct Shopify handles that map to forced slots but may not resolve via slot
  if (
    handle === 'xsto-ezgo2-carbon-fiber-power-wheelchair' ||
    handle === 'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition'
  ) {
    return true;
  }
  return false;
}

export function isForcedLowStock(handle?: string | null): boolean {
  if (!handle) return false;
  const slot = getHomepageProductSlot(handle);
  if (slot != null && FORCE_LOW_STOCK_SLOTS.has(slot)) return true;
  return handle === 'x12-all-terrain-mobility-robot';
}

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

/** Default in-stock lead time when a product has no per-handle override. */
export const DEFAULT_IN_STOCK_DELIVERY_DAYS = '5–7 working days';

/**
 * In-stock delivery ETA for chairs that ship in 3–4 working days
 * (M-series + X12 when available).
 */
export const FAST_IN_STOCK_DELIVERY_DAYS = '3–4 working days';

/** @deprecated Use FAST_IN_STOCK_DELIVERY_DAYS */
export const M_SERIES_IN_STOCK_DELIVERY_DAYS = FAST_IN_STOCK_DELIVERY_DAYS;

const FAST_IN_STOCK_SLOTS = new Set([
  'xsto-m4',
  'xsto-m4b',
  'xsto-m4-pro',
  'xsto-x12',
]);

export function getInStockDeliveryDays(handle?: string | null): string {
  if (!handle) return DEFAULT_IN_STOCK_DELIVERY_DAYS;

  const slot = getHomepageProductSlot(handle);
  if (slot && FAST_IN_STOCK_SLOTS.has(slot)) {
    return FAST_IN_STOCK_DELIVERY_DAYS;
  }

  if (
    handle === 'x12-all-terrain-mobility-robot' ||
    handle === 'xsto-x12'
  ) {
    return FAST_IN_STOCK_DELIVERY_DAYS;
  }

  return DEFAULT_IN_STOCK_DELIVERY_DAYS;
}

export function formatInStockEtaLabel(handle?: string | null): string {
  return `Delivers in ${getInStockDeliveryDays(handle)}`;
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

  // EzGo2 / X12 Pro: always pre-order regardless of Shopify qty.
  if (isForcedPreorder(handle)) {
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

  const inStock =
    availableForSale && (quantityAvailable == null || quantityAvailable > 0);

  if (inStock) {
    if (isForcedLowStock(handle)) {
      return {
        status: 'low_stock',
        headline: 'Very low stock',
        detail: 'Limited availability — order soon',
        etaLabel: formatInStockEtaLabel(handle),
        preorderWeeks: null,
      };
    }

    return {
      status: 'in_stock',
      headline: 'In stock',
      detail: 'Free UK mainland delivery',
      etaLabel: formatInStockEtaLabel(handle),
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
