import type {ProductFAQ} from '~/lib/product-faqs';
import {
  m4FAQs,
  m4bFAQs,
  m4ProFAQs,
  x12FAQs,
  ezgo2FAQs,
} from '~/lib/product-faqs';
import {
  getHomepageProductSlot,
  type HomepageProductHandle,
} from '~/lib/homepage-data';

export type ProductSpec = {label: string; value: string; unit?: string};
export type ProductDimension = {label: string; value: string};
export type ProductVideo = {title: string; embedUrl: string};
export type ProductDownload = {
  title: string;
  href: string;
  description?: string;
};

export type ProductFeatureBlock = {
  title: string;
  description: string;
  highlights: string[];
};

export type ProductContent = {
  displayName?: string;
  tagline?: string;
  overview: string;
  highlights: string[];
  features?: ProductFeatureBlock[];
  specs: ProductSpec[];
  dimensions: ProductDimension[];
  inBox: string[];
  deliveryWarranty: string;
  faqs: ProductFAQ[];
  videos: ProductVideo[];
  downloads?: ProductDownload[];
};

const M4_SERIES_PRODUCT_SHEET: ProductDownload = {
  title: 'M4 Series Product Sheet',
  href: '/docs/m4/xsto-m4-series-product-sheet.pdf',
  description: 'Technical overview and key specifications for the M4 series.',
};

const M4_USER_MANUAL: ProductDownload = {
  title: 'M4 User Manual',
  href: '/docs/m4/xsto-m4-user-manual.pdf',
  description: 'Operating guide, safety instructions, and maintenance (D701000220).',
};

const M4_AND_M4B_DOWNLOADS: ProductDownload[] = [
  M4_SERIES_PRODUCT_SHEET,
  M4_USER_MANUAL,
];

const M4_PRO_DOWNLOADS: ProductDownload[] = [M4_SERIES_PRODUCT_SHEET];

const X12_SERIES_PRODUCT_SHEET: ProductDownload = {
  title: 'X12 Series Product Sheet',
  href: '/docs/x12/xsto-x12-series-product-sheet.pdf',
  description: 'Technical overview and key specifications for the X12 series.',
};

const X12_USER_MANUAL: ProductDownload = {
  title: 'X12 Series User Manual',
  href: '/docs/x12/xsto-x12-user-manual.pdf',
  description: 'Operating guide, safety instructions, and maintenance (D701000274).',
};

const X12_SERIES_DOWNLOADS: ProductDownload[] = [
  X12_SERIES_PRODUCT_SHEET,
  X12_USER_MANUAL,
];

/** Giant local demo MP4s kept out of public/ (see tmp/local-videos). */
const X12_SERIES_VIDEOS: ProductVideo[] = [];

const DELIVERY_WARRANTY = `Free UK mainland delivery on all XSTO wheelchairs. In-stock models typically arrive within 5–7 working days.

Warranty: 5 years on the frame and base seat structure, 1 year on electrical and mechanical parts, and 1 year on the battery. Bentech Medical Ltd manages all UK warranty claims as the official distributor.`;

const M_SERIES_DELIVERY_WARRANTY = `Free UK mainland delivery on all XSTO wheelchairs. Typically arrives within 3–4 working days.

Warranty: 5 years on the frame and base seat structure, 1 year on electrical and mechanical parts, and 1 year on the battery. Bentech Medical Ltd manages all UK warranty claims as the official distributor.`;

const YOUTUBE = {
  m4: 'https://www.youtube-nocookie.com/embed/D-7Pt3OUdQg',
  m4Pro: 'https://www.youtube-nocookie.com/embed/R2eyc-2uYNQ',
  x12: 'https://www.youtube-nocookie.com/embed/ihXdzLuNz2s',
  x12Pro: 'https://www.youtube-nocookie.com/embed/4KFMBL5jX20',
} as const;

const CONTENT: Record<HomepageProductHandle, ProductContent> = {
  'xsto-m4': {
    displayName: 'XSTO M4',
    tagline: 'Smart Wheelchair — Technology Redefining the Beauty of Travel',
    overview:
      'The XSTO M4 overcomes the fear of uphill and downhill travel. The smart control platform monitors slopes in real time, automatically levelling the chassis for smooth, stable movement. Electric height adjustment from 347–650 mm, one-button folding, and tool-free 4-module disassembly make it truly portable.',
    highlights: [
      'Self-balancing smart control platform',
      'Electric height adjustment (347–650 mm)',
      'One-button electric folding',
      '15 km range · 10° slope capability',
    ],
    features: [
      {
        title: 'Self-Balancing Technology',
        description:
          'The M4 uses a gyroscopic self-balancing system to keep you stable on slopes, kerbs and uneven ground.',
        highlights: [
          '10° maximum climbing angle',
          'Real-time slope monitoring',
          'Automatic chassis levelling',
          'Front & rear self-balancing',
        ],
      },
      {
        title: 'Electric Height Adjustment',
        description:
          'Adjust seat height at the touch of a button — ideal for tables, desks and social eye-level conversation.',
        highlights: [
          '347–650 mm seat height range',
          'One-touch electric control',
          'Tilt positioning for tables & desks',
          'Smooth, quiet motor',
        ],
      },
      {
        title: 'Omnidirectional Movement',
        description:
          'Mecanum wheels enable precise 360° movement in tight spaces where conventional chairs struggle.',
        highlights: [
          'Full 360° directional movement',
          '820 mm turning radius',
          '50 mm obstacle clearance',
          '10" solid rear tyres',
        ],
      },
      {
        title: 'Foldable & Portable',
        description:
          'Folds in seconds and breaks into four lightweight modules for car boots, trains and home storage.',
        highlights: [
          'One-button electric folding',
          'Tool-free 4-module quick-detach',
          'Heaviest module just 16 kg',
          'Fits any car boot',
        ],
      },
      {
        title: 'Smart Control Options',
        description:
          'Control your M4 via joystick, Bluetooth remote or the XSTO app — with interchangeable left/right mounting.',
        highlights: [
          'Joystick, Bluetooth remote & app control',
          'Interchangeable left/right handle',
          'IPX4 water resistant',
          'iOS & Android compatible',
        ],
      },
    ],
    specs: [
      {label: 'Max Load Capacity', value: '115 kg', unit: '(254 lbs)'},
      {label: 'Range', value: '15 km', unit: '(9.3 miles)'},
      {label: 'Top Speed', value: '6 km/h', unit: '(3.7 mph)'},
      {label: 'Max Slope', value: '10°'},
      {label: 'Weight (no battery)', value: '51.5 kg', unit: '(114 lbs)'},
      {label: 'Battery', value: '25.55V', unit: '15.5Ah'},
      {label: 'Charge Time', value: '4 hours'},
      {label: 'Obstacle Clearance', value: '50 mm'},
      {label: 'Ditch Crossing', value: '100 mm'},
      {label: 'Protection', value: 'IPX4', unit: 'Water Resistant'},
    ],
    dimensions: [
      {label: 'Folded Size', value: '1040 × 580 × 570 mm'},
      {label: 'Unfolded Size', value: '1035 × 580 × 930 mm'},
      {label: 'Highest Position', value: '980 × 580 × 1080 mm'},
      {label: 'Seat Height Range', value: '347–650 mm'},
      {label: 'Turning Radius', value: '820 mm'},
    ],
    inBox: [
      'XSTO M4 Power Wheelchair',
      '25.55V 15.5Ah Lithium Battery',
      'Battery Charger',
      'Joystick Controller',
      'Bluetooth Remote Control',
      'User Manual',
      'Tool Kit',
    ],
    deliveryWarranty: M_SERIES_DELIVERY_WARRANTY,
    faqs: m4FAQs,
    videos: [{title: 'Watch the M4 in Action', embedUrl: YOUTUBE.m4}],
    downloads: M4_AND_M4B_DOWNLOADS,
  },
  'xsto-m4-pro': {
    displayName: 'XSTO M4 Pro',
    tagline: 'Premium Smart Wheelchair — Safe, Comfortable, Ergonomic Design',
    overview:
      'The XSTO M4 Pro delivers uncompromised comfort and absolute safety. Electric seat height, 0–20° seat tilt with synchronous legrest, and 135° backrest recline for total customisation. Integrated LED lighting, 150 kg capacity, 26 km range, and 15° slope capability.',
    highlights: [
      '150 kg capacity · 26 km range',
      '0–20° seat tilt · 135° backrest recline',
      'Integrated LED head, tail and turn lights',
      '450–730 mm electric seat height',
    ],
    specs: [
      {label: 'Max Load Capacity', value: '150 kg', unit: '(331 lbs)'},
      {label: 'Range', value: '26 km', unit: '(16.2 miles)'},
      {label: 'Top Speed', value: '6 km/h', unit: '(3.7 mph)'},
      {label: 'Max Slope', value: '15°'},
      {label: 'Weight (no battery)', value: '60.1 kg', unit: '(132 lbs)'},
      {label: 'Battery', value: '25.2V', unit: '23.8Ah'},
      {label: 'Charge Time', value: '6 hours'},
      {label: 'Seat Tilt', value: '0–20°', unit: '(default 7°)'},
      {label: 'Backrest Recline', value: 'Up to 135°'},
      {label: 'Obstacle Height', value: '85 mm fwd', unit: '/ 50 mm rev'},
      {label: 'Ditch Crossing', value: '100 mm'},
      {label: 'Protection', value: 'IPX4', unit: 'Water Resistant'},
    ],
    dimensions: [
      {label: 'Folded Size', value: '1040 × 592 × 770 mm'},
      {label: 'Unfolded Size', value: '1120 × 592 × 1040 mm'},
      {label: 'Highest Position', value: '1120 × 592 × 1200 mm'},
      {label: 'Seat Height Range', value: '450–730 mm'},
      {label: 'Turning Radius', value: '825 mm'},
    ],
    inBox: [
      'XSTO M4 Pro Power Wheelchair',
      '25.2V 23.8Ah Lithium Battery',
      'Battery Charger',
      'Joystick Controller',
      'Bluetooth Remote Control',
      'User Manual',
      'Tool Kit',
    ],
    deliveryWarranty: M_SERIES_DELIVERY_WARRANTY,
    faqs: m4ProFAQs,
    videos: [{title: 'Watch the M4 Pro in Action', embedUrl: YOUTUBE.m4Pro}],
    downloads: M4_PRO_DOWNLOADS,
  },
  'xsto-m4b': {
    displayName: 'XSTO M4B',
    tagline: 'New Front Wheels · Folding Footrest',
    overview:
      'The XSTO M4B builds on the award-winning M4 platform with redesigned front wheels and a brand new folding footrest for easier transfers and a tidier folded footprint. Self-balancing, electric height adjustment and omnidirectional movement — all in a chair that folds into any car boot.',
    highlights: [
      'New front wheel design',
      'New folding footrest',
      'Self-balancing chassis · 10° slopes',
      'Electric height adjustment 347–650 mm',
    ],
    specs: [
      {label: 'Max Load Capacity', value: '115 kg', unit: '(254 lbs)'},
      {label: 'Range', value: '15 km', unit: '(9.3 miles)'},
      {label: 'Top Speed', value: '6 km/h', unit: '(3.7 mph)'},
      {label: 'Max Slope', value: '10°'},
      {label: 'Weight (no battery)', value: '55.5 kg', unit: '(122 lbs)'},
      {label: 'Battery', value: '25.55V', unit: '15.5Ah'},
      {label: 'Charge Time', value: '4 hours'},
      {label: 'Footrest', value: 'Integrated folding pedals'},
      {label: 'Obstacle Clearance', value: '50 mm'},
      {label: 'Ditch Crossing', value: '100 mm'},
      {label: 'Protection', value: 'IPX4', unit: 'Water Resistant'},
    ],
    dimensions: [
      {label: 'Folded Size', value: '1040 × 590 × 570 mm'},
      {label: 'Unfolded Size', value: '1050 × 590 × 1055 mm'},
      {label: 'Highest Position', value: '1125 × 590 × 1190 mm'},
      {label: 'Seat Height Range', value: '347–650 mm'},
      {label: 'Turning Radius', value: '820 mm'},
    ],
    inBox: [
      'XSTO M4B Power Wheelchair',
      '25.55V 15.5Ah Lithium Battery',
      'Battery Charger',
      'Joystick Controller',
      'Bluetooth Remote Control',
      'User Manual',
      'Tool Kit',
    ],
    deliveryWarranty: M_SERIES_DELIVERY_WARRANTY,
    faqs: m4bFAQs,
    videos: [{title: 'Watch the M4B in Action', embedUrl: YOUTUBE.m4}],
    downloads: M4_AND_M4B_DOWNLOADS,
  },
  'xsto-ezgo2': {
    displayName: 'XSTO EzGo2',
    tagline: 'Carbon Fibre · Ultra-Lightweight · Fold With Ease',
    overview:
      'The XSTO EzGo2 is an aerospace-grade carbon fibre power wheelchair weighing just 11.5 kg without battery. Three-step folding to a 26 cm packed width, dual 150W motors, and a 24V 10Ah battery make it ideal for indoor mobility, travel, and effortless lifting into a car boot.',
    highlights: [
      'Only 11.5 kg without battery',
      'High-strength full carbon fibre frame',
      'Three-step quick fold · 26 cm folded width',
      '15 km range · 136 kg capacity',
    ],
    features: [
      {
        title: 'Aerospace-Grade Carbon Fibre',
        description:
          'A full carbon fibre frame delivers exceptional strength at ultra-low weight — light enough for many users to lift with one hand.',
        highlights: [
          '11.5 kg frame weight (no battery)',
          'High-strength carbon fibre construction',
          'Battery approx. 2.2 kg',
          'Easy boot and travel packing',
        ],
      },
      {
        title: 'Three-Step Quick Folding',
        description:
          'One lift, one pull, one fold — compact storage with a folded width of just 26 cm.',
        highlights: [
          'Folded size 630 × 260 × 700 mm',
          'Unfolded size 860 × 600 × 900 mm',
          'Fits easily in most car boots',
          'Ideal for flats and travel',
        ],
      },
      {
        title: 'Smart Everyday Comfort',
        description:
          'Ventilated seat cushion, smart LED controller, holding brake, anti-tip wheel, and high-brightness LED lighting for safer daily use.',
        highlights: [
          '24V 10Ah lithium battery',
          '150W × 2 motors',
          'Joystick control',
          'Indoor-focused agility',
        ],
      },
    ],
    specs: [
      {label: 'Max Load Capacity', value: '136 kg', unit: '(300 lbs)'},
      {label: 'Weight (no battery)', value: '11.5 kg', unit: '(25 lbs)'},
      {label: 'Battery Weight', value: '2.2 kg', unit: '(4.9 lbs)'},
      {label: 'Range', value: '15 km', unit: '(9.3 miles)'},
      {label: 'Top Speed', value: '≤ 4.5 km/h', unit: '(2.8 mph)'},
      {label: 'Climbing Capacity', value: '≥ 3°'},
      {label: 'Usage Type', value: 'Indoor'},
      {label: 'Battery', value: '24V', unit: '10Ah'},
      {label: 'Motor Power', value: '150W × 2'},
      {label: 'Frame Material', value: 'Carbon fibre'},
      {label: 'Obstacle Clearance', value: '≥ 25 mm'},
      {label: 'Gap Crossing', value: '100 mm'},
      {label: 'Turning Diameter', value: '≤ 1800 mm'},
    ],
    dimensions: [
      {label: 'Folded Size', value: '630 × 260 × 700 mm'},
      {label: 'Unfolded Size', value: '860 × 600 × 900 mm'},
      {label: 'Seat Width', value: '430 mm'},
      {label: 'Seat Depth', value: '400 mm'},
      {label: 'Front Seat Height', value: '490 mm'},
      {label: 'Backrest Height', value: '400 mm'},
      {label: 'Front Wheel', value: '6.5 inch'},
      {label: 'Rear Wheel', value: '12 inch'},
    ],
    inBox: [
      'XSTO EzGo2 Carbon Fibre Power Wheelchair',
      '24V 10Ah Lithium Battery',
      'Battery Charger',
      'Joystick Controller',
      'User Manual',
    ],
    deliveryWarranty: `${DELIVERY_WARRANTY}\n\nWhen ordered as a pre-order build, estimated delivery is about 2 weeks. Pay in full or place a 10% deposit; balance due before dispatch.`,
    faqs: ezgo2FAQs,
    videos: [],
  },
  'xsto-x12': {
    displayName: 'XSTO X12',
    tagline: 'AI-Powered All-Terrain Mobility Robot',
    overview:
      'The XSTO X12 is a true all-terrain machine with AI-powered automatic mode switching. Climbs stairs up to 40°, crosses ditches up to 300 mm, and delivers 35 km range on dual batteries with gyroscopic self-balancing.',
    highlights: [
      'Climbs stairs up to 40° incline',
      '35 km range on dual batteries',
      'Three terrain modes for any surface',
      'LiDAR obstacle detection',
    ],
    specs: [
      {label: 'Max Load Capacity', value: '136 kg', unit: '(300 lbs)'},
      {label: 'Range', value: '35 km', unit: '(22 miles)'},
      {label: 'Top Speed', value: '0–12 km/h', unit: '(7.5 mph)'},
      {label: 'Max Stair Slope', value: '40°'},
      {label: 'Weight (no battery)', value: '112.8 kg', unit: '(249 lbs)'},
      {label: 'Battery', value: '25.2V', unit: '25.6Ah × 2'},
      {label: 'Charge Time', value: '6.5 hours × 2'},
      {label: 'Max Pit Width', value: '300 mm', unit: '(tracked)'},
      {label: 'Protection', value: 'IPX5', unit: 'Water Resistant'},
    ],
    dimensions: [
      {label: 'Compact transport size', value: '1185 × 685 × 617 mm'},
      {label: 'Operating size', value: '1210 × 685 × 1550 mm'},
      {label: 'Lifting / seat range', value: '315–700 mm'},
      {label: 'Recline Angle', value: '90°–121°'},
    ],
    inBox: [
      'XSTO X12 All-Terrain Mobility Robot',
      '2× 25.2V 25.6Ah Lithium Battery Packs',
      'Battery Charger',
      'Joystick Controller',
      'Wireless Key',
      'User Manual',
      'Tool Kit',
    ],
    deliveryWarranty: `${DELIVERY_WARRANTY}\n\nWhen the X12 is in stock, free UK mainland delivery typically takes 3–4 working days. If currently out of stock with pre-order enabled, estimated build time is ~10 weeks (pay in full or place a 10% deposit; balance due before dispatch).`,
    faqs: x12FAQs,
    videos: [
      {title: 'Watch the X12 in Action', embedUrl: YOUTUBE.x12},
      ...X12_SERIES_VIDEOS,
    ],
    downloads: X12_SERIES_DOWNLOADS,
  },
  'xsto-x12-pro': {
    displayName: 'XSTO X12 Pro',
    tagline: 'AI Stair Climbing Mobility Wheelchair — Pro Edition',
    overview:
      'The X12 Pro adds an electric legrest and electric seat adjustment over the standard X12. Same 136 kg capacity, 40° stair capability, dual batteries, and 35 km range — with enhanced comfort and Pro-exclusive adjustments.',
    highlights: [
      'Electric legrest (Pro exclusive)',
      'Climbs stairs up to 40° incline',
      'Dual battery system — 35 km range',
      'LiDAR obstacle detection',
    ],
    specs: [
      {label: 'Max Load Capacity', value: '136 kg', unit: '(300 lbs)'},
      {label: 'Range', value: '35 km', unit: '(22 miles)'},
      {label: 'Top Speed', value: '0–12 km/h', unit: '(7.5 mph)'},
      {label: 'Max Stair Slope', value: '40°'},
      {label: 'Weight (no battery)', value: '115.8 kg', unit: '(255 lbs)'},
      {label: 'Legrest Adjustment', value: 'Electric (Pro exclusive)'},
      {label: 'Battery', value: '25.2V', unit: '25.6Ah × 2'},
      {label: 'Charge Time', value: '6.5 hours × 2'},
      {label: 'Protection', value: 'IPX5', unit: 'Water Resistant'},
    ],
    dimensions: [
      {label: 'Compact transport size', value: '1185 × 685 × 617 mm'},
      {label: 'Operating size', value: '1210 × 685 × 1550 mm'},
      {label: 'Lifting / seat range', value: '315–700 mm'},
      {label: 'Recline Angle', value: '90°–121°'},
    ],
    inBox: [
      'XSTO X12 Pro All-Terrain Mobility Robot',
      '2× 25.2V 25.6Ah Lithium Battery Packs',
      'Battery Charger',
      'Joystick Controller',
      'Wireless Key',
      'User Manual',
      'Tool Kit',
    ],
    deliveryWarranty: `${DELIVERY_WARRANTY}\n\nX12 Pro models are available by pre-order (estimated ~10 weeks). Pay in full or place a 10% deposit to join the build queue; balance due before dispatch.`,
    faqs: x12FAQs,
    videos: [
      {title: 'Watch the X12 Pro in Action', embedUrl: YOUTUBE.x12Pro},
      ...X12_SERIES_VIDEOS,
    ],
    downloads: X12_SERIES_DOWNLOADS,
  },
};

export function getProductContent(
  shopifyHandle: string,
): ProductContent | undefined {
  const slot = getHomepageProductSlot(shopifyHandle);
  return slot ? CONTENT[slot] : undefined;
}

/** Clean storefront name — prefers curated displayName over long Shopify titles. */
export function getProductDisplayName(
  shopifyHandle: string,
  fallbackTitle?: string | null,
): string {
  const content = getProductContent(shopifyHandle);
  if (content?.displayName) return content.displayName;

  const slot = getHomepageProductSlot(shopifyHandle);
  if (slot) {
    const fromBadges = {
      'xsto-m4': 'XSTO M4',
      'xsto-m4-pro': 'XSTO M4 Pro',
      'xsto-m4b': 'XSTO M4B',
      'xsto-ezgo2': 'XSTO EzGo2',
      'xsto-x12': 'XSTO X12',
      'xsto-x12-pro': 'XSTO X12 Pro',
    } as const;
    return fromBadges[slot];
  }

  return fallbackTitle?.trim() || 'XSTO';
}

export function mergeProductVideos(
  content: ProductContent | undefined,
  metafieldEmbedUrl?: string | null,
): ProductVideo[] {
  const videos = [...(content?.videos ?? [])];
  if (
    metafieldEmbedUrl &&
    !videos.some((video) => video.embedUrl === metafieldEmbedUrl)
  ) {
    videos.unshift({title: 'Product video', embedUrl: metafieldEmbedUrl});
  }
  return videos;
}
