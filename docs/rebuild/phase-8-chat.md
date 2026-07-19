# Phase 8 — Shopify Inbox (Hydrogen)

Hydrogen cannot use the Online Store Inbox **app embed**. The storefront loads
`shopifyChatV1.js` from `cdn.shopify.com` in `app/components/ShopChat.tsx`.

## Setup checklist

1. Install **Shopify Inbox** in Admin (Apps).
2. In Inbox settings, ensure chat is **enabled** for your storefront / Online Store
   (Inbox still needs to be activated even for headless).
3. Set Oxygen / `.env`:
   - `PUBLIC_SHOP_ID=90445414778` (from `https://f7vjea-hq.myshopify.com/meta.json` → `id`)
   - `PUBLIC_STORE_DOMAIN=f7vjea-hq.myshopify.com`
4. CSP for Inbox domains is configured in `app/entry.server.tsx`.

## Behaviour

- Chat button loads on all pages except `/account/*` and `/checkout`.
- Not gated by the cookie banner (support chat).
- May not fully initialise on `localhost` (Shopify bot protection) — test on the
  Oxygen / custom domain.

## If the button still does not appear

1. Confirm Inbox is installed and online in Shopify Admin → Inbox.
2. On a published Liquid theme preview, DevTools → search for `shopifyChatV1.js`
   and compare the `shop_id=` query param. If it differs from `90445414778`,
   set `PUBLIC_SHOP_ID` to that value in Oxygen and redeploy.
3. Hard-refresh with cache disabled and check the browser console for CSP errors.
