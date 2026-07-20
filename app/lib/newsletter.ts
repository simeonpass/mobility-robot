import {
  sendFormNotification,
  type FormNotificationEnv,
} from '~/lib/form-notifications';

const NEWSLETTER_SUBSCRIBE_MUTATION = `#graphql
  mutation NewsletterSubscribe($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        acceptsMarketing
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;

export type NewsletterResult = {
  success?: boolean;
  error?: string;
  message?: string;
};

type StorefrontMutate = {
  mutate: (
    query: string,
    options?: {variables?: Record<string, unknown>},
  ) => Promise<{
    customerCreate?: {
      customer?: {id?: string | null} | null;
      customerUserErrors?: Array<{
        code?: string | null;
        message?: string | null;
      }> | null;
    } | null;
  }>;
};

export async function subscribeNewsletter(
  storefront: StorefrontMutate,
  email: string,
  env?: FormNotificationEnv,
): Promise<NewsletterResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail.includes('@') || normalizedEmail.length < 5) {
    return {error: 'Please enter a valid email address.'};
  }

  try {
    const result = await storefront.mutate(NEWSLETTER_SUBSCRIBE_MUTATION, {
      variables: {
        input: {
          email: normalizedEmail,
          password: crypto.randomUUID(),
          acceptsMarketing: true,
        },
      },
    });

    const payload = result?.customerCreate;
    const userErrors = payload?.customerUserErrors ?? [];

    if (userErrors.length > 0) {
      const alreadyRegistered = userErrors.some((error) => {
        const code = (error.code || '').toUpperCase();
        const message = (error.message || '').toLowerCase();
        return (
          code === 'TAKEN' ||
          code === 'CUSTOMER_DISABLED' ||
          message.includes('already') ||
          message.includes('taken')
        );
      });

      if (alreadyRegistered) {
        return {
          success: true,
          message: 'Thank you — you are already on our mailing list.',
        };
      }

      console.error('[newsletter] customerCreate userErrors', userErrors);
      // Fall through to email notification fallback below.
    } else if (payload?.customer?.id) {
      return {
        success: true,
        message: 'Thank you for subscribing.',
      };
    }
  } catch (error) {
    console.error('[newsletter] Storefront customerCreate failed', error);
  }

  // Fallback: notify sales via Resend when Storefront customerCreate is
  // unavailable (common with New Customer Accounts / disabled legacy signup).
  if (env) {
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

    console.error('[newsletter] Resend fallback failed', notified);
  }

  return {
    error:
      'Something went wrong. Please try again or contact sales@bentechmeduk.com.',
  };
}
