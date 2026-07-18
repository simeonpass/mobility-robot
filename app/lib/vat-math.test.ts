import {describe, expect, it} from 'vitest';
import {exVatFromGross, vatPortionFromGross} from '~/lib/vat-math';

describe('vat-math', () => {
  it('calculates exact ex-VAT from gross', () => {
    expect(exVatFromGross(3995)).toBe(3329.17);
    expect(vatPortionFromGross(3995)).toBe(665.83);
    expect(exVatFromGross(3995) + vatPortionFromGross(3995)).toBe(3995);
  });
});
