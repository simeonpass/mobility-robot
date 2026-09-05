import type {LoaderFunctionArgs} from 'react-router';
import {
  googleMerchantFeedRows,
  googleMerchantTsv,
} from '~/lib/google-merchant-feed';
import {SITE_URL} from '~/lib/const';

const PRODUCTS_QUERY = `#graphql
  query GoogleMerchantProducts($cursor: String) {
    products(first: 50, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        handle
        variants(first: 100) {
          nodes {
            id
            price {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
` as const;

type FeedProduct = {
  id: string;
  handle: string;
  variants?: {
    nodes?: Array<{
      id: string;
      price?: {amount: string; currencyCode: string} | null;
      selectedOptions?: Array<{name: string; value: string}> | null;
    } | null> | null;
  };
};

export async function loader({context: {storefront}}: LoaderFunctionArgs) {
  const products: FeedProduct[] = [];
  let cursor: string | null = null;
  let hasNext = true;

  while (hasNext) {
    const data = await storefront.query(PRODUCTS_QUERY, {
      variables: {cursor},
    });
    const connection = data?.products;
    products.push(...(connection?.nodes ?? []));
    hasNext = Boolean(connection?.pageInfo?.hasNextPage);
    cursor = connection?.pageInfo?.endCursor ?? null;
  }

  // Shopify catalog prices are currently VAT-inclusive. The Merchant feed
  // deliberately publishes the VAT-exempt / ex-VAT customer price instead.
  const body = googleMerchantTsv(
    googleMerchantFeedRows(products, SITE_URL, false),
  );

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/tab-separated-values; charset=utf-8',
      'Cache-Control': `max-age=${60 * 60}`,
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
