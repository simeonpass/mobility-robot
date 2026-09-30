import {describe, expect, it} from 'vitest';
import {
  ALL_FLAGSHIP_HANDLES,
  HOMEPAGE_FLAGSHIP_HANDLES,
  HOMEPAGE_FLAGSHIP_LABELS,
  PAUSED_FLAGSHIP_HANDLES,
  PRODUCT_SERIES,
} from '~/lib/homepage-data';
import {
  FOOTER_QUICK_LINKS,
  PRODUCT_NAV_GROUPS,
  PRODUCT_NAV_ITEMS,
} from '~/lib/site-navigation';

describe('product navigation', () => {
  it('gives X12 and X12 Pro different product pages', () => {
    const x12 = PRODUCT_NAV_ITEMS.find((item) => item.title === 'X12')!;
    const pro = PRODUCT_NAV_ITEMS.find((item) => item.title === 'X12 Pro')!;
    expect(pro.productSlot).toBe('xsto-x12-pro');
    expect(pro.url).not.toBe(x12.url);
    expect(pro.url).not.toContain('?');
  });

  it('lists every model on sale once, grouped by series, and no paused model', () => {
    expect(PRODUCT_NAV_ITEMS.map((item) => item.productSlot)).toEqual([
      ...HOMEPAGE_FLAGSHIP_HANDLES,
    ]);
    for (const slot of PAUSED_FLAGSHIP_HANDLES) {
      expect(PRODUCT_NAV_ITEMS.map((item) => item.productSlot)).not.toContain(
        slot,
      );
      expect(FOOTER_QUICK_LINKS.map((link) => link.title)).not.toContain(
        HOMEPAGE_FLAGSHIP_LABELS[slot],
      );
    }
    const seriesWithModelsOnSale = PRODUCT_SERIES.filter((series) =>
      series.slots.some((slot) => HOMEPAGE_FLAGSHIP_HANDLES.includes(slot)),
    );
    expect(PRODUCT_NAV_GROUPS.map((group) => group.title)).toEqual(
      seriesWithModelsOnSale.map((series) => series.title),
    );
  });

  it('pauses the M8 series until its photography is ready', () => {
    expect(PAUSED_FLAGSHIP_HANDLES).toEqual(['xsto-m8', 'xsto-m8-pro']);
    expect(PRODUCT_NAV_GROUPS.map((group) => group.title)).toEqual([
      'M4 Series',
      'X12 Series',
    ]);
    expect(ALL_FLAGSHIP_HANDLES).toContain('xsto-m8');
    expect(HOMEPAGE_FLAGSHIP_HANDLES).not.toContain('xsto-m8');
  });
});
