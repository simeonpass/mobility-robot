import type {Route} from './+types/contact';
import {JsonLd, PageHeader, PageShell} from '~/components/content/PageShell';
import {CONTACT_INFO} from '~/lib/content/company';
import {
  FormField,
  FormSuccess,
  SubmitButton,
  TextArea,
  TextInput,
} from '~/components/forms/FormField';
import {useValidatedApiForm} from '~/components/forms/useValidatedApiForm';
import {contactFormSchema} from '~/lib/form-schemas';
import {COMPANY} from '~/lib/site-navigation';
import {pageMeta, SITE_URL} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: 'Contact Us',
    description:
      'Contact Bentech Medical Ltd for XSTO sales, support and warranty enquiries. Phone, email and contact form.',
    path: '/contact',
  });

export default function ContactPage() {
  const {errors, loading, success, handleSubmit} = useValidatedApiForm({
    schema: contactFormSchema,
    action: '/api/contact',
  });

  return (
    <PageShell>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: COMPANY.name,
          url: SITE_URL,
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: COMPANY.phone,
            email: CONTACT_INFO.email,
            contactType: 'customer support',
            areaServed: ['GB', 'IE'],
            availableLanguage: 'English',
          },
        }}
      />

      <PageHeader
        breadcrumbs={[{name: 'Home', path: '/'}, {name: 'Contact'}]}
        description="Our UK team is here to help with product advice, orders, warranty and after-sales support."
        title="Contact Us"
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Get in touch</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-medium text-foreground">Address</dt>
                <dd className="text-muted-foreground">{CONTACT_INFO.address}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Phone</dt>
                <dd>
                  <a className="text-gold hover:text-gold-dark" href={CONTACT_INFO.phoneHref}>
                    {CONTACT_INFO.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Email</dt>
                <dd>
                  <a className="text-gold hover:text-gold-dark" href={`mailto:${CONTACT_INFO.email}`}>
                    {CONTACT_INFO.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Hours</dt>
                <dd className="text-muted-foreground">{CONTACT_INFO.hours}</dd>
              </div>
            </dl>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <iframe
              className="h-64 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={CONTACT_INFO.mapEmbed}
              title="Map showing Bentech Medical Ltd, Wimborne"
            />
          </div>
        </div>

        <div>
          {success ? (
            <FormSuccess>
              Thank you — we&apos;ve received your message and will respond shortly.
            </FormSuccess>
          ) : (
            <form className="space-y-4 rounded-xl border border-border bg-card p-6" onSubmit={handleSubmit}>
              <FormField error={errors.name} id="name" label="Name">
                <TextInput id="name" name="name" required type="text" />
              </FormField>
              <FormField error={errors.email} id="email" label="Email">
                <TextInput id="email" name="email" required type="email" />
              </FormField>
              <FormField error={errors.phone} id="phone" label="Phone">
                <TextInput id="phone" name="phone" required type="tel" />
              </FormField>
              <FormField error={errors.message} id="message" label="Message">
                <TextArea id="message" name="message" required />
              </FormField>
              {errors.form ? (
                <p className="text-sm text-destructive" role="alert">
                  {errors.form}
                </p>
              ) : null}
              <SubmitButton loading={loading}>Send message</SubmitButton>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
}
