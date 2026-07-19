import {describe, expect, it} from 'vitest';
import {
  DEFAULT_PREORDER_WEEKS,
  getCartDeliveryInfo,
  getDeliveryInfo,
  getPreorderWeeks,
} from './product-delivery';

describe('getPreorderWeeks', () => {
  it('returns EzGo2 as 2 weeks', () => {
    expect(
      getPreorderWeeks('xsto-ezgo2-carbon-fiber-power-wheelchair'),
    ).toBe(2);
  });

  it('returns X12 and X12 Pro as 10 weeks', () => {
    expect(getPreorderWeeks('x12-all-terrain-mobility-robot')).toBe(10);
    expect(
      getPreorderWeeks(
        'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
      ),
    ).toBe(10);
  });

  it('falls back to default for other products', () => {
    expect(getPreorderWeeks('buy-robot-wheelchair')).toBe(
      DEFAULT_PREORDER_WEEKS,
    );
  });
});

describe('getDeliveryInfo', () => {
  it('marks continue-selling OOS as preorder with product ETA', () => {
    const info = getDeliveryInfo({
      availableForSale: true,
      quantityAvailable: 0,
      handle: 'x12-all-terrain-mobility-robot',
    });
    expect(info.status).toBe('preorder');
    expect(info.headline).toBe('Pre-order');
    expect(info.detail).toContain('~10 weeks');
    expect(info.preorderWeeks).toBe(10);
  });

  it('forces X12 / EzGo2 preorder even when Shopify reports stock', () => {
    const x12 = getDeliveryInfo({
      availableForSale: true,
      quantityAvailable: 5,
      handle: 'x12-all-terrain-mobility-robot',
    });
    expect(x12.status).toBe('preorder');
    expect(x12.detail).toContain('~10 weeks');

    const ezgo = getDeliveryInfo({
      availableForSale: true,
      quantityAvailable: 2,
      handle: 'xsto-ezgo2-carbon-fiber-power-wheelchair',
    });
    expect(ezgo.status).toBe('preorder');
    expect(ezgo.detail).toContain('~2 weeks');
  });

  it('marks in-stock products as in_stock', () => {
    const info = getDeliveryInfo({
      availableForSale: true,
      quantityAvailable: 3,
      handle: 'buy-robot-wheelchair',
    });
    expect(info.status).toBe('in_stock');
    expect(info.preorderWeeks).toBeNull();
  });

  it('marks unavailable as sold_out', () => {
    const info = getDeliveryInfo({
      availableForSale: false,
      quantityAvailable: 0,
    });
    expect(info.status).toBe('sold_out');
  });
});

describe('getCartDeliveryInfo', () => {
  it('uses the longest pre-order lead time in the cart', () => {
    const info = getCartDeliveryInfo([
      {
        merchandise: {
          availableForSale: true,
          quantityAvailable: 5,
          product: {handle: 'xsto-ezgo2-carbon-fiber-power-wheelchair'},
        },
      },
      {
        merchandise: {
          availableForSale: true,
          quantityAvailable: 3,
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
