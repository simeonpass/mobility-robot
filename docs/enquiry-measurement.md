# Enquiry measurement

The storefront separates choosing an enquiry link from successfully sending a form.

| Event | Trigger | Parameters |
| --- | --- | --- |
| `enquiry_intent` | Click on an annotated demo or call link | `enquiry_action`, `placement`, optional `product_model` |
| `generate_lead` | Demo/contact endpoint confirms success | `form_name` |

Intent placements currently cover `home_mobile`, `product_summary`, `product_purchase`, and `product_mobile`. Model values are restricted to the supported demo models. No submitted name, email, telephone number, postcode, notes, or health information is sent with either event. Events require analytics consent; marketing-only consent does not qualify. A call click indicates intent, not a completed telephone conversation.

In GA4, use event-scoped custom dimensions for `enquiry_action`, `placement`, `product_model`, and `form_name` if they are not already registered. Compare `enquiry_intent` with `generate_lead` and product-page traffic over consistent date ranges. Completed leads do not currently include model attribution, so do not treat model-specific intent counts as model-specific completed leads.

Verification: unit tests cover consent, invalid/free-text dimensions, tracking failures, and recording confirmed leads once. Local browser checks with Google requests intercepted confirmed the queued intent event and model preselection. These checks do not establish ingestion into GA4 reports; confirm that separately in the property's Realtime/DebugView after release using consented traffic.

## Local preview

Link the existing Mobility Robot storefront and pull its environment into the worktree's ignored `.env`. Pass environment files to the Hydrogen command, not to the outer Node process. Do not commit environment files or include their contents in logs. The production environment has the checkout-domain setting; the Oxygen Preview environment previously reported it missing. Shopify documents the required configuration at https://shopify.dev/docs/storefronts/headless/hydrogen/analytics/consent.

## Rendering regression

The former inline font `<style>` rendered quote characters as HTML entities on the server. Style text is not HTML-decoded by the browser, so it differed from the client CSS and caused React to replace the server-rendered document. Font declarations now live in `app/styles/app.css`; font preload links remain in the root document. A fresh local browser no longer reports hydration failures after this change.
