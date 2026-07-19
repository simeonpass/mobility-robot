import {describe, expect, it} from 'vitest';
import {partitionShopAllProducts} from '~/lib/shop-all';

function product(
  handle: string,
  title: string,
  extras?: {tags?: string[]; productType?: string},
) {
  return {
    id: `gid://shopify/Product/${handle}`,
    handle,
    title,
    tags: extras?.tags,
    productType: extras?.productType,
    priceRange: {
      minVariantPrice: {amount: '1000.00', currencyCode: 'GBP'},
    },
  };
}

describe('partitionShopAllProducts', () => {
  it('orders chairs cheapest to most expensive and separates accessories', () => {
    const products = [
      product('xsto-m4-pro', 'M4 Pro'),
      product('armrest-bag', 'Armrest Bag', {productType: 'Accessories'}),
      product('xsto-ezgo2-carbon-fiber-power-wheelchair', 'EzGo2'),
      product('x12-all-terrain-mobility-robot', 'X12'),
      product('buy-robot-wheelchair', 'M4'),
      product('xsto-m4b-1', 'M4B'),
      product(
        'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
        'X12 Pro',
      ),
      product('lithium-10-4-ah-battery', 'Battery'),
      product('xsto-x12-pre-order-deposit-10', 'X12 Deposit'),
      product('wheeled-bipedal-robot-a6', 'A6 Robot'),
    ];

    const {chairs, accessories} = partitionShopAllProducts(products);

    expect(chairs.map((p) => p.handle)).toEqual([
      'xsto-ezgo2-carbon-fiber-power-wheelchair',
      'buy-robot-wheelchair',
      'xsto-m4b-1',
      'xsto-m4-pro',
      'x12-all-terrain-mobility-robot',
      'xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
    ]);
    expect(accessories.map((p) => p.handle)).toEqual([
      'armrest-bag',
      'lithium-10-4-ah-battery',
    ]);
  });

  it('prefers accessories collection when provided', () => {
    const products = [
      product('buy-robot-wheelchair', 'M4'),
      product('armrest-bag', 'Armrest Bag'),
    ];
    const fromCollection = [product('flashlight-holder', 'Flashlight Holder')];

    const {accessories} = partitionShopAllProducts(products, fromCollection);
    expect(accessories.map((p) => p.handle)).toEqual(['flashlight-holder']);
  });
});
