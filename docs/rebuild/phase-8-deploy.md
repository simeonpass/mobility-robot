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
| `SHOPIFY_ADMIN_API_ACCESS_TOKEN` | VAT relief customer sync (legacy `shpat_`) |
| `XSTO_VAT_RELIEF_CLIENT_ID` / `XSTO_VAT_RELIEF_CLIENT_SECRET` | Preferred VAT taxExempt sync (`write_customers`) |
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
- [ ] Custom domain `mobilityrobot.co.uk` attached to Oxygen (canonical site)
- [ ] `xsto.co.uk` 301s to `mobilityrobot.co.uk` preserving path (brand domain retained for redirect only)
- [ ] GA4 Real-time shows page views after consent
- [ ] Shop Chat renders with marketing consent
- [ ] Legacy `/pages/*` URLs return 301 on the new host
- [ ] Custom 404 with noindex
- [ ] Domain cutover complete (see below)

## Domain cutover — `mobilityrobot.co.uk`

**Canonical public URL:** `https://mobilityrobot.co.uk`  
**Legacy domain:** `https://xsto.co.uk` (301 → canonical)  
**Store brand:** Mobility Robot (Bentech Medical Ltd). Products remain XSTO-branded.

### Shopify Admin / DNS (preferred)

Do this in Shopify so redirects happen at the edge before Oxygen when possible:

1. **Domains** → add `mobilityrobot.co.uk` (and optionally `www.mobilityrobot.co.uk`).
2. Set **`mobilityrobot.co.uk` as the primary** domain for the storefront / Hydrogen channel.
3. Point DNS for `mobilityrobot.co.uk` (and `www`) at Shopify/Oxygen as instructed in Admin.
4. Add or keep `xsto.co.uk` as a **redirecting** domain targeting `mobilityrobot.co.uk` (Shopify “Redirect to primary domain” / domain redirect), **or** configure DNS/CDN for `xsto.co.uk` to 301 to `https://mobilityrobot.co.uk$request_uri`.
5. Confirm `www.mobilityrobot.co.uk` → apex `mobilityrobot.co.uk` (or the reverse — match `SITE_URL` in `app/lib/const.ts`).
6. Update any Google Search Console / Bing / GA4 property URLs to the new primary domain after cutover.

### In-app fallback (Hydrogen)

If the Oxygen app still receives requests on a legacy host, `app/lib/redirects.ts` 301s:

| From host | To |
|-----------|-----|
| `xsto.co.uk` | `https://mobilityrobot.co.uk` + same path/query |
| `www.xsto.co.uk` | same |
| `www.mobilityrobot.co.uk` | apex `https://mobilityrobot.co.uk` |

Path legacy maps (`/pages/about` → `/about`, short `/products/xsto-*` handles, etc.) still apply and are combined with host redirects into a single hop when both match.

### Merchant redirect checklist

- [ ] Primary domain = `mobilityrobot.co.uk` in Shopify Admin
- [ ] `xsto.co.uk` → `mobilityrobot.co.uk` 301 (Shopify domain redirect or DNS)
- [ ] `www` → apex (or documented preference) consistent with `SITE_URL`
- [ ] Spot-check: `/`, `/products/buy-robot-wheelchair`, `/pages/about` from both hosts
- [ ] Canonical tags / sitemap / OG URLs show `https://mobilityrobot.co.uk/...`
- [ ] `shopify.app.toml` application + auth callback URLs match primary domain (redeploy app config if needed)
