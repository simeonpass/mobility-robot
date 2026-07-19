import {describe, expect, it} from 'vitest';
import {
  exVatFromCatalog,
  vatReliefCheckoutDiscountFromCatalog,
} from './vat-math.js';

describe('vatReliefCheckoutDiscountFromCatalog', () => {
  it('always returns 0 — taxExempt handles relief on exclusive catalogs', () => {
    expect(vatReliefCheckoutDiscountFromCatalog(3329.17)).toBe(0);
    expect(vatReliefCheckoutDiscountFromCatalog(6658.34)).toBe(0);
    expect(vatReliefCheckoutDiscountFromCatalog(1995)).toBe(0);
    expect(vatReliefCheckoutDiscountFromCatalog(1000)).toBe(0);
    expect(exVatFromCatalog(1000)).toBe(1000);
  });

  it('documents why catalog/6 must not be used when tax is not added after discount', () => {
    const net = 1000;
    const legacyDiscount = Math.round((net - net / 1.2) * 100) / 100;
    expect(legacyDiscount).toBe(166.67);
    // If Shopify does not add 20% tax after that discount → £833.33 (user bug).
    expect(Math.round((net - legacyDiscount) * 100) / 100).toBe(833.33);
  });
});
