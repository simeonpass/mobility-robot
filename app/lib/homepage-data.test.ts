import {describe, expect, it} from 'vitest';
import {isAccessoryProduct} from '~/lib/cart-utils';
import {
  ACCESSORY_COMPAT_BY_HANDLE,
  resolveAccessoryCompatibility,
} from '~/lib/accessories';
import {
  getHomepageProductSlot,
  SHOPIFY_HOME_PRODUCT_HANDLES,
} from '~/lib/homepage-data';
import {
  getProductContent,
  getProductDisplayName,
  resolveProductIdentity,
} from '~/lib/product-content';
import {resolveProductSeo} from '~/lib/product-seo';
import {resolveLegacyRedirect} from '~/lib/redirects';
import {
  FOOTER_QUICK_LINKS,
  FOOTER_SUPPORT_LINKS,
  HEADER_CTA,
  HEADER_MOBILE_EXTRA_NAV,
  HEADER_SECONDARY_NAV,
  PRODUCT_NAV_ITEMS,
} from '~/lib/site-navigation';
import {SITE_URL} from '~/lib/const';

/**
 * Full live Shopify accessories catalogue
 * (https://f7vjea-hq.myshopify.com/collections/accessories).
 */
export const LIVE_ACCESSORY_HANDLES = [
  'armrest-bag',
  'flashlight-holder',
  'buy-universal-phone-holder',
  'cup-holder-for-all-models',
  'travel-cushion-seat-with-pump',
  'wheelchair-battery-charger',
  'adjustable-headrest-for-x12-x12-pro',
  'bluetooth-controller-for-m4-m4h-m4-pro-x12-x12-pro',
  'black-backpack-for-m4-pro',
  'ergonomic-chairs-for-back-support',
  'universal-wheels-for-xsto-m4',
  'lithium-10-4ah-battery-batteries-lithium-battery',
  'batteries-lithium-battery-15-6ah-battery',
  'calf-support-set-for-x12-x12pro',
] as const;

const LIVE_ACCESSORY_TITLES: Record<(typeof LIVE_ACCESSORY_HANDLES)[number], string> =
  {
    'armrest-bag': 'Armrest Storage Bag',
    'flashlight-holder': 'XSTO M4 Flashlight Holder With Torch',
    'buy-universal-phone-holder': 'XSTO M4 Universal Mobile Phone Holder',
    'cup-holder-for-all-models': 'Cup Holder for All Models',
    'travel-cushion-seat-with-pump': 'Inflatable Travel Cushion with Pump',
    'wheelchair-battery-charger': 'XSTO Power Chair Battery Charger',
    'adjustable-headrest-for-x12-x12-pro': 'Adjustable Headrest for X12/X12 Pro',
    'bluetooth-controller-for-m4-m4h-m4-pro-x12-x12-pro':
      'Bluetooth Controller for M4/M4B/M4 Pro/X12/X12 Pro',
    'black-backpack-for-m4-pro': 'Black Backpack for M4 Pro',
    'ergonomic-chairs-for-back-support':
      'High Back Rest & Neck Support Cushion',
    'universal-wheels-for-xsto-m4':
      'XSTO M4 Universal Wheels With Flip-Up Foot Rest',
    'lithium-10-4ah-battery-batteries-lithium-battery':
      'Airline Compliant 10.4AH Lithium Battery',
    'batteries-lithium-battery-15-6ah-battery': '15.6Ah Lithium Battery Pack',
    'calf-support-set-for-x12-x12pro': 'Calf Support Set for X12/X12Pro',
  };

const CHAIR_DISPLAY_NAMES = [
  'XSTO M4',
  'XSTO M4 Pro',
  'XSTO M4B',
  'XSTO EzGo2',
  'XSTO X12',
  'XSTO X12 Pro',
] as const;

/** Handles that the old substring slot matcher wrongly treated as chairs. */
const PREVIOUSLY_MISROUTED = [
  'adjustable-headrest-for-x12-x12-pro',
  'black-backpack-for-m4-pro',
  'bluetooth-controller-for-m4-m4h-m4-pro-x12-x12-pro',
  'calf-support-set-for-x12-x12pro',
] as const;

describe('getHomepageProductSlot', () => {
  it('maps live Shopify chair handles', () => {
    expect(getHomepageProductSlot('buy-robot-wheelchair')).toBe('xsto-m4');
    expect(getHomepageProductSlot('xsto-m4-pro')).toBe('xsto-m4-pro');
    expect(getHomepageProductSlot('xsto-m4b-1')).toBe('xsto-m4b');
    expect(getHomepageProductSlot('x12-all-terrain-mobility-robot')).toBe(
      'xsto-x12',
    );
    expect(
      getHomepageProductSlot(
        'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
      ),
    ).toBe('xsto-x12-pro');
  });

  it('does not resolve any live accessory as a chair', () => {
    const bad = LIVE_ACCESSORY_HANDLES.filter((handle) =>
      Boolean(getHomepageProductSlot(handle)),
    ).map((handle) => ({handle, slot: getHomepageProductSlot(handle)}));

    expect(bad).toEqual([]);
  });

  it('does not resolve curated accessory handles as chairs', () => {
    const bad = Object.keys(ACCESSORY_COMPAT_BY_HANDLE)
      .filter((handle) => Boolean(getHomepageProductSlot(handle)))
      .map((handle) => ({handle, slot: getHomepageProductSlot(handle)}));

    expect(bad).toEqual([]);
  });
});

describe('accessory catalogue integrity', () => {
  it('keeps accessory titles instead of chair display names', () => {
    for (const handle of LIVE_ACCESSORY_HANDLES) {
      const title = LIVE_ACCESSORY_TITLES[handle];
      const display = getProductDisplayName(handle, title);
      expect(isAccessoryProduct(handle)).toBe(true);
      expect(getProductContent(handle)).toBeUndefined();
      expect(CHAIR_DISPLAY_NAMES).not.toContain(display);
      expect(display).toBe(title);
    }
  });

  it('fixes every previously mis-routed accessory handle', () => {
    for (const handle of PREVIOUSLY_MISROUTED) {
      expect(getHomepageProductSlot(handle)).toBeUndefined();
      expect(isAccessoryProduct(handle)).toBe(true);
    }
  });

  it('does not legacy-redirect accessory product URLs to chairs', () => {
    for (const handle of LIVE_ACCESSORY_HANDLES) {
      const result = resolveLegacyRedirect(
        new Request(`${SITE_URL}/products/${handle}`),
      );
      expect(result).toBeNull();
    }
  });

  it('still resolves compatibility for model-mentioning accessories', () => {
    expect(
      resolveAccessoryCompatibility({
        handle: 'bluetooth-controller-for-m4-m4h-m4-pro-x12-x12-pro',
        title: 'Bluetooth Controller for M4/M4B/M4 Pro/X12/X12 Pro',
      }),
    ).toEqual([
      'xsto-m4',
      'xsto-m4b',
      'xsto-m4-pro',
      'xsto-x12',
      'xsto-x12-pro',
    ]);

    expect(
      resolveAccessoryCompatibility({
        handle: 'black-backpack-for-m4-pro',
        title: 'Black Backpack for M4 Pro',
      }),
    ).toEqual(['xsto-m4-pro']);

    expect(
      resolveAccessoryCompatibility({
        handle: 'adjustable-headrest-for-x12-x12-pro',
        title: 'Adjustable Headrest for X12/X12 Pro',
      }),
    ).toEqual(['xsto-x12', 'xsto-x12-pro']);

    expect(
      resolveAccessoryCompatibility({
        handle: 'calf-support-set-for-x12-x12pro',
        title: 'Calf Support Set for X12/X12Pro',
      }),
    ).toEqual(['xsto-x12', 'xsto-x12-pro']);
  });
});

describe('exact-handle guards against future regressions', () => {
  const adversarialHandles = [
    'something-for-m4-pro',
    'xsto-m4-pro-headrest',
    'xsto-x12-pro-calf-support',
    'bag-for-xsto-m4',
    'controller-m4-pro-x12-pro',
    'm4-pro-backpack',
    'x12-pro-accessory-kit',
    'for-m4-pro-and-x12',
  ] as const;

  it('never maps accessory-like handles to chair slots', () => {
    for (const handle of adversarialHandles) {
      expect(getHomepageProductSlot(handle)).toBeUndefined();
      expect(getProductContent(handle)).toBeUndefined();
      const identity = resolveProductIdentity(handle, `Title for ${handle}`);
      expect(identity.isChair).toBe(false);
      expect(identity.displayName).toBe(`Title for ${handle}`);
      expect(CHAIR_DISPLAY_NAMES).not.toContain(identity.displayName);
    }
  });

  it('does not apply chair SEO to accessory-like handles', () => {
    for (const handle of adversarialHandles) {
      const seo = resolveProductSeo({
        handle,
        productTitle: `Accessory ${handle}`,
        productDescription: 'Spare part description',
      });
      expect(seo.title).toBe(`Accessory ${handle}`);
      expect(seo.description).toBe('Spare part description');
      expect(seo.title).not.toMatch(/XSTO M4 Pro Wheelchair|XSTO X12 Pro/);
    }
  });

  it('keeps chair identity only for exact known handles', () => {
    const identity = resolveProductIdentity(
      'xsto-m4-pro',
      'Long Shopify Title That Should Be Replaced',
    );
    expect(identity.isChair).toBe(true);
    expect(identity.slot).toBe('xsto-m4-pro');
    expect(identity.displayName).toBe('XSTO M4 Pro');
  });
});

describe('site navigation product URLs', () => {
  it('points every product nav/footer chair link at the live Shopify handle', () => {
    for (const item of PRODUCT_NAV_ITEMS) {
      expect(item.productSlot).toBeTruthy();
      const expected = `/products/${SHOPIFY_HOME_PRODUCT_HANDLES[item.productSlot!]}`;
      expect(item.url).toBe(expected);
      expect(getHomepageProductSlot(item.productSlot!)).toBe(item.productSlot);
      expect(
        getHomepageProductSlot(SHOPIFY_HOME_PRODUCT_HANDLES[item.productSlot!]),
      ).toBe(item.productSlot);
    }

    const footerProductUrls = FOOTER_QUICK_LINKS.filter((link) =>
      link.url.startsWith('/products/'),
    );
    expect(footerProductUrls).toHaveLength(6);
    for (const link of footerProductUrls) {
      const handle = link.url.replace('/products/', '');
      expect(getHomepageProductSlot(handle)).toBeTruthy();
    }
  });

  it('keeps support and secondary nav on known internal paths', () => {
    const paths = [
      ...HEADER_SECONDARY_NAV,
      ...HEADER_MOBILE_EXTRA_NAV,
      HEADER_CTA,
      ...FOOTER_SUPPORT_LINKS,
      ...FOOTER_QUICK_LINKS.filter((link) => !link.url.startsWith('/products/')),
    ].map((link) => link.url);

    for (const path of paths) {
      expect(path.startsWith('/')).toBe(true);
      expect(path.includes('xstouk')).toBe(false);
    }
  });
});
