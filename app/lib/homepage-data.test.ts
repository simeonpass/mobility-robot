import {describe, expect, it} from 'vitest';
import {getHomepageProductSlot} from '~/lib/homepage-data';

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

  it('does not treat accessory handles that mention models as chairs', () => {
    expect(
      getHomepageProductSlot(
        'bluetooth-controller-for-m4-m4h-m4-pro-x12-x12-pro',
      ),
    ).toBeUndefined();
    expect(
      getHomepageProductSlot('adjustable-headrest-for-x12-x12-pro'),
    ).toBeUndefined();
    expect(
      getHomepageProductSlot('calf-support-set-for-x12-x12pro'),
    ).toBeUndefined();
    expect(getHomepageProductSlot('black-backpack-for-m4-pro')).toBeUndefined();
    expect(
      getHomepageProductSlot('ergonomic-chairs-for-back-support'),
    ).toBeUndefined();
  });
});
