import {describe, expect, it} from 'vitest';
import {
  DEFAULT_PREORDER_WEEKS,
  getCartDeliveryInfo,
  getDeliveryInfo,
  getPreorderWeeks,
  getPreorderWeeksLabel,
  isForcedPreorder,
  isPreorderAllowed,
  isPurchasable,
} from './product-delivery';

describe('getPreorderWeeks', () => {
  it('returns X12 and X12 Pro as 10 weeks (upper bound)', () => {
    expect(getPreorderWeeks('x12-all-terrain-mobility-robot')).toBe(10);
    expect(
      getPreorderWeeks(
        'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
      ),
    ).toBe(10);
  });

  it('returns 8–10 weeks labels for the X12 range', () => {
    expect(getPreorderWeeksLabel('x12-all-terrain-mobility-robot')).toBe(
      '8–10 weeks',
    );
    expect(
      getPreorderWeeksLabel(
        'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
      ),
    ).toBe('8–10 weeks');
  });

  it('falls back to default for other products', () => {
    expect(getPreorderWeeks('buy-robot-wheelchair')).toBe(
      DEFAULT_PREORDER_WEEKS,
    );
  });
});

describe('getDeliveryInfo', () => {
  it('forces X12 preorder even when Shopify reports stock', () => {
    const info = getDeliveryInfo({
      availableForSale: true,
      quantityAvailable: 3,
      handle: 'x12-all-terrain-mobility-robot',
    });
    expect(info.status).toBe('preorder');
    expect(info.headline).toBe('Pre-order');
    expect(info.detail).toContain('8–10 weeks');
    expect(info.detail).toContain('10% deposit');
    expect(info.preorderWeeks).toBe(10);
    expect(isForcedPreorder('x12-all-terrain-mobility-robot')).toBe(true);
  });

  it('forces X12 preorder when quantity is zero', () => {
    const info = getDeliveryInfo({
      availableForSale: true,
      quantityAvailable: 0,
      handle: 'x12-all-terrain-mobility-robot',
    });
    expect(info.status).toBe('preorder');
    expect(info.detail).toContain('8–10 weeks');
  });

  it('forces X12 Pro preorder even when Shopify reports stock', () => {
    const x12Pro = getDeliveryInfo({
      availableForSale: true,
      quantityAvailable: 5,
      handle:
        'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
    });
    expect(x12Pro.status).toBe('preorder');
    expect(x12Pro.detail).toContain('8–10 weeks');
    expect(x12Pro.detail).toContain('10% deposit');
  });

  it('marks in-stock products as in_stock', () => {
    const info = getDeliveryInfo({
      availableForSale: true,
      quantityAvailable: 3,
      handle: 'buy-robot-wheelchair',
    });
    expect(info.status).toBe('in_stock');
    expect(info.detail).toBe('3 available · Free UK mainland delivery');
    expect(info.etaLabel).toBe('Delivers in 3–4 working days');
    expect(info.preorderWeeks).toBeNull();
  });

  it('uses default in-stock ETA for non M-series products', () => {
    const info = getDeliveryInfo({
      availableForSale: true,
      quantityAvailable: 1,
      handle: 'some-other-product',
    });
    expect(info.etaLabel).toBe('Delivers in 5–7 working days');
  });

  it('marks unavailable as sold_out', () => {
    const info = getDeliveryInfo({
      availableForSale: false,
      quantityAvailable: 0,
    });
    expect(info.status).toBe('sold_out');
  });

  it('treats qty 0 as sold out unless pre-order is opted in', () => {
    const info = getDeliveryInfo({
      availableForSale: true,
      quantityAvailable: 0,
      handle: 'buy-robot-wheelchair',
    });
    expect(info.status).toBe('sold_out');
  });

  it('allows pre-order at qty 0 when the product is tagged', () => {
    const info = getDeliveryInfo({
      availableForSale: true,
      quantityAvailable: 0,
      handle: 'buy-robot-wheelchair',
      tags: ['Pre-order'],
    });
    expect(info.status).toBe('preorder');
    expect(info.headline).toBe('Pre-order');
  });

  it('allows pre-order at qty 0 when the metafield is set', () => {
    const info = getDeliveryInfo({
      availableForSale: true,
      quantityAvailable: 0,
      handle: 'some-accessory',
      allowPreorder: 'true',
    });
    expect(info.status).toBe('preorder');
  });
});

describe('getCartDeliveryInfo', () => {
  it('uses the longest pre-order lead time in the cart', () => {
    const info = getCartDeliveryInfo([
      {
        merchandise: {
          availableForSale: true,
          quantityAvailable: 5,
          product: {
            handle:
              'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
          },
        },
      },
      {
        merchandise: {
          availableForSale: true,
          quantityAvailable: 0,
          product: {handle: 'x12-all-terrain-mobility-robot'},
        },
      },
    ]);
    expect(info.status).toBe('preorder');
    expect(info.preorderWeeks).toBe(10);
  });

  it('falls back to in-stock when no preorder lines', () => {
    const info = getCartDeliveryInfo([
      {
        merchandise: {
          availableForSale: true,
          quantityAvailable: 2,
          product: {handle: 'buy-robot-wheelchair'},
        },
      },
    ]);
    expect(info.status).toBe('in_stock');
  });
});

describe('isPreorderAllowed / isPurchasable', () => {
  it('does not sell untagged products at qty 0', () => {
    expect(
      isPurchasable({
        availableForSale: true,
        quantityAvailable: 0,
        handle: 'buy-robot-wheelchair',
      }),
    ).toBe(false);
  });

  it('sells tagged products at qty 0 when Shopify still allows sale', () => {
    expect(isPreorderAllowed({tags: ['preorder']})).toBe(true);
    expect(
      isPurchasable({
        availableForSale: true,
        quantityAvailable: 0,
        handle: 'buy-robot-wheelchair',
        tags: ['preorder'],
      }),
    ).toBe(true);
  });
});
