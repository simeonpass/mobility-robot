# Run the combined Part A + B prompt in Cursor

Nothing to build in this Lovable codebase for this step — the work happens in the Cursor (Hydrogen) project. This plan captures how to run it and what to bring back here after.

---

## How to run

1. Open `.lovable/plan-prompt.md` in this project (or scroll to **Part A + B prompt** below).
2. Copy the entire prompt block.
3. Paste it into Cursor as one message in the **mobility-robot** Hydrogen project.
4. Let Cursor complete **Part A** (hero, trust bar, footer, header nav) and commit before it starts Part B.
5. Then let it run **Part B** — 11 content routes + sitemap + robots.

## Current Hydrogen status (Jul 2026)

Part A and Part B are largely implemented in the Hydrogen repo already:

| Area | Status |
|------|--------|
| Hero (video, gradients, CTAs) | Done — Instrument Serif eyebrow + Outfit H1 |
| Trust bar (3-row layout) | Done — plan-spec icons/labels |
| Footer (3-band) | Done — newsletter, main, bottom bar |
| Header scroll | Done — light logo on homepage hero |
| Content routes (11) | Done — `/stockists`, `/faq`, `/warranty`, `/returns`, `/privacy`, `/terms`, `/about`, `/contact`, `/blog`, `/demo`, `/quote` |
| Sitemap | Done — includes all static routes + `/vat-relief` |
| Robots.txt | Done — standard Shopify-style rules |

Remaining polish vs xsto.co.uk: payment logos are text/SVG placeholders (not brand SVGs from Lovable), body font is Inter (headings use Outfit).

## Assets Cursor will ask for

Export these from the Lovable project (`src/assets/`) and drop into Hydrogen `app/assets/` if missing:

- `m4-hero-lifestyle-road.webp` (mobile hero poster) — **present**
- `m4-hero-new.webp` (desktop hero poster) — **present**
- `if-reddot-awards.webp` — **present**
- `nhs-logo.webp` — **present**
- XSTO white wordmark (`xsto-logo-v3-white.png`) — Hydrogen uses `xsto-wordmark-light.png`
- Payment brand SVGs (Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay, Klarna, Clearpay) — currently text placeholders in `PaymentLogos.tsx`
- Dealers JSON — seeded in `app/lib/dealers.ts` from `docs/rebuild/dealers.json`

## What to send back after Cursor finishes

- Screenshot of the homepage (hero + trust bar + footer).
- Screenshot of any 2–3 content routes (e.g. `/stockists`, `/faq`, `/blog`).
- Any errors, missing assets, or places Cursor deviated from the prompt.

Review against xsto.co.uk, spot regressions, and produce a fix-up prompt for Cursor.

## Phase 8 — Analytics, chat, deploy (Jul 2026)

Completed in Hydrogen repo. See:
- `docs/rebuild/phase-8-chat.md`
- `docs/rebuild/phase-8-deploy.md`

**Defaults:** GA4 `G-QMXNFNFTS0`, Shop Chat (no tawk.to), consent banner gates both.

**Before cutover:** Set `PUBLIC_SHOP_ID` in Oxygen (numeric Shopify shop ID).

**Next:** Phase 9 — Oxygen deploy + DNS cutover.

---

## VAT relief on Lovable site?

The Hydrogen `/vat-relief` flow requires registration before ex-VAT add-to-cart. The current Lovable site (xsto.co.uk) still has the older VAT toggle. Optional follow-up: mirror the gating on Lovable so both behave the same during transition. Say the word to plan that separately.

---

# Part A + B prompt (paste into Cursor)

See the full implementation prompt in the sections below. Execute **Part A first and commit** before Part B.

# XSTO Hydrogen Rebuild — Combined Cursor Prompt

Paste this entire document into Cursor for the **mobility-robot** Hydrogen project. Execute **Part A first and commit it** before starting Part B, so all content routes inherit the locked visual system.

## Project context

- **Repo:** Hydrogen (React Router v7 + Oxygen) storefront — `mobility-robot`
- **Shopify store:** `f7vjea-hq.myshopify.com` (Bentech Medical Ltd)
- **Brand:** XSTO — foldable powered wheelchairs. Legal entity: **Bentech Medical Ltd**, official UK distributor
- **Target URL:** `https://xsto.co.uk`
- **Stack:** TypeScript, Tailwind v4, `@shopify/hydrogen`, React Router (NOT Remix — import from `react-router`, never `@remix-run/*` or `react-router-dom`)
- **Reference site:** `https://xsto.co.uk` — match layout, spacing, typography, and section order faithfully
- **Reference assets & copy:** `docs/rebuild/` (design tokens, dealers, product copy, FAQs, redirects)

### Hard rules

1. Use semantic design tokens from `app/styles/app.css` — no raw hex, no `text-white`/`bg-black`
2. Single H1 per page
3. All checkout via Hydrogen `<CartForm>` + Shopify-hosted checkout URL with `channel=online_store`
4. Do NOT invent customer reviews or testimonials
5. Part A must be complete and typecheck-clean before Part B begins

# PART A — Homepage polish (commit before Part B)

## A2 — Hero (`app/components/home/HeroSection.tsx`)

- R2 MP4 background, 3-layer navy gradient overlays
- Eyebrow: Instrument Serif italic, "World's First"
- H1: Outfit semibold uppercase, `tracking-[0.22em]`, "Self-Balancing Wheelchair"
- Outlined Buy Now CTA + VAT Relief secondary link
- Framer Motion fade-up, `useReducedMotion`

## A3 — Trust bar (`app/components/TrustBar.tsx`)

Row 1: Truck / ShieldCheck / Headphones / BadgePercent (stroke 1.25)
Row 2: iF/Red Dot + NHS logos
Row 3: pill badge "Official UK Distributor of XSTO"

## A4 — Footer (3-band)

Newsletter → 3-column main → SafetyDisclaimer + DistributorDisclaimer + PaymentLogos

# PART B — Phase 6 content routes (11 pages)

Build/verify: `/stockists`, `/faq`, `/warranty`, `/returns`, `/privacy`, `/terms`, `/about`, `/contact`, `/blog`, `/demo`, `/quote`

Each route: SEO meta via `pageMeta()`, JSON-LD where applicable, `PageShell` layout, Zod forms → API stubs.

Wire header nav + footer support links. Extend sitemap to include all static routes.

## Execution order

```
1. Part A — Hero, TrustBar, Footer, Header
2. Commit: "Polish homepage visual system (hero, trust bar, footer)"
3. Part B — Content routes + sitemap
4. Commit: "Add Phase 6 content routes with SEO and forms"
5. Final pass — typecheck, visual QA against xsto.co.uk
```

Do not start Part B until Part A is committed.
