import {useEffect, useState} from 'react';
import {Link, data, useLoaderData, useSearchParams} from 'react-router';
import type {Route} from './+types/vat-relief';
import {Check, ShieldCheck} from 'lucide-react';
import {PageHeader, PageShell} from '~/components/content/PageShell';
import {
  FormField,
  FormSuccess,
  SubmitButton,
  TextArea,
  TextInput,
} from '~/components/forms/FormField';
import {useValidatedApiForm} from '~/components/forms/useValidatedApiForm';
import {vatReliefRegistrationSchema} from '~/lib/form-schemas';
import {buildMeta, NOINDEX_HEADERS} from '~/lib/seo';
import {adminApiConfigured} from '~/lib/shopify-admin-vat';
import {
  buildAccountLoginUrl,
  saveVatReliefRegistration,
} from '~/lib/vat-relief-session';

export const meta: Route.MetaFunction = ({location}) => {
  const registered = new URLSearchParams(location.search).has('registered');
  return buildMeta({
    title: registered ? 'VAT Relief — Sign In' : 'Register for VAT Relief',
    description:
      'Register for HMRC VAT relief on XSTO mobility products. Create your VAT-exempt customer account before you shop.',
    path: '/vat-relief',
    robots: registered ? 'noindex, nofollow' : undefined,
  });
};

export const headers: Route.HeadersFunction = ({loaderHeaders}) => loaderHeaders;

export async function loader({context, request}: Route.LoaderArgs) {
  const registered = new URL(request.url).searchParams.has('registered');

  return data(
    {adminConfigured: adminApiConfigured(context.env)},
    registered ? {headers: NOINDEX_HEADERS} : undefined,
  );
}

const STEPS = [
  {
    title: 'Register',
    description: 'Complete the HMRC declaration below',
  },
  {
    title: 'Sign in',
    description: 'Create or sign in to your account with the same email',
  },
  {
    title: 'Shop',
    description: 'Purchase at the VAT-relief price at checkout',
  },
] as const;

type VatReliefApiResponse = {
  ok?: boolean;
  email?: string;
  name?: string;
  address?: string;
  condition?: string;
  error?: string;
};

export default function VatReliefPage() {
  const {adminConfigured} = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return') ?? '/collections/all';
  const [redirecting, setRedirecting] = useState(false);

  const {errors, loading, success, handleSubmit, fetcherData} =
    useValidatedApiForm({
      schema: vatReliefRegistrationSchema,
      action: '/api/vat-relief',
    });

  const response = fetcherData as VatReliefApiResponse | undefined;

  useEffect(() => {
    if (!success || !response?.email) return;

    saveVatReliefRegistration({
      email: response.email,
      name: response.name ?? '',
      address: response.address ?? '',
      condition: response.condition ?? '',
      registeredAt: new Date().toISOString(),
    });

    setRedirecting(true);
    const loginUrl = buildAccountLoginUrl({
      email: response.email,
      returnTo,
    });

    const timer = window.setTimeout(() => {
      window.location.href = loginUrl;
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [success, response, returnTo]);

  return (
    <PageShell className="max-w-3xl">
      <PageHeader
        description="Under HMRC rules, individuals with a long-term illness or disability may purchase eligible mobility aids VAT-free. Register once, then sign in before you shop."
        title="Register for VAT Relief"
      />

      <ol className="mb-10 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li
            className="rounded-xl border border-border bg-card p-4 shadow-soft"
            key={step.title}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
              Step {index + 1}
            </p>
            <p className="mt-2 font-semibold text-foreground">{step.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {step.description}
            </p>
          </li>
        ))}
      </ol>

      {!adminConfigured ? (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Online VAT registration is being finalised. You can still complete the
          form — our team will create your VAT-exempt account manually. For
          immediate help, email{' '}
          <a className="font-medium underline" href="mailto:support@xsto.co.uk">
            support@xsto.co.uk
          </a>
          .
        </div>
      ) : null}

      {response?.ok === false && response.error ? (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {response.error}
        </div>
      ) : null}

      {success ? (
        <div className="space-y-4">
          <FormSuccess>
            <span className="inline-flex items-center gap-2">
              <Check aria-hidden className="size-5 text-vat-price" />
              VAT relief registration complete
            </span>
          </FormSuccess>
          <p className="text-center text-sm text-muted-foreground">
            {redirecting
              ? 'Redirecting you to sign in…'
              : 'Preparing your account sign-in…'}
          </p>
          {response?.email ? (
            <p className="text-center">
              <Link
                className="text-sm font-medium text-gold hover:underline"
                to={buildAccountLoginUrl({
                  email: response.email,
                  returnTo,
                })}
              >
                Continue to sign in now
              </Link>
            </p>
          ) : null}
        </div>
      ) : (
        <>
          <div className="mb-8 rounded-xl border border-border bg-secondary/40 p-5">
            <div className="flex gap-3">
              <ShieldCheck
                aria-hidden
                className="mt-0.5 size-5 shrink-0 text-gold"
                strokeWidth={1.5}
              />
              <div className="text-sm leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">
                  Who qualifies for VAT relief?
                </p>
                <p className="mt-2">
                  VAT relief applies when a mobility aid is supplied to a
                  chronically sick or disabled person for personal use. You must
                  provide a truthful declaration. Bentech Medical Ltd may
                  request supporting information and will report suspected fraud
                  to HMRC.
                </p>
              </div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField error={errors.name} id="name" label="Full name">
              <TextInput
                autoComplete="name"
                id="name"
                name="name"
                required
                type="text"
              />
            </FormField>

            <FormField error={errors.email} id="email" label="Email address">
              <TextInput
                autoComplete="email"
                id="email"
                name="email"
                required
                type="email"
              />
            </FormField>

            <FormField error={errors.address} id="address" label="Address">
              <TextArea
                autoComplete="street-address"
                id="address"
                name="address"
                required
              />
            </FormField>

            <FormField
              error={errors.condition}
              id="condition"
              label="Nature of condition"
            >
              <TextInput
                id="condition"
                name="condition"
                placeholder="e.g. long-term mobility impairment"
                required
                type="text"
              />
            </FormField>

            <fieldset className="rounded-xl border border-border bg-card p-4">
              <legend className="sr-only">HMRC declaration</legend>
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  className="mt-1 size-4 rounded border-border"
                  name="declaration"
                  type="checkbox"
                  value="yes"
                />
                <span className="leading-relaxed text-foreground">
                  I declare that I am chronically sick or disabled, that the
                  goods are for my personal or domestic use, and that I am
                  eligible for VAT relief under HMRC Notice 701/7. I understand
                  that making a false declaration is an offence.
                </span>
              </label>
              {errors.declaration ? (
                <p className="mt-2 text-xs text-destructive" role="alert">
                  {errors.declaration}
                </p>
              ) : null}
            </fieldset>

            <SubmitButton loading={loading}>
              Register &amp; continue to sign in
            </SubmitButton>
          </form>
        </>
      )}

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Already registered?{' '}
        <Link className="font-medium text-gold hover:underline" to="/account/login">
          Sign in to your account
        </Link>
        {' · '}
        <Link className="font-medium text-gold hover:underline" to="/faq">
          VAT relief FAQ
        </Link>
      </p>
    </PageShell>
  );
}
