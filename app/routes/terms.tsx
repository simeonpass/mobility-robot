import {Link} from 'react-router';
import type {Route} from './+types/terms';
import {ContentWithToc} from '~/components/content/ContentWithToc';
import {JsonLd, PageShell} from '~/components/content/PageShell';
import {termsSections} from '~/lib/content/legal';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: 'Terms & Conditions',
    description:
      'Terms of use and purchase for mobilityrobot.co.uk, operated by Bentech Medical Ltd, official UK XSTO distributor.',
    path: '/terms',
  });

export default function TermsPage() {
  return (
    <PageShell>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Terms & Conditions — Mobility Robot',
          description:
            'Terms and conditions for purchases from Bentech Medical Ltd.',
        }}
      />

      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-navy text-white">
        <div className="px-5 py-8 sm:px-8 md:px-10 md:py-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
            Legal
          </p>
          <h1 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            Terms &amp; conditions
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80">
            Please read these terms before using our website or placing an order.
            They apply to all purchases from Bentech Medical Ltd (Mobility Robot).
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
            <Link
              className="underline-offset-2 hover:text-white hover:underline"
              prefetch="intent"
              to="/delivery"
            >
              Delivery information
            </Link>
            <Link
              className="underline-offset-2 hover:text-white hover:underline"
              prefetch="intent"
              to="/returns"
            >
              Returns policy
            </Link>
            <Link
              className="underline-offset-2 hover:text-white hover:underline"
              prefetch="intent"
              to="/warranty"
            >
              Warranty
            </Link>
          </div>
        </div>
      </section>

      <nav aria-label="Breadcrumb" className="mt-5 text-xs text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="hover:text-gold" prefetch="intent" to="/">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="font-medium text-foreground">
            Terms
          </li>
        </ol>
      </nav>

      <div className="mt-10">
        <ContentWithToc sections={termsSections} />
      </div>
    </PageShell>
  );
}
