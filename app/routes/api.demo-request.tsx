import type {Route} from './+types/api.demo-request';
import {handleValidatedFormAction} from '~/lib/form-action';
import {demoRequestSchema} from '~/lib/form-schemas';

export async function action({request, context}: Route.ActionArgs) {
  return handleValidatedFormAction({
    request,
    context,
    schema: demoRequestSchema,
    formType: 'demo-request',
    subject: (values) => `Demo request: ${values.model}`,
    getReplyTo: (values) => values.email,
    buildFields: (values) => ({
      Name: values.name,
      Email: values.email,
      Phone: values.phone,
      Postcode: values.postcode,
      Model: values.model,
      'Preferred date': values.preferredDate,
      'Preferred time': values.preferredTime,
      Notes: values.notes,
    }),
  });
}

export default function DemoRequestApiRoute() {
  return null;
}
