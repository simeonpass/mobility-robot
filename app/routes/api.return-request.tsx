import type {Route} from './+types/api.return-request';
import {handleValidatedFormAction} from '~/lib/form-action';
import {returnRequestSchema} from '~/lib/form-schemas';

export async function action({request, context}: Route.ActionArgs) {
  return handleValidatedFormAction({
    request,
    context,
    schema: returnRequestSchema,
    formType: 'return-request',
    subject: (values) => `Return request: ${values.orderRef}`,
    buildFields: (values) => ({
      'Order reference': values.orderRef,
      Reason: values.reason,
      Details: values.details,
      'Unused confirmation': values.unusedConfirmation,
    }),
  });
}

export default function ReturnRequestApiRoute() {
  return null;
}
