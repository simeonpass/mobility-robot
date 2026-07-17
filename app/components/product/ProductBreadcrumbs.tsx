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
      <nav aria-label="Breadcrumb" className="mb-8 text-xs text-muted-foreground md:mb-10">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link className="hover:text-gold" prefetch="intent" to="/">
            Home
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li>
          <Link className="hover:text-gold" prefetch="intent" to="/#product-range">
            Wheelchairs
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li aria-current="page" className="font-medium text-foreground">
          {title}
        </li>
      </ol>
    </nav>
    </>
  );
}
