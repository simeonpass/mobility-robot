import {afterEach, describe, expect, it} from 'vitest';
import {buildMeta, jsonLdScript, productJsonLd, truncateTitle} from './seo';
import {resolveProductOffer} from './product-seo';
import {setShopifyPricesExVat} from './pricing-mode';

afterEach(() => setShopifyPricesExVat(null));
const variant = (id: string, amount: string, vat = 'Standard') => ({
  id,
  availableForSale: true,
  price: {amount, currencyCode: 'GBP' as const},
  selectedOptions: [{name: 'VAT', value: vat}],
});

describe('product and page search data', () => {
  it('uses the selected Pro edition and its public Standard VAT SKU', () => {
    const standard = variant('standard', '6000');
    const pro = variant('pro-standard', '6600');
    const relief = variant('pro-relief', '5500', 'VAT Relief');
    const offer = resolveProductOffer({
      selectedVariant: standard,
      variants: [standard],
      proVariant: relief,
      proVariants: [pro, relief],
      isPro: true,
    });
    expect(offer?.variant.id).toBe('pro-standard');
    expect(offer?.price.amount).toBe('6600.00');
  });
  it('uses the gross visible price for a legacy net catalogue', () => {
    setShopifyPricesExVat(true);
    const selected = {...variant('legacy', '3500'), selectedOptions: []};
    expect(
      resolveProductOffer({selectedVariant: selected, variants: [selected]})
        ?.price.amount,
    ).toBe('4200.00');
  });
  it('does not publish a fabricated zero-price offer without a usable price', () => {
    expect(
      resolveProductOffer({selectedVariant: null, variants: []}),
    ).toBeNull();
  });
  it('marks back-order accessories as preorder and links to the offered SKU', () => {
    const schema = productJsonLd({
      name: 'X12 battery',
      description: 'Replacement battery',
      handle: 'x12-x12-pro-battery-25-2v-25-6ah',
      price: '600',
      currencyCode: 'GBP',
      availableForSale: true,
      quantityAvailable: 4,
      variantId: 'gid://shopify/ProductVariant/123',
    });
    expect(schema.offers.availability).toBe('https://schema.org/PreOrder');
    expect(schema.offers.url).toBe(
      'https://mobilityrobot.co.uk/products/x12-x12-pro-battery-25-2v-25-6ah?variant=123',
    );
  });
  it('keeps the Pro edition selected in the offer URL', () => {
    const schema = productJsonLd({
      name: 'XSTO X12 Pro',
      description: 'Electric leg rest',
      handle: 'x12-all-terrain-mobility-robot',
      price: '6600',
      currencyCode: 'GBP',
      availableForSale: false,
      variantId: 'gid://shopify/ProductVariant/456',
      isProEdition: true,
    });
    expect(schema.offers.availability).toBe('https://schema.org/OutOfStock');
    expect(new URL(schema.offers.url).searchParams.get('legrest')).toBe(
      'electric',
    );
  });
  it('does not assign landscape dimensions to an unknown product photo', () => {
    const meta = buildMeta({
      title: 'M4',
      description: 'Wheelchair',
      path: '/products/m4',
      image: 'https://cdn.shopify.com/portrait.jpg',
    });
    expect(meta.some((tag) => tag.property === 'og:image:width')).toBe(false);
    expect(meta.find((tag) => tag.rel === 'canonical')?.href).toBe(
      'https://mobilityrobot.co.uk/products/m4',
    );
  });
  it('keeps JSON-LD intact when product text contains a closing script tag', () => {
    const text = '</script><p>A product description</p>';
    const serialized = jsonLdScript({description: text}).__html;
    expect(serialized).not.toContain('<');
    expect(JSON.parse(serialized)).toEqual({description: text});
  });
  it('does not duplicate Mobility Robot in longer existing branded titles', () => {
    const title =
      'Mobility Robot | XSTO Powered Wheelchairs and Mobility Accessories';
    expect(truncateTitle(title).match(/Mobility Robot/g)).toHaveLength(1);
  });
});
