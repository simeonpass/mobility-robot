import {Link} from 'react-router';
import type {Route} from './+types/warranty';
import {ContentWithToc} from '~/components/content/ContentWithToc';
import {JsonLd, PageHeader, PageShell} from '~/components/content/PageShell';
import {
  FormField,
  FormSuccess,
  SubmitButton,
  TextInput,
} from '~/components/forms/FormField';
import {useValidatedApiForm} from '~/components/forms/useValidatedApiForm';
import {warrantySections} from '~/lib/content/warranty-returns';
import {warrantyRegisterSchema} from '~/lib/form-schemas';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: 'Warranty Information',
    description:
      'XSTO warranty: 5-year frame, 1-year electrical and battery cover. Register your product with Bentech Medical Ltd.',
    path: '/warranty',
  });

export default function WarrantyPage() {
  const {errors, loading, success, handleSubmit} = useValidatedApiForm({
    schema: warrantyRegisterSchema,
    action: '/api/warranty-register',
  });

  return (
    <PageShell>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'XSTO Warranty Information',
          description:
            'Manufacturer warranty terms for XSTO powered wheelchairs in the UK.',
        }}
      />
      <PageHeader
        breadcrumbs={[{name: 'Home', path: '/'}, {name: 'Warranty'}]}
        description="All XSTO wheelchairs include manufacturer warranty cover managed in the UK by Bentech Medical Ltd."
        title="Warranty"
      />

      <ContentWithToc sections={warrantySections} />

      <section aria-labelledby="warranty-register-heading" className="mt-12">
        <h2 className="text-xl font-semibold text-foreground" id="warranty-register-heading">
          Register your warranty
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Register your product to speed up future warranty claims. Returns policy:{' '}
          <Link className="text-gold hover:text-gold-dark" to="/returns">
            view our returns page
          </Link>
          .
        </p>

        <div className="mt-6 max-w-xl">
          {success ? (
            <FormSuccess>
              Thank you — your warranty registration has been received.
            </FormSuccess>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <FormField error={errors.name} id="name" label="Full name">
                <TextInput id="name" name="name" required type="text" />
              </FormField>
              <FormField error={errors.email} id="email" label="Email">
                <TextInput id="email" name="email" required type="email" />
              </FormField>
              <FormField error={errors.orderRef} id="orderRef" label="Order reference">
                <TextInput id="orderRef" name="orderRef" required type="text" />
              </FormField>
              <FormField error={errors.serial} id="serial" label="Serial number">
                <TextInput id="serial" name="serial" required type="text" />
              </FormField>
              <FormField error={errors.purchaseDate} id="purchaseDate" label="Purchase date">
                <TextInput id="purchaseDate" name="purchaseDate" required type="date" />
              </FormField>
              {errors.form ? (
                <p className="text-sm text-destructive" role="alert">
                  {errors.form}
                </p>
              ) : null}
              <SubmitButton loading={loading}>Register warranty</SubmitButton>
            </form>
          )}
        </div>
      </section>
    </PageShell>
  );
}
