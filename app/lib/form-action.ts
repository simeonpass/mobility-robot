import {data} from 'react-router';
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

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return data(
      {ok: false as const, fieldErrors: formatZodErrors(parsed.error)},
      {status: 400},
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
    return data(
      {ok: false as const, error: result.error},
      {status: result.configured ? 502 : 503},
    );
  }

  return data({ok: true as const});
}
