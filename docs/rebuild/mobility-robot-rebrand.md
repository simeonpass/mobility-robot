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

## Validation

The final suite passed all 176 tests across 22 files; npx tsc --noEmit and npm run build both passed. Affected production-source ESLint passed with one existing hook dependency warning. Including test files in ESLint is blocked by the baseline Jest plugin configuration (this project uses Vitest); the changed notification test passes under Vitest. The build emits an optional bundle-analysis warning about a missing metafile, but client and server build successfully. Several baseline currency and feed-query TypeScript errors were resolved with type-only changes; generated Storefront query types were refreshed. Product purchase behavior was preserved in code review. No test orders, payments, customer account changes or enquiry emails were submitted.

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
