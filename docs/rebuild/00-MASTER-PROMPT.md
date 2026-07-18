# XSTO / Mobility Robot — Hydrogen Rebuild Master Prompt

Paste this entire file into your Hydrogen project's AI editor (Cursor, Claude Code, Copilot Workspace, etc.) as the initial instruction. The AI should execute the phases in order and stop for confirmation at the end of each phase.

## Context

- Project: Hydrogen (Remix + Oxygen) storefront named `mobility-robot`.
- Shopify store domain: `f7vjea-hq.myshopify.com` (Bentech Medical Ltd).
- Public brand: **XSTO** — foldable powered wheelchairs. Legal entity: **Bentech Medical Ltd**, official UK distributor of XSTO.
- Target production URL: `https://xsto.co.uk` (DNS moved to Oxygen after cutover). Until then, use the Oxygen preview URL.
- Language: TypeScript. Styling: Tailwind v4.
- Shopify is the single source of truth for products, variants, inventory, prices, discount codes, orders, customer accounts, and checkout.
- The Hydrogen repo owns: all frontend, dealer locator data (JSON in-repo), redirects, SEO, blog rendering.

## Reference files (in `docs/rebuild/`)

- `design-tokens.css` — exact HSL tokens, gradients, shadows from the previous site.
- `dealers.json` — 17 authorised UK/IE stockists with lat/lng, hours, phone, email.
- `redirects.csv` — legacy → new URL map for 301s.
- `product-copy-productData.ts` — M4 / M4 Pro descriptions, specs, images alt text.
- `product-copy-m4b.ts` — M4B (new product) full copy + specs.
- `product-copy-x12.ts`, `product-copy-x12pro.ts` — X12 and X12 Pro copy.
- `product-faqs.ts` — per-model FAQ entries.

---

## Phase 1 — Design tokens & Tailwind

Import the values from `docs/rebuild/design-tokens.css` into `app/styles/app.css` using Tailwind v4 `@theme` syntax. Preserve the token names (`--primary`, `--gold`, `--navy`, `--shadow-luxe`, `--gradient-hero`, etc.) so the AI can reuse them literally in components.

- Font: Outfit (Google Fonts) — weights 300–800. Load via `<link>` in `app/root.tsx`.
- Primary: `hsl(222 47% 11%)` (dark navy). Accent (was "gold", now Medical Blue): `hsl(221 83% 53%)`.
- Radius: `0.75rem`. Background: pure white. All shadows use the navy channel at low alpha.
- Do NOT hardcode hex or `text-white`/`bg-black` classes in components; always use semantic tokens.

Deliverable: `app/styles/app.css` with `@theme` block + Outfit imported. Verify `tailwindcss` builds without warnings.

## Phase 2 — Global layout

`app/root.tsx` renders:

1. **Announcement bar** (top, navy background, white text, centered): `Official UK Distributor of XSTO · Free UK Delivery · 5-Year Frame Warranty`.
2. **Header** (sticky, white bg, navy text, subtle border-bottom):
   - Left: text wordmark `Bentech Medical Ltd` (link to `/`).
   - Center nav: `Home · M4 · M4 Pro · M4B · X12 · X12 Pro · Accessories · Stockists · Demo`.
   - Right: `Sign in` (→ `/account`), `Search` (→ predictive search), `Cart 0` (drawer trigger).
   - Mobile: hamburger drawer.
3. **Trust bar** (below header on homepage only): 4 icons — Free UK Delivery · 5-Year Warranty · UK-Based Support · VAT Relief Available.
4. **Footer** (3 columns, compact):
   - Column 1: Bentech Medical Ltd address, phone, email, distributor disclaimer.
   - Column 2: Shop links (each product), Accessories, Stockists.
   - Column 3: Support — FAQ, Warranty, Returns, Privacy, Terms, Contact.
   - Bottom row: `© Bentech Medical Ltd. XSTO is a registered trademark of its owner. Bentech Medical Ltd is the Official UK Distributor.`

No customer signup or admin routes in nav. All checkout goes through Shopify.

## Phase 3 — Homepage (`app/routes/_index.tsx`)

Sections top-to-bottom:

1. **Hero**:
   - Desktop (`md:` and up): YouTube embed background (autoplay, muted, loop, no controls). Overlay tint navy 40%.
   - Mobile: static hero image (poster JPG) + play button opening a lightbox.
   - Copy overlay (left-aligned): H1 `The Future of Powered Mobility`. Sub `Foldable. Portable. VAT-relief eligible.` CTAs: `Shop the Range` (primary), `Book a Demo` (ghost).
2. **Product range grid** — 5 cards (M4, M4 Pro, M4B, X12, X12 Pro). Each: image, title, from-price (ex-VAT), 3 bullet specs, `View details` link. Load from Shopify Storefront API.
3. **Comparison strip** — small horizontal-scroll table: weight, capacity, range, folded size across all 5 models.
4. **Testimonials placeholder** — do NOT invent reviews. Render an empty state that says `Verified customer reviews coming soon.`
5. **Newsletter** — email input → Shopify Customer newsletter subscription.
6. **FAQ preview** — 4 items from `product-faqs.ts` general section, `See all` links to `/faq`.

## Phase 4 — Product template (`app/routes/products.$handle.tsx`)

- **Gallery**: main image + thumbnails, keyboard-accessible.
- **Title + price**: show BOTH inc-VAT (small, struck) and ex-VAT (large, emerald green) when VAT relief is enabled. Default view = inc-VAT.
- **VAT Relief toggle**: switch labelled `I have a qualifying long-term illness or disability`. When ON:
   - Price displays ex-VAT (÷ 1.20).
   - A HMRC declaration form appears (name, address, condition) — must be captured as a cart line-item attribute so it reaches the Shopify order.
   - Show inline note: `Under HMRC rules, individuals with a chronic illness or disability are eligible for VAT relief on mobility aids.`
- **Variant selectors**: colour (Black is free, other colours per Shopify variant pricing).
- **Delivery estimate**:
   - If Shopify variant `availableForSale = true` and inventory > 0 → `In stock. Free UK delivery in 5–7 working days.`
   - Else → `Pre-order. Estimated delivery <today + 12 weeks, formatted "DD Month YYYY">.` (compute at request time, don't hardcode.)
- **Add to cart** using Hydrogen `<CartForm>` — never manual URLs.
- **Spec tabs**: Overview · Specifications · Included · Delivery & Warranty · FAQ · Videos (embed YouTube from product metafield if present).
- **Related products**: 3 other models.

## Phase 5 — Cart & checkout

Use Hydrogen's built-in `CartProvider` and `<CartForm>`. The generated checkout URL is Shopify-hosted — do NOT redirect to manual `/cart/add` or `/checkout` URLs. Ensure `channel=online_store` is present on the checkout URL.

Referral codes: `JENNI10` (10% off) is a Shopify discount code — apply via `discountCodesUpdate` cart mutation when a `?ref=JENNI10` query param is present.

## Phase 6 — Content routes

- `/stockists` — Dealer locator. Load `docs/rebuild/dealers.json` at build time. UI:
   - Postcode input → geocode via `https://nominatim.openstreetmap.org/search?format=json&countrycodes=gb,ie&q=<postcode>`.
   - Compute distance via Haversine, sort ascending, show top 10.
   - Each card: name, address, phone (`tel:`), email (`mailto:`), website, hours, `Offers demo` badge if `offers_demo=true`.
   - Include a Leaflet or MapLibre map with markers (optional; skip if adding complexity).
- `/faq` — All FAQ items from `product-faqs.ts` grouped by section. Emit `FAQPage` JSON-LD.
- `/warranty` — 5-year frame, 1-year electrical/mechanical, 1-year battery. Full T&Cs body.
- `/returns` — 14-day UK Consumer Rights window, £250 collection fee for large items.
- `/privacy`, `/terms` — standard boilerplate scoped to Bentech Medical Ltd, UK data controller.
- `/distributor-disclaimer` — `This site is operated by Bentech Medical Ltd, the Official UK Distributor of XSTO. XSTO is a trademark of its manufacturer. Bentech Medical Ltd is not affiliated with XSTO Robot Technology Co., Ltd.`
- `/about`, `/contact` — company info, address, phone, email.
- `/blog` and `/blog/$handle` — pull from Shopify blog `news` via Storefront API.
- `/demo` — form submitting to Shopify Contact form (or a Formspree endpoint as fallback).
- `/quote` — trade quote form.

## Phase 7 — SEO

- `app/root.tsx` global `meta`: title `XSTO Powered Wheelchairs UK | Bentech Medical Ltd`, description ≤160 chars.
- Per-route `meta` export (Remix pattern) — title <60 chars with primary keyword, unique description.
- Single H1 per page.
- JSON-LD:
   - Sitewide `Organization` in root (name Bentech Medical Ltd, url, logo, sameAs).
   - Product route: `Product` + `Offer` (price, currency GBP, availability from Shopify).
   - FAQ route: `FAQPage`.
   - Blog post: `Article` + `BreadcrumbList`.
- `app/routes/sitemap[.]xml.tsx` — generate from Shopify Storefront API (products, collections, blog posts) plus static routes.
- `app/routes/robots[.]txt.tsx` — `Allow: /`, `Disallow: /account`, `Disallow: /cart`, `Sitemap: https://xsto.co.uk/sitemap.xml`.
- Canonical URLs on every page pointing at `https://xsto.co.uk<path>`.
- Open Graph + Twitter card tags per route.
- Image alt text: use values from `product-copy-*.ts` files.

## Phase 8 — Analytics & chat

- **Google Analytics 4**: add GA4 script in `app/root.tsx`. Ask user for their measurement ID (currently `G-…` — pull from previous project env).
- **tawk.to** live chat: paste the tawk.to embed script into `app/root.tsx`, wrapped in a `<ClientOnly>` boundary so it doesn't SSR. Exclude on `/checkout` and `/account`.
- **Shopify web pixels** — enabled via Shopify admin, no code needed.

## Phase 9 — Redirects

Read `docs/rebuild/redirects.csv` and emit 301s from `app/routes/$.tsx` (catch-all) or via Oxygen edge config. Include the Shopify legacy paths (`/products/*`, `/collections/*`, `/pages/*`, `/blogs/*`, `/account`, `/track-order`).

## Verification checklist

Before handing back to the user:

- [ ] `npm run dev` boots without errors.
- [ ] Homepage renders with hero, product grid, footer.
- [ ] Clicking a product loads a real Shopify product with correct price.
- [ ] Add to cart works; checkout URL opens Shopify-hosted checkout with `channel=online_store`.
- [ ] `/stockists` renders all 17 dealers.
- [ ] `/sitemap.xml` and `/robots.txt` respond 200.
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, SEO = 100 on desktop.
- [ ] No hardcoded colour utilities (`text-white`, `bg-black`) — grep for them and refactor.
- [ ] No fake reviews, no invented testimonials, no placeholder Lorem Ipsum in shipped copy.

## Anti-patterns (do NOT do)

- Manual checkout URLs like `/cart/add?id=…` or `/checkout?id=…`.
- Redirecting to `f7vjea-hq.myshopify.com` product pages.
- Storing products, prices, or inventory in code.
- Generating fake reviews, ratings, or "verified purchase" badges.
- Using purple/indigo gradients on white — this site's palette is navy + medical blue + white only.
- Adding customer auth routes inside Hydrogen; use Shopify Customer Account API (`/account`).

---

Begin with Phase 1 and stop for confirmation at the end of each phase.