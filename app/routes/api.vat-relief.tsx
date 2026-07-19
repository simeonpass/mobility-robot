import {data} from 'react-router';
import type {Route} from './+types/api.vat-relief';
import {vatReliefRegistrationSchema} from '~/lib/form-schemas';
import {upsertTaxExemptCustomer} from '~/lib/shopify-admin-vat';

export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {status: 405});
  }

  const body = await request.json().catch(() => null);
  const parsed = vatReliefRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return data(
      {ok: false, error: 'Please check the form and try again.'},
      {status: 400},
    );
  }

  const {name, email, address, condition} = parsed.data;
  const result = await upsertTaxExemptCustomer(context.env, {
    name,
    email,
    address,
    condition,
  });

  if (!result.ok) {
    if (result.reason === 'missing_token') {
      return data(
        {
          ok: false,
          error:
            'VAT registration is temporarily unavailable. Please contact support@mobilityrobot.co.uk and we will set up your account manually.',
        },
        {status: 503},
      );
    }

    return data(
      {
        ok: false,
        error:
          result.message ??
          'We could not register your VAT relief account. Please try again or contact us.',
      },
      {status: 500},
    );
  }

  return data({
    ok: true,
    email,
    name,
    address,
    condition,
    created: result.created,
  });
}

export default function VatReliefApiRoute() {
  return null;
}
