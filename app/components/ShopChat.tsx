import {Script} from '@shopify/hydrogen';
import {useLocation} from 'react-router';
import {
  DEFAULT_SHOPIFY_INBOX_EXTERNAL_ID,
  SHOPIFY_INBOX_CHAT_LOADER_SRC,
} from '~/lib/const';

type ShopifyInboxProps = {
  shopDomain?: string | null;
  /**
   * Inbox `data-external-identifier` from the Liquid theme embed
   * (not the numeric meta.json shop id).
   */
  inboxExternalId?: string | null;
};

const CHAT_EMBED_SETTINGS = {
  greetingMessage: '',
  showFeaturedProducts: true,
  featuredProducts: [] as unknown[],
  horizontalPosition: 'bottom_right',
  icon: 'chat_bubble',
  buttonLabel: 'Chat',
};

function shouldHideChat(pathname: string): boolean {
  if (pathname.startsWith('/account')) return true;
  if (pathname.startsWith('/checkout')) return true;
  return false;
}

/**
 * Shopify Inbox for Hydrogen.
 *
 * Uses the theme’s legacy inbox-chat-loader (same external-identifier as Liquid).
 * The newer agent.js bundle needs Online Store `/agent/handoff`, which Hydrogen
 * does not serve — that path left a blank panel on Oxygen.
 */
export function ShopChat({shopDomain, inboxExternalId}: ShopifyInboxProps) {
  const location = useLocation();
  const externalId = inboxExternalId || DEFAULT_SHOPIFY_INBOX_EXTERNAL_ID;

  if (!shopDomain || !externalId) return null;
  if (shouldHideChat(location.pathname)) return null;

  return (
    <>
      <script
        id="shopify-chat-app-embed-data"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({settings: CHAT_EMBED_SETTINGS}),
        }}
      />
      {/*
        id must be chat-button-container — inbox-chat-loader.js reads dataset
        from this script and sets shopId from data-external-identifier.
      */}
      <Script
        id="chat-button-container"
        defer
        src={SHOPIFY_INBOX_CHAT_LOADER_SRC}
        data-horizontal-position="bottom_right"
        data-vertical-position="lowest"
        data-icon="chat_bubble"
        data-text="chat_with_us"
        data-color="#202A36"
        data-secondary-color="#ffffff"
        data-ternary-color="#6a6a6a"
        data-domain={shopDomain}
        data-shop-domain={shopDomain}
        data-external-identifier={externalId}
        suppressHydrationWarning
      />
    </>
  );
}
