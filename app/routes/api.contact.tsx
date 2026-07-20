import type {Route} from './+types/api.contact';
import {handleValidatedFormAction} from '~/lib/form-action';
import {contactFormSchema} from '~/lib/form-schemas';

export async function action({request, context}: Route.ActionArgs) {
  return handleValidatedFormAction({
    request,
    context,
    schema: contactFormSchema,
    formType: 'contact',
    subject: (values) => `Contact form: ${values.topic}`,
    getReplyTo: (values) => values.email,
    buildFields: (values) => ({
      Name: values.name,
      Email: values.email,
      Phone: values.phone,
      Topic: values.topic,
      'Order reference': values.orderRef,
      Message: values.message,
    }),
  });
}

export default function ContactApiRoute() {
  return null;
}
