import type {Route} from './+types/api.newsletter';
import {subscribeNewsletter} from '~/lib/newsletter';

function isSameOriginRequest(request: Request): boolean {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (origin) {
    try {
      return new URL(origin).origin === requestUrl.origin;
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      return new URL(referer).origin === requestUrl.origin;
    } catch {
      return false;
    }
  }

  // Normal browser form submissions include Origin or Referer. Direct bot
  // requests commonly include neither, so reject those requests.
  return false;
}

export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return Response.json({error: 'Method not allowed'}, {status: 405});
  }

  if (!isSameOriginRequest(request)) {
    return Response.json({error: 'Invalid request.'}, {status: 403});
  }

  const formData = await request.formData();
  const email = formData.get('email');
  const website = formData.get('website');

  // Honeypot: real visitors never see or fill this field. Return a normal
  // success response so automated submitters are less likely to retry.
  if (typeof website === 'string' && website.trim() !== '') {
    return Response.json({
      success: true,
      message: 'Thank you for subscribing.',
    });
  }

  if (typeof email !== 'string') {
    return Response.json({error: 'Email is required.'}, {status: 400});
  }

  const result = await subscribeNewsletter(
    context.storefront,
    email,
    context.env,
  );

  if (result.error) {
    return Response.json(result, {status: 400});
  }

  return Response.json(result);
}
