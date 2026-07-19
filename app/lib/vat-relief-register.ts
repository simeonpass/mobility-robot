import type {VatDeclaration} from '~/lib/vat-relief-types';

/**
 * Registers / updates the tax-exempt Shopify customer for a VAT declaration.
 * Fire-and-forget from the client; cart sync is the server-side backup.
 */
export async function registerVatReliefCustomer(
  declaration: VatDeclaration,
): Promise<{ok: boolean; error?: string}> {
  try {
    const response = await fetch('/api/vat-relief', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: declaration.email.trim(),
        name: declaration.name.trim(),
        address: declaration.address.trim(),
        condition: declaration.condition.trim(),
        declaration: 'yes',
      }),
    });
    const payload = (await response.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
    } | null;

    if (!response.ok || !payload?.ok) {
      return {
        ok: false,
        error: payload?.error ?? 'VAT registration failed',
      };
    }

    return {ok: true};
  } catch {
    return {ok: false, error: 'VAT registration network error'};
  }
}
