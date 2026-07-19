# Phase 8 — Shop Chat setup

The Hydrogen storefront uses **Shop Chat** (Shopify `shop-js`) as the headless-friendly chat option.

## Primary path — Shop Chat

1. Set `PUBLIC_SHOP_ID` in Oxygen to your numeric Shopify shop ID (`90445414778` for `f7vjea-hq.myshopify.com`).
   - Also available from `https://f7vjea-hq.myshopify.com/meta.json` → `id`
   - The app falls back to this ID when the env var is empty
2. The widget loads from `https://cdn.shopify.com/shopifycloud/shop-js/client.js` with `data-shop-id`.
3. Mounted in `app/components/ShopChat.tsx`, gated by cookie consent (`marketing` preference).
4. Hidden on `/account/*`, `/checkout`, and `/vat-relief?registered=1`.

## Fallback — Shopify Inbox manual snippet

If Shop Chat does not render for this store:

1. Shopify Admin → Sales channels → **Online Store** → Themes → Customize
2. Open **App embeds** → enable **Shopify Inbox**
3. Copy the generated `<script>` snippet from the theme or Inbox settings
4. Replace the loader in `ShopChat.tsx` with that snippet, keeping the same consent gate and hide rules

## tawk.to

No tawk.to code remains in the Hydrogen repo. Do not re-add unless Shop Chat and Inbox are both rejected.

## Testing

- Accept marketing cookies on localhost
- Confirm chat button appears on `/` and `/faq`
- Confirm chat hidden on `/account/login` and `/cart`
