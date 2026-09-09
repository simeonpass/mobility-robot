import {Link} from 'react-router';
import {JsonLd} from '~/components/content/PageShell';
import {breadcrumbJsonLd} from '~/lib/seo';

type ProductBreadcrumbsProps = {
  title: string;
};

export function ProductBreadcrumbs({title}: ProductBreadcrumbsProps) {
  const items = [
    {name: 'Home', path: '/'},
    {name: 'Shop', path: '/collections/all'},
    {name: title},
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav aria-label="Breadcrumb" className="mr-product-breadcrumbs text-slate">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link className="transition-colors hover:text-navy" prefetch="intent" to="/">
            Home
          </Link>
        </li>
        <li aria-hidden className="text-border">
          /
        </li>
        <li>
          <Link
            className="transition-colors hover:text-navy"
            prefetch="intent"
            to="/collections/all"
          >
            Shop
          </Link>
        </li>
        <li aria-hidden className="text-border">
          /
        </li>
        <li aria-current="page" className="font-medium text-navy">
          {title}
        </li>
      </ol>
    </nav>
    </>
  );
}
