import {describe, expect, it} from 'vitest';
import {
  isX12CanonicalHandle,
  isX12ProShopifyHandle,
  parseX12ChoiceFromSearch,
  parseX12LegRest,
  productHasX12EditionOption,
  variantsForX12Edition,
  withX12EditionSelectedOptions,
  x12ChoiceSearchParams,
  x12MergedPath,
  X12_CANONICAL_HANDLE,
  X12_EDITION_OPTION_NAME,
  X12_EDITION_PRO_VALUE,
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
    expect(parseX12LegRest('X12 Pro')).toBe('electric');
    expect(parseX12LegRest('X12')).toBe('standard');
  });

  it('prefers Edition search params over legrest', () => {
    expect(
      parseX12ChoiceFromSearch(new URLSearchParams('Edition=X12+Pro')),
    ).toBe('electric');
    expect(
      parseX12ChoiceFromSearch(new URLSearchParams('legrest=electric')),
    ).toBe('electric');
    expect(parseX12ChoiceFromSearch(new URLSearchParams())).toBe('standard');
  });

  it('injects Edition into selected options for the X12 PDP', () => {
    expect(
      withX12EditionSelectedOptions(
        X12_CANONICAL_HANDLE,
        [{name: 'VAT', value: 'Standard'}],
        'https://example.com/products/x12-all-terrain-mobility-robot?legrest=electric',
      ),
    ).toEqual([
      {name: 'VAT', value: 'Standard'},
      {name: X12_EDITION_OPTION_NAME, value: X12_EDITION_PRO_VALUE},
    ]);
  });

  it('splits same-product Edition variants', () => {
    const variants = [
      {
        id: 'x12-std',
        selectedOptions: [
          {name: 'Edition', value: 'X12'},
          {name: 'VAT', value: 'Standard'},
        ],
      },
      {
        id: 'pro-std',
        selectedOptions: [
          {name: 'Edition', value: 'X12 Pro'},
          {name: 'VAT', value: 'Standard'},
        ],
      },
    ];
    expect(productHasX12EditionOption(variants)).toBe(true);
    expect(variantsForX12Edition(variants, 'standard').map((v) => v.id)).toEqual([
      'x12-std',
    ]);
    expect(variantsForX12Edition(variants, 'electric').map((v) => v.id)).toEqual([
      'pro-std',
    ]);
  });

  it('writes Edition and legrest into the PDP search params', () => {
    const electric = x12ChoiceSearchParams(new URLSearchParams(), 'electric');
    expect(electric.get('Edition')).toBe('X12 Pro');
    expect(electric.get('legrest')).toBe('electric');
    const standard = x12ChoiceSearchParams(electric, 'standard');
    expect(standard.get('Edition')).toBe('X12');
    expect(standard.get('legrest')).toBeNull();
  });

  it('builds merged PDP paths', () => {
    expect(x12MergedPath()).toBe(`/products/${X12_CANONICAL_HANDLE}`);
    expect(x12MergedPath('electric')).toBe(
      `/products/${X12_CANONICAL_HANDLE}?legrest=electric`,
    );
  });
});
