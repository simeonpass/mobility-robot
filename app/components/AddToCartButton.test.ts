import {createElement, type ReactNode} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AddToCartButton} from './AddToCartButton';

const fetcher = vi.hoisted(() => ({state: 'idle'}));
vi.mock('@shopify/hydrogen', () => {
  const CartForm = ({
    children,
  }: {
    children: (value: typeof fetcher) => ReactNode;
  }) => children(fetcher);
  CartForm.ACTIONS = {LinesAdd: 'LinesAdd'};
  return {CartForm};
});
vi.mock('~/components/ConsentBanner', () => ({
  useConsent: () => ({analyticsAllowed: false}),
}));
vi.mock('~/lib/analytics', () => ({
  toGa4Item: vi.fn(),
  trackAddToCart: vi.fn(),
}));

const render = (disabled = false) =>
  renderToStaticMarkup(
    createElement(AddToCartButton, {
      disabled,
      lines: [{merchandiseId: 'chair', quantity: 1}],
      children: 'Add to basket',
    }),
  );

describe('purchase submission button', () => {
  beforeEach(() => {
    fetcher.state = 'idle';
  });
  it('allows an available selection when the cart is idle', () => {
    expect(render()).not.toContain('disabled=""');
    expect(render()).toContain('Add to basket');
  });
  it.each(['submitting', 'loading'])(
    'blocks repeat clicks while %s even when disabled=false',
    (state) => {
      fetcher.state = state;
      expect(render(false)).toContain('disabled=""');
      expect(render(false)).toContain('Adding…');
      expect(render(false)).toContain('aria-busy="true"');
    },
  );
  it('blocks an unavailable selection while idle', () => {
    expect(render(true)).toContain('disabled=""');
  });
});
