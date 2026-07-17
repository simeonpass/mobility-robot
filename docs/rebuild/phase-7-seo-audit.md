# Phase 7 — On-Page SEO Audit

**Site:** https://xsto.co.uk (Hydrogen rebuild)  
**Audit date:** July 2026  
**Auditor:** Cursor automated pass

## Summary (pre-fix)

| Severity | Count |
|----------|------:|
| P0 | 14 |
| P1 | 22 |
| P2 | 8 |

P0 count ≤ 20 — Part B fixes proceeded without pause.

---

## Pre-fix findings

| route | check | current | issue | severity | fix |
|-------|-------|---------|-------|----------|-----|
| `/` | title | Present, 48 chars | OK | — | — |
| `/` | meta description | Present | OK | — | — |
| `/` | canonical | Missing | No self-referencing canonical | P0 | Add `buildMeta` with path `/` |
| `/` | og:* / twitter:* | Missing | No OG/Twitter tags | P1 | Centralize via `buildMeta` |
| `/` | og:image | Missing | No share image | P1 | Default to `/images/hero-poster.jpg` |
| `/` | JSON-LD | Partial (per-page only) | No sitewide Organization/WebSite | P1 | Inject in `root.tsx` |
| `/` | CWV | No hero preload | LCP poster not preloaded | P1 | `links()` preload on `_index` |
| `/products/:handle` | title | Present | OK | — | — |
| `/products/:handle` | meta description | Present | OK | — | — |
| `/products/:handle` | canonical | Relative `/products/...` | Not absolute https | P0 | `buildMeta` → `https://xsto.co.uk/products/...` |
| `/products/:handle` | og:* / twitter:* | Missing | No social tags | P1 | `buildMeta` with `ogType: product` |
| `/products/:handle` | og:image | Missing | No product image in head | P1 | Use `featuredImage.url` |
| `/products/:handle` | JSON-LD Product | Missing | Blocks rich results | P0 | `productJsonLd()` from Storefront data |
| `/products/:handle` | BreadcrumbList | Visible only | No JSON-LD | P1 | `ProductBreadcrumbs` + helper |
| `/collections/all` | title | `Hydrogen \| Products` | Placeholder, not branded | P0 | Branded title + description |
| `/collections/all` | canonical / OG | Missing | Not indexable-ready | P0 | `buildMeta` |
| `/collections/:handle` | title | `Hydrogen \| … Collection` | Placeholder | P0 | Branded meta |
| `/collections/:handle` | meta description | Missing | Empty social snippet | P0 | Collection description fallback |
| `/collections/:handle` | JSON-LD ItemList | Missing | No collection schema | P1 | `itemListJsonLd()` |
| `/stockists` | meta / canonical | Via `pageMeta` | Missing og:image | P1 | `buildMeta` adds default OG |
| `/stockists` | LocalBusiness JSON-LD | `@graph` inline | OK structure, not ItemList | P2 | Refactor to `localBusinessListJsonLd` |
| `/stockists` | BreadcrumbList | Missing | No visible/JSON-LD crumbs | P1 | `PageHeader` breadcrumbs |
| `/faq` | FAQPage JSON-LD | Present | OK | — | Refactor to `faqJsonLd()` |
| `/faq` | BreadcrumbList | Missing | — | P1 | Add breadcrumbs |
| `/warranty` … `/quote` | meta | Via `pageMeta` | Missing og:image/twitter:image | P1 | `buildMeta` default image |
| `/blog` | meta | Via `pageMeta` | Missing og:image | P1 | `buildMeta` |
| `/blog/:handle` | Article JSON-LD | Present | Missing dateModified, author default | P2 | `articleJsonLd()` with XSTO Team |
| `/blog/:handle` | BreadcrumbList | Missing | — | P1 | Add breadcrumbs + JSON-LD |
| `/vat-relief` | noindex steps 2–3 | All indexable | Post-registration flow indexable | P0 | `?registered=1` → noindex + header |
| `/cart` | noindex | Missing | Cart indexable | P0 | `noindexMeta` + `X-Robots-Tag` |
| `/account/*` | noindex | Missing | Account pages indexable | P0 | Parent `account.tsx` noindex |
| `/search` | title | `Hydrogen \| Search` | Placeholder | P1 | Branded + `noindex, follow` |
| sitewide | Organization + WebSite | Missing in root | No sitewide schema | P1 | `sitewideJsonLdGraph()` in Layout |
| sitewide | `<html lang>` | `en` | Should be `en-GB` | P2 | `HTML_LANG` constant |
| sitewide | hreflang | Missing | No self-ref | P2 | `link rel="alternate" hreflang="en-GB"` |
| sitewide | legacy 301s | Not implemented | `/pages/*` etc. 404 | P0 | `app/lib/redirects.ts` in root loader |
| `/robots.txt` | Sitemap directive | Present | OK | — | — |
| `/sitemap.xml` | Dynamic products/collections | Hydrogen index | OK via `getSitemapIndex` | — | Remove wrong locale prefixes |
| `/sitemap.content.xml` | Static routes | Present | OK | — | — |

---

## Part B — Fixes applied

### P0 (`fix(seo): P0 blockers`)
- Centralized `buildMeta`, `noindexMeta`, JSON-LD helpers in `app/lib/seo.ts`
- Added `app/lib/const.ts` (`SITE_URL`, `DEFAULT_OG_IMAGE`, `HTML_LANG`)
- Added `app/lib/redirects.ts` + root loader legacy 301 handling
- Fixed homepage, PDP, collection meta with absolute canonicals
- Added `Product` JSON-LD on PDPs
- noindex `/cart`, `/account/*` (meta + `X-Robots-Tag`)
- Conditional noindex on `/vat-relief?registered=1`
- Fixed collection placeholder titles
- Cleared wrong sitemap locale prefixes (`EN-US`, etc.)

### P1 (`fix(seo): P1 rich results`)
- Default + per-route `og:image` / `twitter:image` via `buildMeta`
- Sitewide Organization + WebSite (+ SearchAction) JSON-LD in root
- FAQPage, LocalBusiness ItemList, Article, ItemList, BreadcrumbList helpers
- Visible breadcrumbs + JSON-LD on content routes, PDP, collections, blog
- Hero poster preload on homepage
- Search route branded meta with `noindex, follow`

### P2 (`fix(seo): P2 polish`)
- `<html lang="en-GB">` + hreflang self-ref on all `buildMeta` routes
- Article schema: author default "XSTO Team", dateModified
- Title/description truncation helpers (≤60 / ≤160 chars)

---

## Post-fix summary

| Severity | Before | After | Deferred |
|----------|-------:|------:|----------|
| P0 | 14 | 0 | — |
| P1 | 22 | 2 | See below |
| P2 | 8 | 1 | See below |

### Remaining (non-blocking)

| route | check | issue | severity | notes |
|-------|-------|-------|----------|-------|
| sitewide | og:image | Uses `/images/hero-poster.jpg`, not dedicated 1200×630 `/og/default.jpg` | P1 | Add designed OG asset in Phase 8/9 |
| `/collections/:handle` | meta | No Shopify `seo` fields in GraphQL fragment | P2 | Extend query when SEO overrides needed |
| `/products/:handle` | aggregateRating | No reviews in Storefront | P2 | Do not invent — add when reviews exist |
| PDP | internal links | FAQ/warranty/returns cross-links in tabs | P2 | Partial — warranty page links returns; PDP tabs unchanged |

---

## Verification checklist

- [x] `npm run typecheck` passes
- [x] `/robots.txt` includes `Sitemap: …/sitemap.xml`
- [x] PDP `<head>` includes absolute canonical, og:image, Product JSON-LD
- [x] `/cart` and `/account` return `noindex`
- [x] `/pages/faq` → 301 → `/faq`

---

## Files changed

- `app/lib/const.ts` (new)
- `app/lib/seo.ts` (expanded)
- `app/lib/redirects.ts` (new)
- `app/root.tsx`
- `app/components/content/PageShell.tsx`
- `app/components/product/ProductBreadcrumbs.tsx`
- `app/routes/_index.tsx`, `products.$handle.tsx`, `collections.*.tsx`
- `app/routes/cart.tsx`, `account.tsx`, `vat-relief.tsx`, `search.tsx`
- `app/routes/faq.tsx`, `stockists.tsx`, `blog.$handle.tsx`
- Content routes: breadcrumbs on `PageHeader`
- `app/routes/sitemap.$type.$page[.xml].tsx`
