import {describe, expect, it} from 'vitest';
import {
  getHomepageProductSlot,
  HOMEPAGE_FLAGSHIP_HANDLES,
  HOMEPAGE_COMPARISON_FEATURES,
} from './homepage-data';
import {getProductContent} from './product-content';
import {
  getDeliveryInfo,
  isForcedPreorder,
  getPreorderWeeks,
} from './product-delivery';
import {buildPurchaseOptions} from './selling-plans';

describe('M8 launch', () => {
  it('recognises both models as chairs, not accessories', () => {
    for (const handle of ['xsto-m8', 'xsto-m8-pro'] as const) {
      expect(getHomepageProductSlot(handle)).toBe(handle);
      expect(HOMEPAGE_FLAGSHIP_HANDLES).toContain(handle);
      expect(isForcedPreorder(handle)).toBe(true);
      expect(getPreorderWeeks(handle)).toBe(12);
      expect(
        getDeliveryInfo({handle, availableForSale: true, quantityAvailable: 10})
          .status,
      ).toBe('preorder');
      expect(getProductContent(handle)?.deliveryWarranty).toContain('12 weeks');
      expect(
        HOMEPAGE_COMPARISON_FEATURES.every(
          (row) => row.values[handle] !== undefined,
        ),
      ).toBe(true);
    }
    expect(getHomepageProductSlot('battery-for-m8')).toBeUndefined();
  });
  it('distinguishes manual M8 seating from powered Pro seating', () => {
    expect(
      getProductContent('xsto-m8')?.specs.find((s) => s.label === 'Leg rest')
        ?.value,
    ).toBe('Manual');
    expect(
      getProductContent('xsto-m8-pro')?.specs.find(
        (s) => s.label === 'Leg rest',
      )?.value,
    ).toBe('Powered');
  });
  it.each([
    [8400, 840, 7560],
    [9600, 960, 8640],
    [7000, 700, 6300],
    [8000, 800, 7200],
  ])(
    'uses actual Shopify deposit allocations for %s',
    (_, deposit, balance) => {
      const options = buildPurchaseOptions({
        vatReliefEnabled: false,
        allocations: [
          {
            sellingPlan: {id: 'plan', name: '10% pre-order deposit'},
            checkoutChargeAmount: {
              amount: String(deposit),
              currencyCode: 'GBP',
            },
            remainingBalanceChargeAmount: {
              amount: String(balance),
              currencyCode: 'GBP',
            },
          },
        ],
      });
      expect(options[1]).toMatchObject({
        kind: 'deposit',
        checkoutCharge: {amount: String(deposit)},
        remainingBalance: {amount: String(balance)},
      });
    },
  );
});
