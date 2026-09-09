# Mobility Robot storefront rebrand

This review branch integrates the approved Mobility Robot design into the existing Shopify Hydrogen storefront. It is not a replacement static shop. Bentech Medical Limited remains the seller and official UK distributor; XSTO remains the product manufacturer.

## Included

- Mobility Robot logo and Bentech Medical byline, separate distributor statement, navy/blue/amber palette, Manrope/DM Sans typography.
- New homepage, product presentation and About story. Existing product URLs and real Shopify loaders stay in place.
- Shopify-sourced homepage and related-product prices with explicit VAT-relief eligibility and VAT-inclusive alternatives.
- /compare, /guides, /guides/self-levelling-wheelchairs, /guides/stair-climbing-wheelchairs, /guides/choosing-an-xsto-wheelchair, /international, /support.
- Page metadata, breadcrumb/Article data, sitemap entries and corrected Organization identity. Existing social preview image retained.
- Existing cart, checkout handoff, VAT declarations, X12 leg-rest edition query, accessories, deposit options, account, stockists, enquiry and returns routes preserved.
- Default notification sender label updated. An explicitly configured FORMS_FROM_EMAIL value is still respected and should be reviewed in Oxygen.
- Non-main GitHub branches explicitly use Oxygen --preview. Non-production hosts return X-Robots-Tag: noindex, nofollow.

## Simplified purchase and mobile design

- Shorter homepage, compact mobile logo/header, clearer shop navigation, and collapsible newsletter/footer sections.
- Product name before the gallery on phones; a single ordered choice/purchase area with the main button visible in the page. The mobile bottom button is hidden while the main purchase control is visible.
- Compatible accessories are optional extras in a closed disclosure: three choices first, an option to see all, colour selection where available, and one combined total. Existing Shopify compatibility rules and parent/child cart lines remain in use.
- Mobile accessory cards place a 200–220px-high photo above the name, price and selection checkbox. A bounded image wrapper fixes Hydrogen's inline full-width image pushing the copy off-screen. Real source dimensions replace fabricated square dimensions, preserving portrait proportions and higher-resolution image choices. Desktop cards use 128px photos. Shopify Inbox uses its supported 120px vertical offset to clear the mobile purchase bar.
- The accessories catalogue shows each product once, with model filters. Attached basket accessories use a quieter presentation and share the chair's VAT-declaration action.
- Per-product VAT calculation keeps displayed accessory prices and package totals consistent, including mixed legacy/dual-VAT products and deposits. Prices in the purchase area retain pennies.
- Repeat add-to-basket clicks are disabled while submitting/loading. Checkout navigation waits for optimistic basket updates to finish.

## Validation

The purchase-flow simplification passed all 191 tests across 25 files, including regression cases for accessory filters, available Standard SKU selection, same-colour VAT siblings, mixed VAT pricing, deposit totals and pending purchase buttons. The subsequent mobile accessory fix passes two new regression tests using the real Hydrogen Image component, covering image containment, uncapped image choices and portrait source proportions. Route type generation completed and npx tsc --noEmit passes. The production client/server build passes; its optional bundle-analysis metafile warning remains non-blocking.

Changed production-source ESLint passes. A broader production-source lint run still finds eight pre-existing errors and four warnings in unchanged consent, payment/edition controls, video, review and VAT-modal code. The baseline Jest lint configuration also prevents linting Vitest test files; the tests pass under Vitest.

Hosted visual and end-to-end checkout verification remain outstanding. Shopify's account-access page presented Cloudflare verification; the user's authorised attempt did not clear it. The browser was not retried through an alternate route. Local visual inspection was also unavailable in this environment. No test orders, payments, customer-account mutations or enquiry emails were submitted. Review this preview on real phones and verify the commercial checkout before production approval.

## Launch sequence

1. Review the Oxygen preview on desktop and mobile. Check the homepage, all four chairs, edition/colour choice, gallery, VAT modal, accessory selection, cart, search, stockists, demo/contact validation and customer account handoff. Confirm prices and current specifications with the commercial team.
2. Complete controlled checkout and enquiry-delivery tests using the shop's agreed test procedure. Verify actual emails and account returns with an authorised test account. Preview cart actions still use the connected Shopify store.
3. Confirm manufacturer-approved distributor wording and current UK territory. Check XSTO logo use on existing product images, manuals and the unchanged social image as part of existing brand permissions. No worldwide sales promise is made.
4. Approve the review branch for production, then merge through the existing store workflow. Retain the current production deployment for rollback.
5. Review Shopify checkout, email templates, invoices and social profile display names for remaining old seller branding. Update Oxygen's explicit sender label if it still says XSTO UK. Do not alter historical customer review text.
6. Verify production indexing, canonical URLs, sitemap submission and real conversions in Google Search Console/analytics. Keep transaction/account pages excluded. Check organic landings, errors and demo/product-to-cart conversions after release.

## Search migration priorities

Keep the current product URLs. The historical X12 Pro URL must continue to resolve to /products/x12-all-terrain-mobility-robot?legrest=electric. Existing redirect tests cover legacy paths; this branch does not change domain redirects.

Only retain or configure old-domain redirects if the manufacturer permits that use of XSTO.co.uk. Do not assume an exception to the user's domain restriction. If permitted, map old URLs individually to their relevant new equivalents and verify permanent redirects without chains. If not permitted, concentrate on the current domain, distributor listings and updated genuine backlinks.

Use Mobility Robot as the store name and Bentech Medical Limited as the business in structured data and business listings. Keep XSTO in product names, manufacturer fields and useful guide content. Ask relevant partners to update their links through the normal approved communication process. No partner messages were sent in this work.

The new guides serve real buyer questions and link to the relevant models and demonstrations. Expand only with original, useful material: product demonstrations, exact configuration details, genuine customer stories and verified aftercare information. Do not add fabricated reviews, location pages without real service coverage, or guaranteed ranking claims.

## Homepage restoration and range hero — 8 September 2026

The user compared the earlier full homepage with the simplified preview and preferred the richer content. The homepage now restores the lifestyle feature, Bentech Medical support section, three buyer guides, four product videos and the new-brand explanation. The newsletter is visible again and desktop footer navigation is expanded; phone footer links retain native accordions.

The current motion wordmark remains, enlarged to 34px in the desktop header and 30px in the footer, with responsive sizing on phones. Desktop navigation already changes to compact controls below 1280px.

The hero now features M4B, X12 and M4 Pro together using real Shopify product photography and canonical product links. Desktop shows the three chairs together on a pale blue background. Phones use a larger featured X12 above the M4B and M4 Pro, rather than shrinking three images into one narrow row. The restored headline reads “A bigger world. A smarter way to move.” Actions lead to the product range and restored demonstration videos. Images retain their source proportions and use responsive CDN widths; only the featured image receives high fetch priority.

The restored video player uses a named native dialog with keyboard Escape, focus containment and focus return. Media loads only after a customer chooses a video. Edition-selection copy now points to the product page.

The production build, all 222 existing tests, changed-source lint and TypeScript checks pass. This update changes presentation and content; the previously audited checkout, VAT and SEO fixes remain. Hosted visual verification is still unavailable because Shopify blocks the testing browser; no further challenge attempts or alternate access routes were used. Review the new layout in the Oxygen preview before production approval.

## Transparent hero photography — 8 September 2026

The user approved direct background removal from the original product photographs after the image editor returned opaque chequered backgrounds. Those generated images are not used. The M4B and M4 Pro hero photos now have actual transparent alpha, including the large openings through their frames. The M4 Pro's original studio-floor shadow was removed. The existing transparent X12 photograph was retained.

The hero uses bundled WebP cut-outs at 360px and 720px widths, accurate intrinsic dimensions, and responsive image selection. It no longer uses the opaque Shopify featured images or blend-mode simulation for its artwork. Product links still resolve from the Shopify product data. Total image sizes are approximately 75 KiB for the smaller three exports and 193 KiB for the larger three. Styling adds subtle contact shadows and refines the shared background, label size and spacing; the larger mobile arrangement remains.

Original source photographs (the query requests a maximum width; M4 Pro's actual original remains 667 × 667):

- M4B: https://cdn.shopify.com/s/files/1/0904/4541/4778/files/M4B.png?width=1200
- M4 Pro: https://cdn.shopify.com/s/files/1/0904/4541/4778/files/xsto-m4-pro-mobility-wheelchair-adjustable-seat-backrest-9425362.jpg?width=1200
- X12: https://cdn.shopify.com/s/files/1/0904/4541/4778/files/x12-optional-supports.webp?width=1200

Preparation is recorded in scripts/prepare-hero-cutouts.py. It uses the approved original photos, background masking, edge decontamination and resizing, with no generative reconstruction of the products. Its M4 Pro floor mask is specific to the recorded source size. The exported alpha channels and transparent corners were checked, and the cut-outs were visually inspected against pale-blue and navy backgrounds.

The production build, TypeScript and changed-source lint pass, and all 222 existing tests pass. Shopify still blocks hosted browser verification, so the image checks are asset checks, not a live-page or checkout sign-off. This update remains on the review branch and Oxygen preview.

## Mobile homepage refinement — 8 September 2026

The source and responsive-style audit found three consecutive presentations of the same chairs on phones: the three-product hero, the four-model shopping grid and four full-size video cards. The mobile homepage now starts with a shorter introduction and presents the range once as the main shopping grid. Desktop keeps its photographic hero and all the restored homepage sections. A desktop-only picture source avoids downloading the hidden hero photographs on phones.

The range retains two columns down to 320px, equal image areas and uncropped photographs. Each card is one labelled link with a concise mobile description, larger price/VAT text and a single “View model” action. Both VAT-inclusive prices and eligibility wording remain. Small duplicate badges and repeated model names in links are removed on phones.

Buyer guides and videos become compact, full-row controls on phones; all three guides and four videos remain accessible. Support copy uses smaller headings and closer spacing. The local review fallback shows two reviews initially with an explicit button for the remaining four; desktop still shows all six. The configured Judge.me carousel is unchanged. Mobile search moves to a prominent link at the top of the menu, leaving menu and basket controls alongside the existing wordmark. Header controls retain 44px touch targets.

The purchase/accessory CSS was also reviewed: large optional-accessory photographs, selection disclosures, combined totals and the conditional sticky purchase button remain in place. This pass makes no checkout or product-price calculation changes.

Validation: all 222 existing tests pass, along with the production build, TypeScript and changed-source lint. Hosted phone rendering and real checkout remain unverified because of the previously recorded browser access block. This is a source-based mobile audit and a review preview, not a live-device or checkout sign-off.

## Complete navy-and-red storefront — 9 September 2026

The user selected navy and red for brand continuity and requested that the entire storefront follow it. The earlier colour comparison changed the shell and homepage but missed the independently styled product and discovery routes. Those styles now consume shared `--mr-*` colour tokens in `app/styles/app.css`; primary actions, hover states, focus outlines and selection controls follow the same red palette.

| Area | Colour coverage |
| --- | --- |
| Homepage, header, footer | Current video hero retained; navy/red wordmark, links, calls to action and compact footer |
| Four chair pages and accessories | Gallery selection, product headings, add-to-basket buttons, radio/checkbox selections, optional extras, VAT controls, related products and mobile purchase bar |
| Shop and search | Shared palette, catalogue stock labels and product links |
| Compare, buyer guides, support and international enquiries | Separate discovery stylesheet converted, including tables, numbered steps, sidebars and demonstration buttons |
| About, contact, demo, quote, FAQ, videos and policy pages | Shared theme and shell colours; dedicated about-page styles converted |
| Basket and account pages | Shared theme, checkout-link gradient, feedback and deposit labels |
| Dealer finder | Red CSS map pins replace the default blue marker images; selection, zoom and popups retain their existing behaviour |
| Reviews | Local stars use the red theme; Judge.me widget stars have a scoped colour override, based on the vendor's documented `.jdgm-star` selector |
| Browser and saved-site branding | Navy theme colour, navy/red SVG favicon, matching PNG/ICO exports, and current lowercase metadata wordmark |

The source scan found no remaining electric-blue/amber brand hex values or blue/amber/orange Tailwind utility colours in the storefront source. Legacy token names such as `gold` remain aliases for red to preserve component compatibility. Product colour names, authentic photography, payment-provider logos and semantic success/error colours retain their meaning.

The old Apple home-screen icon still displayed XSTO. It has been replaced with a PNG rendering of the Mobility Robot SVG favicon, with a matching ICO fallback and an explicit versioned Apple icon link. PNG/ICO exports are format conversions of the SVG; no generated product imagery is involved. The icon and metadata wordmark exports were visually inspected.

Validation: production build, TypeScript, changed-source lint and all 222 existing tests pass. Primary text/button colour pairs meet a 4.5:1 contrast ratio. Source and stylesheet inspection covers the page families above; Shopify's previously recorded access block still prevents hosted visual/playback verification. Shopify-hosted checkout, account authentication screens and external app settings are separate from these storefront styles and were not changed. No orders, payments, enquiry emails or production deployment were made.

Judge.me reference: https://judge.me/help/en/articles/8415813-customizing-the-reviews-carousel . Scoped storefront CSS is used; external review settings were not edited.

## Verified awards and approved production release — 9 September 2026

The user approved making the navy/red storefront live and requested product awards beneath the homepage video. `AwardsStrip` now sits directly after the video hero. A restrained grey background, navy type and red accents match the approved palette. Three linked winner records sit alongside an explicit **XSTO M4** heading; on phones they become compact full-width rows with 48px minimum touch targets. The text is rendered in the homepage HTML, with no extra image downloads or carousel script.

| Model | Award | Year | Primary winner record |
| --- | --- | --- | --- |
| XSTO M4 | Red Dot Award: Product Design | 2025 | https://www.red-dot.org/project/xsto-mobility-robot-81361 |
| XSTO M4 | iF Design Award: Product Design | 2025 | https://ifdesign.com/en/winner-ranking/project/xsto-mobility-robot/680124 |
| XSTO M4 | Good Design Award, Japan; award no. 25G020123 | 2025 | https://www.g-mark.org/en/gallery/winners/33173?years=2025 |

The award organisers list the entry as “XSTO Mobility Robot”. Manufacturer announcements explicitly identify it as the M4 and establish the year: https://www.xstomobility.com/blogs/news/xsto-mobility-robot-claims-both-if-and-red-dot-design-awards (13 June 2025) and https://www.xstomobility.com/blogs/news/xsto-wins-japans-g-mark-award-sweeping-the-global-design-oscars (17 October 2025). The iF winner entry was confirmed in its indexed official search result; direct retrieval returned 403. Good Design's indexed official result supplies the award number/year and manufacturer; its directly retrieved page omits the dynamic entry content. Red Dot's full winner page and both manufacturer announcements were readable. No award is attributed to the X12, M4B or M4 Pro. No award logos have been recreated or additional certification claims added.

The current production contact-form spam fix, commit `a304ef9050209ba232658d7cd8191f74f6e4c5b9` from PR #56, is incorporated into this release before validation. TypeScript identified missing narrowing of the unknown request body and two test typing issues in that commit. The honeypot now explicitly checks for an object and the property before reading it; the tests use typed header records and a structural response assertion. Existing rejection and genuine-enquiry behaviour is preserved.

Validation: the production build and all 238 tests across 32 files pass; after the typing correction, TypeScript, changed-source lint and the 16 form-action tests pass. Build output retains the existing non-blocking Hydrogen bundle-analyser and future-flag warnings. Production publication uses the existing PR #55 merge and main-branch Oxygen workflow. This explicit release approval supersedes the earlier preview-only status; no DNS or domain changes are required. Hosted visual/playback and real-payment checkout checks remain limited by the previously documented browser access block.
