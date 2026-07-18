import type {Route} from './+types/quote';
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
import {quoteRequestSchema} from '~/lib/form-schemas';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: 'Request a Quote',
    description:
      'Request a trade or bulk quote for XSTO powered wheelchairs from Bentech Medical Ltd.',
    path: '/quote',
  });

const MODEL_OPTIONS = [
  'M4',
  'M4 Pro',
  'M4B',
  'EzGo2',
  'X12',
  'X12 Pro',
  'Multiple / Unsure',
] as const;

export default function QuotePage() {
  const {errors, loading, success, handleSubmit} = useValidatedApiForm({
    schema: quoteRequestSchema,
    action: '/api/quote-request',
  });

  return (
    <PageShell className="max-w-3xl">
      <PageHeader
        description="Healthcare professionals, care providers and retailers — request pricing for single or multiple units."
        title="Request a Quote"
      />

      <p className="mb-8 text-muted-foreground">
        A member of our team will respond within one business day with pricing,
        availability and delivery information tailored to your requirements.
      </p>

      {success ? (
        <FormSuccess>
          Quote request received — we&apos;ll be in touch within one business day.
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
          <FormField error={errors.company} id="company" label="Company (optional)">
            <TextInput id="company" name="company" type="text" />
          </FormField>
          <FormField error={errors.model} id="model" label="Model">
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
          <FormField error={errors.quantity} id="quantity" label="Quantity">
            <TextInput defaultValue="1" id="quantity" min={1} name="quantity" required type="number" />
          </FormField>
          <FormField error={errors.vatReliefEligible} id="vatReliefEligible" label="VAT relief eligible?">
            <SelectInput defaultValue="" id="vatReliefEligible" name="vatReliefEligible" required>
              <option disabled value="">
                Select
              </option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </SelectInput>
          </FormField>
          <FormField error={errors.notes} id="notes" label="Notes (optional)">
            <TextArea id="notes" name="notes" />
          </FormField>
          {errors.form ? (
            <p className="text-sm text-destructive" role="alert">
              {errors.form}
            </p>
          ) : null}
          <SubmitButton loading={loading}>Request quote</SubmitButton>
        </form>
      )}
    </PageShell>
  );
}
