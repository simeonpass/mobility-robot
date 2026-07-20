import {Link} from 'react-router';
import type {Route} from './+types/demo';
import {CalendarCheck, MapPin, MessageSquare} from 'lucide-react';
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
import {demoRequestSchema} from '~/lib/form-schemas';
import {breadcrumbJsonLd, pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: 'Book a Demo',
    description:
      'Book an XSTO wheelchair demonstration with Bentech Medical Ltd or an authorised UK stockist.',
    path: '/demo',
  });

const MODEL_OPTIONS = ['M4', 'M4 Pro', 'M4B', 'EzGo2', 'X12', 'X12 Pro'] as const;

const EXPECT_STEPS = [
  {
    icon: MessageSquare,
    title: 'We confirm within one business day',
    description:
      'Our team will call or email to agree a date, time and location that works for you.',
  },
  {
    icon: MapPin,
    title: 'Dorset or London location',
    description:
      "We'll arrange a hands-on session at one of our locations in Dorset or London.",
  },
  {
    icon: CalendarCheck,
    title: 'Try before you buy',
    description:
      'Experience foldability, controls and fit — with guidance on sizing, accessories and VAT relief.',
  },
] as const;

const breadcrumbs = [
  {name: 'Home', path: '/'},
  {name: 'Book a Demo'},
] as const;

export default function DemoPage() {
  const {errors, formError, loading, success, handleSubmit} = useValidatedApiForm({
    schema: demoRequestSchema,
    action: '/api/demo-request',
  });

  return (
    <PageShell>
      <JsonLd data={breadcrumbJsonLd([...breadcrumbs])} />

      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-navy text-white">
        <div className="px-5 py-8 sm:px-8 md:px-10 md:py-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
            In-person demonstration
          </p>
          <h1 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            Book a demo
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
            See and try an XSTO wheelchair before you buy — at a location in
            Dorset or London. No obligation.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
            <a className="underline-offset-2 hover:text-white hover:underline" href="#demo-form">
              Request a booking
            </a>
            <Link
              className="underline-offset-2 hover:text-white hover:underline"
              prefetch="intent"
              to="/stockists"
            >
              Find a stockist
            </Link>
            <Link
              className="underline-offset-2 hover:text-white hover:underline"
              prefetch="intent"
              to="/vat-relief"
            >
              VAT relief
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
            Book a Demo
          </li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-5 lg:gap-12 lg:items-start">
        <section
          aria-labelledby="demo-form-heading"
          className="lg:col-span-3"
          id="demo-form"
        >
          <h2
            className="font-display text-2xl font-bold tracking-tight text-foreground"
            id="demo-form-heading"
          >
            Request your demo
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Tell us how to reach you and which model you&apos;d like to try. Your
            postcode helps us match you with the best location.
          </p>

          {success ? (
            <div className="mt-8">
              <FormSuccess>
                Demo request received — we&apos;ll contact you to confirm a date
                and location.
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
                  <FormField error={errors.phone} id="phone" label="Phone">
                    <TextInput
                      autoComplete="tel"
                      id="phone"
                      name="phone"
                      required
                      type="tel"
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
                  <FormField error={errors.postcode} id="postcode" label="Postcode">
                    <TextInput
                      autoComplete="postal-code"
                      id="postcode"
                      name="postcode"
                      required
                      type="text"
                    />
                  </FormField>
                </div>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-navy/55">
                  Preferences
                </legend>
                <FormField
                  error={errors.model}
                  id="model"
                  label="Preferred model"
                >
                  <SelectInput defaultValue="" id="model" name="model" required>
                    <option disabled value="">
                      Select a model
                    </option>
                    {MODEL_OPTIONS.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </SelectInput>
                </FormField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    error={errors.preferredDate}
                    id="preferredDate"
                    label="Preferred date (optional)"
                  >
                    <TextInput
                      id="preferredDate"
                      name="preferredDate"
                      type="date"
                    />
                  </FormField>
                  <FormField
                    error={errors.preferredTime}
                    id="preferredTime"
                    label="Preferred time (optional)"
                  >
                    <TextInput
                      id="preferredTime"
                      name="preferredTime"
                      placeholder="e.g. Morning"
                      type="text"
                    />
                  </FormField>
                </div>
                <FormField
                  error={errors.notes}
                  id="notes"
                  label="Anything else? (optional)"
                >
                  <TextArea
                    id="notes"
                    name="notes"
                    placeholder="Accessibility needs, companion attending, questions about VAT relief…"
                  />
                </FormField>
              </fieldset>

              {formError ? <FormErrorBanner>{formError}</FormErrorBanner> : null}

              <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  We&apos;ll confirm within one business day.
                </p>
                <SubmitButton loading={loading}>Book your demo</SubmitButton>
              </div>
            </form>
          )}
        </section>

        <div className="space-y-8 lg:col-span-2 lg:sticky lg:top-28 lg:pt-1">
          <section aria-labelledby="demo-expect-heading">
            <h2
              className="font-display text-xl font-bold tracking-tight text-foreground"
              id="demo-expect-heading"
            >
              What happens next
            </h2>
            <ol className="mt-6 space-y-6">
              {EXPECT_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li className="flex gap-4" key={step.title}>
                    <span
                      aria-hidden
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy"
                    >
                      <Icon className="size-5" strokeWidth={1.5} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
                        Step {index + 1}
                      </p>
                      <p className="mt-1 font-semibold text-foreground">
                        {step.title}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section
            aria-labelledby="demo-vat-heading"
            className="border-y border-border py-6"
          >
            <h2
              className="font-semibold text-foreground"
              id="demo-vat-heading"
            >
              VAT relief
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Eligible customers can buy qualifying XSTO powered wheelchairs
              VAT-free. Ask about eligibility during your demo, or{' '}
              <Link
                className="font-medium text-navy underline-offset-2 hover:underline"
                prefetch="intent"
                to="/vat-relief"
              >
                read how VAT relief works
              </Link>
              .
            </p>
          </section>

          <p className="text-sm text-muted-foreground">
            Prefer to speak to someone first?{' '}
            <Link
              className="font-medium text-navy underline-offset-2 hover:underline"
              prefetch="intent"
              to="/contact"
            >
              Contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </PageShell>
  );
}
