import {describe, expect, it} from 'vitest';
import {marketProductUrl, requestCountry} from './market';

describe('market links and navigation', () => {
  it('uses the explicit country ahead of the previous shopping session', () => {
    expect(
      requestCountry(
        new URL('https://shop.test/products/m4?country=BG&currency=GBP'),
        'GB',
      ),
    ).toBe('BG');
    expect(
      requestCountry(new URL('https://shop.test/products/m4?country=GB'), 'BG'),
    ).toBe('GB');
  });

  it('retains Bulgaria during navigation and cart submission', () => {
    expect(requestCountry(new URL('https://shop.test/cart'), 'BG')).toBe('BG');
    expect(
      requestCountry(new URL('https://shop.test/collections/all'), 'BG'),
    ).toBe('BG');
    expect(requestCountry(new URL('https://shop.test/'), undefined)).toBe('GB');
  });

  it('keeps scheduled feeds independent of browser sessions', () => {
    expect(
      requestCountry(new URL('https://shop.test/feeds/google-links.txt'), 'BG'),
    ).toBe('GB');
    expect(
      requestCountry(
        new URL('https://shop.test/feeds/google-links.txt?country=BG'),
        'GB',
      ),
    ).toBe('BG');
  });

  it('ignores unknown countries and derives currency from the market', () => {
    expect(
      requestCountry(
        new URL('https://shop.test/?country=INVALID&currency=EUR'),
      ),
    ).toBe('GB');
    const link = new URL(
      marketProductUrl(
        'https://shop.test/products/x12?variant=57222228967802&legrest=electric',
        'BG',
      ),
    );
    expect(Object.fromEntries(link.searchParams)).toEqual({
      variant: '57222228967802',
      legrest: 'electric',
      country: 'BG',
      currency: 'EUR',
    });
  });
});
