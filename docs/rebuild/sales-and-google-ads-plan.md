# Sales audit and Google Ads plan

**Site:** https://mobilityrobot.co.uk  
**Date:** 18 September 2026  
**Products:** XSTO M4 (£3,500 / £4,200), M4B (£3,750 / £4,500), M4 Pro (£4,500 / £5,400), X12 (£12,500 / £15,000)

This is a high-ticket mobility sale, not a typical Shopify add-to-cart business. Most buyers need a demonstration, VAT-relief help, or a phone conversation before they spend £3,500–£15,000. The storefront is stronger than the measurement and acquisition setup around it.

---

## Where sales are leaking

### 1. Ads cannot learn what a sale looks like

The storefront already sends `view_item`, `add_to_cart` and `begin_checkout` to GA4 after cookie consent. It did **not** send the events that matter for this catalogue:

| Event | Why it matters | Status before this work |
| --- | --- | --- |
| `generate_lead` on `/demo` | Primary conversion for a £3.5k–£15k chair | Missing |
| `generate_lead` on `/quote` and `/contact` | Trade and sales enquiries | Missing |
| Google Ads `AW-` conversion tag | Needed to bid on leads, not just clicks | Missing |
| `purchase` | Checkout is hosted by Shopify, so Hydrogen never sees the order | Still missing — Shopify admin work |

Without lead conversions, Google Ads optimises for clicks. Clicks on “stair climbing wheelchair” are expensive and mostly window-shopping. That is the main reason paid traffic will not pay for itself today.

Checkout sits on Shopify’s domain. Hydrogen `begin_checkout` is not a sale. Purchase tracking has to be added in **Shopify → Settings → Customer events** (or the Google & YouTube channel), not only in this repo.

### 2. The homepage asked people to browse, not to buy or book

The first screen led with the £12,500 X12 (“Meet the X12”) and “Explore the range”. For this price point the first action should be a demonstration. Book-a-demo lived in the header and at the bottom of the page — after awards, story, videos and reviews.

This change makes **Book a demo** the primary hero action and **Explore the range** the secondary one.

### 3. Three names compete in every ad auction

Shoppers search **XSTO**. The legal seller is **Bentech Medical**. The public domain is **mobilityrobot.co.uk**. That split hurts:

- Quality Score and ad relevance (“XSTO wheelchair” landing on a Mobility Robot URL)
- Trust on the first visit
- Brand bidding (you must own `XSTO wheelchair` and `XSTO M4` or a reseller will)

Keep XSTO in titles, ads and the first heading. Use Mobility Robot / Bentech as the UK support line, not the keyword.

### 4. Google Shopping will get disapproved if you advertise the VAT-relief price

`/feeds/google-products.txt` currently publishes **£3,500** for the M4. The product page’s default checkout total is **£4,200 including VAT** until the shopper completes a VAT declaration.

Google’s shopping policy is that the advertised price must match the price a typical visitor can check out at. Advertising £3,500 while checkout is £4,200 is a common disapproval. The safer feed is **VAT-inclusive public prices**, with VAT relief explained on the page — which the storefront already does.

Use `/feeds/google-links.txt` as the Hydrogen **link** supplement. Do **not** use `google-products.txt` as a price override against Shopify’s primary feed.

### 5. The Shopping catalogue is noisy

The live feed includes every accessory **and** leftover handles such as `ergonomic-chairs-for-back-support` and `buy-robot-wheelchair`. Shopping campaigns that advertise cup holders and cushions next to £12,500 chairs waste budget and dilute conversion rate.

Shopping / Performance Max should include **only the four chairs** (plus maybe the travel battery) until the chair campaigns are profitable.

### 6. Product URLs are not built for ads

The M4 still lives at `/products/buy-robot-wheelchair`. That URL is leftover catalogue copy. It does not match how people search and it looks untrustworthy in an ad. Keep the 301 from `/products/xsto-m4`, but the public handle should eventually be `xsto-m4`.

### 7. Brand search is unprotected

If you are not running a small exact-match campaign on `xsto`, `xsto wheelchair`, `xsto m4`, `xsto m4 pro`, `xsto x12`, anyone else can. For a £3,500+ product this is usually the first paid campaign, not Shopping.

---

## What this storefront change does

Code in this branch:

1. Sends GA4 `generate_lead` when a real demo, quote or contact form is delivered (honeypot spam is marked `ignored` and is not counted).
2. Loads a Google Ads tag when marketing cookies are accepted, and fires an Ads conversion if `PUBLIC_GOOGLE_ADS_ID` and `PUBLIC_GOOGLE_ADS_LEAD_LABEL` are set.
3. Records `phone_click` on the main `tel:` links so calls can be a secondary conversion.
4. Puts **Book a demo** first on the homepage and on the product page.

You still need to finish the Google Ads / Shopify admin steps below. The website cannot create the Ads account, Merchant Center feed mapping, or Shopify checkout purchase pixel by itself.

---

## Google advertising plan

### Do this in order

1. **Measure** (this week)  
   Link GA4 `G-QMXNFNFTS0` to a Google Ads account. Import `generate_lead` as the primary conversion. Add the Shopify Google & YouTube / checkout pixel so `purchase` is recorded. Set Oxygen env `PUBLIC_GOOGLE_ADS_ID` and `PUBLIC_GOOGLE_ADS_LEAD_LABEL` once the Ads conversion action exists.

2. **Protect brand** (week 1, small budget)  
   Exact/phrase Search campaign: `xsto`, `xsto wheelchair`, `xsto m4`, `xsto m4 pro`, `xsto m4b`, `xsto x12`, `mobility robot wheelchair`.  
   Landing pages: M4 PDP for M4 terms, X12 PDP for X12 terms, homepage or `/demo` for generic brand.  
   This is usually the cheapest qualified traffic you will ever buy.

3. **High-intent Search** (week 2, once leads are recording)  
   Separate ad groups, not one pile of keywords:

   | Ad group | Example terms | Land on |
   | --- | --- | --- |
   | Self-levelling | self balancing wheelchair, self levelling wheelchair UK | M4 |
   | Folding powerchair | folding electric wheelchair UK, portable power wheelchair | M4 / M4B |
   | VAT relief | VAT free wheelchair, VAT relief mobility scooter / wheelchair | `/vat-relief` or M4 with VAT copy |
   | Stair climber | stair climbing wheelchair UK, wheelchair that climbs stairs | X12 |
   | Demo | wheelchair demonstration UK, try wheelchair before buying | `/demo` |

   Bid for **demo bookings**, not purchases, until you have 30+ leads and know the close rate.

4. **Shopping / Performance Max** (only after the feed is clean)  
   - Primary Shopify Merchant Center feed = VAT-inclusive prices and in-stock chairs.  
   - Supplemental Hydrogen feed = `/feeds/google-links.txt` only.  
   - Exclude accessories and VAT-relief SKUs from the campaign.  
   - Asset group 1: M4 + M4B. Asset group 2: M4 Pro. Asset group 3: X12 (higher CPA target).  
   - If Google still has no purchase signal, give PMax the `generate_lead` conversion with a realistic lead value (see below).

5. **Remarketing** (once the tag has users)  
   30–90 day visitors who saw a chair but did not book. Creative: demo + VAT relief + 4.8/369 reviews. Exclude converters.

Skip Display “awareness” and broad Performance Max until Search is profitable. This catalogue is too expensive to train Google on random UK traffic.

### Budgets and targets (starting point, not a forecast)

These products can support a high cost per lead if the close rate is real.

Assume a conservative 15% demo-to-order rate on M4/M4B and 8% on X12:

| Campaign | Daily budget to start | Pause if |
| --- | --- | --- |
| Brand Search | £20–£40 | Irrelevant queries slip in |
| Non-brand Search | £40–£80 | Cost/lead > £250 with no sales after 20 leads |
| Shopping / PMax chairs only | £30–£50 | Feed disapprovals or CPA > 15% of chair price |

Lead value to send Google (optional but useful):  
`average order value × close rate`. Example for M4: £4,200 × 15% ≈ **£630** per qualified demo. That stops Google treating a demo like a £1 newsletter signup.

### Ad copy rules

- Headline 1: the model (`XSTO M4 wheelchair`).
- Headline 2: the UK proof (`Official UK distributor` or `VAT relief if eligible`).
- Headline 3: the action (`Book a free demo` / `In stock, UK delivery`).
- Do not lead with “Mobility Robot” on XSTO queries.
- Do not promise VAT-free checkout in Shopping if the landing price is VAT-inclusive.
- Healthcare: mobility equipment is allowed; do not claim it treats or cures a condition. Stick to features, VAT relief, warranty, demo.

### Landing-page pairing

Never send all ads to the homepage. Match query → page:

- Brand / model → that PDP  
- “try before you buy” → `/demo`  
- “VAT free wheelchair” → `/vat-relief` plus a chair CTA  
- Trade / bulk → `/quote`

The demo page already says Dorset or London. Use that in ad extensions (callout + location) so you do not pay for nationwide demo intent you cannot serve quickly. Add sitelinks: VAT relief, Compare, Stockists, Warranty.

---

## Other ways to sell these chairs

Paid search will not be the whole business. In order of likely return:

1. **Answer every demo/quote lead the same day.** The form already promises one business day. For this AOV, same-day phone follow-up is the conversion rate work.
2. **Own YouTube and Google’s video shelf.** The M4/X12 films already exist. YouTube search for “XSTO M4” and “stair climbing wheelchair” is cheaper than Shopping and matches how this product is chosen.
3. **Dealer / stockist channel.** `/stockists` is a sales team. Give dealers a unique discount code and a demo-booking link so you can see who closes.
4. **Judge.me 4.8 from 369 reviews** should appear in ads (seller ratings) and in Merchant Center. Confirm the Google review feed is connected.
5. **Occupational therapists, case managers, motability-style referrers.** `/quote` is the page; it needs a dedicated Search ad group and a PDF spec sheet, not just the consumer PDP.
6. **Do not buy generic “mobility scooter” traffic.** Wrong product, high bounce, policy risk.

---

## Merchant admin checklist

Storefront code cannot do these:

- [ ] Google Ads account linked to GA4 `G-QMXNFNFTS0`
- [ ] Mark `generate_lead` as a primary conversion; `add_to_cart` and `begin_checkout` as secondary
- [ ] Create a Google Ads “Lead — demo/quote/contact” conversion, then set Oxygen `PUBLIC_GOOGLE_ADS_ID` and `PUBLIC_GOOGLE_ADS_LEAD_LABEL`
- [ ] Shopify checkout purchase tracking (Google & YouTube channel or a custom pixel on thank-you)
- [ ] Merchant Center: chairs only; VAT-inclusive prices; Hydrogen **links** feed not price feed
- [ ] Call reporting: use the existing `020 8050 4849` as a call extension, or Google forwarding numbers if you want recorded call conversions
- [ ] Search Console + Merchant Center claimed for `mobilityrobot.co.uk`
- [ ] Rename the M4 handle from `buy-robot-wheelchair` when you next touch the catalogue

---

## What not to spend on yet

- Broad match “wheelchair” or “mobility aid”
- Shopping the full accessory catalogue
- Advertising VAT-relief prices in Merchant Center
- Performance Max with no conversion history
- A second brand campaign on “Mobility Robot” until XSTO brand is covered
