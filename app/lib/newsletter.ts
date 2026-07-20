import {
  sendFormNotification,
  type FormNotificationEnv,
} from '~/lib/form-notifications';

export type NewsletterResult = {
  success?: boolean;
  error?: string;
  message?: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Footer / homepage "Stay Updated" — emails the sales inbox via Resend
 * (same path as contact / demo / quote forms). No Shopify Admin app required.
 */
export async function subscribeNewsletter(
  _storefront: unknown,
  email: string,
  env?: FormNotificationEnv,
): Promise<NewsletterResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    return {error: 'Please enter a valid email address.'};
  }

  if (!env) {
    return {
      error:
        'Something went wrong. Please try again or contact sales@bentechmeduk.com.',
    };
  }

  const notified = await sendFormNotification(env, {
    formType: 'newsletter',
    subject: `Newsletter signup: ${normalizedEmail}`,
    replyTo: normalizedEmail,
    fields: {
      Email: normalizedEmail,
      Source: 'Footer Stay Updated',
    },
  });

  if (notified.ok) {
    return {
      success: true,
      message: 'Thank you for subscribing.',
    };
  }

  console.error('[newsletter] notification failed', notified.error);

  return {
    error:
      'Something went wrong. Please try again or contact sales@bentechmeduk.com.',
  };
}
