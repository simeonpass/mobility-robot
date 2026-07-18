# Phase 8 — Deploy checklist (Oxygen)

## Required environment variables

| Variable | Purpose |
|----------|---------|
| `PUBLIC_STOREFRONT_API_TOKEN` | Storefront API (public) |
| `PRIVATE_STOREFRONT_API_TOKEN` | Server-side Storefront queries |
| `PUBLIC_STORE_DOMAIN` | `f7vjea-hq.myshopify.com` |
| `PUBLIC_STOREFRONT_ID` | Hydrogen analytics + Shop |
| `PUBLIC_CHECKOUT_DOMAIN` | Shopify checkout host |
| `SESSION_SECRET` | Cookie signing |
| `SHOPIFY_ADMIN_API_ACCESS_TOKEN` | VAT relief customer sync (optional) |
| `PUBLIC_GA4_ID` | Google Analytics 4 (`G-QMXNFNFTS0`) |
| `PUBLIC_SHOP_ID` | Shop Chat widget (numeric shop ID) |

Copy from `.env.example` and fill in Oxygen project settings before deploy.

## Preview deploy

```bash
npx shopify hydrogen deploy --preview
```

> **Note:** Preview deploy requires Shopify CLI authentication and Oxygen project linkage. Run locally when credentials are available; record the preview URL below.

| Environment | URL | Date |
|-------------|-----|------|
| Preview | _Pending CLI auth — run `npx shopify hydrogen deploy --preview`_ | — |

## Security headers (entry.server.tsx)

- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- CSP: Shopify CDN, Google Fonts, GA4, Shop Chat, YouTube, Cloudflare R2 hero video

## Cache policy

| Path | Header |
|------|--------|
| `/build/*`, `/assets/*`, `/images/*` | `max-age=31536000, immutable` |
| HTML pages | `max-age=0, s-maxage=60, stale-while-revalidate=300` |
| `/robots.txt`, `*.xml` | `max-age=3600` |
| Legacy 301 redirects | `max-age=3600` |

## Lighthouse targets

Run against preview URL (or `http://localhost:3001` for local baseline):

```bash
npx lighthouse http://localhost:3001 --only-categories=performance,seo,accessibility --output=json --output-path=./lighthouse-home.json
npx lighthouse http://localhost:3001/products/buy-robot-wheelchair --only-categories=performance,seo,accessibility
npx lighthouse http://localhost:3001/stockists --only-categories=performance,seo,accessibility
```

| Page | Performance | SEO | Accessibility | Notes |
|------|------------:|----:|--------------:|-------|
| `/` | 59 | 100 | 99 | Local dev; hero MP4 + HMR hurt LCP — expect ≥90 on Oxygen production |
| PDP (`/products/buy-robot-wheelchair`) | 55 | 100 | 97 | Product JSON-LD present; gallery images from CDN |
| `/stockists` | 55 | 100 | 100 | Leaflet map deferred; SEO passes |

**Targets:** Performance ≥ 90, SEO ≥ 95, Accessibility ≥ 95

**Local baseline (Jul 2026, `npm run dev` on localhost:3001):** SEO and Accessibility meet targets. Performance is below target in dev due to unminified bundles, source maps, and hero video autoplay — re-run Lighthouse against the Oxygen preview URL after deploy.

## Pre-cutover checklist

- [ ] All Phase 8 env vars set in Oxygen
- [ ] GA4 Real-time shows page views after consent
- [ ] Shop Chat renders with marketing consent
- [ ] Legacy `/pages/*` URLs return 301
- [ ] Custom 404 with noindex
- [ ] DNS cutover plan ready (Phase 9)
