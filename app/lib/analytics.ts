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

export type LeadType = 'demo' | 'quote' | 'contact' | 'phone';

export type GtagIds = {
  ga4Id?: string | null;
  googleAdsId?: string | null;
};

let gtagBootstrapped = false;
const configuredIds = new Set<string>();

export function googleAdsConversionSendTo(
  adsId?: string | null,
  label?: string | null,
): string | null {
  const id = adsId?.trim();
  const conversionLabel = label?.trim();
  if (!id || !conversionLabel) return null;
  const prefixed = id.toUpperCase().startsWith('AW-') ? id : `AW-${id}`;
  return `${prefixed}/${conversionLabel}`;
}

export function initGtag({ga4Id, googleAdsId}: GtagIds): void {
  if (typeof window === 'undefined') return;

  if (!gtagBootstrapped) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date());
    gtagBootstrapped = true;
  }

  const gtag = window.gtag;
  if (!gtag) return;

  if (ga4Id && !configuredIds.has(ga4Id)) {
    gtag('config', ga4Id, {send_page_view: false});
    configuredIds.add(ga4Id);
  }

  if (googleAdsId && !configuredIds.has(googleAdsId)) {
    gtag('config', googleAdsId);
    configuredIds.add(googleAdsId);
  }
}

/** @deprecated Prefer initGtag — kept for existing GA4-only call sites. */
export function initGa4(measurementId: string): void {
  initGtag({ga4Id: measurementId});
}

export function loadGtagScript({ga4Id, googleAdsId}: GtagIds): void {
  if (typeof document === 'undefined') return;
  const scriptId = ga4Id || googleAdsId;
  if (!scriptId) return;

  if (!document.getElementById('gtag-script')) {
    const script = document.createElement('script');
    script.id = 'gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${scriptId}`;
    document.head.appendChild(script);
  }

  initGtag({ga4Id, googleAdsId});
}

/** @deprecated Prefer loadGtagScript. */
export function loadGa4Script(measurementId: string): void {
  loadGtagScript({ga4Id: measurementId});
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

export function trackGenerateLead(leadType: LeadType): void {
  window.gtag?.('event', 'generate_lead', {
    currency: 'GBP',
    lead_type: leadType,
  });
}

export function trackAdsConversion(
  sendTo: string,
  extra?: Record<string, string>,
): void {
  window.gtag?.('event', 'conversion', {
    send_to: sendTo,
    ...extra,
  });
}

export function trackPhoneClick(): void {
  window.gtag?.('event', 'phone_click', {
    event_category: 'engagement',
    event_label: 'tel',
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

export function resetGtagForTests(): void {
  gtagBootstrapped = false;
  configuredIds.clear();
}
