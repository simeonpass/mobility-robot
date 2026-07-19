# Judge.me on Hydrogen (Oxygen)

This storefront uses an **Oxygen-safe** Judge.me integration (custom preloader —
not the buggy official `installed.js` path).

## 1. Shopify Admin

1. Install **Judge.me Product Reviews** from the Shopify App Store.
2. Open Judge.me → **Settings → Technical** (or Widgets → Platform independent).
3. Copy:
   - **Shop domain** (usually `f7vjea-hq.myshopify.com`)
   - **Public token**
4. Plan: **Awesome** (or higher) is required for platform-independent widgets on Hydrogen.
5. Import your Lovable reviews CSV in Judge.me → **Import reviews**.

## 2. Environment variables

Local `.env` and Oxygen (Hydrogen storefront → Environments → Production):

```bash
JUDGEME_SHOP_DOMAIN=f7vjea-hq.myshopify.com
JUDGEME_PUBLIC_TOKEN=paste_public_token_here
JUDGEME_CDN_HOST=https://cdn.judge.me
```

`PUBLIC_STORE_DOMAIN` is used as a fallback for the shop domain if `JUDGEME_SHOP_DOMAIN` is empty.

Redeploy after setting Oxygen vars (push to `main`, or “Publish” in Admin).

## 3. What the code does

- `JudgemeBootstrap` in `root.tsx` loads `widget_preloader.js`
- Homepage: Judge.me carousel when configured (else static Lovable reviews)
- PDP: preview badge + full review widget when configured (else static reviews)
- CSP already allows `cdn.judge.me` / `judge.me`

## 4. Verify

1. Accept cookies if your banner is showing (not required for Judge.me itself).
2. Open `/` — carousel should populate after a short delay.
3. Open `/products/buy-robot-wheelchair` — stars under the title + review widget below specs.
4. If widgets stay empty: check token, Awesome plan, and browser console CSP errors.
