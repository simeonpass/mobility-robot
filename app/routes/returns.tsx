import {Link} from 'react-router';
import type {Route} from './+types/returns';
import {RotateCcw} from 'lucide-react';
import {ContentWithToc} from '~/components/content/ContentWithToc';
import {JsonLd, PageShell} from '~/components/content/PageShell';
import {returnsSections} from '~/lib/content/warranty-returns';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: 'Returns Policy',
    description:
      '14-day UK returns, online return requests, condition requirements and £250 collection fee for large XSTO mobility products.',
    path: '/returns',
  });

export default function ReturnsPage() {
  return (
    <PageShell>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Returns Policy — Mobility Robot',
          description:
            'Returns and cancellation policy for XSTO products purchased from Bentech Medical Ltd.',
        }}
      />

      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-navy text-white">
        <div className="px-5 py-8 sm:px-8 md:px-10 md:py-12">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
            <RotateCcw aria-hidden className="size-3.5" />
            14-day statutory returns
          </p>
          <h1 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            Returns policy
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
            Your statutory rights and how to return an XSTO product. Signed-in
            customers can submit a return request online from their order.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="btn-checkout inline-flex h-11 items-center px-5"
              to="/account/orders"
            >
              Request a return
            </Link>
            <Link
              className="inline-flex h-11 items-center rounded-lg border border-white/30 bg-white/5 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              to="/contact"
            >
              Contact support
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
            Returns
          </li>
        </ol>
      </nav>

      <section
        aria-labelledby="returns-online-heading"
        className="mt-10 rounded-xl border border-gold/30 bg-gold/10 p-5 md:p-6"
      >
        <h2
          className="font-semibold text-foreground"
          id="returns-online-heading"
        >
          Online return requests
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          <Link className="font-medium text-gold hover:text-gold-dark" to="/account/login">
            Sign in
          </Link>{' '}
          to your account, open the order you wish to return, and choose{' '}
          <strong className="font-medium text-foreground">Request a return</strong>.
          We review each request and email you confirmation — including
          specialist pallet collection where required.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Shopify&apos;s built-in self-serve returns are designed for standard
          Online Store themes. On this Hydrogen storefront we use a return{' '}
          <em>request</em> workflow: your submission is reviewed by our team and
          processed in Shopify Admin. You can also use the order status link from
          your confirmation email if returns are enabled there.
        </p>
      </section>

      <div className="mt-10">
        <ContentWithToc sections={returnsSections} />
      </div>
    </PageShell>
  );
}
