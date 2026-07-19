# Phase 8 — Shopify Inbox (Hydrogen)

Hydrogen cannot use the Online Store Inbox **app embed** automatically.
`app/components/ShopChat.tsx` loads `shopifyChatV1.js` with the theme’s
`data-external-identifier` as `shop_id`.

## Why chat failed on Hydrogen

1. **Wrong shop id** — messaging-api expects Inbox’s
   `data-external-identifier` (e.g. `0LePiN80P-…`), not the numeric
   `meta.json` id. Wrong id → `401 The specified identifier does not match any shop`
   → “A technical problem occurred.”
2. **Newer agent.js bundle** needs Online Store `/agent/handoff`, which
   Oxygen does not serve (blank panel). We keep the classic `shopifyChatV1.js` path.

## Setup

1. Enable Inbox on a Liquid theme once (password off for theme editor).
2. From Liquid HTML, copy `data-external-identifier` on the chat script.
3. Optional Oxygen override: `PUBLIC_SHOPIFY_INBOX_EXTERNAL_ID=…`
   (default is in `app/lib/const.ts`).
4. `PUBLIC_STORE_DOMAIN=f7vjea-hq.myshopify.com`
5. CSP for Inbox is in `app/entry.server.tsx`.

## Behaviour

- Hidden on `/account/*` and `/checkout`.
- Not gated by the cookie banner.
