import {
  ACCESSORY_CHAIR_SECTIONS,
  accessoryFitsX12,
  formatCompatibilityLabel,
  resolveAccessoryCompatibility,
  type AccessoryChairSlot,
} from '~/lib/accessories';
import {SHOPIFY_HOME_PRODUCT_HANDLES} from '~/lib/homepage-data';
import {
  buildDescriptionHtmlFromPlain,
  extractHighlightsFromHtml,
  isThinProductDescription,
  normalizeDescriptionHtml,
  stripHtml,
} from '~/lib/product-description';

export type AccessoryFallbackContent = {
  overview: string;
  highlights: string[];
};

/**
 * Curated copy for accessories whose Shopify body is only a title stub.
 * Rich Shopify HTML still wins when present.
 */
export const ACCESSORY_DESCRIPTION_FALLBACKS: Record<
  string,
  AccessoryFallbackContent
> = {
  'cup-holder-for-all-models': {
    overview:
      'Keep a drink within easy reach while you move. This cup holder clamps securely to compatible XSTO powered wheelchairs so bottles and cups travel with you indoors and out.',
    highlights: [
      'Secure clamp mount for everyday use',
      'Holds standard cups and bottles',
      'Tool-light fitting for quick attach and remove',
      'Ideal for shopping trips, parks and day centres',
    ],
  },
  'adjustable-headrest-for-x12-x12-pro': {
    overview:
      'Add comfortable head and neck support to the XSTO X12. The adjustable headrest helps with longer outdoor sessions, stair-climbing practice and all-day posture.',
    highlights: [
      'Designed for X12 seating, including X12 Pro',
      'Adjustable height and angle for personal fit',
      'Supports neck comfort on longer journeys',
      'Pairs with the stair-climbing outdoor platform',
    ],
  },
  'bluetooth-controller-for-m4-m4h-m4-pro-x12-x12-pro': {
    overview:
      'Control compatible XSTO chairs wirelessly with this Bluetooth controller. Useful for demonstration, attendant support, or users who prefer an alternative to the primary joystick in some situations.',
    highlights: [
      'Bluetooth wireless connection',
      'Compatible across M4-family and X12-family models',
      'Handy for demos, training and attendant use',
      'Compact controller that travels with the chair',
    ],
  },
  'black-backpack-for-m4-pro': {
    overview:
      'A dedicated black backpack for the XSTO M4 Pro, giving you carry space for daily essentials without crowding the seat. Designed to sit cleanly with the M4 Pro frame and seating setup.',
    highlights: [
      'Made for the M4 Pro mounting points',
      'Room for day-trip essentials',
      'Keeps items off the seat and footrest',
      'Practical everyday storage upgrade',
    ],
  },
  'calf-support-set-for-x12-x12pro': {
    overview:
      'Calf supports for the XSTO X12 help stabilise the lower legs during outdoor travel and stair-climbing modes. A useful comfort upgrade for users who need extra lower-leg guidance.',
    highlights: [
      'Fits X12 and X12 Pro',
      'Improves lower-leg stability underway',
      'Supports comfort on longer outdoor routes',
      'Complements the X12 seating package',
    ],
  },
  'rear-cover-m4': {
    overview:
      'Interchangeable rear cover for the XSTO M4 and M4B — personalise your chair with a splash of colour. Choose from seven finishes including Barbie Pink, Tiffany Blue, Pearl White, Burgundy Red, Blue Enamel, Sparkling Yellow and Superior Purple.',
    highlights: [
      'Fits XSTO M4 and M4B',
      'Seven colour finishes to choose from',
      'Snap-on colour backplate for everyday personalisation',
      'Lightweight accessory — ships as a spare / add-on',
    ],
  },
};

const ACCESSORY_DELIVERY = `Accessories typically ship with free UK mainland delivery when ordered with an XSTO wheelchair, or as a standalone spare.

In-stock accessories usually dispatch within a few working days. Warranty cover follows the accessory type — contact us if you need help confirming fitment or spare-part eligibility.`;

const X12_ACCESSORY_DELIVERY = `X12 accessories are available to order now on a ~4 week pre-order / backorder. You can still add them to your basket today.

They usually ship by parcel courier as a spare, or alongside an X12 when the dates line up. Warranty cover follows the accessory type — contact us if you need help confirming fitment.`;

export function buildAccessoryOverviewHtml({
  handle,
  title,
  descriptionHtml,
  description,
}: {
  handle: string;
  title: string;
  descriptionHtml?: string | null;
  description?: string | null;
}): {
  overview: string;
  overviewHtml: string;
  highlights: string[];
  usedFallback: boolean;
} {
  const html = descriptionHtml?.trim() ?? '';
  const plain = description?.trim() || stripHtml(html);
  const fallback = ACCESSORY_DESCRIPTION_FALLBACKS[handle];
  const thin = isThinProductDescription(html || plain, title);

  if (html && !thin) {
    const normalised = normalizeDescriptionHtml(html);
    return {
      overview: plain || stripHtml(normalised),
      overviewHtml: normalised,
      highlights: [],
      usedFallback: false,
    };
  }

  if (fallback) {
    const list = fallback.highlights
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join('');
    return {
      overview: fallback.overview,
      overviewHtml: `<p>${escapeHtml(fallback.overview)}</p><ul>${list}</ul>`,
      highlights: fallback.highlights,
      usedFallback: true,
    };
  }

  if (plain) {
    return {
      overview: plain,
      overviewHtml: buildDescriptionHtmlFromPlain(plain),
      highlights: extractHighlightsFromHtml(buildDescriptionHtmlFromPlain(plain)),
      usedFallback: false,
    };
  }

  return {
    overview: '',
    overviewHtml: '',
    highlights: [],
    usedFallback: false,
  };
}

export function accessoryCompatibilityLinks(slots: AccessoryChairSlot[]) {
  return ACCESSORY_CHAIR_SECTIONS.filter((section) => slots.includes(section.slot)).map(
    (section) => ({
      label: section.shortLabel,
      title: section.label,
      url: `/products/${SHOPIFY_HOME_PRODUCT_HANDLES[section.slot]}`,
    }),
  );
}

export function buildAccessoryTabExtras(product: {
  handle: string;
  title: string;
  tags?: readonly string[] | null;
  descriptionHtml?: string | null;
  description?: string | null;
}) {
  const slots = resolveAccessoryCompatibility(product);
  const overview = buildAccessoryOverviewHtml(product);

  return {
    ...overview,
    deliveryWarranty: accessoryFitsX12(product.handle, product.title, product.tags)
      ? X12_ACCESSORY_DELIVERY
      : ACCESSORY_DELIVERY,
    compatibilityLabel: formatCompatibilityLabel(slots),
    compatibilityChairs: accessoryCompatibilityLinks(slots),
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
