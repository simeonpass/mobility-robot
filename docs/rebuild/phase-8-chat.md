# Phase 8 — Shopify Inbox (Hydrogen)

Hydrogen cannot use the Online Store Inbox **app embed** automatically. The
storefront mirrors the Liquid theme embed in `app/components/ShopChat.tsx`.

## Why the old `shopifyChatV1.js?shop_id=` approach failed

Inbox authenticates with `data-external-identifier` (e.g.
`0LePiN80P-zoypskCNcNW443I327GeKq0WN_XNP9gr0`), **not** the numeric
`meta.json` shop id. Sending `90445414778` makes messaging-api return:

`401 The specified identifier does not match any shop`

→ UI: “Chat is unavailable / A technical problem occurred.”

## Setup

1. Install **Shopify Inbox** and enable it on a Liquid theme once (“Add to theme”).
   Online Store password must be **off** while using the theme editor iframe.
2. Copy from the Liquid storefront HTML (View Source / DevTools):
   - `data-external-identifier=...` on `#shopify-chat-bundle-selector`
   - Extension asset URL for `shopify-chat-bundle-selector.js` if it changed
3. Oxygen / `.env` (optional overrides; defaults are in `app/lib/const.ts`):
   - `PUBLIC_STORE_DOMAIN=f7vjea-hq.myshopify.com`
   - `PUBLIC_SHOPIFY_INBOX_EXTERNAL_ID=<from theme>`
4. CSP for Inbox is in `app/entry.server.tsx` (`scriptSrcElem` + messaging/pusher hosts).

## Behaviour

- Same bundle selector + `agent.js` / legacy loader path as the Online Store theme.
- Hidden on `/account/*` and `/checkout`.
- Not gated by the cookie banner.
