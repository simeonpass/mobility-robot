import {
  HOMEPAGE_PRODUCT_THUMBS,
  SHOPIFY_HOME_PRODUCT_HANDLES,
  type HomepageFlagshipHandle,
} from '~/lib/homepage-data';

export type NavItem = {
  title: string;
  url: string;
  description?: string;
  /** Optional product thumb for mega menu / mobile models list. */
  imageUrl?: string;
  /** Canonical homepage slot when this item is a flagship chair. */
  productSlot?: HomepageFlagshipHandle;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

function productUrl(handle: HomepageFlagshipHandle) {
  return `/products/${SHOPIFY_HOME_PRODUCT_HANDLES[handle]}`;
}

function chairItem(
  slot: HomepageFlagshipHandle,
  title: string,
  description: string,
): NavItem {
  return {
    title,
    url: productUrl(slot),
    description,
    imageUrl: HOMEPAGE_PRODUCT_THUMBS[slot],
    productSlot: slot,
  };
}

/**
 * Product series shown in the Models dropdown / mobile menu.
 * Ordered M series → X series → EzGo2.
 */
export const PRODUCT_NAV_GROUPS: NavGroup[] = [
  {
    title: 'M Series',
    items: [
      chairItem('xsto-m4', 'M4', 'Self-levelling everyday chair'),
      chairItem('xsto-m4b', 'M4B', 'Updated wheels & footrest'),
      chairItem('xsto-m4-pro', 'M4 Pro', 'Premium comfort & capacity'),
    ],
  },
  {
    title: 'X Series',
    items: [
      chairItem('xsto-x12', 'X12', 'All-terrain stair climber'),
      chairItem('xsto-x12-pro', 'X12 Pro', 'Fully configurable X12'),
    ],
  },
  {
    title: 'EzGo2',
    items: [
      chairItem('xsto-ezgo2', 'EzGo2', 'Ultra-light carbon fibre'),
    ],
  },
];

/** Flat product links (all chairs). */
export const PRODUCT_NAV_ITEMS: NavItem[] = PRODUCT_NAV_GROUPS.flatMap(
  (group) => group.items,
);

/** Secondary links in the desktop header (kept lean). */
export const HEADER_SECONDARY_NAV: NavItem[] = [
  {title: 'Accessories', url: '/collections/accessories'},
  {title: 'Stockists', url: '/stockists'},
  {title: 'Blog', url: '/blog'},
  {title: 'FAQ', url: '/faq'},
];

/** Extra links shown in the mobile menu under Explore. */
export const HEADER_MOBILE_EXTRA_NAV: NavItem[] = [
  {title: 'Videos', url: '/videos'},
  {title: 'Request a quote', url: '/quote'},
];

export const HEADER_CTA: NavItem = {
  title: 'Book a demo',
  url: '/demo',
};

/** @deprecated Prefer PRODUCT_NAV_GROUPS / HEADER_SECONDARY_NAV for new UI */
export const MAIN_NAV: NavItem[] = [
  ...PRODUCT_NAV_ITEMS,
  ...HEADER_SECONDARY_NAV,
  HEADER_CTA,
  {title: 'Quote', url: '/quote'},
];

export const FOOTER_QUICK_LINKS: NavItem[] = [
  {title: 'Shop All', url: '/collections/all'},
  {title: 'M4', url: productUrl('xsto-m4')},
  {title: 'M4B', url: productUrl('xsto-m4b')},
  {title: 'M4 Pro', url: productUrl('xsto-m4-pro')},
  {title: 'X12', url: productUrl('xsto-x12')},
  {title: 'X12 Pro', url: productUrl('xsto-x12-pro')},
  {title: 'EzGo2', url: productUrl('xsto-ezgo2')},
  {title: 'Accessories', url: '/collections/accessories'},
  {title: 'Videos', url: '/videos'},
  {title: 'Blog', url: '/blog'},
  {title: 'Find a Dealer', url: '/stockists'},
  {title: 'Book Demo', url: '/demo'},
];

export const FOOTER_SUPPORT_LINKS: NavItem[] = [
  {title: 'About', url: '/about'},
  {title: 'FAQ', url: '/faq'},
  {title: 'Warranty Information', url: '/warranty'},
  {title: 'Delivery', url: '/delivery'},
  {title: 'Returns Policy', url: '/returns'},
  {title: 'Track Order', url: '/account/orders'},
  {title: 'Contact Us', url: '/contact'},
  {title: 'VAT Relief', url: '/vat-relief'},
  {title: 'Privacy', url: '/privacy'},
  {title: 'Terms', url: '/terms'},
];

/** @deprecated Use FOOTER_QUICK_LINKS */
export const FOOTER_SHOP_LINKS = FOOTER_QUICK_LINKS;

/** @deprecated Use FOOTER_SUPPORT_LINKS */
export const FOOTER_COMPANY_LINKS: NavItem[] = [
  {title: 'About', url: '/about'},
  {title: 'Contact', url: '/contact'},
  {title: 'Blog', url: '/blog'},
  {title: 'Stockists', url: '/stockists'},
];

/** @deprecated Merged into FOOTER_SUPPORT_LINKS */
export const FOOTER_LEGAL_LINKS: NavItem[] = [
  {title: 'Privacy', url: '/privacy'},
  {title: 'Terms', url: '/terms'},
];

export const COMPANY = {
  name: 'Bentech Medical Ltd',
  address: 'Unit 2 Old Forge Road',
  city: 'Wimborne, Dorset',
  postcode: 'BH21 7RR',
  phone: '0208 050 4849',
  phoneHref: 'tel:+442080504849',
  email: 'sales@bentechmeduk.com',
  disclaimer:
    'Official UK Distributor of XSTO. XSTO is a registered trademark of its manufacturer.',
} as const;
