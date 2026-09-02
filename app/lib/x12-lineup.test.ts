import {describe, expect, it} from 'vitest';
import {
  isX12CanonicalHandle,
  isX12ProShopifyHandle,
  parseX12LegRest,
  x12MergedPath,
  X12_CANONICAL_HANDLE,
  X12_PRO_SHOPIFY_HANDLE,
} from '~/lib/x12-lineup';

describe('x12 lineup helpers', () => {
  it('identifies the canonical X12 listing', () => {
    expect(isX12CanonicalHandle(X12_CANONICAL_HANDLE)).toBe(true);
    expect(isX12CanonicalHandle('xsto-x12')).toBe(true);
    expect(isX12CanonicalHandle(X12_PRO_SHOPIFY_HANDLE)).toBe(false);
  });

  it('identifies the hidden X12 Pro Shopify SKU', () => {
    expect(isX12ProShopifyHandle(X12_PRO_SHOPIFY_HANDLE)).toBe(true);
    expect(isX12ProShopifyHandle('xsto-x12-pro')).toBe(true);
    expect(
      isX12ProShopifyHandle(
        'bluetooth-controller-for-m4-m4h-m4-pro-x12-x12-pro',
      ),
    ).toBe(false);
  });

  it('parses the leg-rest query param', () => {
    expect(parseX12LegRest(null)).toBe('standard');
    expect(parseX12LegRest('electric')).toBe('electric');
    expect(parseX12LegRest('PRO')).toBe('electric');
  });

  it('builds merged PDP paths', () => {
    expect(x12MergedPath()).toBe(`/products/${X12_CANONICAL_HANDLE}`);
    expect(x12MergedPath('electric')).toBe(
      `/products/${X12_CANONICAL_HANDLE}?legrest=electric`,
    );
  });
});
