import {COMPANY} from '~/lib/site-navigation';

export type FormNotificationEnv = {
  RESEND_API_KEY?: string;
  FORMSPREE_ENDPOINT?: string;
  FORMS_TO_EMAIL?: string;
  FORMS_FROM_EMAIL?: string;
};

export type FormNotificationPayload = {
  /** Short type key used in the subject, e.g. contact / demo / quote */
  formType: string;
  /** Email subject line */
  subject: string;
  /** Customer reply-to when available */
  replyTo?: string | null;
  /** Field label → value for the email body */
  fields: Record<string, string | number | boolean | null | undefined>;
};

export type FormNotificationResult =
  | {ok: true; provider: 'resend' | 'formspree'}
  | {ok: false; error: string; configured: boolean};

const DEFAULT_TO = COMPANY.email;
/** Verified Resend domain — do not use onboarding@resend.dev in production. */
const DEFAULT_FROM = 'XSTO UK <noreply@mobilityrobot.co.uk>';

export function isFormEmailConfigured(env: FormNotificationEnv): boolean {
  return Boolean(env.RESEND_API_KEY?.trim() || env.FORMSPREE_ENDPOINT?.trim());
}

export function formatFormFieldsHtml(
  fields: FormNotificationPayload['fields'],
): string {
  const rows = Object.entries(fields)
    .filter(([, value]) => value != null && String(value).trim() !== '')
    .map(([label, value]) => {
      const safeLabel = escapeHtml(label);
      const safeValue = escapeHtml(String(value)).replace(/\n/g, '<br />');
      return `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;vertical-align:top;white-space:nowrap;">${safeLabel}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${safeValue}</td></tr>`;
    })
    .join('');

  return `<table style="border-collapse:collapse;width:100%;max-width:640px;font-family:system-ui,sans-serif;font-size:14px;color:#111">${rows}</table>`;
}

export function formatFormFieldsText(
  fields: FormNotificationPayload['fields'],
): string {
  return Object.entries(fields)
    .filter(([, value]) => value != null && String(value).trim() !== '')
    .map(([label, value]) => `${label}: ${String(value)}`)
    .join('\n\n');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Notify the sales team of a website form submission.
 * Prefers Resend when RESEND_API_KEY is set; otherwise Formspree.
 */
export async function sendFormNotification(
  env: FormNotificationEnv,
  payload: FormNotificationPayload,
): Promise<FormNotificationResult> {
  if (!isFormEmailConfigured(env)) {
    console.error(
      `[forms] ${payload.formType} submitted but email is not configured. Set RESEND_API_KEY or FORMSPREE_ENDPOINT.`,
    );
    return {
      ok: false,
      configured: false,
      error:
        'Form email is not configured on the server. Please email sales@bentchmeduk.com directly or call 0208 050 4849.',
    };
  }

  if (env.RESEND_API_KEY?.trim()) {
    return sendViaResend(env, payload);
  }

  return sendViaFormspree(env, payload);
}

async function sendViaResend(
  env: FormNotificationEnv,
  payload: FormNotificationPayload,
): Promise<FormNotificationResult> {
  const to = env.FORMS_TO_EMAIL?.trim() || DEFAULT_TO;
  const from = env.FORMS_FROM_EMAIL?.trim() || DEFAULT_FROM;
  const html = `
    <p style="font-family:system-ui,sans-serif;font-size:14px;color:#111">
      New <strong>${escapeHtml(payload.formType)}</strong> submission from mobilityrobot.co.uk
    </p>
    ${formatFormFieldsHtml(payload.fields)}
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY!.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: payload.subject,
        reply_to: payload.replyTo || undefined,
        html,
        text: formatFormFieldsText(payload.fields),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('[forms] Resend failed', response.status, detail);
      return {
        ok: false,
        configured: true,
        error:
          'We could not send your message just now. Please try again or email sales@bentchmeduk.com.',
      };
    }

    return {ok: true, provider: 'resend'};
  } catch (error) {
    console.error('[forms] Resend request error', error);
    return {
      ok: false,
      configured: true,
      error:
        'We could not send your message just now. Please try again or email sales@bentchmeduk.com.',
    };
  }
}

async function sendViaFormspree(
  env: FormNotificationEnv,
  payload: FormNotificationPayload,
): Promise<FormNotificationResult> {
  const endpoint = env.FORMSPREE_ENDPOINT!.trim();

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload.fields,
        _subject: payload.subject,
        _replyto: payload.replyTo || undefined,
        formType: payload.formType,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('[forms] Formspree failed', response.status, detail);
      return {
        ok: false,
        configured: true,
        error:
          'We could not send your message just now. Please try again or email sales@bentchmeduk.com.',
      };
    }

    return {ok: true, provider: 'formspree'};
  } catch (error) {
    console.error('[forms] Formspree request error', error);
    return {
      ok: false,
      configured: true,
      error:
        'We could not send your message just now. Please try again or email sales@bentchmeduk.com.',
    };
  }
}
