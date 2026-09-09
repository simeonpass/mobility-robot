import {createElement, type ReactNode} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {CartSummary} from './CartSummary';

const state = vi.hoisted(() => ({
  fetchers: [] as Array<{state: string; formAction?: string}>,
}));
vi.mock('react-router', () => ({
  useFetchers: () => state.fetchers,
  Link: ({children, to}: {children: ReactNode; to: string}) =>
    createElement('a', {href: to}, children),
}));
vi.mock('@shopify/hydrogen', () => {
  const CartForm = ({
    children,
    inputs,
  }: {
    children: ReactNode;
    inputs: unknown;
  }) =>
    createElement('form', {'data-inputs': JSON.stringify(inputs)}, children);
  CartForm.ACTIONS = {DiscountCodesUpdate: 'DiscountCodesUpdate'};
  return {CartForm};
});
vi.mock('~/components/ConsentBanner', () => ({
  useConsent: () => ({analyticsAllowed: false}),
}));
vi.mock('~/components/vat-relief/VatReliefProvider', () => ({
  useVatRelief: () => ({openCartModal: vi.fn()}),
}));
vi.mock('~/lib/vat-relief', () => ({
  getCartTotals: () => ({
    total: 4200,
    subtotalIncVat: 4200,
    hasVatRelief: false,
    vatReliefApplied: false,
  }),
}));

function render(isOptimistic = false) {
  return renderToStaticMarkup(
    createElement(CartSummary, {
      layout: 'page',
      cart: {
        isOptimistic,
        checkoutUrl: 'https://checkout.mobilityrobot.co.uk/checkouts/example',
        lines: {nodes: []},
        discountCodes: [{code: 'VALID', applicable: true}],
      } as unknown as Parameters<typeof CartSummary>[0]['cart'],
    }),
  );
}

describe('checkout link and discount controls', () => {
  beforeEach(() => {
    state.fetchers = [];
  });
  it('links to Shopify checkout when the confirmed basket is idle', () => {
    expect(render()).toContain(
      'href="https://checkout.mobilityrobot.co.uk/checkouts/example?channel=online_store"',
    );
  });
  it.each(['submitting', 'loading'])(
    'removes the checkout URL while a discount or VAT update is %s',
    (status) => {
      state.fetchers = [{state: status, formAction: '/cart'}];
      const html = render();
      expect(html).not.toContain('href="https://checkout.');
      expect(html).toContain('Updating basket…');
      expect(html).toContain('disabled=""');
    },
  );
  it('also blocks checkout for optimistic line changes', () => {
    expect(render(true)).not.toContain('href="https://checkout.');
  });
  it('submits no discount codes from the Remove control', () => {
    const form = render().match(
      /<form[^>]*>\s*<button aria-label="Remove discount code"/g,
    )?.[0];
    expect(form).toContain('data-inputs="{&quot;discountCodes&quot;:[]}"');
  });
});
