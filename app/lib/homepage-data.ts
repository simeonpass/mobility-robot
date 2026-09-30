/**
 * Flagship models shown on the homepage grid and comparison table.
 * Ordered M series → X series.
 */
import {catalogToExVatAmount} from '~/lib/pricing-mode';
import m8Poster from '~/assets/m8-hero-poster.jpg';
import m8FullFilm from '~/assets/m8-full-film.mp4';

/** Every flagship chair the storefront knows about, paused or not. */
export const ALL_FLAGSHIP_HANDLES = [
  'xsto-m4',
  'xsto-m4b',
  'xsto-m4-pro',
  'xsto-m8',
  'xsto-m8-pro',
  'xsto-x12',
  'xsto-x12-pro',
] as const satisfies readonly HomepageProductHandle[];

export type HomepageFlagshipHandle = (typeof ALL_FLAGSHIP_HANDLES)[number];

/**
 * Models switched off across the storefront for now (the M8s are waiting on
 * proper photography). A paused model drops out of the hero, range grid,
 * navigation, footer, compare table, series pages, enquiry forms, search,
 * shop-all, sitemaps and the Merchant Center feed, and its product URL
 * temporarily redirects to the range. Remove a handle here to bring the
 * model back everywhere at once.
 */
export const PAUSED_FLAGSHIP_HANDLES: readonly HomepageFlagshipHandle[] = [
  'xsto-m8',
  'xsto-m8-pro',
];

export function isPausedFlagshipSlot(slot: string): boolean {
  return (PAUSED_FLAGSHIP_HANDLES as readonly string[]).includes(slot);
}

/** Enquiry-form labels ("M8 Pro") for models that are paused. */
export function isPausedModelLabel(label: string): boolean {
  return PAUSED_FLAGSHIP_HANDLES.some(
    (slot) => HOMEPAGE_FLAGSHIP_LABELS[slot] === label,
  );
}

/** Flagship chairs currently on sale and shown across the site. */
export const HOMEPAGE_FLAGSHIP_HANDLES: readonly HomepageFlagshipHandle[] =
  ALL_FLAGSHIP_HANDLES.filter((slot) => !isPausedFlagshipSlot(slot));

export type ProductSeriesKey = 'm4' | 'm8' | 'x12';

export const PRODUCT_SERIES: readonly {
  key: ProductSeriesKey;
  title: string;
  slots: readonly HomepageFlagshipHandle[];
}[] = [
  {
    key: 'm4',
    title: 'M4 Series',
    slots: ['xsto-m4', 'xsto-m4b', 'xsto-m4-pro'],
  },
  {key: 'm8', title: 'M8 Series', slots: ['xsto-m8', 'xsto-m8-pro']},
  {key: 'x12', title: 'X12 Series', slots: ['xsto-x12', 'xsto-x12-pro']},
];

/** A series is paused once every chair in it is paused. */
export function isPausedSeries(key: string): boolean {
  const series = PRODUCT_SERIES.find((item) => item.key === key);
  return Boolean(series?.slots.every((slot) => isPausedFlagshipSlot(slot)));
}

/** Series with at least one chair on sale, in catalogue order. */
export const ACTIVE_PRODUCT_SERIES = PRODUCT_SERIES.filter(
  (series) => !isPausedSeries(series.key),
);

/** "M4 and X12" / "M4, M8 and X12" — for copy that lists the range. */
export function formatActiveSeriesList(conjunction = 'and'): string {
  const names = ACTIVE_PRODUCT_SERIES.map((series) => series.key.toUpperCase());
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} ${conjunction} ${names[names.length - 1]}`;
}

export const HOMEPAGE_PRODUCT_BADGES: Record<
  HomepageFlagshipHandle,
  {badge: string; shortName: string; exploreLabel: string}
> = {
  'xsto-m8': {
    badge: 'Pre-order',
    shortName: 'XSTO M8',
    exploreLabel: 'Explore XSTO M8',
  },
  'xsto-m8-pro': {
    badge: 'Pre-order',
    shortName: 'XSTO M8 Pro',
    exploreLabel: 'Explore XSTO M8 Pro',
  },
  'xsto-m4': {
    badge: 'Self-Levelling',
    shortName: 'XSTO M4',
    exploreLabel: 'Explore XSTO M4',
  },
  'xsto-m4-pro': {
    badge: 'Customisable',
    shortName: 'XSTO M4 Pro',
    exploreLabel: 'Explore XSTO M4 Pro',
  },
  'xsto-m4b': {
    badge: 'New',
    shortName: 'XSTO M4B',
    exploreLabel: 'Explore XSTO M4B',
  },
  'xsto-x12-pro': {
    badge: 'Stair Climber',
    shortName: 'XSTO X12 Pro',
    exploreLabel: 'Explore XSTO X12 Pro',
  },
  'xsto-x12': {
    badge: 'Stair Climber',
    shortName: 'XSTO X12',
    exploreLabel: 'Explore XSTO X12',
  },
};

/** M4B launch film — Shopify CDN MP4 used by the experience-range M4B card. */
export const HERO_VIDEO_URL =
  'https://cdn.shopify.com/videos/c/o/v/24482dbe89234283a018301fa020db98.mp4';

export type HomepageVideoItem = {
  id: string;
  title: string;
  description: string;
  /** YouTube ID for iframe playback. */
  youtubeId?: string;
  /** Direct MP4/CDN URL (click-to-play; used when no YouTube ID). */
  videoUrl?: string;
};

export const HOMEPAGE_VIDEO_ITEMS: readonly HomepageVideoItem[] = [
  {
    id: 'm4',
    youtubeId: 'D-7Pt3OUdQg',
    title: 'XSTO M4 — Essential Edition',
    description:
      "See the M4's self-balancing technology, foldable design, and omnidirectional movement in action",
  },
  {
    id: 'm4-pro',
    youtubeId: 'R2eyc-2uYNQ',
    title: 'XSTO M4 Pro — Premium Edition',
    description:
      'Discover the M4 Pro with integrated headrest, electric folding, and LED safety lighting',
  },
  {
    id: 'm4b',
    // Shopify CDN MP4 (no dedicated M4B YouTube yet).
    videoUrl: HERO_VIDEO_URL,
    title: 'XSTO M4B — Improved Footrest & Front Suspension',
    description:
      'See the M4B platform with its improved folding footrest, new front suspension and self-balancing control',
  },
  {
    id: 'x12',
    youtubeId: 'ihXdzLuNz2s',
    title: 'XSTO X12 — Stair Climber',
    description:
      'See the X12 in action on suitable stairs and outdoor routes. Compare X12 and X12 Pro with its electric elevating leg rest on their individual product pages',
  },
];

export type ComparisonFeatureRow = {
  label: string;
  values: Record<HomepageFlagshipHandle, string | boolean>;
};

/** Feature matrix for the homepage comparison table. */
export const HOMEPAGE_COMPARISON_FEATURES: ComparisonFeatureRow[] = [
  {
    label: 'Self-Balancing',
    values: {
      'xsto-m8': true,
      'xsto-m8-pro': true,
      'xsto-m4': true,
      'xsto-m4-pro': true,
      'xsto-m4b': true,
      'xsto-x12': true,
      'xsto-x12-pro': true,
    },
  },
  {
    label: 'Foldable',
    values: {
      'xsto-m8': true,
      'xsto-m8-pro': true,
      'xsto-m4': true,
      'xsto-m4-pro': true,
      'xsto-m4b': true,
      'xsto-x12': true,
      'xsto-x12-pro': true,
    },
  },
  {
    label: 'Stair Climbing',
    values: {
      'xsto-m8': false,
      'xsto-m8-pro': false,
      'xsto-m4': false,
      'xsto-m4-pro': false,
      'xsto-m4b': false,
      'xsto-x12': true,
      'xsto-x12-pro': true,
    },
  },
  {
    label: 'Headrest',
    values: {
      'xsto-m8': 'Confirm configuration',
      'xsto-m8-pro': 'Confirm configuration',
      'xsto-m4': false,
      'xsto-m4-pro': true,
      'xsto-m4b': false,
      'xsto-x12': false,
      'xsto-x12-pro': false,
    },
  },
  {
    label: 'Electric Legrest',
    values: {
      'xsto-m8': false,
      'xsto-m8-pro': true,
      'xsto-m4': false,
      'xsto-m4-pro': false,
      'xsto-m4b': false,
      'xsto-x12': false,
      'xsto-x12-pro': true,
    },
  },
  {
    label: 'Folding Footrest',
    values: {
      'xsto-m8': 'Manual',
      'xsto-m8-pro': 'Powered',
      'xsto-m4': false,
      'xsto-m4-pro': false,
      'xsto-m4b': true,
      'xsto-x12': false,
      'xsto-x12-pro': false,
    },
  },
  {
    label: 'Max Slope',
    values: {
      'xsto-m8': '15°',
      'xsto-m8-pro': '15°',
      'xsto-m4': '10°',
      'xsto-m4-pro': '15°',
      'xsto-m4b': '10°',
      'xsto-x12': '40°',
      'xsto-x12-pro': '40°',
    },
  },
  {
    label: 'Range',
    values: {
      'xsto-m8': 'Up to 54 km*',
      'xsto-m8-pro': 'Up to 54 km*',
      'xsto-m4': '15 km',
      'xsto-m4-pro': '26 km',
      'xsto-m4b': '15 km',
      'xsto-x12': '35 km',
      'xsto-x12-pro': '35 km',
    },
  },
  {
    label: 'Top Speed',
    values: {
      'xsto-m8': 'Confirm UK configuration',
      'xsto-m8-pro': 'Confirm UK configuration',
      'xsto-m4': '6 km/h',
      'xsto-m4-pro': '6 km/h',
      'xsto-m4b': '6 km/h',
      'xsto-x12': '12 km/h',
      'xsto-x12-pro': '12 km/h',
    },
  },
  {
    label: 'Weight',
    values: {
      'xsto-m8': '68.6 kg (no batteries)',
      'xsto-m8-pro': '72.6 kg (no batteries)',
      'xsto-m4': '51.5 kg',
      'xsto-m4-pro': '60.1 kg',
      'xsto-m4b': '55.5 kg',
      'xsto-x12': '112.8 kg',
      'xsto-x12-pro': '115.8 kg',
    },
  },
];

export const HOMEPAGE_FLAGSHIP_LABELS: Record<HomepageFlagshipHandle, string> =
  {
    'xsto-m8': 'M8',
    'xsto-m8-pro': 'M8 Pro',
    'xsto-m4': 'M4',
    'xsto-m4-pro': 'M4 Pro',
    'xsto-m4b': 'M4B',
    'xsto-x12': 'X12',
    'xsto-x12-pro': 'X12 Pro',
  };

/**
 * Product thumbs for mega menu / nav (Shopify Files CDN).
 * Prefer transparent or clean cutouts when available.
 */
export const HOMEPAGE_PRODUCT_THUMBS: Record<HomepageFlagshipHandle, string> = {
  'xsto-m8':
    'https://cdn.shopify.com/s/files/1/0904/4541/4778/files/m8-standard-original.webp',
  'xsto-m8-pro':
    'https://cdn.shopify.com/s/files/1/0904/4541/4778/files/m8-pro-front.webp',
  'xsto-m4': 'https://cdn.shopify.com/s/files/1/0904/4541/4778/files/m4-01.jpg',
  'xsto-m4b': 'https://cdn.shopify.com/s/files/1/0904/4541/4778/files/M4B.png',
  'xsto-m4-pro':
    'https://cdn.shopify.com/s/files/1/0904/4541/4778/files/xsto-m4-pro-mobility-wheelchair-adjustable-seat-backrest-9425362.jpg',
  'xsto-x12-pro':
    'https://cdn.shopify.com/s/files/1/0904/4541/4778/files/x12-all-terrain-mobility-robot-8874875.jpg',
  'xsto-x12':
    'https://cdn.shopify.com/s/files/1/0904/4541/4778/files/x12-all-terrain-mobility-robot-8874875.jpg',
};

/** Canonical product slots used for specs, comparison data, and bullets. */
export const HOMEPAGE_PRODUCT_HANDLES = [
  'xsto-m8',
  'xsto-m8-pro',
  'xsto-m4',
  'xsto-m4-pro',
  'xsto-m4b',
  'xsto-x12',
  'xsto-x12-pro',
] as const;

export type HomepageProductHandle = (typeof HOMEPAGE_PRODUCT_HANDLES)[number];

/**
 * Live Shopify product handles (Storefront API).
 * Update here when handles change in Shopify admin.
 */
export const SHOPIFY_HOME_PRODUCT_HANDLES: Record<
  HomepageProductHandle,
  string
> = {
  'xsto-m8': 'xsto-m8',
  'xsto-m8-pro': 'xsto-m8-pro',
  'xsto-m4': 'buy-robot-wheelchair',
  'xsto-m4-pro': 'xsto-m4-pro',
  'xsto-m4b': 'xsto-m4b-1',
  'xsto-x12': 'x12-all-terrain-mobility-robot',
  'xsto-x12-pro':
    'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
};

/**
 * Product handles that must not appear on the UK storefront.
 * EzGo2 carbon lightweight chair is not authorised for UK sale.
 */
export const UK_UNAVAILABLE_PRODUCT_HANDLES = [
  'xsto-ezgo2',
  'xsto-ezgo2-carbon-fiber-power-wheelchair',
  'ezgo2-mobility-robot',
] as const;

export function isUkUnavailableProductHandle(handle: string): boolean {
  const h = handle.trim().toLowerCase();
  if (!h) return false;
  if ((UK_UNAVAILABLE_PRODUCT_HANDLES as readonly string[]).includes(h)) {
    return true;
  }
  return h.startsWith('xsto-ezgo2') || h.startsWith('ezgo2-');
}

/**
 * Shopify products that remain as cart SKUs but must not appear as their
 * own storefront listing. Both X12 models now have standalone products.
 */
export const MERGED_AWAY_PRODUCT_HANDLES: readonly string[] = [];

export function isMergedAwayProductHandle(handle: string): boolean {
  const h = handle.trim().toLowerCase();
  if (!h) return false;
  return (MERGED_AWAY_PRODUCT_HANDLES as readonly string[]).includes(h);
}

/** Shopify product handle → paused flagship chair? */
export function isPausedProductHandle(handle: string): boolean {
  const slot = getHomepageProductSlot(handle.trim().toLowerCase());
  return slot ? isPausedFlagshipSlot(slot) : false;
}

/** Hidden from grids, search, sitemaps, shop-all and the merchant feed. */
export function isHiddenStorefrontProductHandle(handle: string): boolean {
  return (
    isUkUnavailableProductHandle(handle) ||
    isMergedAwayProductHandle(handle) ||
    isPausedProductHandle(handle)
  );
}

/** Reverse lookup: Shopify handle → canonical slot (for bullets/specs). */
export const HOMEPAGE_PRODUCT_SLOT_BY_SHOPIFY_HANDLE: Record<
  string,
  HomepageProductHandle
> = Object.fromEntries(
  Object.entries(SHOPIFY_HOME_PRODUCT_HANDLES).map(([slot, handle]) => [
    handle,
    slot as HomepageProductHandle,
  ]),
) as Record<string, HomepageProductHandle>;

export function getHomepageProductSlot(
  shopifyHandle: string,
): HomepageProductHandle | undefined {
  if (HOMEPAGE_PRODUCT_SLOT_BY_SHOPIFY_HANDLE[shopifyHandle]) {
    return HOMEPAGE_PRODUCT_SLOT_BY_SHOPIFY_HANDLE[shopifyHandle];
  }

  // Short / legacy chair handles only.
  // Must be the whole handle or a known chair-product prefix — never a mid-string
  // match. Accessory handles like
  // `bluetooth-controller-for-m4-m4h-m4-pro-x12-x12-pro` mention models in the
  // slug and must NOT resolve as chairs.
  if (
    shopifyHandle === 'xsto-x12-pro' ||
    shopifyHandle.startsWith('xsto-x12-pro-')
  ) {
    return 'xsto-x12-pro';
  }
  if (
    shopifyHandle === 'xsto-x12' ||
    shopifyHandle.startsWith('x12-all-terrain-')
  ) {
    return 'xsto-x12';
  }
  if (shopifyHandle === 'xsto-m4b' || shopifyHandle.startsWith('xsto-m4b-')) {
    return 'xsto-m4b';
  }
  if (
    shopifyHandle === 'xsto-m4-pro' ||
    shopifyHandle.startsWith('xsto-m4-pro-')
  ) {
    return 'xsto-m4-pro';
  }
  if (shopifyHandle === 'xsto-m4' || shopifyHandle === 'buy-robot-wheelchair') {
    return 'xsto-m4';
  }

  return undefined;
}

/** Homepage hero YouTube video — X12 stair-climbing / all-terrain film. */
export const HOMEPAGE_HERO_YOUTUBE_ID = 'ihXdzLuNz2s';

/** Bundled M8 poster is also the no-motion / autoplay-blocked fallback. */
export const HOMEPAGE_HERO_POSTER_URL = m8Poster;
export const HOMEPAGE_HERO_POSTER_SRC_SET = `${m8Poster} 1600w`;
export const M8_FULL_VIDEO_URL = m8FullFilm;

export function heroYoutubePosterUrl(
  videoId = HOMEPAGE_HERO_YOUTUBE_ID,
): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function buildHeroYoutubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: videoId,
    controls: '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    iv_load_policy: '3',
    disablekb: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/** Bundled hero poster — avoids /public 404s on Oxygen preview deploys. */
export {default as HOMEPAGE_HERO_POSTER} from '~/assets/hero-poster.jpg';

/** Bullet specs for product cards — keyed by canonical slot. */
export const HOMEPAGE_PRODUCT_BULLETS: Record<HomepageProductHandle, string[]> =
  {
    'xsto-m8': [
      'Four-wheel drive · self-balancing chassis',
      '450–730 mm powered seat elevation',
      'Manual reclining backrest · 150 kg capacity',
    ],
    'xsto-m8-pro': [
      'Four-wheel drive · self-balancing chassis',
      'Powered recline and leg rest',
      '450–730 mm powered seat elevation · 150 kg capacity',
    ],
    'xsto-m4': [
      'Self-balancing smart control platform',
      'Electric height adjustment (347–650 mm)',
      '15 km range · one-button folding',
    ],
    'xsto-m4-pro': [
      '150 kg capacity · 26 km range',
      '0–20° seat tilt · 135° backrest recline',
      'Integrated LED head, tail and turn lights',
    ],
    'xsto-m4b': [
      'Improved footrest · new front suspension',
      'Self-balancing chassis · 10° slopes',
      'Electric height adjustment 347–650 mm',
    ],
    'xsto-x12': [
      'Climbs stairs up to 40° incline',
      '35 km range on dual batteries',
      'Optional electric elevating leg rest',
    ],
    'xsto-x12-pro': [
      'Climbs stairs up to 40° incline',
      'Electric elevating leg rest',
      '35 km dual-battery range',
    ],
  };

export type ComparisonRow = {
  model: string;
  handle: HomepageProductHandle;
  shopifyHandle: string;
  weight: string;
  capacity: string;
  range: string;
  foldedSize: string;
};

/** Comparison strip data — sourced from docs/rebuild product specs. */
export const HOMEPAGE_COMPARISON_ROWS: ComparisonRow[] = [
  {
    model: 'M4',
    handle: 'xsto-m4',
    shopifyHandle: SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4'],
    weight: '51.5 kg',
    capacity: '115 kg',
    range: '15 km',
    foldedSize: '1040 × 580 × 570 mm',
  },
  {
    model: 'M4B',
    handle: 'xsto-m4b',
    shopifyHandle: SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4b'],
    weight: '55.5 kg',
    capacity: '115 kg',
    range: '15 km',
    foldedSize: '1040 × 590 × 570 mm',
  },
  {
    model: 'M4 Pro',
    handle: 'xsto-m4-pro',
    shopifyHandle: SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4-pro'],
    weight: '60.1 kg',
    capacity: '150 kg',
    range: '26 km',
    foldedSize: '1040 × 592 × 770 mm',
  },
  {
    model: 'M8',
    handle: 'xsto-m8',
    shopifyHandle: 'xsto-m8',
    weight: '68.6 kg',
    capacity: '150 kg',
    range: '54 km (optional battery)',
    foldedSize: '1063 × 610 × 730 mm',
  },
  {
    model: 'M8 Pro',
    handle: 'xsto-m8-pro',
    shopifyHandle: 'xsto-m8-pro',
    weight: '72.6 kg',
    capacity: '150 kg',
    range: '54 km (optional battery)',
    foldedSize: '1129 × 610 × 730 mm',
  },
  {
    model: 'X12',
    handle: 'xsto-x12',
    shopifyHandle: SHOPIFY_HOME_PRODUCT_HANDLES['xsto-x12'],
    weight: '112.8 kg',
    capacity: '136 kg',
    range: '35 km',
    foldedSize: '1185 × 685 × 617 mm',
  },
  {
    model: 'X12 Pro',
    handle: 'xsto-x12-pro',
    shopifyHandle: SHOPIFY_HOME_PRODUCT_HANDLES['xsto-x12-pro'],
    weight: '115.8 kg',
    capacity: '136 kg',
    range: '35 km',
    foldedSize: '1185 × 685 × 617 mm',
  },
];

/**
 * Homepage "From" price overrides (ex-VAT marketing amounts).
 * Used when Shopify Admin still has a different live price — cart/checkout
 * continue to use the Storefront API amount until Admin is updated.
 */
export const HOMEPAGE_DISPLAY_PRICE_EX_VAT: Partial<
  Record<HomepageFlagshipHandle, {amount: number; currencyCode: string}>
> = {};

export function formatExVatPrice(amount: string, currencyCode: string): string {
  const exVat = catalogToExVatAmount(amount);
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(exVat);
}

/** Homepage grid "From" price — prefers display overrides over Shopify. */
export function formatHomepageFromPrice(
  slot: HomepageFlagshipHandle | undefined,
  amount: string,
  currencyCode: string,
): string {
  const override = slot ? HOMEPAGE_DISPLAY_PRICE_EX_VAT[slot] : undefined;
  if (override) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: override.currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(override.amount);
  }
  return formatExVatPrice(amount, currencyCode);
}

export function youtubeEmbedUrl(
  videoId: string,
  options?: {autoplay?: boolean; controls?: boolean},
): string {
  const params = new URLSearchParams({
    autoplay: options?.autoplay ? '1' : '0',
    mute: '1',
    loop: '1',
    playlist: videoId,
    controls: options?.controls === false ? '0' : '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    enablejsapi: '1',
    iv_load_policy: '3',
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
