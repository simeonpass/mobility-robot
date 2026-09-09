import {beforeEach, describe, expect, it, vi} from 'vitest';
import {action} from '../routes/cart';

vi.mock('~/components/CartMain', () => ({CartMain: () => null}));
vi.mock('~/lib/shopify-admin-vat', () => ({
  syncVatExemptionCustomersFromCart: vi.fn(),
}));

const cartResult = {
  id: 'cart-1',
  lines: {
    nodes: [
      {
        attributes: [
          {key: 'VAT Declaration Email', value: 'buyer@example.com'},
        ],
      },
    ],
  },
};
const cart = {
  addLines: vi.fn(),
  updateLines: vi.fn(),
  removeLines: vi.fn(),
  updateDiscountCodes: vi.fn(),
  updateBuyerIdentity: vi.fn(),
  setCartId: vi.fn(() => new Headers({'Set-Cookie': 'cart=cart-1'})),
};
async function submit(actionName = 'LinesAdd', redirectTo?: string) {
  const form = new FormData();
  form.set(
    'cartFormInput',
    JSON.stringify({
      action: actionName,
      inputs: {
        lines: [{merchandiseId: 'chair', quantity: 1}],
        lineIds: ['line-1'],
        discountCodes: [],
      },
    }),
  );
  if (redirectTo) form.set('redirectTo', redirectTo);
  return action({
    request: new Request('https://mobilityrobot.co.uk/cart', {
      method: 'POST',
      body: form,
    }),
    context: {cart, env: {}},
  } as unknown as Parameters<typeof action>[0]);
}

describe('basket mutation responses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cart.addLines.mockResolvedValue({
      cart: cartResult,
      userErrors: [],
      warnings: [],
    });
    cart.updateBuyerIdentity.mockResolvedValue({
      cart: cartResult,
      userErrors: [],
      warnings: [],
    });
  });
  it('preserves Shopify user errors and warnings after declaration email synchronization', async () => {
    cart.addLines.mockResolvedValue({
      cart: cartResult,
      userErrors: [{message: 'This accessory is unavailable.'}],
      warnings: [{message: 'Quantity adjusted.'}],
    });
    const response = await submit('LinesAdd', '/cart');
    expect(response.data.errors).toEqual([
      {message: 'This accessory is unavailable.'},
    ]);
    expect(response.data).toMatchObject({
      warnings: [{message: 'Quantity adjusted.'}],
    });
    expect(response.init?.status).toBe(200);
    expect(cart.updateBuyerIdentity).toHaveBeenCalledWith({
      email: 'buyer@example.com',
    });
  });
  it('reports buyer identity rejection even if Shopify returns no cart', async () => {
    cart.updateBuyerIdentity.mockResolvedValue({
      cart: null,
      userErrors: [{message: 'Email could not be applied.'}],
    });
    const response = await submit();
    expect(response.data.errors).toEqual([
      {message: 'Email could not be applied.'},
    ]);
  });
  it('returns a recoverable error when the cart service fails', async () => {
    cart.addLines.mockRejectedValue(new Error('Unavailable'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const response = await submit();
    expect(response.init?.status).toBe(503);
    expect(response.data.errors?.[0].message).toContain('Please try again');
    log.mockRestore();
  });
  it('keeps the cart cookie on a successful local redirect', async () => {
    const response = await submit('LinesAdd', '/cart');
    expect(response.init?.status).toBe(303);
    const headers = new Headers(response.init?.headers);
    expect(headers.get('Location')).toBe('/cart');
    expect(headers.get('Set-Cookie')).toBe('cart=cart-1');
  });
  it('does not redirect shoppers to an external site supplied through a form', async () => {
    const response = await submit('LinesAdd', '//example.com');
    expect(new Headers(response.init?.headers).has('Location')).toBe(false);
  });
  it('passes an empty code list to Shopify when removing the discount', async () => {
    cart.updateDiscountCodes.mockResolvedValue({
      cart: cartResult,
      userErrors: [],
    });
    await submit('DiscountCodesUpdate');
    expect(cart.updateDiscountCodes).toHaveBeenCalledWith([]);
  });
});
