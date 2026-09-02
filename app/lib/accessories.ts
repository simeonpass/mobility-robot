import {
  getHomepageProductSlot,
  SHOPIFY_HOME_PRODUCT_HANDLES,
  type HomepageProductHandle,
} from '~/lib/homepage-data';

/** Chairs that accessories can be matched to. */
export type AccessoryChairSlot = HomepageProductHandle;

export const ACCESSORY_CHAIR_SECTIONS: ReadonlyArray<{
  id: string;
  slot: AccessoryChairSlot;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    id: 'm4',
    slot: 'xsto-m4',
    label: 'XSTO M4',
    shortLabel: 'M4',
    description: 'Everyday foldable self-balancing chair — bags, covers, mounts and spares.',
  },
  {
    id: 'm4b',
    slot: 'xsto-m4b',
    label: 'XSTO M4B',
    shortLabel: 'M4B',
    description: 'M4-platform accessories that fit the M4B folding-footrest model.',
  },
  {
    id: 'm4-pro',
    slot: 'xsto-m4-pro',
    label: 'XSTO M4 Pro',
    shortLabel: 'M4 Pro',
    description: 'Comfort and control upgrades made for the M4 Pro.',
  },
  {
    id: 'x12',
    slot: 'xsto-x12',
    label: 'XSTO X12',
    shortLabel: 'X12',
    description:
      'Accessories for the all-terrain stair-climbing X12, including X12 Pro. Available to order now — estimated delivery around 4 weeks.',
  },
];

const ALL_M4_FAMILY: AccessoryChairSlot[] = [
  'xsto-m4',
  'xsto-m4b',
  'xsto-m4-pro',
];

const M4_AND_M4B: AccessoryChairSlot[] = ['xsto-m4', 'xsto-m4b'];

const TAG_TO_SLOT: Record<string, AccessoryChairSlot> = {
  'compatible-m4': 'xsto-m4',
  'compatible-m4b': 'xsto-m4b',
  'compatible-m4-pro': 'xsto-m4-pro',
  'compatible-m4pro': 'xsto-m4-pro',
  'compatible-x12': 'xsto-x12',
  'compatible-x12-pro': 'xsto-x12',
  'compatible-x12pro': 'xsto-x12',
  m4: 'xsto-m4',
  m4b: 'xsto-m4b',
  'm4-pro': 'xsto-m4-pro',
  m4pro: 'xsto-m4-pro',
  x12: 'xsto-x12',
  'x12-pro': 'xsto-x12',
  x12pro: 'xsto-x12',
};

/**
 * Curated handle → chairs. Prefer Shopify tags when present;
 * this catches known catalogue items if tags are missing.
 */
export const ACCESSORY_COMPAT_BY_HANDLE: Record<string, AccessoryChairSlot[]> = {
  'adjustable-headrest-m4-pro': ['xsto-m4-pro', 'xsto-x12'],
  'adjustable-headrest-for-x12-x12-pro': ['xsto-x12'],
  'armrest-bag': M4_AND_M4B,
  'auxiliary-joystick-m4-pro': ['xsto-m4-pro', 'xsto-m4', 'xsto-m4b'],
  'backrest-cushion-large-m4-pro': ['xsto-m4-pro'],
  'backrest-cushion-small-m4-pro': ['xsto-m4-pro'],
  'batteries-lithium-battery-15-6ah-battery': ALL_M4_FAMILY,
  'black-backpack-for-m4-pro': ['xsto-m4-pro'],
  'bluetooth-controller-for-m4-m4h-m4-pro-x12-x12-pro': [
    'xsto-m4',
    'xsto-m4b',
    'xsto-m4-pro',
    'xsto-x12',
  ],
  'buy-universal-phone-holder': M4_AND_M4B,
  'calf-support-set-for-x12-x12pro': ['xsto-x12'],
  'cooling-seat-cushion-m4-pro-x12': ['xsto-m4-pro', 'xsto-x12'],
  'cup-holder-for-all-models': [
    'xsto-m4',
    'xsto-m4b',
    'xsto-m4-pro',
    'xsto-x12',
  ],
  // Live Shopify handle (title: High Back Rest & Neck Support Cushion)
  'ergonomic-chairs-for-back-support': M4_AND_M4B,
  'ergonomic-raised-backrest-neck-support': M4_AND_M4B,
  'flashlight-holder': M4_AND_M4B,
  'left-lateral-support-m4-pro': ['xsto-m4-pro'],
  'lithium-10-4-ah-battery': ALL_M4_FAMILY,
  'lithium-10-4ah-battery-batteries-lithium-battery': ALL_M4_FAMILY,
  'lithium-15-6-ah-battery': ALL_M4_FAMILY,
  'phone-holder-for-m4': M4_AND_M4B,
  'phone-holder-m4-pro-x12': ['xsto-m4-pro', 'xsto-x12'],
  'power-chair-battery-charger': ALL_M4_FAMILY,
  /** Live Shopify product: one listing with 7 colour variants. */
  'rear-cover-m4': M4_AND_M4B,
  'rear-cover-barbie-pink': M4_AND_M4B,
  'rear-cover-blue-enamel': M4_AND_M4B,
  'rear-cover-burgundy-red': M4_AND_M4B,
  'rear-cover-pearl-white': M4_AND_M4B,
  'rear-cover-sparkling-yellow': M4_AND_M4B,
  'rear-cover-superior-purple': M4_AND_M4B,
  'rear-cover-tiffany-blue': M4_AND_M4B,
  'rear-view-mirror-m4-pro': ['xsto-m4-pro'],
  'rear-view-mirror-m4-pro-x12': ['xsto-m4-pro', 'xsto-x12'],
  'right-lateral-support-m4-pro': ['xsto-m4-pro'],
  'seat-cushion-large-m4-pro': ['xsto-m4-pro'],
  'seat-cushion-small-m4-pro': ['xsto-m4-pro'],
  'straight-backrest-cushion-s-m4-pro-x12': ['xsto-m4-pro', 'xsto-x12'],
  'straight-backrest-cushion-m-m4-pro-x12': ['xsto-m4-pro', 'xsto-x12'],
  'straight-backrest-cushion-l-m4-pro-x12': ['xsto-m4-pro', 'xsto-x12'],
  'straight-seat-cushion-s-m4-pro-x12': ['xsto-m4-pro', 'xsto-x12'],
  'straight-seat-cushion-m-m4-pro-x12': ['xsto-m4-pro', 'xsto-x12'],
  'straight-seat-cushion-l-m4-pro-x12': ['xsto-m4-pro', 'xsto-x12'],
  'travel-cushion-seat-with-pump': ALL_M4_FAMILY,
  'travel-cushion-with-pump': ALL_M4_FAMILY,
  'trunk-support': ['xsto-m4-pro', 'xsto-x12'],
  'trunk-support-m4-pro': ['xsto-m4-pro', 'xsto-x12'],
  'umbrella-attachment': ALL_M4_FAMILY,
  'umbrella-holder-m4-pro-x12': ['xsto-m4-pro', 'xsto-x12'],
  'universal-wheels-for-xsto-m4': M4_AND_M4B,
  'wheelchair-battery-charger': ALL_M4_FAMILY,
  'x12-x12-pro-battery-25-2v-25-6ah': ['xsto-x12'],
};

type CompatibilityInput = {
  handle: string;
  title: string;
  tags?: readonly string[] | null;
};

function canonicalAccessorySlot(
  slot: string,
): AccessoryChairSlot | undefined {
  if (slot === 'xsto-x12-pro') return 'xsto-x12';
  return ACCESSORY_CHAIR_SECTIONS.some((section) => section.slot === slot)
    ? (slot as AccessoryChairSlot)
    : undefined;
}

function uniqueSlots(slots: readonly string[]): AccessoryChairSlot[] {
  const canonical = slots
    .map((slot) => canonicalAccessorySlot(slot))
    .filter((slot): slot is AccessoryChairSlot => Boolean(slot));

  return ACCESSORY_CHAIR_SECTIONS.map((section) => section.slot).filter((slot) =>
    canonical.includes(slot),
  );
}

function slotsFromTags(tags: readonly string[]): AccessoryChairSlot[] {
  const found: AccessoryChairSlot[] = [];
  for (const raw of tags) {
    const tag = raw.trim().toLowerCase();
    const mapped = TAG_TO_SLOT[tag];
    if (mapped) found.push(mapped);

    const compatibleMatch = tag.match(/^compatible[-_:](.+)$/);
    if (compatibleMatch) {
      const key = compatibleMatch[1].replace(/\s+/g, '-');
      const fromKey = TAG_TO_SLOT[key] ?? TAG_TO_SLOT[`compatible-${key}`];
      if (fromKey) found.push(fromKey);
    }
  }
  return uniqueSlots(found);
}

function slotsFromTitle(title: string): AccessoryChairSlot[] | null {
  const t = title.toLowerCase();

  if (/m4\s*&\s*m4\s*pro|m4 and m4 pro|compatible with m4(?:\s*[&and]+)\s*m4\s*pro/.test(t)) {
    return ALL_M4_FAMILY;
  }

  if (/m4\s*pro/.test(t)) return ['xsto-m4-pro'];
  if (/m4b/.test(t)) return ['xsto-m4b'];
  if (/x12/.test(t)) return ['xsto-x12'];

  if (
    /rear cover|phone holder|armrest bag|flashlight|universal wheels|raised backrest|high back|neck support/.test(
      t,
    )
  ) {
    return M4_AND_M4B;
  }

  if (/battery|charger|travel cushion|umbrella/.test(t)) {
    return ALL_M4_FAMILY;
  }

  if (/\bm4\b/.test(t)) return M4_AND_M4B;

  return null;
}

/** Handles that must appear in accessories UI even if missing from the collection. */
export const FORCED_ACCESSORY_HANDLES = ['rear-cover-m4'] as const;

/**
 * Handles whose Shopify title/tags include X12 but the handle does not.
 * Chairs are excluded by getHomepageProductSlot in accessoryFitsX12.
 */
const X12_ACCESSORY_HANDLE_EXTRAS = new Set([
  'adjustable-headrest-m4-pro',
  'trunk-support',
  'trunk-support-m4-pro',
]);

/**
 * True for accessories sold for the X12 (including shared M4 Pro & X12 parts).
 * Used to show a ~4 week pre-order / backorder lead time.
 */
export function accessoryFitsX12(
  handle?: string | null,
  title = '',
  tags?: readonly string[] | null,
): boolean {
  if (!handle) return false;
  const h = handle.trim().toLowerCase();
  if (!h) return false;
  if (getHomepageProductSlot(h)) return false;

  if (h.includes('x12')) return true;
  if (X12_ACCESSORY_HANDLE_EXTRAS.has(h)) return true;

  return resolveAccessoryCompatibility({
    handle: h,
    title: title || h,
    tags,
  }).includes('xsto-x12');
}

/** Resolve which chairs an accessory fits. */
export function resolveAccessoryCompatibility(
  product: CompatibilityInput,
): AccessoryChairSlot[] {
  // Curated handles win over incomplete Shopify tags (e.g. tag "m4" alone).
  const fromHandle = ACCESSORY_COMPAT_BY_HANDLE[product.handle];
  if (fromHandle?.length) return uniqueSlots(fromHandle);

  const fromTags = product.tags?.length ? slotsFromTags(product.tags) : [];
  if (fromTags.length) return fromTags;

  const fromTitle = slotsFromTitle(product.title);
  if (fromTitle?.length) return uniqueSlots(fromTitle);

  // Catalogue default — most current accessories are M4-family.
  return ALL_M4_FAMILY;
}

/**
 * Merge collection products with forced accessory handles (deduped by handle).
 */
export function mergeAccessoryProducts<T extends {handle: string}>(
  collectionProducts: T[],
  forcedProducts: Array<T | null | undefined>,
): T[] {
  const byHandle = new Map<string, T>();
  for (const product of collectionProducts) {
    byHandle.set(product.handle, product);
  }
  for (const product of forcedProducts) {
    if (!product?.handle) continue;
    if (!byHandle.has(product.handle)) {
      byHandle.set(product.handle, product);
    }
  }
  return Array.from(byHandle.values());
}

export function formatCompatibilityLabel(slots: AccessoryChairSlot[]): string {
  if (!slots.length) return 'Compatibility TBC';
  if (slots.length === ACCESSORY_CHAIR_SECTIONS.length) return 'All models';

  const labels = ACCESSORY_CHAIR_SECTIONS.filter((section) =>
    slots.includes(section.slot),
  ).map((section) => section.shortLabel);

  if (labels.length === 1) return `Fits ${labels[0]}`;
  if (labels.length === 2) return `Fits ${labels[0]} & ${labels[1]}`;
  return `Fits ${labels.slice(0, -1).join(', ')} & ${labels.at(-1)}`;
}

export function isAccessoryCompatibleWithChair(
  product: CompatibilityInput,
  chairHandleOrSlot: string,
): boolean {
  const rawSlot =
    getHomepageProductSlot(chairHandleOrSlot) ??
    (chairHandleOrSlot in SHOPIFY_HOME_PRODUCT_HANDLES
      ? (chairHandleOrSlot as AccessoryChairSlot)
      : undefined);

  const slot = rawSlot ? canonicalAccessorySlot(rawSlot) : undefined;
  if (!slot) return false;
  return resolveAccessoryCompatibility(product).includes(slot);
}

export function groupAccessoriesByChair<T extends CompatibilityInput>(
  products: T[],
): Record<AccessoryChairSlot, T[]> {
  const groups = Object.fromEntries(
    ACCESSORY_CHAIR_SECTIONS.map((section) => [section.slot, [] as T[]]),
  ) as Record<AccessoryChairSlot, T[]>;

  for (const product of products) {
    for (const slot of resolveAccessoryCompatibility(product)) {
      groups[slot].push(product);
    }
  }

  return groups;
}

export const ACCESSORIES_COLLECTION_HANDLE = 'accessories';

/** Handles shown first in “Choose accessories” on chair PDPs. */
export const FEATURED_ADDON_HANDLES = ['rear-cover-m4'] as const;

/**
 * Put featured accessories first, then the remaining compatible list.
 */
export function prioritizeAccessoryAddons<T extends {handle: string}>(
  products: T[],
  featuredHandles: readonly string[] = FEATURED_ADDON_HANDLES,
): T[] {
  const featured: T[] = [];
  const rest: T[] = [];
  const featuredSet = new Set(featuredHandles);

  for (const product of products) {
    if (featuredSet.has(product.handle)) featured.push(product);
    else rest.push(product);
  }

  featured.sort(
    (a, b) =>
      featuredHandles.indexOf(a.handle) - featuredHandles.indexOf(b.handle),
  );

  return [...featured, ...rest];
}
