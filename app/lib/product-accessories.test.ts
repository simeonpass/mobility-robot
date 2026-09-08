import {afterEach, describe, expect, it} from 'vitest';
import {
  getAccessoryChoices,
  getSelectedAccessories,
  getAccessoryVariants,
  type AddonProduct,
  type AddonVariant,
} from '~/lib/product-accessories';
import {
  getPurchaseDisplayPrice,
  getVariantDisplayPrice,
  sumMoneyV2,
} from '~/lib/product-pricing';
import {setShopifyPricesExVat} from '~/lib/pricing-mode';

function variant(
  id: string,
  colour: string,
  vat: string,
  amount: string,
  availableForSale = true,
): AddonVariant {
  return {
    id,
    title: `${colour} / ${vat}`,
    availableForSale,
    price: {amount, currencyCode: 'GBP'},
    selectedOptions: [
      {name: 'Colour', value: colour},
      {name: 'VAT', value: vat},
    ],
  };
}
const black = variant('black', 'Black', 'Standard', '60.00');
const blackRelief = variant('black-relief', 'Black', 'VAT Relief', '50.00');
const white = variant('white', 'White', 'Standard', '72.00');
const whiteRelief = variant('white-relief', 'White', 'VAT Relief', '60.00');
const variants = [black, blackRelief, white, whiteRelief];
const accessory: AddonProduct = {
  id: 'cover',
  handle: 'cover',
  title: 'Rear cover',
  priceRange: {minVariantPrice: blackRelief.price},
  variants: {nodes: variants},
};
const legacy: AddonVariant = {
  id: 'bag',
  title: 'Default Title',
  availableForSale: true,
  price: {amount: '24.60', currencyCode: 'GBP'},
};

afterEach(() => setShopifyPricesExVat(null));

describe('accessories with a chair purchase', () => {
  it('offers available standard colour choices without exposing relief SKUs', () => {
    const product = {
      ...accessory,
      variants: {
        nodes: [
          black,
          blackRelief,
          {...white, availableForSale: false},
          whiteRelief,
        ],
      },
    };
    expect(getAccessoryChoices(product).map(({id}) => id)).toEqual(['black']);
  });
  it('does not offer a relief-only SKU as a standard purchase', () => {
    expect(
      getAccessoryChoices({...accessory, variants: {nodes: [blackRelief]}}),
    ).toEqual([]);
  });
  it('supports the selected variant fallback without dropping it from a bundle', () => {
    const product = {
      ...accessory,
      variants: null,
      selectedOrFirstAvailableVariant: legacy,
    };
    expect(getAccessoryVariants(product)).toEqual([legacy]);
    expect(
      getSelectedAccessories([product], new Set(['bag']), false)[0]
        .purchaseVariant,
    ).toEqual(legacy);
  });
  it('keeps the chosen colour when VAT relief changes the purchase SKU', () => {
    const selection = new Set(['white']);
    expect(
      getSelectedAccessories([accessory], selection, true)[0].purchaseVariant
        .id,
    ).toBe('white-relief');
    expect(
      getSelectedAccessories([accessory], selection, false)[0].purchaseVariant
        .id,
    ).toBe('white');
    expect([...selection]).toEqual(['white']);
  });
  it('returns an unavailable relief sibling so the purchase can be blocked', () => {
    const product = {
      ...accessory,
      variants: {
        nodes: [
          black,
          {...blackRelief, availableForSale: false},
          white,
          whiteRelief,
        ],
      },
    };
    const selected = getSelectedAccessories(
      [product],
      new Set(['black']),
      true,
    );
    expect(selected[0].purchaseVariant.id).toBe('black-relief');
    expect(selected[0].purchaseVariant.availableForSale).toBe(false);
  });
  it('does not add unselected accessories', () => {
    expect(getSelectedAccessories([accessory], new Set(), false)).toEqual([]);
  });
  it('totals a chair, a dual-VAT accessory and a legacy accessory at their displayed prices', () => {
    setShopifyPricesExVat(false);
    const chair = variant('chair', 'Black', 'Standard', '4200.00');
    const chairRelief = variant(
      'chair-relief',
      'Black',
      'VAT Relief',
      '3500.00',
    );
    const bundle = (relief: boolean) =>
      sumMoneyV2([
        getVariantDisplayPrice(chair, [chair, chairRelief], relief),
        getVariantDisplayPrice(white, variants, relief),
        getVariantDisplayPrice(legacy, [legacy], relief),
      ]);
    expect(bundle(false)?.amount).toBe('4296.60');
    expect(bundle(true)?.amount).toBe('3580.50');
  });
  it('shows the chair deposit plus the full price of each selected accessory', () => {
    setShopifyPricesExVat(false);
    expect(
      sumMoneyV2([
        getPurchaseDisplayPrice(
          {amount: '350.00', currencyCode: 'GBP'},
          true,
          true,
        ),
        getVariantDisplayPrice(white, variants, true),
        getVariantDisplayPrice(legacy, [legacy], true),
      ])?.amount,
    ).toBe('430.50');
  });
  it('respects an ex-VAT legacy catalogue without converting a relief SKU twice', () => {
    setShopifyPricesExVat(true);
    expect(getVariantDisplayPrice(legacy, [legacy], false)?.amount).toBe(
      '29.52',
    );
    expect(getVariantDisplayPrice(legacy, [legacy], true)?.amount).toBe(
      '24.60',
    );
    expect(getVariantDisplayPrice(white, variants, true)?.amount).toBe('60.00');
  });
});
