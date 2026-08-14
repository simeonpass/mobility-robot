export const VAT_RELIEF_SESSION_KEY = 'xsto-vat-relief';

export type StoredVatReliefRegistration = {
  email: string;
  name: string;
  address: string;
  condition: string;
  registeredAt: string;
  /** When false, declaration may still be remembered for the form but relief is off. */
  enabled?: boolean;
};

export function saveVatReliefRegistration(data: StoredVatReliefRegistration) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(VAT_RELIEF_SESSION_KEY, JSON.stringify(data));
}

export function readVatReliefRegistration(): StoredVatReliefRegistration | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(VAT_RELIEF_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredVatReliefRegistration;
    if (!parsed.email || !parsed.name || !parsed.address || !parsed.condition) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** True only when a complete declaration is stored AND relief is still enabled. */
export function readVatReliefEnabled(): boolean {
  const stored = readVatReliefRegistration();
  if (!stored) return false;
  if (stored.enabled === false) return false;
  return Boolean(
    stored.email.trim() &&
      stored.name.trim() &&
      stored.address.trim() &&
      stored.condition.trim(),
  );
}

export function clearVatReliefRegistration() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(VAT_RELIEF_SESSION_KEY);
}

export function buildAccountLoginUrl({
  email,
  returnTo,
}: {
  email: string;
  returnTo?: string;
}) {
  const params = new URLSearchParams({
    login_hint: email,
    login_hint_mode: 'email',
  });

  if (returnTo) {
    params.set('return_to', returnTo);
  }

  return `/account/login?${params.toString()}`;
}

export function buildVatReliefRegisterUrl(returnTo: string) {
  const params = new URLSearchParams({return: returnTo});
  return `/vat-relief?${params.toString()}`;
}
