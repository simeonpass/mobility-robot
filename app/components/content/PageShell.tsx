import type {ReactNode} from 'react';
import {Link} from 'react-router';
import {type BreadcrumbItem, breadcrumbJsonLd} from '~/lib/seo';

export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}) {
  return (
    <script
      dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
      type="application/ld+json"
    />
  );
}

export function PageShell({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`xsto-container py-8 md:py-12 ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
}: {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
}) {
  return (
    <header className="mb-8 max-w-3xl">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <>
          <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
          <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-2">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li className="flex items-center gap-2" key={`${crumb.name}-${index}`}>
                    {index > 0 ? <span aria-hidden>/</span> : null}
                    {crumb.path && !isLast ? (
                      <Link className="hover:text-gold" prefetch="intent" to={crumb.path}>
                        {crumb.name}
                      </Link>
                    ) : (
                      <span
                        aria-current={isLast ? 'page' : undefined}
                        className={isLast ? 'font-medium text-foreground' : undefined}
                      >
                        {crumb.name}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </>
      ) : null}
      <h1 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h1>
      {description ? (
        <p className="mt-3 text-lg text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}
