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
