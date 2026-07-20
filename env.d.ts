/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

import type {HydrogenEnv} from '@shopify/hydrogen';

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env extends HydrogenEnv {
    /** Custom app token with write_customers scope — enables VAT exempt customer sync */
    SHOPIFY_ADMIN_API_ACCESS_TOKEN?: string;
    /** Google Analytics 4 measurement ID (e.g. G-QMXNFNFTS0) */
    PUBLIC_GA4_ID?: string;
    /** Numeric Shopify shop ID (meta.json) */
    PUBLIC_SHOP_ID?: string;
    /** Inbox data-external-identifier from Liquid theme embed */
    PUBLIC_SHOPIFY_INBOX_EXTERNAL_ID?: string;
    /** Judge.me shop domain (defaults to PUBLIC_STORE_DOMAIN) */
    JUDGEME_SHOP_DOMAIN?: string;
    /** Judge.me public token — required to enable widgets */
    JUDGEME_PUBLIC_TOKEN?: string;
    /** Judge.me CDN host */
    JUDGEME_CDN_HOST?: string;
    /** Resend API key — preferred provider for form notification emails */
    RESEND_API_KEY?: string;
    /** Formspree form endpoint URL — used when Resend is not configured */
    FORMSPREE_ENDPOINT?: string;
    /** Inbox address for form notifications (default: sales@bentchmeduk.com) */
    FORMS_TO_EMAIL?: string;
    /** Verified Resend from address, e.g. "XSTO UK <noreply@mobilityrobot.co.uk>" */
    FORMS_FROM_EMAIL?: string;
  }
}

export {};
