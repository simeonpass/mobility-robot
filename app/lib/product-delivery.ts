import {accessoryFitsX12} from '~/lib/accessories';
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

/** X12 accessories ship as a backorder — still buyable, ~4 week lead time. */
export const X12_ACCESSORY_PREORDER_WEEKS = 4;
export const X12_ACCESSORY_PREORDER_LABEL = '~4 weeks';

/**
 * Per-product pre-order ETA (upper-bound weeks for date estimates / cart sorting).
 * Keys are Shopify product handles and homepage slot aliases.
 * Used when a product is available for sale but qty is 0 (continue selling),
 * or when the handle is in FORCE_PREORDER_SLOTS.
 */
export const PREORDER_WEEKS_BY_HANDLE: Record<string, number> = {};

/** Customer-facing lead-time labels (prefer ranges over a single week count). */
export const PREORDER_WEEKS_LABEL_BY_HANDLE: Record<string, string> = {};

/**
 * Slot handles that always show as pre-order, even with Shopify stock.
 * Currently none — X12 / X12 Pro ship in stock with a 10-day lead time.
 */
const FORCE_PREORDER_SLOTS = new Set<string>();

/**
 * Slot handles that always show as in stock when available for sale,
 * even if Shopify quantity is 0 (continue selling).
 */
const FORCE_IN_STOCK_SLOTS = new Set(['xsto-x12', 'xsto-x12-pro']);

/** Slot handles that show a "Very low stock" urgency alert when available. */
const FORCE_LOW_STOCK_SLOTS = new Set<string>();

function matchesForcedSlots(
  handle: string | null | undefined,
  slots: Set<string>,
  extraHandles: readonly string[] = [],
): boolean {
  if (!handle) return false;
  const slot = getHomepageProductSlot(handle);
  if (slot != null && slots.has(slot)) return true;
  return extraHandles.includes(handle);
}

export function isForcedPreorder(handle?: string | null): boolean {
  return matchesForcedSlots(handle, FORCE_PREORDER_SLOTS);
}

/** Accessories for the X12 are sold on a 4-week pre-order / backorder. */
export function isX12AccessoryBackorder(handle?: string | null): boolean {
  return accessoryFitsX12(handle);
}

export function isForcedInStock(handle?: string | null): boolean {
  return matchesForcedSlots(handle, FORCE_IN_STOCK_SLOTS, [
    'x12-all-terrain-mobility-robot',
    'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
  ]);
}

export function isForcedLowStock(handle?: string | null): boolean {
  return matchesForcedSlots(handle, FORCE_LOW_STOCK_SLOTS);
}

export function getPreorderWeeks(handle?: string | null): number {
  if (!handle) return DEFAULT_PREORDER_WEEKS;

  if (isX12AccessoryBackorder(handle)) return X12_ACCESSORY_PREORDER_WEEKS;

  const direct = PREORDER_WEEKS_BY_HANDLE[handle];
  if (direct != null) return direct;

  const slot = getHomepageProductSlot(handle);
  if (slot && PREORDER_WEEKS_BY_HANDLE[slot] != null) {
    return PREORDER_WEEKS_BY_HANDLE[slot];
  }

  return DEFAULT_PREORDER_WEEKS;
}

export function getPreorderWeeksLabel(handle?: string | null): string {
  if (handle) {
    if (isX12AccessoryBackorder(handle)) return X12_ACCESSORY_PREORDER_LABEL;

    const direct = PREORDER_WEEKS_LABEL_BY_HANDLE[handle];
    if (direct) return direct;

    const slot = getHomepageProductSlot(handle);
    if (slot && PREORDER_WEEKS_LABEL_BY_HANDLE[slot]) {
      return PREORDER_WEEKS_LABEL_BY_HANDLE[slot];
    }
  }

  return formatPreorderWeeksLabel(getPreorderWeeks(handle));
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
 * (M-series).
 */
export const FAST_IN_STOCK_DELIVERY_DAYS = '3–4 working days';

/** X12 / X12 Pro in-stock lead time. */
export const X12_IN_STOCK_DELIVERY_DAYS = '10 days';

/** Upper-bound working/calendar days used to pick the slowest cart ETA. */
const DEFAULT_IN_STOCK_LEAD_DAYS = 7;
const FAST_IN_STOCK_LEAD_DAYS = 4;
const X12_IN_STOCK_LEAD_DAYS = 10;

/** @deprecated Use FAST_IN_STOCK_DELIVERY_DAYS */
export const M_SERIES_IN_STOCK_DELIVERY_DAYS = FAST_IN_STOCK_DELIVERY_DAYS;

const FAST_IN_STOCK_SLOTS = new Set(['xsto-m4', 'xsto-m4b', 'xsto-m4-pro']);
const X12_IN_STOCK_SLOTS = new Set(['xsto-x12', 'xsto-x12-pro']);

export function getInStockDeliveryDays(handle?: string | null): string {
  if (!handle) return DEFAULT_IN_STOCK_DELIVERY_DAYS;

  const slot = getHomepageProductSlot(handle);
  if (slot && FAST_IN_STOCK_SLOTS.has(slot)) {
    return FAST_IN_STOCK_DELIVERY_DAYS;
  }
  if (slot && X12_IN_STOCK_SLOTS.has(slot)) {
    return X12_IN_STOCK_DELIVERY_DAYS;
  }

  return DEFAULT_IN_STOCK_DELIVERY_DAYS;
}

export function getInStockLeadDays(handle?: string | null): number {
  if (!handle) return DEFAULT_IN_STOCK_LEAD_DAYS;

  const slot = getHomepageProductSlot(handle);
  if (slot && FAST_IN_STOCK_SLOTS.has(slot)) {
    return FAST_IN_STOCK_LEAD_DAYS;
  }
  if (slot && X12_IN_STOCK_SLOTS.has(slot)) {
    return X12_IN_STOCK_LEAD_DAYS;
  }

  return DEFAULT_IN_STOCK_LEAD_DAYS;
}

export function formatInStockEtaLabel(handle?: string | null): string {
  return `Delivers in ${getInStockDeliveryDays(handle)}`;
}

export function formatPreorderWeeksLabel(weeks: number): string {
  return weeks === 1 ? '~1 week' : `~${weeks} weeks`;
}

function inStockDelivery(handle?: string | null): DeliveryInfo {
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

function x12AccessoryBackorderDelivery(handle?: string | null): DeliveryInfo {
  const weeks = getPreorderWeeks(handle);
  const weeksLabel = getPreorderWeeksLabel(handle);
  return {
    status: 'preorder',
    headline: 'Pre-order',
    detail: `Available to order now · estimated delivery ${weeksLabel}`,
    etaLabel: `Est. arrival around ${getPreorderDeliveryDate(weeks)}`,
    preorderWeeks: weeks,
  };
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

  if (isForcedPreorder(handle)) {
    const weeks = getPreorderWeeks(handle);
    const weeksLabel = getPreorderWeeksLabel(handle);
    return {
      status: 'preorder',
      headline: 'Pre-order',
      detail: `Estimated delivery ${weeksLabel} · 10% deposit available`,
      etaLabel: `Est. arrival around ${getPreorderDeliveryDate(weeks)}`,
      preorderWeeks: weeks,
    };
  }

  if (isX12AccessoryBackorder(handle)) {
    return x12AccessoryBackorderDelivery(handle);
  }

  // X12 / X12 Pro: in stock with a 10-day lead time, even if Shopify qty is 0.
  if (isForcedInStock(handle)) {
    return inStockDelivery(handle);
  }

  const inStock =
    availableForSale && (quantityAvailable == null || quantityAvailable > 0);

  if (inStock) {
    return inStockDelivery(handle);
  }

  const weeks = getPreorderWeeks(handle);
  const weeksLabel = getPreorderWeeksLabel(handle);

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
 * Prefers the longest pre-order lead time when mixed; otherwise the
 * slowest in-stock ETA (so an X12 10-day line is not hidden by M-series).
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
  let slowestInStock: DeliveryInfo | null = null;
  let slowestInStockDays = 0;

  for (const line of lines) {
    const merchandise = line.merchandise;
    if (!merchandise) continue;

    const handle = merchandise.product?.handle;
    const info = getDeliveryInfo({
      availableForSale: merchandise.availableForSale ?? true,
      quantityAvailable: merchandise.quantityAvailable,
      handle,
    });

    if (info.status === 'preorder') {
      if (
        !worstPreorder ||
        (info.preorderWeeks ?? 0) > (worstPreorder.preorderWeeks ?? 0)
      ) {
        worstPreorder = info;
      }
      continue;
    }

    if (info.status === 'in_stock' || info.status === 'low_stock') {
      const days = getInStockLeadDays(handle);
      if (!slowestInStock || days > slowestInStockDays) {
        slowestInStock = info;
        slowestInStockDays = days;
      }
    }
  }

  if (worstPreorder && slowestInStock) {
    const weeks = worstPreorder.preorderWeeks ?? DEFAULT_PREORDER_WEEKS;
    return {
      status: 'preorder',
      headline: 'Split delivery',
      detail: `${slowestInStock.etaLabel} for in-stock items`,
      etaLabel: `Pre-order accessories arrive around ${getPreorderDeliveryDate(weeks)}`,
      preorderWeeks: weeks,
    };
  }

  if (worstPreorder) return worstPreorder;
  if (slowestInStock) return slowestInStock;

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
