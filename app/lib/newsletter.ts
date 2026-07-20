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

export async function subscribeNewsletter(
  storefront: {
    query: (
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
  },
  email: string,
): Promise<NewsletterResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail.includes('@')) {
    return {error: 'Please enter a valid email address.'};
  }

  try {
    const result = await storefront.query(NEWSLETTER_SUBSCRIBE_MUTATION, {
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
      const alreadyRegistered = userErrors.some(
        (error) =>
          error.code === 'TAKEN' || error.code === 'UNIDENTIFIED_CUSTOMER',
      );

      if (alreadyRegistered) {
        return {
          success: true,
          message: 'Thank you — you are already on our mailing list.',
        };
      }

      return {
        error: userErrors[0]?.message ?? 'Unable to subscribe. Please try again.',
      };
    }

    if (payload?.customer?.id) {
      return {
        success: true,
        message: 'Thank you for subscribing.',
      };
    }

    return {error: 'Unable to subscribe. Please try again.'};
  } catch {
    return {
      error:
        'Something went wrong. Please try again or contact sales@bentchmeduk.com.',
    };
  }
}
