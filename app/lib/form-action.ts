import type {z} from 'zod';
import {formatZodErrors} from '~/lib/form-schemas';
import {
  sendFormNotification,
  type FormNotificationEnv,
  type FormNotificationPayload,
} from '~/lib/form-notifications';

type FormActionArgs = {
  request: Request;
  context: {env: FormNotificationEnv};
};

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {'Cache-Control': 'no-store'},
  });
}

/**
 * Shared JSON form action: validate → email sales → {ok} / fieldErrors.
 */
export async function handleValidatedFormAction<T extends z.ZodType>({
  request,
  context,
  schema,
  formType,
  subject,
  buildFields,
  getReplyTo,
}: {
  request: Request;
  context: FormActionArgs['context'];
  schema: T;
  formType: string;
  subject: string | ((values: z.infer<T>) => string);
  buildFields: (values: z.infer<T>) => FormNotificationPayload['fields'];
  getReplyTo?: (values: z.infer<T>) => string | null | undefined;
}) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {status: 405});
  }

  // These endpoints serve our browser forms, not third-party integrations.
  // Origin checks are one layer only: bots can forge request headers.
  const source =
    request.headers.get('origin') || request.headers.get('referer');
  let sameOrigin = false;
  try {
    sameOrigin =
      Boolean(source) &&
      new URL(source!).origin === new URL(request.url).origin;
  } catch {
    sameOrigin = false;
  }
  if (!sameOrigin || request.headers.get('sec-fetch-site') === 'cross-site') {
    return json(
      {
        ok: false,
        error: 'Please send your enquiry using the form on our website.',
      },
      403,
    );
  }

  const body = await request.json().catch(() => null);
  // Check before schema parsing, which can strip unknown fields.
  if (
    body !== null &&
    typeof body === 'object' &&
    'website' in body &&
    typeof body.website === 'string' &&
    body.website.trim()
  ) {
    return json({ok: true as const});
  }
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return json(
      {ok: false as const, fieldErrors: formatZodErrors(parsed.error)},
      400,
    );
  }

  const values = parsed.data as z.infer<T>;
  const result = await sendFormNotification(context.env, {
    formType,
    subject: typeof subject === 'function' ? subject(values) : subject,
    replyTo: getReplyTo?.(values),
    fields: buildFields(values),
  });

  if (!result.ok) {
    return json(
      {ok: false as const, error: result.error},
      result.configured ? 502 : 503,
    );
  }

  return json({ok: true as const});
}
