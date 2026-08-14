import {data} from 'react-router';
import type {Route} from './+types/api.vat-relief';
import {vatReliefRegistrationSchema} from '~/lib/form-schemas';
import {upsertTaxExemptCustomer} from '~/lib/shopify-admin-vat';
import {z} from 'zod';

const vatReliefToggleSchema = z.discriminatedUnion('enabled', [
  z.object({
    enabled: z.literal(true),
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    address: z.string().trim().min(10),
    condition: z.string().trim().min(3),
  }),
  z.object({
    enabled: z.literal(false),
    email: z.string().trim().email(),
    name: z.string().trim().optional(),
    address: z.string().trim().optional(),
    condition: z.string().trim().optional(),
  }),
]);

export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {status: 405});
  }

  const body = await request.json().catch(() => null);

  // Legacy form posts (with declaration: "yes") still work.
  const legacy = vatReliefRegistrationSchema.safeParse(body);
  if (legacy.success) {
    const {name, email, address, condition} = legacy.data;
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
              'VAT registration is temporarily unavailable. Please contact sales@bentechmeduk.com and we will set up your account manually.',
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
    return data({ok: true, email, name, address, condition, created: result.created});
  }

  const parsed = vatReliefToggleSchema.safeParse(body);
  if (!parsed.success) {
    return data(
      {ok: false, error: 'Please check the form and try again.'},
      {status: 400},
    );
  }

  if (parsed.data.enabled === false) {
    const email = parsed.data.email;
    const result = await upsertTaxExemptCustomer(
      context.env,
      {
        email,
        name: parsed.data.name?.trim() || email,
        address: parsed.data.address?.trim() || 'Removed on website',
        condition: parsed.data.condition?.trim() || 'Removed on website',
      },
      {taxExempt: false},
    );

    if (!result.ok && result.reason !== 'missing_token') {
      return data(
        {
          ok: false,
          error:
            result.message ??
            'We could not update your VAT relief status. Please try again.',
        },
        {status: 500},
      );
    }

    return data({ok: true, email, enabled: false});
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
            'VAT registration is temporarily unavailable. Please contact sales@bentechmeduk.com and we will set up your account manually.',
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
    enabled: true,
    created: result.created,
  });
}

export default function VatReliefApiRoute() {
  return null;
}
