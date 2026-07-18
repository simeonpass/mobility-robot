import {Link} from 'react-router';
import type {Route} from './+types/vat-relief';
import {BadgePercent, Check, ShieldCheck} from 'lucide-react';
import {ContentWithToc} from '~/components/content/ContentWithToc';
import {JsonLd, PageShell} from '~/components/content/PageShell';
import {
  VAT_RELIEF_ELIGIBLE_PRODUCTS,
  VAT_RELIEF_STEPS,
  vatReliefSections,
} from '~/lib/content/vat-relief';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: 'VAT Relief on Mobility Aids',
    description:
      'Eligible customers pay no VAT on XSTO powered wheelchairs. Declare eligibility on the product page or in your cart — VAT is removed automatically at checkout.',
    path: '/vat-relief',
  });

export default function VatReliefPage() {
  return (
    <PageShell>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'VAT Relief on XSTO Mobility Aids',
          description:
            'How eligible customers claim HMRC VAT relief on XSTO powered wheelchairs from Bentech Medical Ltd.',
        }}
      />

      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-navy text-white">
        <div className="px-6 py-10 md:px-10 md:py-14">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90">
            <BadgePercent aria-hidden className="size-3.5" />
            HMRC Notice 701/7
          </p>
          <h1 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            Eligible customers pay no VAT
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
            If you are chronically sick or disabled, you can buy qualifying XSTO
            powered wheelchairs VAT-free. Declare eligibility when you shop —
            we remove the exact VAT amount at checkout.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-checkout inline-flex h-11 items-center px-5" to="/collections/all">
              Shop the range
            </Link>
            <Link
              className="inline-flex h-11 items-center rounded-lg border border-white/25 bg-white/5 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              to="/faq#faq-vat-relief"
            >
              Eligibility FAQ
            </Link>
          </div>
        </div>
      </section>

      <nav aria-label="Breadcrumb" className="mt-6 text-xs text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="hover:text-gold" prefetch="intent" to="/">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="font-medium text-foreground">
            VAT Relief
          </li>
        </ol>
      </nav>

      <section aria-labelledby="vat-steps-heading" className="mt-10">
        <h2
          className="text-2xl font-bold text-foreground md:text-3xl"
          id="vat-steps-heading"
        >
          How to claim VAT relief
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          No advance account approval. Claim relief on the product page or in
          your cart, then check out as normal.
        </p>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {VAT_RELIEF_STEPS.map((step, index) => (
            <li className="relative" key={step.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                Step {index + 1}
              </p>
              <p className="mt-2 font-semibold text-foreground">{step.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="vat-qualify-summary"
        className="mt-12 flex gap-4 border-y border-border py-6"
      >
        <ShieldCheck
          aria-hidden
          className="mt-0.5 size-6 shrink-0 text-navy"
          strokeWidth={1.5}
        />
        <div>
          <h2 className="font-semibold text-foreground" id="vat-qualify-summary">
            Quick eligibility check
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            VAT relief applies when a mobility aid is supplied to a chronically
            sick or disabled person for personal use. You confirm this with a
            short declaration — name, address, nature of condition and an HMRC
            eligibility statement. Bentech Medical Ltd may request supporting
            information and will report suspected fraud to HMRC.
          </p>
        </div>
      </section>

      <section aria-labelledby="vat-products-heading" className="mt-12">
        <h2
          className="text-xl font-semibold text-foreground"
          id="vat-products-heading"
        >
          Eligible products
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Claim VAT relief on these powered wheelchairs. Accessories purchased
          separately are not included in the same declaration.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VAT_RELIEF_ELIGIBLE_PRODUCTS.map((product) => (
            <li key={product.path}>
              <Link
                className="flex items-center gap-2 text-sm font-medium text-navy underline-offset-2 hover:underline"
                prefetch="intent"
                to={product.path}
              >
                <Check aria-hidden className="size-4 shrink-0 text-vat-price" />
                {product.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-14">
        <ContentWithToc sections={vatReliefSections} />
      </div>

      <section
        aria-labelledby="vat-next-heading"
        className="mt-14 border-t border-border pt-10"
      >
        <h2
          className="text-xl font-semibold text-foreground"
          id="vat-next-heading"
        >
          Ready to shop?
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Browse the range, complete your declaration when you add to cart, and
          see VAT removed at checkout. Prefer to talk it through first? Book a
          demo or contact the team.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="btn-checkout inline-flex h-11 items-center px-5" to="/collections/all">
            Shop all products
          </Link>
          <Link
            className="inline-flex h-11 items-center rounded-lg border border-border px-5 text-sm font-medium text-foreground hover:bg-secondary"
            to="/demo"
          >
            Book a demo
          </Link>
          <Link
            className="inline-flex h-11 items-center rounded-lg border border-border px-5 text-sm font-medium text-foreground hover:bg-secondary"
            to="/contact"
          >
            Contact us
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
