import type {Route} from './+types/demo';
import {PageHeader, PageShell} from '~/components/content/PageShell';
import {
  FormField,
  FormSuccess,
  SelectInput,
  SubmitButton,
  TextArea,
  TextInput,
} from '~/components/forms/FormField';
import {useValidatedApiForm} from '~/components/forms/useValidatedApiForm';
import {demoRequestSchema} from '~/lib/form-schemas';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: 'Book a Demo',
    description:
      'Book an XSTO wheelchair demonstration with Bentech Medical Ltd or an authorised UK stockist.',
    path: '/demo',
  });

const MODEL_OPTIONS = ['M4', 'M4 Pro', 'M4B', 'X12', 'X12 Pro'] as const;

export default function DemoPage() {
  const {errors, loading, success, handleSubmit} = useValidatedApiForm({
    schema: demoRequestSchema,
    action: '/api/demo-request',
  });

  return (
    <PageShell className="max-w-3xl">
      <PageHeader
        breadcrumbs={[{name: 'Home', path: '/'}, {name: 'Book a Demo'}]}
        description="See an XSTO wheelchair in person. We'll confirm your booking within one business day."
        title="Book a Demo"
      />

      <div className="mb-8 space-y-4 text-muted-foreground">
        <p>
          Whether you visit our Dorset showroom or an authorised stockist near you,
          a demo lets you experience foldability, controls and fit before you buy.
        </p>
        <h2 className="text-lg font-semibold text-foreground">What to expect</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Hands-on time with your preferred model</li>
          <li>Guidance on sizing, accessories and VAT relief</li>
          <li>No obligation — our team is here to help you decide</li>
        </ul>
      </div>

      {success ? (
        <FormSuccess>
          Demo request received — we&apos;ll contact you to confirm a date and location.
        </FormSuccess>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormField error={errors.name} id="name" label="Name">
            <TextInput id="name" name="name" required type="text" />
          </FormField>
          <FormField error={errors.email} id="email" label="Email">
            <TextInput id="email" name="email" required type="email" />
          </FormField>
          <FormField error={errors.phone} id="phone" label="Phone">
            <TextInput id="phone" name="phone" required type="tel" />
          </FormField>
          <FormField error={errors.postcode} id="postcode" label="Postcode">
            <TextInput id="postcode" name="postcode" required type="text" />
          </FormField>
          <FormField error={errors.model} id="model" label="Preferred model">
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
            <FormField error={errors.preferredDate} id="preferredDate" label="Preferred date">
              <TextInput id="preferredDate" name="preferredDate" type="date" />
            </FormField>
            <FormField error={errors.preferredTime} id="preferredTime" label="Preferred time">
              <TextInput id="preferredTime" name="preferredTime" placeholder="e.g. Morning" type="text" />
            </FormField>
          </div>
          <FormField error={errors.notes} id="notes" label="Notes (optional)">
            <TextArea id="notes" name="notes" />
          </FormField>
          {errors.form ? (
            <p className="text-sm text-destructive" role="alert">
              {errors.form}
            </p>
          ) : null}
          <SubmitButton loading={loading}>Request demo</SubmitButton>
        </form>
      )}
    </PageShell>
  );
}
