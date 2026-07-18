import type {Route} from './+types/about';
import {JsonLd, PageHeader, PageShell} from '~/components/content/PageShell';
import {
  ABOUT_INTRO,
  ABOUT_VALUE_PROPS,
  DISTRIBUTOR_DISCLAIMER,
} from '~/lib/content/company';
import {COMPANY} from '~/lib/site-navigation';
import {pageMeta, SITE_URL} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: 'About Bentech Medical Ltd',
    description:
      'Bentech Medical Ltd is the official UK distributor of XSTO powered wheelchairs — clinical quality, UK support and expert fitting.',
    path: '/about',
  });

export default function AboutPage() {
  return (
    <PageShell>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: COMPANY.name,
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
            areaServed: 'GB',
          },
        }}
      />

      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-navy">
        <div className="grid md:grid-cols-2">
          <div className="flex flex-col justify-center p-8 md:p-12">
            <PageHeader
              description="Official UK & Ireland distributor of XSTO powered wheelchairs."
              title="About Bentech Medical Ltd"
            />
          </div>
          <div className="relative min-h-[240px] md:min-h-[320px]">
            <img
              alt="XSTO M4 powered wheelchair — foldable mobility robot"
              className="size-full object-cover"
              decoding="async"
              height={640}
              loading="eager"
              src="/images/hero-poster.jpg"
              width={960}
            />
          </div>
        </div>
      </section>

      <div className="mt-8 rounded-xl border border-gold/30 bg-gold/10 p-5">
        <p className="text-sm font-medium text-foreground">
          {DISTRIBUTOR_DISCLAIMER}
        </p>
      </div>

      <div className="mt-10 max-w-3xl space-y-4 text-muted-foreground">
        {ABOUT_INTRO.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {ABOUT_VALUE_PROPS.map((prop) => (
          <div
            className="rounded-xl border border-border bg-card p-6"
            key={prop.title}
          >
            <h2 className="text-lg font-semibold text-foreground">{prop.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{prop.description}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
