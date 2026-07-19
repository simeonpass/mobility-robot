import {Script} from '@shopify/hydrogen';
import {useLocation} from 'react-router';

type ShopifyInboxProps = {
  shopDomain?: string | null;
  /** Shopify numeric shop ID (meta.json → id). Also used as Inbox shop_id. */
  shopId?: string | null;
};

function shouldHideChat(pathname: string): boolean {
  if (pathname.startsWith('/account')) return true;
  if (pathname.startsWith('/checkout')) return true;
  return false;
}

/**
 * Shopify Inbox chat widget for Hydrogen.
 * Official theme app-embed does not inject on headless storefronts, so we load
 * shopifyChatV1.js directly (see Shopify hydrogen discussion #878).
 */
export function ShopChat({shopDomain, shopId}: ShopifyInboxProps) {
  const location = useLocation();

  if (!shopDomain || !shopId) return null;
  if (shouldHideChat(location.pathname)) return null;

  const params = new URLSearchParams({
    v: 'V1',
    api_env: 'production',
    shop_id: shopId,
    shop: shopDomain,
    c: 'black',
    s: 'icon',
    p: 'button_right',
    vp: 'lowest',
    t: 'chat_with_us',
    i: 'chat_bubble',
  });

  const src = `https://cdn.shopify.com/shopifycloud/shopify_chat/storefront/shopifyChatV1.js?${params.toString()}`;

  return (
    <Script async id="shopify-inbox" src={src} suppressHydrationWarning />
  );
}
