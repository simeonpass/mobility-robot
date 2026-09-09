import {createElement, type ReactNode} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it, vi} from 'vitest';
import {
  ProductAccessoryAddons,
  type AddonProduct,
} from './ProductAccessoryAddons';

vi.mock('react-router', () => ({
  Link: ({children, to}: {children: ReactNode; to: string}) =>
    createElement('a', {href: to}, children),
}));

// Keep the real Hydrogen Image: its inline width caused the mobile overflow,
// and its source-size handling must not be capped by invented dimensions.
const cover: AddonProduct = {
  id: 'cover',
  handle: 'rear-cover-m4',
  title: 'Rear cover',
  priceRange: {minVariantPrice: {amount: '60', currencyCode: 'GBP'}},
  variants: {
    nodes: [
      {
        id: 'pink-cover',
        title: 'Pink',
        availableForSale: true,
        price: {amount: '60', currencyCode: 'GBP'},
        image: {url: 'https://cdn.shopify.com/cover.jpg'},
        selectedOptions: [{name: 'Colour', value: 'Pink'}],
      },
    ],
  },
};

function render(product: AddonProduct) {
  return renderToStaticMarkup(
    createElement(ProductAccessoryAddons, {
      products: [product],
      selectedIds: new Set(['pink-cover']),
      onToggle: () => {},
      onSelectVariant: () => {},
      vatReliefActive: false,
    }),
  );
}

describe('accessory image containment', () => {
  it('contains the real fluid image separately from the product copy and checkbox', () => {
    const html = render(cover);
    const photo = html.match(
      /<span class="mr-addon-photo"[^>]*>(<img[^>]*\/>|<img[^>]*>)<\/span>/,
    )?.[1];

    expect(photo).toBeDefined();
    expect(photo).toContain('width:100%');
    expect(photo).toContain('height:100%');
    expect(photo).toContain('aspect-ratio:auto');
    expect(photo).toMatch(/width=800[^,]* 800w/);
    expect(html).toMatch(/<\/span><span class="mr-addon-copy">/);
    expect(html).toContain('aria-label="Add Rear cover" checked=""');
  });

  it('preserves portrait source dimensions when using the featured image', () => {
    const html = render({
      ...cover,
      featuredImage: {
        url: 'https://cdn.shopify.com/portrait-cover.jpg',
        width: 800,
        height: 1200,
      },
      variants: {
        nodes: cover.variants!.nodes.map((variant) => ({
          ...variant,
          image: null,
        })),
      },
    });

    // Source requests retain 2:3 proportions instead of a fabricated square.
    expect(html).toContain('width=400&amp;height=600');
    expect(html).toMatch(/width=800&amp;height=1200[^,]* 800w/);
    expect(html).toContain('aspect-ratio:auto');
  });
});
