import {describe, expect, it} from 'vitest';
import {
  formatCompatibilityLabel,
  resolveAccessoryCompatibility,
} from '~/lib/accessories';

describe('resolveAccessoryCompatibility', () => {
  it('prefers Shopify tags when present', () => {
    expect(
      resolveAccessoryCompatibility({
        handle: 'mystery-part',
        title: 'Mystery Part',
        tags: ['compatible-x12', 'compatible-x12-pro'],
      }),
    ).toEqual(['xsto-x12', 'xsto-x12-pro']);
  });

  it('uses curated handle map', () => {
    expect(
      resolveAccessoryCompatibility({
        handle: 'armrest-bag',
        title: 'Armrest Bag',
      }),
    ).toEqual(['xsto-m4', 'xsto-m4b']);
  });

  it('detects M4 Pro from title', () => {
    expect(
      resolveAccessoryCompatibility({
        handle: 'some-cushion',
        title: 'Seat Cushion Large M4 Pro',
      }),
    ).toEqual(['xsto-m4-pro']);
  });

  it('formats multi-chair labels', () => {
    expect(
      formatCompatibilityLabel(['xsto-m4', 'xsto-m4b', 'xsto-m4-pro']),
    ).toBe('Fits M4, M4B & M4 Pro');
  });
});
