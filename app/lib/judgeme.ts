export type JudgemeConfig = {
  shopDomain: string;
  publicToken: string;
  cdnHost: string;
  delay: number;
};

export function getJudgemeConfig(env: {
  JUDGEME_SHOP_DOMAIN?: string;
  JUDGEME_PUBLIC_TOKEN?: string;
  JUDGEME_CDN_HOST?: string;
  PUBLIC_STORE_DOMAIN?: string;
}): JudgemeConfig | null {
  const shopDomain = (
    env.JUDGEME_SHOP_DOMAIN ||
    env.PUBLIC_STORE_DOMAIN ||
    ''
  ).trim();
  const publicToken = (env.JUDGEME_PUBLIC_TOKEN || '').trim();
  const cdnHost = (env.JUDGEME_CDN_HOST || 'https://cdn.judge.me').trim();

  if (!shopDomain || !publicToken) return null;

  return {
    shopDomain,
    publicToken,
    cdnHost: cdnHost.replace(/\/$/, ''),
    delay: 500,
  };
}

/** Judge.me accepts numeric IDs or Shopify GIDs. */
export function judgemeProductId(shopifyProductId: string): string {
  const match = shopifyProductId.match(/Product\/(\d+)/);
  return match?.[1] ?? shopifyProductId;
}
