import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createHydrogenRouterContext} from './context';

const mocks = vi.hoisted(() => ({
  values: new Map<string, unknown>(),
  create: vi.fn(),
  cart: {getCartId: vi.fn(), get: vi.fn(), updateBuyerIdentity: vi.fn()},
}));
vi.mock('@shopify/hydrogen', () => ({createHydrogenContext: mocks.create}));
vi.mock('./session', () => ({
  AppSession: {
    init: async () => ({
      get: (key: string) => mocks.values.get(key),
      set: (key: string, value: unknown) => mocks.values.set(key, value),
    }),
  },
}));

const context = (path: string) =>
  createHydrogenRouterContext(
    new Request(`https://shop.test${path}`),
    {SESSION_SECRET: 'test'} as Env,
    {waitUntil: vi.fn()} as unknown as ExecutionContext,
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.values.clear();
  vi.stubGlobal('caches', {open: vi.fn().mockResolvedValue({})});
  mocks.cart.getCartId.mockReturnValue(undefined);
  mocks.create.mockImplementation(() => ({cart: mocks.cart}));
});

describe('market storefront and cart context', () => {
  it('passes Bulgaria to both product pricing and new cart creation', async () => {
    await context('/products/m4?country=BG&currency=EUR');
    expect(mocks.create.mock.calls[0][0]).toMatchObject({
      i18n: {language: 'EN', country: 'BG'},
      buyerIdentity: {countryCode: 'BG'},
    });
    expect(mocks.values.get('marketCountry')).toBe('BG');
    await context('/cart');
    expect(mocks.create.mock.calls[1][0].buyerIdentity).toEqual({
      countryCode: 'BG',
    });
    expect(mocks.cart.updateBuyerIdentity).not.toHaveBeenCalled();
  });

  it('reprices an existing cart before returning context on a market switch', async () => {
    mocks.cart.getCartId.mockReturnValue('existing-cart');
    mocks.cart.get.mockResolvedValue({buyerIdentity: {countryCode: 'GB'}});
    mocks.cart.updateBuyerIdentity.mockResolvedValue({
      cart: {id: 'existing-cart'},
    });
    await context('/products/m4?country=BG');
    expect(mocks.cart.updateBuyerIdentity).toHaveBeenCalledWith({
      countryCode: 'BG',
    });
  });

  it('does not create or reprice carts for feed crawlers', async () => {
    mocks.values.set('marketCountry', 'GB');
    mocks.cart.getCartId.mockReturnValue('existing-cart');
    await context('/feeds/google-links.txt?country=BG');
    expect(mocks.values.get('marketCountry')).toBe('GB');
    expect(mocks.cart.get).not.toHaveBeenCalled();
    expect(mocks.cart.updateBuyerIdentity).not.toHaveBeenCalled();
  });

  it('fails the market switch if Shopify rejects the cart update', async () => {
    mocks.cart.getCartId.mockReturnValue('existing-cart');
    mocks.cart.get.mockResolvedValue({buyerIdentity: {countryCode: 'GB'}});
    mocks.cart.updateBuyerIdentity.mockResolvedValue({
      userErrors: [{message: 'Market unavailable'}],
    });
    await expect(context('/products/m4?country=BG')).rejects.toThrow(
      'Unable to update cart market',
    );
  });
});
