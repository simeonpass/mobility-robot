import {Script} from '@shopify/hydrogen';
import {useLocation} from 'react-router';
import {DEFAULT_SHOPIFY_INBOX_EXTERNAL_ID} from '~/lib/const';

type ShopifyInboxProps = {
  shopDomain?: string | null;
  /**
   * Inbox `data-external-identifier` from the Liquid theme embed.
   * Passed as shop_id to shopifyChatV1.js (numeric meta.json id 401s).
   */
  inboxExternalId?: string | null;
};

function shouldHideChat(pathname: string): boolean {
  if (pathname.startsWith('/account')) return true;
  if (pathname.startsWith('/checkout')) return true;
  return false;
}

/**
 * Shopify Inbox for Hydrogen.
 * Liquid themes now use an extension loader + agent.js; on Oxygen we load
 * shopifyChatV1.js with the theme’s external-identifier as shop_id.
 */
export function ShopChat({shopDomain, inboxExternalId}: ShopifyInboxProps) {
  const location = useLocation();
  const externalId = inboxExternalId || DEFAULT_SHOPIFY_INBOX_EXTERNAL_ID;

  if (!shopDomain || !externalId) return null;
  if (shouldHideChat(location.pathname)) return null;

  const params = new URLSearchParams({
    v: 'V1',
    api_env: 'production',
    // Must be Inbox external-identifier, not meta.json numeric id
    shop_id: externalId,
    shop: shopDomain,
    c: '#202A36',
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
