import type {Route} from './+types/api.newsletter';
import {subscribeNewsletter} from '~/lib/newsletter';

export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return Response.json({error: 'Method not allowed'}, {status: 405});
  }

  const formData = await request.formData();
  const email = formData.get('email');

  if (typeof email !== 'string') {
    return Response.json({error: 'Email is required.'}, {status: 400});
  }

  const result = await subscribeNewsletter(context.storefront, email);

  if (result.error) {
    return Response.json(result, {status: 400});
  }

  return Response.json(result);
}
