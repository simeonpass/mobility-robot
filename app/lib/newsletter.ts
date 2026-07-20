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

const ADMIN_CUSTOMER_SEARCH = `
  query NewsletterCustomerSearch($query: String!) {
    customers(first: 1, query: $query) {
      nodes {
        id
        email
        emailMarketingConsent {
          marketingState
        }
      }
    }
  }
`;

const ADMIN_CUSTOMER_CREATE = `
  mutation NewsletterCustomerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        emailMarketingConsent {
          marketingState
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const ADMIN_EMAIL_MARKETING_UPDATE = `
  mutation NewsletterEmailMarketingConsentUpdate(
    $input: CustomerEmailMarketingConsentUpdateInput!
  ) {
    customerEmailMarketingConsentUpdate(input: $input) {
      customer {
        id
        emailMarketingConsent {
          marketingState
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

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

type NewsletterEnv = FormNotificationEnv & {
  SHOPIFY_ADMIN_API_ACCESS_TOKEN?: string;
  PUBLIC_STORE_DOMAIN?: string;
};

type AdminGraphqlResponse<T> = {
  data?: T;
  errors?: Array<{message: string}>;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function adminGraphql<T>(
  env: NewsletterEnv,
  query: string,
  variables: Record<string, unknown>,
): Promise<AdminGraphqlResponse<T>> {
  const token = env.SHOPIFY_ADMIN_API_ACCESS_TOKEN?.trim();
  const storeDomain = env.PUBLIC_STORE_DOMAIN?.trim();
  if (!token || !storeDomain) {
    return {errors: [{message: 'Admin API not configured'}]};
  }

  const response = await fetch(
    `https://${storeDomain}/admin/api/2025-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({query, variables}),
    },
  );

  if (!response.ok) {
    return {errors: [{message: `Admin API HTTP ${response.status}`}]};
  }

  return (await response.json()) as AdminGraphqlResponse<T>;
}

/**
 * Prefer Admin API: create customer or mark existing as email-marketing subscribed.
 * This is the reliable path for Hydrogen + New Customer Accounts stores.
 */
async function subscribeViaAdminApi(
  env: NewsletterEnv,
  email: string,
): Promise<NewsletterResult | null> {
  if (!env.SHOPIFY_ADMIN_API_ACCESS_TOKEN?.trim() || !env.PUBLIC_STORE_DOMAIN?.trim()) {
    return null;
  }

  const marketingConsent = {
    marketingState: 'SUBSCRIBED',
    marketingOptInLevel: 'SINGLE_OPT_IN',
    consentUpdatedAt: new Date().toISOString(),
  };

  const search = await adminGraphql<{
    customers: {
      nodes: Array<{
        id: string;
        emailMarketingConsent?: {marketingState?: string | null} | null;
      }>;
    };
  }>(env, ADMIN_CUSTOMER_SEARCH, {query: `email:${email}`});

  if (search.errors?.length) {
    console.error('[newsletter] Admin search failed', search.errors);
    return null;
  }

  const existing = search.data?.customers.nodes[0];

  if (existing?.id) {
    if (existing.emailMarketingConsent?.marketingState === 'SUBSCRIBED') {
      return {
        success: true,
        message: 'Thank you — you are already on our mailing list.',
      };
    }

    const update = await adminGraphql<{
      customerEmailMarketingConsentUpdate: {
        customer?: {id: string} | null;
        userErrors: Array<{message: string}>;
      };
    }>(env, ADMIN_EMAIL_MARKETING_UPDATE, {
      input: {
        customerId: existing.id,
        emailMarketingConsent: marketingConsent,
      },
    });

    const userErrors =
      update.data?.customerEmailMarketingConsentUpdate.userErrors ?? [];
    if (userErrors.length || update.errors?.length) {
      console.error('[newsletter] Admin consent update failed', {
        userErrors,
        errors: update.errors,
      });
      return null;
    }

    return {
      success: true,
      message: 'Thank you for subscribing.',
    };
  }

  const create = await adminGraphql<{
    customerCreate: {
      customer?: {id: string} | null;
      userErrors: Array<{message: string}>;
    };
  }>(env, ADMIN_CUSTOMER_CREATE, {
    input: {
      email,
      tags: ['newsletter', 'website-signup'],
      emailMarketingConsent: marketingConsent,
    },
  });

  const userErrors = create.data?.customerCreate.userErrors ?? [];
  const customerId = create.data?.customerCreate.customer?.id;

  if (!customerId || userErrors.length || create.errors?.length) {
    console.error('[newsletter] Admin customerCreate failed', {
      userErrors,
      errors: create.errors,
    });
    return null;
  }

  return {
    success: true,
    message: 'Thank you for subscribing.',
  };
}

async function subscribeViaStorefront(
  storefront: StorefrontMutate,
  email: string,
): Promise<NewsletterResult | null> {
  try {
    const result = await storefront.mutate(NEWSLETTER_SUBSCRIBE_MUTATION, {
      variables: {
        input: {
          email,
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

      console.error('[newsletter] Storefront userErrors', userErrors);
      return null;
    }

    if (payload?.customer?.id) {
      return {
        success: true,
        message: 'Thank you for subscribing.',
      };
    }
  } catch (error) {
    console.error('[newsletter] Storefront customerCreate failed', error);
  }

  return null;
}

export async function subscribeNewsletter(
  storefront: StorefrontMutate,
  email: string,
  env?: NewsletterEnv,
): Promise<NewsletterResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    return {error: 'Please enter a valid email address.'};
  }

  if (env) {
    const adminResult = await subscribeViaAdminApi(env, normalizedEmail);
    if (adminResult) return adminResult;
  }

  const storefrontResult = await subscribeViaStorefront(
    storefront,
    normalizedEmail,
  );
  if (storefrontResult) return storefrontResult;

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
  }

  return {
    error:
      'Something went wrong. Please try again or contact sales@bentechmeduk.com.',
  };
}
