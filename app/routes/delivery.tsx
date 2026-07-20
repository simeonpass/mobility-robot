import {Link} from 'react-router';
import type {Route} from './+types/delivery';
import {MapPin, Package, Truck, Wrench} from 'lucide-react';
import {ContentWithToc} from '~/components/content/ContentWithToc';
import {JsonLd, PageShell} from '~/components/content/PageShell';
import {
  DELIVERY_METHODS,
  DELIVERY_ON_ARRIVAL,
  DELIVERY_REGIONS,
  DELIVERY_STEPS,
  deliverySections,
} from '~/lib/content/delivery';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: 'Delivery Information',
    description:
      'How XSTO products are delivered in the UK — pallet delivery for wheelchairs, courier for accessories, and engineer setup in selected areas.',
    path: '/delivery',
  });

const METHOD_ICONS = {
  pallet: Truck,
  courier: Package,
  engineer: Wrench,
} as const;

export default function DeliveryPage() {
  return (
    <PageShell>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'XSTO Delivery Information',
          description:
            'Delivery methods for XSTO powered wheelchairs and accessories from Bentech Medical Ltd.',
        }}
      />

      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-navy text-white">
        <div className="px-5 py-8 sm:px-8 md:px-10 md:py-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
            UK &amp; Ireland fulfilment
          </p>
          <h1 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            Delivery information
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
            Full-size chairs arrive on a pallet. Accessories ship by courier. In
            selected areas we can arrange engineer delivery and setup — contact
            us to check your postcode.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="btn-checkout inline-flex h-11 items-center px-5"
              to="/collections/all"
            >
              Shop the range
            </Link>
            <Link
              className="inline-flex h-11 items-center rounded-lg border border-white/30 bg-white/5 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              to="/contact"
            >
              Check your postcode
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
            Delivery
          </li>
        </ol>
      </nav>

      <section aria-labelledby="delivery-methods-heading" className="mt-12">
        <h2
          className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl"
          id="delivery-methods-heading"
        >
          How we deliver
        </h2>
        <ul className="mt-8 grid gap-6 lg:grid-cols-3">
          {DELIVERY_METHODS.map((method) => {
            const Icon = METHOD_ICONS[method.id];
            return (
              <li
                className="rounded-xl border border-border bg-card p-6"
                key={method.id}
              >
                <Icon
                  aria-hidden
                  className="size-6 text-navy"
                  strokeWidth={1.5}
                />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {method.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {method.summary}
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-4 text-sm text-muted-foreground">
                  {method.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="delivery-steps-heading" className="mt-14">
        <h2
          className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl"
          id="delivery-steps-heading"
        >
          From order to doorstep
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DELIVERY_STEPS.map((step, index) => (
            <li key={step.title}>
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
        aria-labelledby="delivery-regions-heading"
        className="mt-14 border-y border-border py-8"
      >
        <h2
          className="font-display text-xl font-bold tracking-tight text-foreground"
          id="delivery-regions-heading"
        >
          Where we deliver
        </h2>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
          {DELIVERY_REGIONS.map((item) => (
            <div key={item.region}>
              <dt className="flex items-center gap-2 font-semibold text-foreground">
                <MapPin aria-hidden className="size-4 text-navy" />
                {item.region}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.detail}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="delivery-arrival-heading" className="mt-12">
        <h2
          className="font-display text-xl font-bold tracking-tight text-foreground"
          id="delivery-arrival-heading"
        >
          On delivery day
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          {DELIVERY_ON_ARRIVAL.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Need to return an item? See our{' '}
          <Link className="font-medium text-gold hover:text-gold-dark" to="/returns">
            returns policy
          </Link>
          .
        </p>
      </section>

      <div className="mt-14">
        <ContentWithToc sections={deliverySections} />
      </div>
    </PageShell>
  );
}
