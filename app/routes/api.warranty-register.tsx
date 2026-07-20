import type {Route} from './+types/api.warranty-register';
import {handleValidatedFormAction} from '~/lib/form-action';
import {warrantyRegisterSchema} from '~/lib/form-schemas';

export async function action({request, context}: Route.ActionArgs) {
  return handleValidatedFormAction({
    request,
    context,
    schema: warrantyRegisterSchema,
    formType: 'warranty-register',
    subject: (values) => `Warranty registration: ${values.orderRef}`,
    getReplyTo: (values) => values.email,
    buildFields: (values) => ({
      Name: values.name,
      Email: values.email,
      'Order reference': values.orderRef,
      'Serial number': values.serial,
      'Purchase date': values.purchaseDate,
    }),
  });
}

export default function WarrantyRegisterApiRoute() {
  return null;
}
