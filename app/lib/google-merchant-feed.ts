import {
  isMergedAwayProductHandle,
  isUkUnavailableProductHandle,
} from '~/lib/homepage-data';
import {
  googleShoppingOfferId,
  numericShopifyId,
  storefrontProductUrl,
} from '~/lib/product-variant-url';
import {catalogToExVatAmount} from '~/lib/pricing-mode';
import {isVatReliefVariant} from '~/lib/product-vat-variants';
import {
  getX12EditionValue,
  isX12CanonicalHandle,
  X12_EDITION_PRO_VALUE,
  x12MergedPath,
} from '~/lib/x12-lineup';
import {SITE_URL} from '~/lib/const';

export const GOOGLE_SHOPPING_FEED_COUNTRIES = ['ZZ', 'GB'] as const;

/**
 * VAT Relief variants are checkout-only price SKUs. They must never be
 * advertised as standalone Google offers because the public landing page
 * defaults back to the VAT-inclusive Standard variant until the customer
 * completes the VAT declaration.
 */
export const VAT_RELIEF_EXCLUDED_DESTINATIONS =
  'Shopping_ads,Display_ads,Free_listings,Youtube_affiliate,Youtube_merchandise';

type GoogleMerchantSelectedOption = {
  name: string;
  value: string;
};

type GoogleMerchantMoney = {
  amount: string;
  currencyCode: string;
};

export type GoogleMerchantFeedVariant = {
  id: string;
  price?: GoogleMerchantMoney | null;
  selectedOptions?: GoogleMerchantSelectedOption[] | null;
};

export type GoogleMerchantFeedProduct = {
  id: string;
  handle: string;
  variants?: {
    nodes?: Array<GoogleMerchantFeedVariant | null> | null;
  } | null;
};

export type GoogleMerchantFeedRow = {
  id: string;
  link: string;
  price?: string;
  excludedDestination?: string;
};

function googleMerchantLandingPath(
  productHandle: string,
  variant: GoogleMerchantFeedVariant,
): string {
  const mergedX12Pro = isMergedAwayProductHandle(productHandle);
  const x12ProEdition =
    isX12CanonicalHandle(productHandle) &&
    getX12EditionValue(variant.selectedOptions) === X12_EDITION_PRO_VALUE;

  if (mergedX12Pro || x12ProEdition) {
    const variantId = numericShopifyId(variant.id);
    const path = x12MergedPath('electric');
    return variantId ? `${path}&variant=${variantId}` : path;
  }

  return storefrontProductUrl(productHandle, variant.id);
}

function googleMerchantExVatPrice(
  variant: GoogleMerchantFeedVariant,
  shopifyPricesExVat: boolean,
): string | undefined {
  const amount = variant.price?.amount;
  const currencyCode = variant.price?.currencyCode;
  if (!amount || !currencyCode) return undefined;

  // VAT Relief variants are already net-price SKUs. Standard variants use the
  // catalog price converted to the customer's VAT-exempt / ex-VAT amount.
  const exVat = isVatReliefVariant(variant.selectedOptions)
    ? Number(amount)
    : catalogToExVatAmount(amount, shopifyPricesExVat);

  if (!Number.isFinite(exVat) || exVat <= 0) return undefined;
  return `${exVat.toFixed(2)} ${currencyCode}`;
}

export function googleMerchantFeedRows(
  products: GoogleMerchantFeedProduct[],
  origin = SITE_URL,
  shopifyPricesExVat = false,
): GoogleMerchantFeedRow[] {
  const rows: GoogleMerchantFeedRow[] = [];

  for (const product of products) {
    if (!product.handle || isUkUnavailableProductHandle(product.handle)) {
      continue;
    }

    for (const variant of product.variants?.nodes ?? []) {
      if (!variant?.id) continue;

      const link = `${origin}${googleMerchantLandingPath(product.handle, variant)}`;
      const price = googleMerchantExVatPrice(variant, shopifyPricesExVat);
      const excludedDestination = isVatReliefVariant(variant.selectedOptions)
        ? VAT_RELIEF_EXCLUDED_DESTINATIONS
        : undefined;

      for (const country of GOOGLE_SHOPPING_FEED_COUNTRIES) {
        const id = googleShoppingOfferId(product.id, variant.id, country);
        if (id) rows.push({id, link, price, excludedDestination});
      }
    }
  }

  return rows;
}

export function googleMerchantTsv(rows: GoogleMerchantFeedRow[]): string {
  const lines = ['id\tlink\tprice\texcluded_destination'];
  for (const row of rows) {
    lines.push(
      `${row.id}\t${row.link}\t${row.price ?? ''}\t${row.excludedDestination ?? ''}`,
    );
  }
  return `${lines.join('\n')}\n`;
}
