import {describe, expect, it} from 'vitest';
import {
  getCartFeedback,
  isCartMutationPending,
  safeStorefrontRedirect,
} from './cart-feedback';

describe('checkout feedback and pending updates', () => {
  it('includes Shopify user errors, warnings and rejected discount codes', () => {
    expect(
      getCartFeedback({
        action: 'DiscountCodesUpdate',
        userErrors: [{message: 'Item unavailable'}],
        warnings: [{message: 'Quantity adjusted'}],
        cart: {discountCodes: [{code: 'EXPIRED', applicable: false}]},
      }),
    ).toEqual([
      'Item unavailable',
      'Quantity adjusted',
      'The code “EXPIRED” cannot be applied to this basket.',
    ]);
  });
  it.each(['submitting', 'loading'])(
    'waits for %s cart updates that do not create optimistic lines',
    (state) => {
      expect(isCartMutationPending([{state, formAction: '/cart'}])).toBe(true);
      expect(isCartMutationPending([{state, formAction: '/search'}])).toBe(
        false,
      );
    },
  );
  it.each([
    '//example.com',
    '/\\example.com',
    'https://example.com',
    'javascript:alert(1)',
  ])('rejects non-storefront redirects: %s', (target) => {
    expect(
      safeStorefrontRedirect(target, 'https://mobilityrobot.co.uk/cart'),
    ).toBeNull();
  });
});
