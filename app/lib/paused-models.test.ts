import {describe, expect, it} from 'vitest';
import {
  HOMEPAGE_FLAGSHIP_HANDLES,
  isHiddenStorefrontProductHandle,
  isPausedModelLabel,
  isPausedSeries,
  PAUSED_FLAGSHIP_HANDLES,
  SHOPIFY_HOME_PRODUCT_HANDLES,
} from '~/lib/homepage-data';
import {resolveLegacyRedirect} from '~/lib/redirects';
import {STATIC_SITEMAP_ROUTES} from '~/lib/static-routes';
import {SITE_URL} from '~/lib/const';

describe('paused models', () => {
  it('keeps paused chairs out of the flagship list, sitemap and search', () => {
    for (const slot of PAUSED_FLAGSHIP_HANDLES) {
      expect(HOMEPAGE_FLAGSHIP_HANDLES).not.toContain(slot);
      expect(
        isHiddenStorefrontProductHandle(SHOPIFY_HOME_PRODUCT_HANDLES[slot]),
      ).toBe(true);
    }
    expect(isHiddenStorefrontProductHandle('buy-robot-wheelchair')).toBe(false);
    expect(STATIC_SITEMAP_ROUTES.map((route) => route.path)).not.toContain(
      '/series/m8',
    );
    expect(STATIC_SITEMAP_ROUTES.map((route) => route.path)).toContain(
      '/series/m4',
    );
  });

  it('temporarily redirects paused product and series pages to the range', () => {
    for (const path of [
      '/products/xsto-m8',
      '/products/xsto-m8-pro',
      '/series/m8',
    ]) {
      const result = resolveLegacyRedirect(new Request(`${SITE_URL}${path}`));
      expect(result?.destination).toBe('/collections/all');
      expect(result?.status).toBe(302);
      expect(result?.cacheControl).toBe('no-store');
    }
    expect(
      resolveLegacyRedirect(new Request(`${SITE_URL}/products/xsto-m4-pro`)),
    ).toBeNull();
    expect(
      resolveLegacyRedirect(new Request(`${SITE_URL}/series/m4`)),
    ).toBeNull();
  });

  it('hides paused models from enquiry forms by label', () => {
    expect(isPausedSeries('m8')).toBe(true);
    expect(isPausedSeries('x12')).toBe(false);
    expect(isPausedModelLabel('M8 Pro')).toBe(true);
    expect(isPausedModelLabel('M4 Pro')).toBe(false);
  });
});
