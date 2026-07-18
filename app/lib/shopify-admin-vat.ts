/**
 * Shopify Admin API helpers for VAT exemption customer records.
 *
 * Requires a custom app with `write_customers` scope and env:
 *   SHOPIFY_ADMIN_API_ACCESS_TOKEN
 *
 * Note: On UK stores with VAT-inclusive pricing, marking a customer tax-exempt
 * may not always reduce checkout totals without Shopify Plus cart transforms,
 * dynamic tax-inclusive pricing, or a dedicated VAT app. This records the
 * customer for merchant review and pairs with the VATRELIEF discount fallback.
 */

export type VatExemptionCustomerInput = {
  email: string;
  name: string;
  address: string;
  condition: string;
};

type AdminGraphqlResponse<T> = {
  data?: T;
  errors?: Array<{message: string}>;
};

type CustomerUpsertResult =
  | {ok: true; customerId: string; created: boolean}
  | {ok: false; reason: 'missing_token' | 'invalid_email' | 'admin_error'; message?: string};

const CUSTOMER_SEARCH_QUERY = `#graphql
  query VatExemptionCustomerSearch($query: String!) {
    customers(first: 1, query: $query) {
      nodes {
        id
        email
        taxExempt
      }
    }
  }
`;

const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation VatExemptionCustomerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        taxExempt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CUSTOMER_UPDATE_MUTATION = `#graphql
  mutation VatExemptionCustomerUpdate($input: CustomerInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        email
        taxExempt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function getAdminConfig(env: Env): {token: string; storeDomain: string} | null {
  const token = env.SHOPIFY_ADMIN_API_ACCESS_TOKEN?.trim();
  const storeDomain = env.PUBLIC_STORE_DOMAIN?.trim();
  if (!token || !storeDomain) return null;
  return {token, storeDomain};
}

async function adminGraphql<T>(
  env: Env,
  query: string,
  variables: Record<string, unknown>,
): Promise<AdminGraphqlResponse<T>> {
  const config = getAdminConfig(env);
  if (!config) {
    return {errors: [{message: 'Admin API not configured'}]};
  }

  const response = await fetch(
    `https://${config.storeDomain}/admin/api/2025-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': config.token,
      },
      body: JSON.stringify({query, variables}),
    },
  );

  if (!response.ok) {
    return {
      errors: [{message: `Admin API HTTP ${response.status}`}],
    };
  }

  return (await response.json()) as AdminGraphqlResponse<T>;
}

function buildCustomerInput(input: VatExemptionCustomerInput) {
  const [firstName, ...rest] = input.name.trim().split(/\s+/);
  const lastName = rest.join(' ') || firstName;
  const note = [
    'HMRC VAT relief declaration (website)',
    `Name: ${input.name.trim()}`,
    `Address: ${input.address.trim()}`,
    `Condition: ${input.condition.trim()}`,
    `Declared: ${new Date().toISOString()}`,
  ].join('\n');

  return {
    email: input.email.trim().toLowerCase(),
    firstName,
    lastName,
    taxExempt: true,
    tags: ['vat-relief', 'vat-relief-declared'],
    note,
  };
}

export function isValidVatExemptionEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function upsertTaxExemptCustomer(
  env: Env,
  input: VatExemptionCustomerInput,
): Promise<CustomerUpsertResult> {
  if (!getAdminConfig(env)) {
    return {ok: false, reason: 'missing_token'};
  }

  if (!isValidVatExemptionEmail(input.email)) {
    return {ok: false, reason: 'invalid_email'};
  }

  const customerInput = buildCustomerInput(input);
  const search = await adminGraphql<{
    customers: {nodes: Array<{id: string; email: string}>};
  }>(env, CUSTOMER_SEARCH_QUERY, {
    query: `email:${customerInput.email}`,
  });

  if (search.errors?.length) {
    return {
      ok: false,
      reason: 'admin_error',
      message: search.errors.map((error) => error.message).join('; '),
    };
  }

  const existing = search.data?.customers.nodes[0];

  if (existing?.id) {
    const update = await adminGraphql<{
      customerUpdate: {
        customer?: {id: string} | null;
        userErrors: Array<{message: string}>;
      };
    }>(env, CUSTOMER_UPDATE_MUTATION, {
      input: {
        id: existing.id,
        ...customerInput,
      },
    });

    const userErrors = update.data?.customerUpdate.userErrors ?? [];
    if (userErrors.length > 0 || update.errors?.length) {
      return {
        ok: false,
        reason: 'admin_error',
        message:
          userErrors.map((error) => error.message).join('; ') ||
          update.errors?.map((error) => error.message).join('; '),
      };
    }

    return {ok: true, customerId: existing.id, created: false};
  }

  const create = await adminGraphql<{
    customerCreate: {
      customer?: {id: string} | null;
      userErrors: Array<{message: string}>;
    };
  }>(env, CUSTOMER_CREATE_MUTATION, {
    input: customerInput,
  });

  const userErrors = create.data?.customerCreate.userErrors ?? [];
  const customerId = create.data?.customerCreate.customer?.id;

  if (!customerId || userErrors.length > 0 || create.errors?.length) {
    return {
      ok: false,
      reason: 'admin_error',
      message:
        userErrors.map((error) => error.message).join('; ') ||
        create.errors?.map((error) => error.message).join('; '),
    };
  }

  return {ok: true, customerId, created: true};
}

export function parseVatExemptionFromAttributes(
  attributes?: Array<{key: string; value?: string | null}> | null,
): VatExemptionCustomerInput | null {
  if (!attributes?.some((attr) => attr.key === 'VAT Relief' && attr.value === 'Yes')) {
    return null;
  }

  const read = (key: string) =>
    attributes.find((attr) => attr.key === key)?.value?.trim() ?? '';

  const email = read('VAT Declaration Email');
  const name = read('VAT Declaration Name');
  const address = read('VAT Declaration Address');
  const condition = read('VAT Declaration Condition');

  if (!email || !name || !address || !condition) return null;

  return {email, name, address, condition};
}

export async function syncVatExemptionCustomersFromCart(
  env: Env,
  lines: Array<{
    attributes?: Array<{key: string; value?: string | null}> | null;
  }>,
): Promise<void> {
  const seenEmails = new Set<string>();

  for (const line of lines) {
    const declaration = parseVatExemptionFromAttributes(line.attributes);
    if (!declaration || seenEmails.has(declaration.email)) continue;
    seenEmails.add(declaration.email);

    try {
      await upsertTaxExemptCustomer(env, declaration);
    } catch (error) {
      console.error('VAT exemption customer sync failed', error);
    }
  }
}

export function adminApiConfigured(env: Env): boolean {
  return Boolean(getAdminConfig(env));
}
