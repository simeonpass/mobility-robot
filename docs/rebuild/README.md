# Hydrogen Rebuild Bundle

Everything you need to have your Hydrogen project's AI editor rebuild the XSTO storefront.

## Files

| File | Purpose |
| --- | --- |
| `00-MASTER-PROMPT.md` | The main paste-into-AI prompt (9 phases). |
| `design-tokens.css` | Exact HSL colours, gradients, shadows. |
| `dealers.json` | 17 authorised UK/IE stockists with lat/lng. |
| `redirects.csv` | Legacy → new URL 301 map. |
| `product-copy-productData.ts` | M4 / M4 Pro long copy + specs. |
| `product-copy-m4b.ts` | M4B new-product copy + specs. |
| `product-copy-x12.ts` | X12 copy + specs. |
| `product-copy-x12pro.ts` | X12 Pro copy + specs. |
| `product-faqs.ts` | Per-model FAQ entries. |

## Steps

1. On your Mac, open the Hydrogen project you created:
   ```bash
   cd mobility-robot
   mkdir -p docs/rebuild
   ```
2. Copy every file from this bundle into `docs/rebuild/`.
3. Open the folder in Cursor (or Claude Code / Copilot Workspace).
4. Open the AI chat panel and paste the full contents of `00-MASTER-PROMPT.md`.
5. Let it run Phase 1. Review, then tell it to continue with Phase 2. Repeat.
6. When it finishes Phase 9, run `npm run dev` and open http://localhost:3000 to verify.

## After the rebuild

- Deploy to Oxygen (Shopify admin → Hydrogen channel → deploy).
- Point **`mobilityrobot.co.uk`** DNS at Oxygen / Shopify and set it as the primary domain.
- Configure **`xsto.co.uk` → `mobilityrobot.co.uk` 301** (Shopify domain redirect or DNS). See `phase-8-deploy.md` domain cutover section.
- Until cutover, the previous Lovable site can keep serving `xsto.co.uk` — no downtime.
## Things the AI will need you to provide

- GA4 measurement ID (`G-…`).
- tawk.to property ID.
- YouTube video ID for the desktop hero.
- Mobile hero poster image (or ask it to generate one).

If it asks for a Storefront API token, it should read `PUBLIC_STOREFRONT_API_TOKEN` from Oxygen env — already injected by Hydrogen. No manual token setup needed.