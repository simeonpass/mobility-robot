# Mobility Robot storefront quality audit — 8 September 2026

The review branch now fixes several confirmed basket and technical SEO defects. Automated checks pass. A completed Shopify checkout and a visual review on real phones are still needed before production approval.

## Scope and evidence

The audit covered the storefront's 61 route modules through source inventory and cross-site checks, with detailed inspection of the product, accessory, basket, VAT, checkout handoff, navigation, account and SEO implementations. Static image/favicon references and the four linked product PDFs exist locally. This was a source audit, not a successful live crawl or a visual inspection of every rendered page.

The earlier Shopify account-access attempt remained blocked by Cloudflare. An isolated browser visual test had also been rejected by the browser URL policy. Neither was bypassed or retried through an alternate route. The public web reader could not retrieve the live robots.txt or sitemap.xml during this audit. No test order, payment, customer mutation, VAT registration or enquiry submission was made against the connected store.

## Confirmed problems fixed

| Area | Problem | Result |
| --- | --- | --- |
| Basket errors | The installed Hydrogen API returns business validation failures in `userErrors`, while the action only read `errors`. | Both error forms and Shopify warnings are preserved and displayed. |
| VAT synchronization | A subsequent buyer-email update could overwrite an earlier stock or accessory failure with an empty error list. | Original errors survive synchronization; rejected email updates remain visible. |
| Failed additions | The add button and basket drawer did not show returned errors. | Feedback appears beside the purchase control and in the basket, including an otherwise empty basket. |
| VAT form | Failed updates could keep the form open without explaining the failure. | The form shows the failure and only completes after a response with no errors or warnings. |
| Discount codes | Remove resubmitted the currently applied codes. | Remove submits an empty code list; unusable codes receive feedback. |
| Checkout timing | Only optimistic line updates disabled checkout; discount and other cart mutations could still be pending. | Checkout becomes a disabled button until cart updates finish, so its old URL cannot be opened during the update. |
| Promotion and basket links | Promotion redirects could lose existing query parameters; malformed basket links reached Shopify; direct links ignored user errors. | Local redirects preserve parameters, unsafe destinations are rejected, quantities are validated and user errors are checked. |
| X12 selection | Local selection state could diverge from the URL; Pro selection still published the standard product's offer. | The displayed edition follows the URL and its offer uses the matching edition, SKU and public price. |
| Availability | Available-for-sale back-order items were always marked InStock in Product data. | Search data uses the same delivery status as the storefront. |
| Price data | Missing price information produced a zero-price offer; legacy net prices could differ from the displayed gross price. | Offers require a usable positive price and use the public VAT-inclusive display calculation. Conditional VAT-relief prices remain visible on the product page. |
| Sitemaps | Hydrogen's default resource list could emit unsupported `/articles` and metaobject routes. Redirected page aliases remained in child sitemaps. | Only supported resource types are advertised; aliases are filtered; blog articles use `/blog/:handle` and paginate beyond the first 250. |
| Metadata | Custom product images inherited the default landscape dimensions; some branded titles repeated the brand. | Dimensions are only emitted when known, and branded titles are kept without duplication. |
| Account pages | Child route metadata replaced the parent's noindex metadata. | Profile, addresses, order list and order detail explicitly retain noindex. |
| Structured data | Text containing a closing script tag could break JSON-LD. | Serialized data escapes `<` while preserving the original JSON value. |
| Brand identity | A few fallbacks described an official XSTO store or invented an XSTO Team author. | Distributor wording identifies Mobility Robot/Bentech Medical; missing article authors reference the seller organization. |

Product availability values, prices and selected-variant URLs were checked against [Google's merchant listing documentation](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing). No reviews, ratings, stock quantities, return terms or shipping promises were invented for structured data.

## Verification

- Full suite: 222 tests across 31 files passed. This includes the previous accessories, VAT, deposits, market, redirect and pricing regressions, plus new cart-action, checkout-control, product-offer and sitemap tests.
- The relocated route tests and final checkout control were rerun: 14 tests passed. Tests live outside the route directory so they cannot become public pages.
- Production client/server build and route type generation pass. TypeScript passes. The optional bundle-analysis metafile warning remains non-blocking.
- Changed production-source lint and whitespace checks pass. Existing lint findings in unchanged cookie controls, payment/edition controls, video captions and the external review-widget declaration are not a clean sitewide accessibility sign-off. Video caption content needs a content review; no dummy captions were added.
- Checkout tests use controlled Shopify response fixtures and rendered components. They verify error handling, cookies, redirects and pending-state behaviour, not an actual payment, delivery quote, tax calculation or order email.

## Remaining launch checks

1. Open the new Oxygen preview on a phone and desktop. Check navigation, search, all four chairs, X12 Pro selection, gallery, accessories, colour choices, removal/quantity changes and both basket layouts.
2. With an authorised test account and agreed test payment method, verify standard and VAT-relief purchases, a chair with accessories, discount apply/remove, delivery postcode pricing, payment success/failure and the confirmation email. Verify deposits only where a live Shopify selling plan is offered. Confirm the final Shopify total matches the advertised selection.
3. Confirm the actual stock, lead times, territory, warranty and returns terms. Product and delivery content could not be checked against live Shopify administration in this session.
4. After production approval, inspect real canonical URLs, robots.txt, sitemap.xml and Product data in Google Search Console/Rich Results Test; measure mobile performance and verify conversion tracking. The preview correctly remains noindex and cannot establish production rankings. Google advises monitoring the relevant reports after release in its [structured data verification guidance](https://developers.google.com/search/docs/appearance/structured-data/product-snippet#monitor).

This work updates the existing draft review branch and Oxygen preview. Production, domains and DNS are unchanged.
