import {createElement, type ReactNode} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it, vi} from 'vitest';
import {
  AccessoriesCatalog,
  type AccessoryListProduct,
} from './AccessoriesCatalog';

vi.mock('react-router', () => ({
  Link: ({children, to}: {children: ReactNode; to: string}) =>
    createElement('a', {href: to}, children),
}));
vi.mock('@shopify/hydrogen', () => ({Image: () => null}));

const products: AccessoryListProduct[] = [
  {
    id: 'cover',
    handle: 'rear-cover-m4',
    title: 'Rear cover',
    priceRange: {minVariantPrice: {amount: '60', currencyCode: 'GBP'}},
  },
  {
    id: 'battery',
    handle: 'x12-x12-pro-battery-25-2v-25-6ah',
    title: 'X12 battery',
    priceRange: {minVariantPrice: {amount: '600', currencyCode: 'GBP'}},
  },
];
describe('accessory catalogue navigation', () => {
  it('shows each accessory once in All, even when it fits multiple chairs', () => {
    const html = renderToStaticMarkup(
      createElement(AccessoriesCatalog, {products}),
    );
    expect(html.match(/href="\/products\/rear-cover-m4"/g)).toHaveLength(1);
    expect(
      html.match(/href="\/products\/x12-x12-pro-battery-25-2v-25-6ah"/g),
    ).toHaveLength(1);
  });
  it('shows only compatible accessories in the chosen model filter', () => {
    const html = renderToStaticMarkup(
      createElement(AccessoriesCatalog, {products, activeSlot: 'xsto-m4'}),
    );
    expect(html).toContain('href="/products/rear-cover-m4"');
    expect(html).not.toContain(
      'href="/products/x12-x12-pro-battery-25-2v-25-6ah"',
    );
  });
});
