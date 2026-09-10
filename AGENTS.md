# AGENTS.md

## Cursor Cloud specific instructions

This repo is a Shopify Hydrogen (React Router v7, not Remix — see `.cursor/rules/hydrogen-react-router.mdc`) headless storefront named `mobility-robot` / XSTO. There is no local database or backend to run — all data comes from remote Shopify APIs configured via environment variables. The only sub-project is the optional Shopify Function in `extensions/vat-relief-discount` (has its own `package.json`).

### Environment file (required to run the app)

The dev server reads a `.env` file, which is git-ignored (see `.gitignore`) and modeled on `.env.example`. It is NOT part of the update script, so if it is missing, recreate it:

- Copy `.env.example` to `.env`.
- Set a non-empty `SESSION_SECRET` (the app throws in `app/lib/context.ts` if it is unset), e.g. `openssl rand -hex 32`.
- Without real Shopify Storefront API tokens, set `PUBLIC_STORE_DOMAIN=mock.shop`. Hydrogen then serves mock catalog data and every page renders. If `PUBLIC_STORE_DOMAIN` points at the real store (`f7vjea-hq.myshopify.com`) with empty tokens, every route 500s with "did not pass in a publicStorefrontToken".

Gotcha with `mock.shop`: the storefront's hard-coded product handles (e.g. `/products/xsto-m4-pro`, `buy-robot-wheelchair`) do NOT exist in mock.shop and return 404. Use mock.shop's own demo products for end-to-end flows (e.g. `/products/soft-cotton-hoodie-in-ocean`, `/products/men-t-shirt`, `/products/sweatpants`). Real product handles only resolve when real Storefront API credentials are supplied.

### Running / testing / building

Standard commands live in `package.json` scripts. Notable ones:
- `npm run dev` — dev server on http://localhost:3000 (`shopify hydrogen dev --codegen --host`). Serves `/graphiql` and `/subrequest-profiler`.
- `npm test` — Vitest unit tests.
- `npm run typecheck` — `react-router typegen && tsc --noEmit` (React Router v8 future-flag warnings are expected/harmless).
- `npm run build` / `npm run preview` — production build / preview.

### Known caveat: lint is broken in the repo

`npm run lint` currently errors out before linting with: "Error while loading rule 'jest/no-deprecated-functions': Unable to detect Jest version". This is a pre-existing config issue in `eslint.config.js` (it enables `eslint-plugin-jest`, but the project uses Vitest and has no `jest` package). It is unrelated to environment setup; fixing it requires a code/config change (e.g. pinning a Jest version in ESLint settings or removing the jest plugin).
