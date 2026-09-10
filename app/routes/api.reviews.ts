import type {Route} from './+types/api.reviews';
import {data} from 'react-router';
import {getReviewsForProduct} from '~/lib/reviews.server';

export async function loader({request}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const handle = url.searchParams.get('product') ?? '';
  const requested = Number(url.searchParams.get('limit') ?? 8);
  const limit = Number.isFinite(requested)
    ? Math.max(8, Math.min(400, Math.floor(requested)))
    : 8;
  return data({handle, reviews: getReviewsForProduct(handle).slice(0, limit)}, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'X-Robots-Tag': 'noindex',
    },
  });
}
