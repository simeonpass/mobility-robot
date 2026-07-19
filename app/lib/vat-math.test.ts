import {describe, expect, it} from 'vitest';
import {
  exVatFromCatalog,
  incVatFromCatalog,
  vatFromCatalog,
  vatReliefCheckoutDiscountFromCatalog,
} from '~/lib/vat-math';

describe('vat-math (tax-exclusive catalog)', () => {
  it('treats catalog as ex VAT and derives inc VAT / savings', () => {
    expect(exVatFromCatalog(3329.17)).toBe(3329.17);
    expect(incVatFromCatalog(3329.17)).toBe(3995);
    expect(vatFromCatalog(3329.17)).toBe(665.83);
    expect(exVatFromCatalog(3329.17) + vatFromCatalog(3329.17)).toBe(3995);
  });

  it('product discount is always 0 — relief is via taxExempt', () => {
    expect(vatReliefCheckoutDiscountFromCatalog(3329.17)).toBe(0);
    expect(vatReliefCheckoutDiscountFromCatalog(1995)).toBe(0);
    expect(vatReliefCheckoutDiscountFromCatalog(1000)).toBe(0);
  });

  it('£1000 catalog: no relief → £1200; with relief (taxExempt) → £1000', () => {
    expect(exVatFromCatalog(1000)).toBe(1000);
    expect(incVatFromCatalog(1000)).toBe(1200);
    expect(vatFromCatalog(1000)).toBe(200);
    // Wrong legacy formula (catalog/6) would leave £833.33 if tax is not added back.
    expect(Math.round((1000 / 6) * 100) / 100).toBe(166.67);
    expect(Math.round((1000 - 166.67) * 100) / 100).toBe(833.33);
  });
});
