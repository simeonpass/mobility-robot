import {Script} from '@shopify/hydrogen';
import {createElement} from 'react';
import {useLocation} from 'react-router';
import agentPageData from '~/data/shopify-agent-page-data.json';
import {
  DEFAULT_SHOPIFY_INBOX_EXTERNAL_ID,
  SHOPIFY_INBOX_BUNDLE_SELECTOR_SRC,
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
 * Shopify Inbox for Hydrogen — mirrors the Online Store theme app embed.
 * Numeric shop_id alone 401s; Inbox authenticates with `data-external-identifier`.
 */
export function ShopChat({shopDomain, inboxExternalId}: ShopifyInboxProps) {
  const location = useLocation();
  const externalId = inboxExternalId || DEFAULT_SHOPIFY_INBOX_EXTERNAL_ID;

  if (!shopDomain || !externalId) return null;
  if (shouldHideChat(location.pathname)) return null;

  const embedJson = JSON.stringify({settings: CHAT_EMBED_SETTINGS});

  return (
    <>
      <script
        id="shopify-chat-app-embed-data"
        type="application/json"
        dangerouslySetInnerHTML={{__html: embedJson}}
      />
      <script
        id="shopify-agent-app-embed-data"
        type="application/json"
        dangerouslySetInnerHTML={{__html: embedJson}}
      />
      <script
        id="shopify-agent-page-data"
        type="application/json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(agentPageData)}}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
shopify-agent:defined:empty,
shopify-chat:defined:empty {
  --shopify-chat-bg-color: #ffffff;
  --shopify-agent-bg-color: #ffffff;
  --shopify-chat-text-color: #000000;
  --shopify-agent-text-color: #000000;
  --shopify-chat-accent-bg-color: #202a36;
  --shopify-agent-accent-bg-color: #202a36;
  --shopify-chat-accent-text-color: #ffffff;
  --shopify-agent-accent-text-color: #ffffff;
  --shopify-chat-activator-offset: 20px;
  --shopify-agent-activator-offset: 20px;
  --shopify-chat-border-radius: 16px;
  --shopify-agent-border-radius: 16px;
}
`,
        }}
      />
      <Script
        id="shopify-chat-bundle-selector"
        defer
        src={SHOPIFY_INBOX_BUNDLE_SELECTOR_SRC}
        data-chat-src="https://cdn.shopify.com/storefront/web-components/agent.js"
        data-agent-src="https://cdn.shopify.com/storefront/web-components/agent.js"
        data-legacy-src="https://cdn.shopify.com/extensions/019f6b79-ce23-71b4-b954-65d455fad0e8/shopify-inbox-1291/assets/inbox-chat-loader.js"
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
      {/* Host element required for the modern agent.js Inbox bundle */}
      {createElement('shopify-chat')}
    </>
  );
}
