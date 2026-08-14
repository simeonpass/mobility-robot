import {describe, expect, it} from 'vitest';
import {
  filterStandardVatVariants,
  filterVisibleProductOptions,
  filterVisibleSelectedOptions,
  isVatReliefVariant,
  getProductListPrice,
  resolveCartMerchandiseId,
  resolveVatPurchaseVariant,
  VAT_OPTION_NAME,
  VAT_OPTION_RELIEF,
  VAT_OPTION_STANDARD,
} from '~/lib/product-vat-variants';

const blackStandard = {
  id: 'gid://shopify/ProductVariant/1',
  price: {amount: '4200.00', currencyCode: 'GBP'},
  selectedOptions: [
    {name: 'Colour', value: 'Magic Black'},
    {name: VAT_OPTION_NAME, value: VAT_OPTION_STANDARD},
  ],
};

const blackRelief = {
  id: 'gid://shopify/ProductVariant/2',
  price: {amount: '3500.00', currencyCode: 'GBP'},
  selectedOptions: [
    {name: 'Colour', value: 'Magic Black'},
    {name: VAT_OPTION_NAME, value: VAT_OPTION_RELIEF},
  ],
};

const whiteStandard = {
  id: 'gid://shopify/ProductVariant/3',
  price: {amount: '4200.00', currencyCode: 'GBP'},
  selectedOptions: [
    {name: 'Colour', value: 'White'},
    {name: VAT_OPTION_NAME, value: VAT_OPTION_STANDARD},
  ],
};

const whiteRelief = {
  id: 'gid://shopify/ProductVariant/4',
  price: {amount: '3500.00', currencyCode: 'GBP'},
  selectedOptions: [
    {name: 'Colour', value: 'White'},
    {name: VAT_OPTION_NAME, value: VAT_OPTION_RELIEF},
  ],
};

const variants = [blackStandard, blackRelief, whiteStandard, whiteRelief];

describe('product-vat-variants', () => {
  it('resolves the VAT Relief sibling for the same colour', () => {
    expect(
      resolveVatPurchaseVariant(blackStandard, variants, true)?.id,
    ).toBe(blackRelief.id);
    expect(
      resolveVatPurchaseVariant(blackRelief, variants, false)?.id,
    ).toBe(blackStandard.id);
  });

  it('keeps the selected variant when dual VAT options are absent', () => {
    const single = {
      id: 'gid://shopify/ProductVariant/9',
      selectedOptions: [{name: 'Title', value: 'Default Title'}],
    };
    expect(resolveVatPurchaseVariant(single, [single], true)).toBe(single);
  });

  it('filters UI options and selected option chips', () => {
    expect(
      filterVisibleProductOptions([
        {name: 'Colour', optionValues: [{}, {}]},
        {name: VAT_OPTION_NAME, optionValues: [{}, {}]},
      ]),
    ).toEqual([{name: 'Colour', optionValues: [{}, {}]}]);

    expect(
      filterVisibleSelectedOptions([
        {name: 'Colour', value: 'Black'},
        {name: VAT_OPTION_NAME, value: VAT_OPTION_RELIEF},
        {name: 'Title', value: 'Default Title'},
      ]),
    ).toEqual([{name: 'Colour', value: 'Black'}]);
  });

  it('filters colour pickers to Standard variants only', () => {
    expect(filterStandardVatVariants(variants).map((v) => v.id)).toEqual([
      blackStandard.id,
      whiteStandard.id,
    ]);
    expect(isVatReliefVariant(blackRelief.selectedOptions)).toBe(true);
  });

  it('resolves cart merchandise id when claiming or clearing relief', () => {
    const merchandise = {
      id: blackStandard.id,
      selectedOptions: blackStandard.selectedOptions,
      product: {variants: {nodes: variants}},
    };
    expect(resolveCartMerchandiseId(merchandise, true)).toBe(blackRelief.id);
    expect(
      resolveCartMerchandiseId(
        {
          id: blackRelief.id,
          selectedOptions: blackRelief.selectedOptions,
          product: {variants: {nodes: variants}},
        },
        false,
      ),
    ).toBe(blackStandard.id);
  });

  it('uses Standard (not VAT Relief) for product list / From prices', () => {
    expect(
      getProductListPrice({
        priceRange: {
          minVariantPrice: {amount: '3500.00', currencyCode: 'GBP'},
          maxVariantPrice: {amount: '4200.00', currencyCode: 'GBP'},
        },
        variants: {nodes: variants},
      }).amount,
    ).toBe('4200.00');
  });
});
