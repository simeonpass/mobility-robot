import type {LoaderFunctionArgs} from 'react-router';
import {loader as productFeedLoader} from './feeds.google-products[.txt]';

/**
 * Scheduled Merchant Center supplement for headless landing-page links.
 * Keep prices and availability under the Shopify primary feed's control.
 * The existing product feed also publishes conditional VAT-relief prices,
 * which must not overwrite the standard prices in the primary feed.
 */
export async function loader(args: LoaderFunctionArgs) {
  const response = await productFeedLoader(args);
  if (!response.ok) return response;

  const lines = (await response.text()).trimEnd().split('\n');
  const columns = lines.shift()?.split('\t') ?? [];
  const idIndex = columns.indexOf('id');
  const linkIndex = columns.indexOf('link');
  if (idIndex < 0 || linkIndex < 0) {
    throw new Response('Product link feed schema unavailable', {status: 503});
  }

  const rows = lines.filter(Boolean).map((line) => {
    const values = line.split('\t');
    return `${values[idIndex]}\t${values[linkIndex]}`;
  });
  const headers = new Headers(response.headers);
  headers.delete('Content-Length');
  return new Response(`id\tlink\n${rows.join('\n')}\n`, {headers});
}
