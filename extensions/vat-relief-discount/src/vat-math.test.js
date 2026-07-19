import {describe, expect, it} from 'vitest';
import {
  exVatFromGross,
  roundMoney,
  vatPortionFromGross,
} from './vat-math.js';

describe('vatPortionFromGross', () => {
  it('removes exactly 20% VAT from a gross price', () => {
    expect(vatPortionFromGross(3995)).toBe(665.83);
    expect(exVatFromGross(3995)).toBe(3329.17);
    expect(roundMoney(3995 - vatPortionFromGross(3995))).toBe(3329.17);
  });

  it('handles multi-quantity line totals', () => {
    expect(vatPortionFromGross(7990)).toBe(1331.67);
    expect(exVatFromGross(7990)).toBe(6658.33);
  });
});
