# Premium footer and consistency review — 5 October 2026

## Changes

- Rebuilt the shared footer as a light, warm-neutral surface using the existing ink-navy palette and full XSTO/Bentech joint logo.
- Balanced the links into product range, buying advice and support groups. Retained native mobile accordions, legal information, distributor/safety notices and payment information.
- Integrated the existing newsletter form with clear labelling, privacy information and loading/success/error states. No subscription was submitted during verification.
- Restored visible underlines on inline links and labelled the off-panel close control.
- Hid the third-party chat launcher while a menu, basket or search panel is open, so it cannot cover those controls.
- Standardised the display of the existing phone number to 020 8050 4849; telephone destinations are unchanged.
- Corrected crossed-out comparison pricing to use the same VAT variant as the headline price. Actual catalogue, basket and checkout prices were not changed.

## Verification before publication

- Production build and TypeScript checks passed.
- 44 test files / 323 tests passed, including seven footer tests and four additional VAT comparison tests.
- Checked 30 public routes at desktop width and 11 key routes at mobile width using the new compiled CSS and server-rendered footer in an isolated browser preview.
- Inspected the footer at desktop, tablet and mobile sizes, including expanded mobile sections.
- No horizontal overflow or broken images detected on the audited views.
- Checked 74 internal destinations: no failed URLs; expected account-login and retired-product redirects remain intact.
- Verified the floating chat launcher is hidden when the mobile menu is open.
- Reviewed WCAG A/AA automated results and repaired inline-link identification issues. Automated checks do not substitute for a complete manual accessibility assessment.

## Separate follow-up work

- Shopify Inbox's injected chat launcher reports an `aria-valid-attr-value` warning: its `aria-controls="chat-ui"` references an element not present in the launcher iframe. The storefront does not own that injected markup. Do not patch vendor internals as part of this visual change.
- A read-only production dependency audit reported 11 advisories (4 high, 6 moderate, 1 low; no critical). A coordinated framework/dependency update and regression test is needed. No automatic audit-fix or dependency upgrades were applied during this design pass. An advisory alone does not establish that a deployed feature is exploitable.
- Payment completion, live newsletter delivery, account authentication and every possible product/variant combination were not exercised. No real orders or subscriptions were created.

Publishing should be followed by live desktop/mobile smoke checks, verification of the M4B comparison price, and checks that the footer accordions and mobile panels behave correctly without preview overrides.
