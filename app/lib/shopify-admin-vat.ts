/**
 * Shopify Admin API helpers for VAT exemption customer records.
 *
 * Auth (first match wins):
 *   1. SHOPIFY_ADMIN_API_ACCESS_TOKEN (legacy shpat_ custom app)
 *   2. XSTO_VAT_RELIEF_CLIENT_ID + XSTO_VAT_RELIEF_CLIENT_SECRET
 *      (Dev Dashboard app — client_credentials; needs write_customers)
 *
 * Catalog prices are tax-exclusive. VAT relief is applied by marking the
 * declarant `taxExempt: true` so Shopify does not add 20% VAT — payable =
 * catalog (ex VAT). The product discount function must apply **£0** (or no
 * candidates); combining taxExempt with a catalog/6 discount under-charges
 * (~£833 on a £1000 item).
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
  | {
      ok: false;
      reason: 'missing_token' | 'invalid_email' | 'admin_error';
      message?: string;
    };

// Not tagged #graphql — Admin API docs must not run through Storefront codegen.
const CUSTOMER_SEARCH_QUERY = `
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

const CUSTOMER_CREATE_MUTATION = `
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

const CUSTOMER_UPDATE_MUTATION = `
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

type AdminAuth =
  | {kind: 'static'; token: string; storeDomain: string}
  | {
      kind: 'client_credentials';
      clientId: string;
      clientSecret: string;
      storeDomain: string;
    };

function getAdminAuth(env: Env): AdminAuth | null {
  const storeDomain = env.PUBLIC_STORE_DOMAIN?.trim();
  if (!storeDomain) return null;

  const staticToken = env.SHOPIFY_ADMIN_API_ACCESS_TOKEN?.trim();
  if (staticToken?.startsWith('shpat_')) {
    return {kind: 'static', token: staticToken, storeDomain};
  }

  const clientId = env.XSTO_VAT_RELIEF_CLIENT_ID?.trim();
  const clientSecret = env.XSTO_VAT_RELIEF_CLIENT_SECRET?.trim();
  if (clientId && clientSecret) {
    return {kind: 'client_credentials', clientId, clientSecret, storeDomain};
  }

  return null;
}

async function resolveAdminToken(
  auth: AdminAuth,
): Promise<{token: string; storeDomain: string} | null> {
  if (auth.kind === 'static') {
    return {token: auth.token, storeDomain: auth.storeDomain};
  }

  const response = await fetch(
    `https://${auth.storeDomain}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: auth.clientId,
        client_secret: auth.clientSecret,
      }),
    },
  );

  const payload = (await response.json()) as {
    access_token?: string;
    scope?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !payload.access_token) {
    console.error('VAT Admin client_credentials failed', {
      status: response.status,
      error: payload.error,
      error_description: payload.error_description,
    });
    return null;
  }

  if (payload.scope && !payload.scope.split(/[,\s]+/).includes('write_customers')) {
    console.error(
      'VAT Admin token missing write_customers scope — taxExempt upsert will fail',
      {scope: payload.scope},
    );
  }

  return {token: payload.access_token, storeDomain: auth.storeDomain};
}

async function adminGraphql<T>(
  env: Env,
  query: string,
  variables: Record<string, unknown>,
): Promise<AdminGraphqlResponse<T>> {
  const auth = getAdminAuth(env);
  if (!auth) {
    return {errors: [{message: 'Admin API not configured'}]};
  }

  const config = await resolveAdminToken(auth);
  if (!config) {
    return {errors: [{message: 'Admin API token unavailable'}]};
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
    // Tax-exclusive catalog: no product discount — taxExempt waives VAT so
    // payable = catalog. Customer must use this email at checkout (ideally signed in).
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
  if (!getAdminAuth(env)) {
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
): Promise<string | null> {
  const seenEmails = new Set<string>();
  let primaryEmail: string | null = null;

  for (const line of lines) {
    const declaration = parseVatExemptionFromAttributes(line.attributes);
    if (!declaration || seenEmails.has(declaration.email)) continue;
    seenEmails.add(declaration.email);
    if (!primaryEmail) primaryEmail = declaration.email.trim().toLowerCase();

    try {
      const result = await upsertTaxExemptCustomer(env, declaration);
      if (!result.ok) {
        console.error('VAT exemption customer sync failed', result);
      }
    } catch (error) {
      console.error('VAT exemption customer sync failed', error);
    }
  }

  return primaryEmail;
}

export function adminApiConfigured(env: Env): boolean {
  return Boolean(getAdminAuth(env));
}
