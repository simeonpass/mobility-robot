import {SHOPIFY_HOME_PRODUCT_HANDLES} from '~/lib/homepage-data';

export type NavItem = {
  title: string;
  url: string;
};

export const MAIN_NAV: NavItem[] = [
  {title: 'Home', url: '/'},
  {title: 'M4', url: `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4']}`},
  {
    title: 'M4 Pro',
    url: `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4-pro']}`,
  },
  {title: 'M4B', url: `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4b']}`},
  {title: 'X12', url: `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-x12']}`},
  {
    title: 'X12 Pro',
    url: `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-x12-pro']}`,
  },
  {title: 'Accessories', url: '/collections/accessories'},
  {title: 'FAQ', url: '/faq'},
  {title: 'Stockists', url: '/stockists'},
  {title: 'Blog', url: '/blog'},
  {title: 'Demo', url: '/demo'},
  {title: 'Quote', url: '/quote'},
];

export const FOOTER_QUICK_LINKS: NavItem[] = [
  {title: 'Shop All', url: '/collections/all'},
  {title: 'M4', url: `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4']}`},
  {
    title: 'M4 Pro',
    url: `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4-pro']}`,
  },
  {title: 'X12', url: `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-x12']}`},
  {
    title: 'X12 Pro',
    url: `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-x12-pro']}`,
  },
  {title: 'Accessories', url: '/collections/accessories'},
  {title: 'Find a Dealer', url: '/stockists'},
  {title: 'Book Demo', url: '/demo'},
];

export const FOOTER_SUPPORT_LINKS: NavItem[] = [
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
  email: 'support@xsto.co.uk',
  disclaimer:
    'Official UK Distributor of XSTO. XSTO is a registered trademark of its manufacturer.',
} as const;
