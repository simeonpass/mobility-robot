import {SHOPIFY_HOME_PRODUCT_HANDLES} from '~/lib/homepage-data';

export type NavItem = {
  title: string;
  url: string;
  description?: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

function productUrl(handle: keyof typeof SHOPIFY_HOME_PRODUCT_HANDLES) {
  return `/products/${SHOPIFY_HOME_PRODUCT_HANDLES[handle]}`;
}

/**
 * Product series shown in the Models dropdown / mobile menu.
 * Ordered cheapest → most expensive (EzGo2 → M series → X series).
 */
export const PRODUCT_NAV_GROUPS: NavGroup[] = [
  {
    title: 'EzGo2',
    items: [
      {
        title: 'EzGo2',
        url: productUrl('xsto-ezgo2'),
        description: 'Ultra-light carbon fibre',
      },
    ],
  },
  {
    title: 'M Series',
    items: [
      {
        title: 'M4',
        url: productUrl('xsto-m4'),
        description: 'Self-levelling everyday chair',
      },
      {
        title: 'M4B',
        url: productUrl('xsto-m4b'),
        description: 'Updated wheels & footrest',
      },
      {
        title: 'M4 Pro',
        url: productUrl('xsto-m4-pro'),
        description: 'Premium comfort & capacity',
      },
    ],
  },
  {
    title: 'X Series',
    items: [
      {
        title: 'X12',
        url: productUrl('xsto-x12'),
        description: 'All-terrain stair climber',
      },
      {
        title: 'X12 Pro',
        url: productUrl('xsto-x12-pro'),
        description: 'Fully configurable X12',
      },
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
  {title: 'FAQ', url: '/faq'},
];

/** Extra links shown in the mobile menu under Explore. */
export const HEADER_MOBILE_EXTRA_NAV: NavItem[] = [
  {title: 'Videos', url: '/videos'},
  {title: 'Blog', url: '/blog'},
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
  {title: 'Blog', url: '/blog'},
  HEADER_CTA,
  {title: 'Quote', url: '/quote'},
];

export const FOOTER_QUICK_LINKS: NavItem[] = [
  {title: 'Shop All', url: '/collections/all'},
  {title: 'EzGo2', url: productUrl('xsto-ezgo2')},
  {title: 'M4', url: productUrl('xsto-m4')},
  {title: 'M4B', url: productUrl('xsto-m4b')},
  {title: 'M4 Pro', url: productUrl('xsto-m4-pro')},
  {title: 'X12', url: productUrl('xsto-x12')},
  {title: 'X12 Pro', url: productUrl('xsto-x12-pro')},
  {title: 'Accessories', url: '/collections/accessories'},
  {title: 'Videos', url: '/videos'},
  {title: 'Find a Dealer', url: '/stockists'},
  {title: 'Book Demo', url: '/demo'},
];

export const FOOTER_SUPPORT_LINKS: NavItem[] = [
  {title: 'About', url: '/about'},
  {title: 'FAQ', url: '/faq'},
  {title: 'Warranty Information', url: '/warranty'},
  {title: 'Returns Policy', url: '/returns'},
  {title: 'Track Order', url: '/account/orders'},
  {title: 'Contact Us', url: '/contact'},
  {title: 'VAT Relief', url: '/vat-relief'},
  {title: 'Trade Login', url: '/account/login'},
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
  email: 'sales@bentchmeduk.com',
  disclaimer:
    'Official UK Distributor of XSTO. XSTO is a registered trademark of its manufacturer.',
} as const;
