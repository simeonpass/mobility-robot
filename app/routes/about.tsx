import {Link} from 'react-router';
import type {Route} from './+types/about';
import {Handshake, Headphones, MapPin, ShieldCheck} from 'lucide-react';
import {JsonLd, PageShell} from '~/components/content/PageShell';
import {
  ABOUT_FACTS,
  ABOUT_INTRO,
  ABOUT_VALUE_PROPS,
  DISTRIBUTOR_DISCLAIMER,
} from '~/lib/content/company';
import {COMPANY} from '~/lib/site-navigation';
import {breadcrumbJsonLd, pageMeta, SITE_URL} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: 'About Mobility Robot',
    description:
      'Mobility Robot is the UK storefront of Bentech Medical Ltd — official distributor of XSTO powered wheelchairs with clinical quality, UK support and expert fitting.',
    path: '/about',
  });

const VALUE_ICONS = [ShieldCheck, Headphones, Handshake] as const;

const breadcrumbs = [
  {name: 'Home', path: '/'},
  {name: 'About'},
] as const;

export default function AboutPage() {
  return (
    <PageShell>
      <JsonLd
        data={[
          breadcrumbJsonLd([...breadcrumbs]),
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: COMPANY.name,
            alternateName: 'Mobility Robot',
            url: SITE_URL,
            logo: `${SITE_URL}/images/xsto-bentech-header.png`,
            description: DISTRIBUTOR_DISCLAIMER,
            address: {
              '@type': 'PostalAddress',
              streetAddress: COMPANY.address,
              addressLocality: COMPANY.city,
              postalCode: COMPANY.postcode,
              addressCountry: 'GB',
            },
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: COMPANY.phone,
              email: COMPANY.email,
              contactType: 'customer service',
              areaServed: ['GB', 'IE'],
              availableLanguage: 'English',
            },
          },
        ]}
      />

      <section className="relative isolate min-h-[min(72vh,36rem)] overflow-hidden rounded-2xl border border-border text-white">
        <img
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover"
          decoding="async"
          height={840}
          loading="eager"
          src="/images/about-hero.jpg"
          width={1600}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-[hsl(216_42%_10%/0.94)] via-[hsl(216_42%_12%/0.82)] to-[hsl(216_42%_14%/0.45)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[hsl(224_54%_8%/0.55)] via-transparent to-transparent"
        />

        <div className="relative flex min-h-[min(72vh,36rem)] flex-col justify-end px-5 py-10 sm:px-8 md:justify-center md:px-12 md:py-16">
          <p className="animate-fade-in text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
            Mobility Robot
          </p>
          <h1 className="animate-fade-in-up mt-3 max-w-xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Official UK distributor of XSTO
          </h1>
          <p className="animate-fade-in-up mt-4 max-w-lg text-base leading-relaxed text-white/85 md:text-lg animate-delay-150">
            Bentech Medical Ltd brings foldable powered wheelchairs to the UK
            and Ireland — with local support, demos and a nationwide stockist
            network.
          </p>
          <div className="animate-fade-in-up mt-8 flex flex-wrap gap-3 animate-delay-150">
            <Link
              className="btn-checkout inline-flex h-11 items-center px-5"
              to="/collections/all"
            >
              Shop the range
            </Link>
            <Link
              className="inline-flex h-11 items-center rounded-lg border border-white/30 bg-white/5 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              to="/demo"
            >
              Book a demo
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
            About
          </li>
        </ol>
      </nav>

      <section aria-labelledby="about-story-heading" className="mt-12">
        <h2
          className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl"
          id="about-story-heading"
        >
          Who we are
        </h2>
        <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {ABOUT_INTRO.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="about-facts-heading"
        className="mt-14 border-y border-border py-8"
      >
        <h2 className="sr-only" id="about-facts-heading">
          At a glance
        </h2>
        <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {ABOUT_FACTS.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                {fact.label}
              </dt>
              <dd className="mt-2 text-sm font-medium leading-snug text-foreground md:text-base">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="about-values-heading" className="mt-14">
        <h2
          className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl"
          id="about-values-heading"
        >
          Why buy with us
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          Engineering you can trust, support you can reach, and the chance to
          try a chair before you commit.
        </p>
        <ul className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          {ABOUT_VALUE_PROPS.map((prop, index) => {
            const Icon = VALUE_ICONS[index] ?? ShieldCheck;
            return (
              <li key={prop.title}>
                <Icon
                  aria-hidden
                  className="size-6 text-navy"
                  strokeWidth={1.5}
                />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {prop.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {prop.description}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        aria-labelledby="about-next-heading"
        className="mt-14 overflow-hidden rounded-2xl border border-border bg-gradient-navy px-5 py-10 text-white sm:px-8 md:px-10 md:py-12"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
              Next step
            </p>
            <h2
              className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl"
              id="about-next-heading"
            >
              See an XSTO in person
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/80">
              Book a hands-on demo, find a stockist near you, or speak to the
              Wimborne team about the right model for your needs.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="btn-checkout inline-flex h-11 items-center px-5"
              to="/demo"
            >
              Book a demo
            </Link>
            <Link
              className="inline-flex h-11 items-center rounded-lg border border-white/30 bg-white/5 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              to="/stockists"
            >
              Find a stockist
            </Link>
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/30 bg-white/5 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              to="/contact"
            >
              <MapPin aria-hidden className="size-4" />
              Contact us
            </Link>
          </div>
        </div>
      </section>

      <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted-foreground">
        {DISTRIBUTOR_DISCLAIMER}
      </p>
    </PageShell>
  );
}
