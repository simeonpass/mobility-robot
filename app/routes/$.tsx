import {data, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/$';
import {PageShell} from '~/components/content/PageShell';
import {NOINDEX_HEADERS, noindexMeta} from '~/lib/seo';
import {SHOPIFY_HOME_PRODUCT_HANDLES} from '~/lib/homepage-data';

export const meta: Route.MetaFunction = () =>
  noindexMeta({
    title: 'Page Not Found',
    description: 'The page you requested could not be found on xsto.co.uk.',
    path: '/404',
  });

export const headers: Route.HeadersFunction = () => NOINDEX_HEADERS;

export async function loader({request}: Route.LoaderArgs) {
  const pathname = new URL(request.url).pathname;
  return data({pathname}, {status: 404, headers: NOINDEX_HEADERS});
}

export default function NotFoundPage() {
  const {pathname} = useLoaderData<typeof loader>();

  return (
    <PageShell className="max-w-2xl text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        404
      </p>
      <h1 className="mt-2 text-3xl font-bold text-foreground">Page not found</h1>
      <p className="mt-3 text-muted-foreground">
        We couldn&apos;t find <strong>{pathname}</strong>. Try searching or browse
        our wheelchairs below.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link className="btn-atc" to="/">
          Homepage
        </Link>
        <Link className="btn-secondary" to="/search">
          Search
        </Link>
      </div>
      <div className="mt-10 text-left">
        <h2 className="text-lg font-semibold text-foreground">Popular products</h2>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <Link
              className="text-gold hover:underline"
              to={`/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4']}`}
            >
              XSTO M4
            </Link>
          </li>
          <li>
            <Link
              className="text-gold hover:underline"
              to={`/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4-pro']}`}
            >
              XSTO M4 Pro
            </Link>
          </li>
          <li>
            <Link className="text-gold hover:underline" to="/stockists">
              Find a stockist
            </Link>
          </li>
          <li>
            <Link className="text-gold hover:underline" to="/faq">
              FAQ
            </Link>
          </li>
        </ul>
      </div>
    </PageShell>
  );
}
