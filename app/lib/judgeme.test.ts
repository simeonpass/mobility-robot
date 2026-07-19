import {describe, expect, it} from 'vitest';
import {getJudgemeConfig, judgemeProductId} from '~/lib/judgeme';

describe('judgeme', () => {
  it('returns null without a public token', () => {
    expect(
      getJudgemeConfig({
        PUBLIC_STORE_DOMAIN: 'f7vjea-hq.myshopify.com',
      }),
    ).toBeNull();
  });

  it('builds config from env', () => {
    expect(
      getJudgemeConfig({
        JUDGEME_PUBLIC_TOKEN: 'abc123',
        PUBLIC_STORE_DOMAIN: 'f7vjea-hq.myshopify.com',
      }),
    ).toEqual({
      shopDomain: 'f7vjea-hq.myshopify.com',
      publicToken: 'abc123',
      cdnHost: 'https://cdn.judge.me',
      delay: 500,
    });
  });

  it('extracts numeric product ids from Shopify GIDs', () => {
    expect(judgemeProductId('gid://shopify/Product/1234567890')).toBe(
      '1234567890',
    );
  });
});
