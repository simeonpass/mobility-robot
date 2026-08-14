import {describe, expect, it, vi, beforeEach} from 'vitest';
import {prepareVatReliefForCheckout} from '~/lib/vat-relief-checkout';

vi.mock('~/lib/shopify-admin-vat', () => ({
  syncVatExemptionCustomersFromCart: vi.fn(async () => undefined),
}));

import {syncVatExemptionCustomersFromCart} from '~/lib/shopify-admin-vat';

describe('prepareVatReliefForCheckout', () => {
  beforeEach(() => {
    vi.mocked(syncVatExemptionCustomersFromCart).mockClear();
  });

  it('syncs customers and updates buyer identity from declaration email', async () => {
    const updateBuyerIdentity = vi.fn(async () => ({
      cart: {id: 'gid://shopify/Cart/1', checkoutUrl: 'https://checkout.test'},
      errors: undefined,
      warnings: undefined,
    }));

    const result = await prepareVatReliefForCheckout(
      {} as Env,
      {updateBuyerIdentity},
      {
        lines: {
          nodes: [
            {
              attributes: [
                {key: 'VAT Relief', value: 'Yes'},
                {
                  key: 'VAT Declaration Email',
                  value: ' buyer@example.com ',
                },
              ],
            },
          ],
        },
      },
    );

    expect(syncVatExemptionCustomersFromCart).toHaveBeenCalledOnce();
    expect(updateBuyerIdentity).toHaveBeenCalledWith({
      email: 'buyer@example.com',
      countryCode: 'GB',
    });
    expect(result.vatEmail).toBe('buyer@example.com');
    expect(result.cart?.checkoutUrl).toBe('https://checkout.test');
  });

  it('skips buyer identity when no declaration email is present', async () => {
    const updateBuyerIdentity = vi.fn();
    const result = await prepareVatReliefForCheckout(
      {} as Env,
      {updateBuyerIdentity},
      {
        lines: {
          nodes: [{attributes: [{key: 'Colour', value: 'Black'}]}],
        },
      },
    );

    expect(syncVatExemptionCustomersFromCart).toHaveBeenCalledOnce();
    expect(updateBuyerIdentity).not.toHaveBeenCalled();
    expect(result.vatEmail).toBeNull();
  });
});
