import {describe, expect, it} from 'vitest';
import {
  DEFAULT_PREORDER_WEEKS,
  getCartDeliveryInfo,
  getDeliveryInfo,
  getInStockDeliveryDays,
  getPreorderWeeks,
  isForcedInStock,
  isForcedPreorder,
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
