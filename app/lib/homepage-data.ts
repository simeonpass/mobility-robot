/**
 * Flagship models shown on the homepage grid and comparison table.
 * Ordered cheapest → most expensive (ex-VAT marketing / display prices).
 */
export const HOMEPAGE_FLAGSHIP_HANDLES = [
  'xsto-ezgo2',
  'xsto-m4',
  'xsto-m4b',
  'xsto-m4-pro',
  'xsto-x12',
  'xsto-x12-pro',
] as const satisfies readonly HomepageProductHandle[];

export type HomepageFlagshipHandle =
  (typeof HOMEPAGE_FLAGSHIP_HANDLES)[number];

export const HOMEPAGE_PRODUCT_BADGES: Record<
  HomepageFlagshipHandle,
  {badge: string; shortName: string; exploreLabel: string}
> = {
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
  'xsto-ezgo2': {
    badge: 'Ultra-Light',
    shortName: 'XSTO EzGo2',
    exploreLabel: 'Explore XSTO EzGo2',
  },
  'xsto-x12': {
    badge: 'Stair Climber',
    shortName: 'XSTO X12',
    exploreLabel: 'Explore XSTO X12',
  },
  'xsto-x12-pro': {
    badge: 'Fully Configurable',
    shortName: 'XSTO X12 Pro',
    exploreLabel: 'Explore XSTO X12 Pro',
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
    title: 'XSTO M4B — New Front Wheels',
    description:
      'See the M4B platform with redesigned front wheels, folding footrest, and self-balancing control',
  },
  {
    id: 'x12-pro',
    youtubeId: '4KFMBL5jX20',
    title: 'XSTO X12 Pro — Stair Climber',
    description:
      "See the X12 Pro climb stairs, tackle rough terrain, and deliver Pro-exclusive comfort features",
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
      'xsto-m4': true,
      'xsto-m4-pro': true,
      'xsto-m4b': true,
      'xsto-ezgo2': false,
      'xsto-x12': true,
      'xsto-x12-pro': true,
    },
  },
  {
    label: 'Foldable',
    values: {
      'xsto-m4': true,
      'xsto-m4-pro': true,
      'xsto-m4b': true,
      'xsto-ezgo2': true,
      'xsto-x12': true,
      'xsto-x12-pro': true,
    },
  },
  {
    label: 'Stair Climbing',
    values: {
      'xsto-m4': false,
      'xsto-m4-pro': false,
      'xsto-m4b': false,
      'xsto-ezgo2': false,
      'xsto-x12': true,
      'xsto-x12-pro': true,
    },
  },
  {
    label: 'Carbon Fibre',
    values: {
      'xsto-m4': false,
      'xsto-m4-pro': false,
      'xsto-m4b': false,
      'xsto-ezgo2': true,
      'xsto-x12': false,
      'xsto-x12-pro': false,
    },
  },
  {
    label: 'Headrest',
    values: {
      'xsto-m4': false,
      'xsto-m4-pro': true,
      'xsto-m4b': false,
      'xsto-ezgo2': false,
      'xsto-x12': false,
      'xsto-x12-pro': true,
    },
  },
  {
    label: 'Electric Legrest',
    values: {
      'xsto-m4': false,
      'xsto-m4-pro': false,
      'xsto-m4b': false,
      'xsto-ezgo2': false,
      'xsto-x12': false,
      'xsto-x12-pro': true,
    },
  },
  {
    label: 'Folding Footrest',
    values: {
      'xsto-m4': false,
      'xsto-m4-pro': false,
      'xsto-m4b': true,
      'xsto-ezgo2': false,
      'xsto-x12': false,
      'xsto-x12-pro': false,
    },
  },
  {
    label: 'Max Slope',
    values: {
      'xsto-m4': '10°',
      'xsto-m4-pro': '15°',
      'xsto-m4b': '10°',
      'xsto-ezgo2': '3°',
      'xsto-x12': '40°',
      'xsto-x12-pro': '40°',
    },
  },
  {
    label: 'Range',
    values: {
      'xsto-m4': '15 km',
      'xsto-m4-pro': '26 km',
      'xsto-m4b': '15 km',
      'xsto-ezgo2': '15 km',
      'xsto-x12': '35 km',
      'xsto-x12-pro': '35 km',
    },
  },
  {
    label: 'Top Speed',
    values: {
      'xsto-m4': '6 km/h',
      'xsto-m4-pro': '6 km/h',
      'xsto-m4b': '6 km/h',
      'xsto-ezgo2': '4.5 km/h',
      'xsto-x12': '12 km/h',
      'xsto-x12-pro': '12 km/h',
    },
  },
  {
    label: 'Weight',
    values: {
      'xsto-m4': '51.5 kg',
      'xsto-m4-pro': '60.1 kg',
      'xsto-m4b': '55.5 kg',
      'xsto-ezgo2': '11.5 kg',
      'xsto-x12': '112.8 kg',
      'xsto-x12-pro': '115.8 kg',
    },
  },
];

export const HOMEPAGE_FLAGSHIP_LABELS: Record<HomepageFlagshipHandle, string> = {
  'xsto-m4': 'M4',
  'xsto-m4-pro': 'M4 Pro',
  'xsto-m4b': 'M4B',
  'xsto-ezgo2': 'EzGo2',
  'xsto-x12': 'X12',
  'xsto-x12-pro': 'X12 Pro',
};

/** Canonical product slots used for specs, comparison data, and bullets. */
export const HOMEPAGE_PRODUCT_HANDLES = [
  'xsto-m4',
  'xsto-m4-pro',
  'xsto-m4b',
  'xsto-ezgo2',
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
  'xsto-m4': 'buy-robot-wheelchair',
  'xsto-m4-pro': 'xsto-m4-pro',
  'xsto-m4b': 'xsto-m4b-1',
  'xsto-ezgo2': 'xsto-ezgo2-carbon-fiber-power-wheelchair',
  'xsto-x12': 'x12-all-terrain-mobility-robot',
  'xsto-x12-pro':
    'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
};

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

  if (/x12.*pro|x12-pro/i.test(shopifyHandle)) return 'xsto-x12-pro';
  if (/x12-all-terrain|xsto-x12(?!-pro|-pre)/i.test(shopifyHandle)) {
    return 'xsto-x12';
  }
  if (/ezgo|ez-go/i.test(shopifyHandle)) return 'xsto-ezgo2';
  if (/m4b/i.test(shopifyHandle)) return 'xsto-m4b';
  if (/m4.*pro|m4-pro/i.test(shopifyHandle)) return 'xsto-m4-pro';
  if (/buy-robot-wheelchair|^xsto-m4$/i.test(shopifyHandle)) return 'xsto-m4';

  return undefined;
}

/** Homepage hero YouTube video — X12 stair-climbing / all-terrain film. */
export const HOMEPAGE_HERO_YOUTUBE_ID = 'ihXdzLuNz2s';

export function heroYoutubePosterUrl(videoId = HOMEPAGE_HERO_YOUTUBE_ID): string {
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
export const HOMEPAGE_PRODUCT_BULLETS: Record<
  HomepageProductHandle,
  string[]
> = {
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
    'New front wheels · folding footrest',
    'Self-balancing chassis · 10° slopes',
    'Electric height adjustment 347–650 mm',
  ],
  'xsto-ezgo2': [
    'Aerospace-grade carbon fibre frame',
    'Only 11.5 kg without battery',
    '3-step fold · 15 km range',
  ],
  'xsto-x12': [
    'Climbs stairs up to 40° incline',
    '35 km range on dual batteries',
    'AI-powered automatic mode switching',
  ],
  'xsto-x12-pro': [
    'Climbs stairs up to 40° incline',
    'Electric legrest · 35 km dual-battery range',
    'LiDAR obstacle detection',
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
    model: 'EzGo2',
    handle: 'xsto-ezgo2',
    shopifyHandle: SHOPIFY_HOME_PRODUCT_HANDLES['xsto-ezgo2'],
    weight: '11.5 kg',
    capacity: '136 kg',
    range: '15 km',
    foldedSize: '630 × 260 × 700 mm',
  },
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
> = {
  'xsto-ezgo2': {amount: 1995, currencyCode: 'GBP'},
};

export function formatExVatPrice(amount: string, currencyCode: string): string {
  const exVat = Number(amount) / 1.2;
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
