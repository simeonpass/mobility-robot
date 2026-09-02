import {describe, expect, it} from 'vitest';
import {
  DEFAULT_PREORDER_WEEKS,
  getCartDeliveryInfo,
  getDeliveryInfo,
  getInStockDeliveryDays,
  getPreorderWeeks,
  isForcedInStock,
  isForcedPreorder,
  isX12AccessoryBackorder,
  X12_ACCESSORY_PREORDER_WEEKS,
} from './product-delivery';

describe('getPreorderWeeks', () => {
  it('falls back to default for products without a preorder override', () => {
    expect(getPreorderWeeks('buy-robot-wheelchair')).toBe(
      DEFAULT_PREORDER_WEEKS,
    );
    expect(getPreorderWeeks('x12-all-terrain-mobility-robot')).toBe(
      DEFAULT_PREORDER_WEEKS,
    );
  });
});

describe('getDeliveryInfo', () => {
  it('shows X12 as in stock with a 10-day lead time when Shopify reports stock', () => {
    const info = getDeliveryInfo({
      availableForSale: true,
      quantityAvailable: 3,
      handle: 'x12-all-terrain-mobility-robot',
    });
    expect(info.status).toBe('in_stock');
    expect(info.headline).toBe('In stock');
    expect(info.etaLabel).toBe('Delivers in 10 days');
    expect(info.preorderWeeks).toBeNull();
    expect(isForcedPreorder('x12-all-terrain-mobility-robot')).toBe(false);
    expect(isForcedInStock('x12-all-terrain-mobility-robot')).toBe(true);
  });

  it('keeps X12 in stock with a 10-day lead time when quantity is zero', () => {
    const info = getDeliveryInfo({
      availableForSale: true,
      quantityAvailable: 0,
      handle: 'x12-all-terrain-mobility-robot',
    });
    expect(info.status).toBe('in_stock');
    expect(info.etaLabel).toBe('Delivers in 10 days');
  });

  it('shows X12 Pro as in stock with a 10-day lead time', () => {
    const x12Pro = getDeliveryInfo({
      availableForSale: true,
      quantityAvailable: 5,
      handle:
        'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
    });
    expect(x12Pro.status).toBe('in_stock');
    expect(x12Pro.etaLabel).toBe('Delivers in 10 days');
    expect(getInStockDeliveryDays('xsto-x12-pro')).toBe('10 days');
  });

  it('marks in-stock products as in_stock', () => {
    const info = getDeliveryInfo({
      availableForSale: true,
      quantityAvailable: 3,
      handle: 'buy-robot-wheelchair',
    });
    expect(info.status).toBe('in_stock');
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

  it('maps continue-selling zero-qty products to preorder', () => {
    const info = getDeliveryInfo({
      availableForSale: true,
      quantityAvailable: 0,
      handle: 'some-other-product',
    });
    expect(info.status).toBe('preorder');
    expect(info.preorderWeeks).toBe(DEFAULT_PREORDER_WEEKS);
  });

  it('puts X12 accessories on a 4-week backorder even when Shopify reports stock', () => {
    expect(isX12AccessoryBackorder('cooling-seat-cushion-m4-pro-x12')).toBe(
      true,
    );
    expect(isX12AccessoryBackorder('x12-x12-pro-battery-25-2v-25-6ah')).toBe(
      true,
    );
    expect(isX12AccessoryBackorder('adjustable-headrest-m4-pro')).toBe(true);
    expect(isX12AccessoryBackorder('x12-all-terrain-mobility-robot')).toBe(
      false,
    );
    expect(isX12AccessoryBackorder('rear-cover-m4')).toBe(false);

    const info = getDeliveryInfo({
      availableForSale: true,
      quantityAvailable: 8,
      handle: 'cooling-seat-cushion-m4-pro-x12',
    });
    expect(info.status).toBe('preorder');
    expect(info.headline).toBe('Pre-order');
    expect(info.preorderWeeks).toBe(X12_ACCESSORY_PREORDER_WEEKS);
    expect(info.detail).toContain('~4 weeks');
    expect(info.detail).not.toMatch(/deposit/i);
    expect(getPreorderWeeks('cooling-seat-cushion-m4-pro-x12')).toBe(
      X12_ACCESSORY_PREORDER_WEEKS,
    );
  });
});

describe('getCartDeliveryInfo', () => {
  it('uses the longest in-stock lead time in the cart', () => {
    const info = getCartDeliveryInfo([
      {
        merchandise: {
          availableForSale: true,
          quantityAvailable: 5,
          product: {handle: 'buy-robot-wheelchair'},
        },
      },
      {
        merchandise: {
          availableForSale: true,
          quantityAvailable: 2,
          product: {handle: 'x12-all-terrain-mobility-robot'},
        },
      },
    ]);
    expect(info.status).toBe('in_stock');
    expect(info.etaLabel).toBe('Delivers in 10 days');
  });

  it('uses the longest pre-order lead time when any line is preorder', () => {
    const info = getCartDeliveryInfo([
      {
        merchandise: {
          availableForSale: true,
          quantityAvailable: 5,
          product: {handle: 'buy-robot-wheelchair'},
        },
      },
      {
        merchandise: {
          availableForSale: true,
          quantityAvailable: 0,
          product: {handle: 'some-preorder-product'},
        },
      },
    ]);
    expect(info.status).toBe('preorder');
    expect(info.preorderWeeks).toBe(DEFAULT_PREORDER_WEEKS);
  });

  it('keeps the X12 chair lead time visible when a 4-week accessory is added', () => {
    const info = getCartDeliveryInfo([
      {
        merchandise: {
          availableForSale: true,
          quantityAvailable: 2,
          product: {handle: 'x12-all-terrain-mobility-robot'},
        },
      },
      {
        merchandise: {
          availableForSale: true,
          quantityAvailable: 1,
          product: {handle: 'cooling-seat-cushion-m4-pro-x12'},
        },
      },
    ]);
    expect(info.status).toBe('preorder');
    expect(info.headline).toBe('Split delivery');
    expect(info.preorderWeeks).toBe(X12_ACCESSORY_PREORDER_WEEKS);
    expect(info.detail).toContain('Delivers in 10 days');
    expect(info.etaLabel).toMatch(/Pre-order accessories arrive around /);
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
    expect(info.etaLabel).toBe('Delivers in 3–4 working days');
  });
});
