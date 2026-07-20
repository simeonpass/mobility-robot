import {Link, redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/account.orders.$id.return';
import {Money} from '@shopify/hydrogen';
import type {OrderQuery} from 'customer-accountapi.generated';
import {
  FormField,
  FormSuccess,
  SelectInput,
  SubmitButton,
  TextArea,
} from '~/components/forms/FormField';
import {useValidatedApiForm} from '~/components/forms/useValidatedApiForm';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';
import {RETURN_REASONS, returnRequestSchema} from '~/lib/form-schemas';
import {NOINDEX_HEADERS, noindexMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => [
  ...noindexMeta({
    title: data?.order ? `Return ${data.order.name}` : 'Request a return',
    description: 'Submit a return request for your Mobility Robot order.',
    path: '/account/orders',
  }),
];

export const headers: Route.HeadersFunction = () => NOINDEX_HEADERS;

export async function loader({params, context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();

  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data: orderData, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await context.customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
        language: context.customerAccount.i18n.language,
      },
    });

  if (errors?.length || !orderData?.order) {
    throw new Response('Order not found', {status: 404});
  }

  return {
    order: orderData.order,
    encodedId: params.id,
  };
}

export default function OrderReturnRoute() {
  const {order, encodedId} = useLoaderData<typeof loader>();
  const {errors, loading, success, handleSubmit} = useValidatedApiForm({
    schema: returnRequestSchema,
    action: '/api/return-request',
  });

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-muted-foreground">
        <Link className="text-gold hover:text-gold-dark" to={`/account/orders/${encodedId}`}>
          ← Back to order {order.name}
        </Link>
      </p>

      <h2 className="mt-4 font-display text-2xl font-bold text-foreground">
        Request a return
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Order {order.name} · placed{' '}
        {order.processedAt
          ? new Date(order.processedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : '—'}{' '}
        · <Money data={order.totalPrice!} />
      </p>

      <p className="mt-4 rounded-lg border border-border bg-[#f7f6f4] p-4 text-sm leading-relaxed text-muted-foreground">
        Submitting this form starts a return <em>request</em>. Our team will
        review it against our{' '}
        <Link className="text-gold hover:text-gold-dark" to="/returns">
          returns policy
        </Link>{' '}
        and email you within one business day. A £250 collection fee may apply
        to large mobility items unless the return is due to our error or a defect.
      </p>

      {success ? (
        <div className="mt-8">
          <FormSuccess>
            Return request received for order {order.name}. We&apos;ll email you
            with next steps shortly.
          </FormSuccess>
          <p className="mt-4 text-sm text-muted-foreground">
            <Link className="text-gold hover:text-gold-dark" to="/account/orders">
              View all orders
            </Link>
          </p>
        </div>
      ) : (
        <form className="mt-8 space-y-6" noValidate onSubmit={handleSubmit}>
          <input name="orderRef" type="hidden" value={order.name} />

          <FormField error={errors.reason} id="reason" label="Reason for return">
            <SelectInput id="reason" name="reason" required defaultValue="">
              <option disabled value="">
                Select a reason
              </option>
              {RETURN_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </SelectInput>
          </FormField>

          <FormField error={errors.details} id="details" label="Additional details">
            <TextArea
              id="details"
              name="details"
              placeholder="Tell us anything we should know — damage, fit issues, accessories included, etc."
              required
              rows={5}
            />
          </FormField>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-foreground">
              Condition confirmation
            </legend>
            <label className="flex gap-3 text-sm text-muted-foreground">
              <input
                className="mt-1 size-4 shrink-0 accent-[hsl(var(--navy))]"
                name="unusedConfirmation"
                required
                type="checkbox"
                value="yes"
              />
              <span>
                I confirm the product is unused, in resalable condition, and I
                have read the{' '}
                <Link className="text-gold hover:text-gold-dark" to="/returns">
                  returns policy
                </Link>
                .
              </span>
            </label>
            {errors.unusedConfirmation ? (
              <p className="text-xs text-destructive" role="alert">
                {errors.unusedConfirmation}
              </p>
            ) : null}
          </fieldset>

          {errors.form ? (
            <p className="text-sm text-destructive" role="alert">
              {errors.form}
            </p>
          ) : null}

          <SubmitButton loading={loading}>Submit return request</SubmitButton>
        </form>
      )}
    </div>
  );
}
