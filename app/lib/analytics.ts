declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type Ga4Item = {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
  item_brand?: string;
  item_category?: string;
};

let ga4Initialized = false;

export function initGa4(measurementId: string): void {
  if (typeof window === 'undefined' || ga4Initialized) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {send_page_view: false});
  ga4Initialized = true;
}

export function loadGa4Script(measurementId: string): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById('ga4-script')) return;

  const script = document.createElement('script');
  script.id = 'ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
  initGa4(measurementId);
}

export function trackPageView(path: string, title?: string): void {
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_title: title ?? document.title,
  });
}

export function trackViewItem(item: Ga4Item, currency = 'GBP'): void {
  window.gtag?.('event', 'view_item', {
    currency,
    value: item.price,
    items: [item],
  });
}

export function trackViewItemList(
  listName: string,
  items: Ga4Item[],
  currency = 'GBP',
): void {
  window.gtag?.('event', 'view_item_list', {
    item_list_name: listName,
    currency,
    items,
  });
}

export function trackAddToCart(item: Ga4Item, currency = 'GBP'): void {
  window.gtag?.('event', 'add_to_cart', {
    currency,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackRemoveFromCart(item: Ga4Item, currency = 'GBP'): void {
  window.gtag?.('event', 'remove_from_cart', {
    currency,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackBeginCheckout(
  items: Ga4Item[],
  value: number,
  currency = 'GBP',
): void {
  window.gtag?.('event', 'begin_checkout', {
    currency,
    value,
    items,
  });
}

export function trackSelectPromotion(
  promotionId: string,
  promotionName: string,
): void {
  window.gtag?.('event', 'select_promotion', {
    promotion_id: promotionId,
    promotion_name: promotionName,
  });
}

export function toGa4Item(input: {
  id: string;
  title: string;
  price?: string | number;
  quantity?: number;
  vendor?: string;
}): Ga4Item {
  return {
    item_id: input.id,
    item_name: input.title,
    price:
      typeof input.price === 'string'
        ? Number.parseFloat(input.price)
        : input.price,
    quantity: input.quantity ?? 1,
    item_brand: input.vendor ?? 'XSTO',
    item_category: 'Wheelchairs',
  };
}
