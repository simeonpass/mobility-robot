import {describe, expect, it} from 'vitest';
import {PRODUCT_NAV_GROUPS, PRODUCT_NAV_ITEMS} from '~/lib/site-navigation';

describe('product navigation', () => {
  it('lists four equal chairs, not series columns', () => {
    expect(PRODUCT_NAV_ITEMS.map((item) => item.title)).toEqual([
      'M4',
      'M4B',
      'M4 Pro',
      'X12',
    ]);
    expect(PRODUCT_NAV_GROUPS).toHaveLength(1);
    expect(PRODUCT_NAV_GROUPS[0]?.items).toHaveLength(4);
  });
});
