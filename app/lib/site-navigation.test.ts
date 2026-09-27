import {describe, expect, it} from 'vitest';
import {PRODUCT_NAV_GROUPS, PRODUCT_NAV_ITEMS} from '~/lib/site-navigation';

describe('product navigation', () => {
  it('gives X12 and X12 Pro different product pages', () => {
    const x12 = PRODUCT_NAV_ITEMS.find((item) => item.title === 'X12')!;
    const pro = PRODUCT_NAV_ITEMS.find((item) => item.title === 'X12 Pro')!;
    expect(pro.productSlot).toBe('xsto-x12-pro');
    expect(pro.url).not.toBe(x12.url);
    expect(pro.url).not.toContain('?');
  });
  it('groups every model into M4, M8 and X12 series', () => {
    expect(PRODUCT_NAV_ITEMS.map((item) => item.title)).toEqual([
      'M4',
      'M4B',
      'M4 Pro',
      'M8',
      'M8 Pro',
      'X12',
      'X12 Pro',
    ]);
    expect(PRODUCT_NAV_GROUPS.map(group => group.title)).toEqual(['M4 Series', 'M8 Series', 'X12 Series']);
    expect(PRODUCT_NAV_GROUPS.map(group => group.items.length)).toEqual([3, 2, 2]);
  });
});
