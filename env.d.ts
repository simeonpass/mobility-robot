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
    /** Numeric Shopify shop ID for Shop Chat widget */
    PUBLIC_SHOP_ID?: string;
  }
}

export {};
