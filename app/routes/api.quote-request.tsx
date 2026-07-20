import type {Route} from './+types/api.quote-request';
import {handleValidatedFormAction} from '~/lib/form-action';
import {quoteRequestSchema} from '~/lib/form-schemas';

export async function action({request, context}: Route.ActionArgs) {
  return handleValidatedFormAction({
    request,
    context,
    schema: quoteRequestSchema,
    formType: 'quote-request',
    subject: (values) => `Quote request: ${values.model}`,
    getReplyTo: (values) => values.email,
    buildFields: (values) => ({
      Name: values.name,
      Email: values.email,
      Phone: values.phone,
      Company: values.company,
      Model: values.model,
      Quantity: values.quantity,
      'VAT relief eligible': values.vatReliefEligible,
      Notes: values.notes,
    }),
  });
}

export default function QuoteRequestApiRoute() {
  return null;
}
