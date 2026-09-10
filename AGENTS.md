# Agent notes

## Local Hydrogen preview

The storefront runs with `npm run dev` (`shopify hydrogen dev --codegen --host`) on **port 3000**. Mini Oxygen reads a gitignored `.env` — Cursor Cloud secrets in the process environment are not enough on their own.

### Cursor Cloud specific instructions

1. Required **Runtime Secrets** on the environment (injected at agent boot):
   - `SESSION_SECRET`
   - `PUBLIC_STOREFRONT_API_TOKEN`
   - `PRIVATE_STOREFRONT_API_TOKEN`
   - `PUBLIC_STORE_DOMAIN`
   - `PUBLIC_STOREFRONT_ID`
   - `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID`
   - `PUBLIC_CUSTOMER_ACCOUNT_API_URL`
   - `SHOP_ID`
2. Optional: `PUBLIC_CHECKOUT_DOMAIN` (defaults to `checkout.shopify.com`), `PUBLIC_SHOP_ID`, `SHOPIFY_ADMIN_API_ACCESS_TOKEN`, analytics/email keys.
3. On boot, `node scripts/write-hydrogen-env.mjs` writes `.env` from those secrets. Re-run it if secrets change and the file is missing.
4. Start preview with:
   ```bash
   npx shopify hydrogen dev --codegen --host --port 3000 --disable-version-check
   ```
   Open `http://localhost:3000` via the Cloud Agent Ports / Preview panel.
5. Do not commit `.env`. Do not print secret values. Do not deploy or publish as part of preview setup.
6. Customer Account login may need `--customer-account-push` (public HTTPS tunnel). Homepage, catalog, and cart work without it.
