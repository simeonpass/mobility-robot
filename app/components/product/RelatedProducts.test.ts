import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {StaticRouter} from 'react-router';
import {describe, expect, it} from 'vitest';
import type {HomeProductFragment} from 'storefrontapi.generated';
import {RelatedProducts} from './RelatedProducts';
import {ProductItem} from '../ProductItem';
import {ProductImage} from '../ProductImage';

describe('product image framing', () => {
  it.each([
    [800, 1200],
    [1200, 800],
    [800, 800],
  ])(
    'preserves the complete %s × %s image in every product card',
    (width, height) => {
      const image = {
        __typename: 'Image' as const,
        id: 'image-x12',
        url: 'https://cdn.shopify.com/s/files/1/x12.jpg',
        altText: 'XSTO X12',
        width,
        height,
      };
      const product = {
        id: 'x12',
        handle: 'x12-all-terrain-mobility-robot',
        title: 'XSTO X12',
        featuredImage: image,
        priceRange: {
          minVariantPrice: {amount: '15000', currencyCode: 'GBP'},
          maxVariantPrice: {amount: '15000', currencyCode: 'GBP'},
        },
        compareAtPriceRange: {
          minVariantPrice: {amount: '15000', currencyCode: 'GBP'},
        },
        variants: {nodes: []},
      } satisfies HomeProductFragment;

      for (const element of [
        createElement(RelatedProducts, {
          products: [product],
          currentHandle: 'xsto-m8',
        }),
        createElement(ProductItem, {product}),
        createElement(ProductImage, {image}),
      ]) {
        const html = renderToStaticMarkup(
          createElement(StaticRouter, {location: '/'}, element),
        );
        const src = html.match(/ src="([^"]+)"/)?.[1];
        expect(src).toBeDefined();
        const params = new URL(src!.replaceAll('&amp;', '&')).searchParams;
        expect(
          Number(params.get('height')) / Number(params.get('width')),
        ).toBeCloseTo(height / width, 1);
        expect(html).toContain('object-contain');
      }
    },
  );
});
