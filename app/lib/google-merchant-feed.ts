import {isHiddenStorefrontProductHandle} from '~/lib/homepage-data';
import {
  googleShoppingOfferId,
  storefrontProductUrl,
} from '~/lib/product-variant-url';
import {SITE_URL} from '~/lib/const';

export const GOOGLE_SHOPPING_FEED_COUNTRIES = ['ZZ', 'GB'] as const;

export type GoogleMerchantFeedProduct = {
  id: string;
  handle: string;
  variants?: {
    nodes?: Array<{id: string} | null> | null;
  } | null;
};

export type GoogleMerchantFeedRow = {
  id: string;
  link: string;
};

export function googleMerchantFeedRows(
  products: GoogleMerchantFeedProduct[],
  origin = SITE_URL,
): GoogleMerchantFeedRow[] {
  const rows: GoogleMerchantFeedRow[] = [];

  for (const product of products) {
    if (!product.handle || isHiddenStorefrontProductHandle(product.handle)) {
      continue;
    }
    for (const variant of product.variants?.nodes ?? []) {
      if (!variant?.id) continue;
      const path = storefrontProductUrl(product.handle, variant.id);
      const link = `${origin}${path}`;
      for (const country of GOOGLE_SHOPPING_FEED_COUNTRIES) {
        const id = googleShoppingOfferId(product.id, variant.id, country);
        if (id) rows.push({id, link});
      }
    }
  }

  return rows;
}

export function googleMerchantTsv(rows: GoogleMerchantFeedRow[]): string {
  const lines = ['id\tlink'];
  for (const row of rows) {
    lines.push(`${row.id}\t${row.link}`);
  }
  return `${lines.join('\n')}\n`;
}
