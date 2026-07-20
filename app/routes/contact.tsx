import {Link} from 'react-router';
import type {Route} from './+types/contact';
import {
  CalendarCheck,
  Clock3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import {FaqList} from '~/components/content/FaqAccordion';
import {JsonLd, PageShell} from '~/components/content/PageShell';
import {
  FormErrorBanner,
  FormField,
  FormSuccess,
  SelectInput,
  SubmitButton,
  TextArea,
  TextInput,
} from '~/components/forms/FormField';
import {useValidatedApiForm} from '~/components/forms/useValidatedApiForm';
import {
  CONTACT_FAQS,
  CONTACT_HELP_LINKS,
  CONTACT_INFO,
  CONTACT_TOPICS,
} from '~/lib/content/contact';
import {contactFormSchema} from '~/lib/form-schemas';
import {COMPANY} from '~/lib/site-navigation';
import {breadcrumbJsonLd, faqJsonLd, pageMeta, SITE_URL} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: 'Contact Mobility Robot',
    description:
      'Contact Mobility Robot (Bentech Medical Ltd) for XSTO sales, demos, warranty and after-sales support. Phone, email, form and FAQs.',
    path: '/contact',
  });

const breadcrumbs = [
  {name: 'Home', path: '/'},
  {name: 'Contact'},
] as const;

export default function ContactPage() {
  const {errors, formError, loading, success, handleSubmit} = useValidatedApiForm({
    schema: contactFormSchema,
    action: '/api/contact',
  });

  return (
    <PageShell>
      <JsonLd
        data={[
          breadcrumbJsonLd([...breadcrumbs]),
          faqJsonLd([...CONTACT_FAQS]),
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: COMPANY.name,
            alternateName: 'Mobility Robot',
            url: SITE_URL,
            logo: `${SITE_URL}/images/xsto-bentech-header.png`,
            address: {
              '@type': 'PostalAddress',
              streetAddress: COMPANY.address,
              addressLocality: COMPANY.city,
              postalCode: COMPANY.postcode,
              addressCountry: 'GB',
            },
            contactPoint: [
              {
                '@type': 'ContactPoint',
                telephone: COMPANY.phone,
                email: CONTACT_INFO.email,
                contactType: 'customer support',
                areaServed: ['GB', 'IE'],
                availableLanguage: 'English',
                hoursAvailable: {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                  ],
                  opens: '09:00',
                  closes: '17:30',
                },
              },
            ],
          },
        ]}
      />

      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-navy text-white">
        <div className="px-5 py-8 sm:px-8 md:px-10 md:py-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
            UK support team
          </p>
          <h1 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            Contact us
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
            Product advice, orders, VAT relief, warranty and demos — the
            Wimborne team is here to help.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
            <a
              className="underline-offset-2 hover:text-white hover:underline"
              href="#contact-form"
            >
              Send a message
            </a>
            <a
              className="underline-offset-2 hover:text-white hover:underline"
              href={CONTACT_INFO.phoneHref}
            >
              Call {CONTACT_INFO.phone}
            </a>
            <a
              className="underline-offset-2 hover:text-white hover:underline"
              href={`mailto:${CONTACT_INFO.email}`}
            >
              Email us
            </a>
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
            Contact
          </li>
        </ol>
      </nav>

      <section
        aria-labelledby="contact-channels-heading"
        className="mt-10 grid gap-6 border-y border-border py-8 sm:grid-cols-3"
      >
        <h2 className="sr-only" id="contact-channels-heading">
          Contact channels
        </h2>
        <a
          className="group flex gap-3 text-left transition-colors"
          href={CONTACT_INFO.phoneHref}
        >
          <Phone
            aria-hidden
            className="mt-0.5 size-5 shrink-0 text-navy"
            strokeWidth={1.5}
          />
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-gold">
              Phone
            </span>
            <span className="mt-1 block text-base font-semibold text-foreground group-hover:text-gold">
              {CONTACT_INFO.phone}
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Speak to the UK team
            </span>
          </span>
        </a>
        <a
          className="group flex gap-3 text-left transition-colors"
          href={`mailto:${CONTACT_INFO.email}`}
        >
          <Mail
            aria-hidden
            className="mt-0.5 size-5 shrink-0 text-navy"
            strokeWidth={1.5}
          />
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-gold">
              Email
            </span>
            <span className="mt-1 block break-all text-base font-semibold text-foreground group-hover:text-gold">
              {CONTACT_INFO.email}
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              {CONTACT_INFO.responseTime}
            </span>
          </span>
        </a>
        <div className="flex gap-3">
          <Clock3
            aria-hidden
            className="mt-0.5 size-5 shrink-0 text-navy"
            strokeWidth={1.5}
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
              Hours
            </p>
            <p className="mt-1 text-base font-semibold text-foreground">
              {CONTACT_INFO.hours}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Closed weekends &amp; bank holidays
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="contact-help-heading" className="mt-12">
        <h2
          className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl"
          id="contact-help-heading"
        >
          Looking for something specific?
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          These shortcuts get you there faster than a general enquiry.
        </p>
        <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACT_HELP_LINKS.map((item) => (
            <li key={item.url}>
              <Link
                className="group block"
                prefetch="intent"
                to={item.url}
              >
                <span className="text-base font-semibold text-foreground group-hover:text-gold">
                  {item.title}
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-14 grid gap-12 lg:grid-cols-5 lg:items-start lg:gap-14">
        <section
          aria-labelledby="contact-form-heading"
          className="lg:col-span-3"
          id="contact-form"
        >
          <h2
            className="font-display text-2xl font-bold tracking-tight text-foreground"
            id="contact-form-heading"
          >
            Send a message
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Tell us what you need — include an order reference if you have one.
            We reply within one business day.
          </p>

          {success ? (
            <div className="mt-8">
              <FormSuccess>
                Thank you — we&apos;ve received your message and will respond
                shortly.
              </FormSuccess>
            </div>
          ) : (
            <form
              className="mt-8 space-y-6"
              noValidate
              onSubmit={handleSubmit}
            >
              <fieldset className="space-y-4">
                <legend className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-navy/55">
                  Your details
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField error={errors.name} id="name" label="Full name">
                    <TextInput
                      autoComplete="name"
                      id="name"
                      name="name"
                      required
                      type="text"
                    />
                  </FormField>
                  <FormField error={errors.email} id="email" label="Email">
                    <TextInput
                      autoComplete="email"
                      id="email"
                      name="email"
                      required
                      type="email"
                    />
                  </FormField>
                </div>
                <FormField error={errors.phone} id="phone" label="Phone">
                  <TextInput
                    autoComplete="tel"
                    id="phone"
                    name="phone"
                    required
                    type="tel"
                  />
                </FormField>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-navy/55">
                  Your enquiry
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField error={errors.topic} id="topic" label="Topic">
                    <SelectInput id="topic" name="topic" required defaultValue="">
                      <option disabled value="">
                        Select a topic
                      </option>
                      {CONTACT_TOPICS.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </SelectInput>
                  </FormField>
                  <FormField
                    error={errors.orderRef}
                    id="orderRef"
                    label="Order reference (optional)"
                  >
                    <TextInput
                      autoComplete="off"
                      id="orderRef"
                      name="orderRef"
                      placeholder="e.g. #1234"
                      type="text"
                    />
                  </FormField>
                </div>
                <FormField error={errors.message} id="message" label="Message">
                  <TextArea
                    id="message"
                    name="message"
                    placeholder="How can we help?"
                    required
                    rows={6}
                  />
                </FormField>
              </fieldset>

              {formError ? <FormErrorBanner>{formError}</FormErrorBanner> : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SubmitButton loading={loading}>Send message</SubmitButton>
                <p className="text-xs text-muted-foreground">
                  Prefer a quick call?{' '}
                  <a
                    className="font-medium text-gold hover:text-gold-dark"
                    href={CONTACT_INFO.phoneHref}
                  >
                    {CONTACT_INFO.phone}
                  </a>
                </p>
              </div>
            </form>
          )}
        </section>

        <aside className="space-y-8 lg:col-span-2">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
              Visit us
            </h2>
            <p className="mt-3 flex gap-3 text-sm leading-relaxed text-muted-foreground">
              <MapPin
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-navy"
                strokeWidth={1.5}
              />
              <span>
                {CONTACT_INFO.address}
                <br />
                <a
                  className="mt-2 inline-block font-medium text-gold hover:text-gold-dark"
                  href={CONTACT_INFO.mapLink}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Open in maps
                </a>
              </span>
            </p>
            <div className="mt-5 overflow-hidden rounded-xl border border-border">
              <iframe
                className="h-56 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={CONTACT_INFO.mapEmbed}
                title="Map showing Bentech Medical Ltd, Wimborne"
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Visits by appointment —{' '}
              <Link className="text-gold hover:text-gold-dark" to="/demo">
                book a demo
              </Link>{' '}
              or message us first.
            </p>
          </div>

          <div className="space-y-4 border-t border-border pt-8">
            <p className="flex gap-3 text-sm text-muted-foreground">
              <ShieldCheck
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-navy"
                strokeWidth={1.5}
              />
              <span>
                Official UK distributor support for XSTO — warranty and parts
                handled locally by {COMPANY.name}.
              </span>
            </p>
            <p className="flex gap-3 text-sm text-muted-foreground">
              <CalendarCheck
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-navy"
                strokeWidth={1.5}
              />
              <span>
                Need a hands-on session?{' '}
                <Link className="font-medium text-gold hover:text-gold-dark" to="/demo">
                  Request a demo
                </Link>{' '}
                in Dorset or London.
              </span>
            </p>
          </div>
        </aside>
      </div>

      <section aria-labelledby="contact-faq-heading" className="mt-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl"
              id="contact-faq-heading"
            >
              Contact FAQs
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Quick answers before you get in touch.
            </p>
          </div>
          <Link
            className="text-sm font-medium text-gold hover:text-gold-dark"
            prefetch="intent"
            to="/faq"
          >
            View all FAQs
          </Link>
        </div>
        <div className="mt-8">
          <FaqList items={[...CONTACT_FAQS]} />
        </div>
      </section>
    </PageShell>
  );
}
