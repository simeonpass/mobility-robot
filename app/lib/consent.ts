export const CONSENT_STORAGE_KEY = 'xsto_consent_v1';

export type ConsentChoice = 'granted' | 'denied' | 'pending';

export type ConsentPreferences = {
  analytics: boolean;
  marketing: boolean;
};

export type StoredConsent = {
  choice: ConsentChoice;
  preferences: ConsentPreferences;
  updatedAt: string;
};

export const DEFAULT_CONSENT: StoredConsent = {
  choice: 'pending',
  preferences: {analytics: false, marketing: false},
  updatedAt: '',
};

export function readStoredConsent(): StoredConsent {
  if (typeof window === 'undefined') return DEFAULT_CONSENT;

  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return DEFAULT_CONSENT;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (!parsed?.choice) return DEFAULT_CONSENT;
    return parsed;
  } catch {
    return DEFAULT_CONSENT;
  }
}

export function writeStoredConsent(consent: StoredConsent): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
}

export function isAnalyticsGranted(consent: StoredConsent): boolean {
  return consent.choice === 'granted' && consent.preferences.analytics;
}

export function syncShopifyTrackingConsent(consent: StoredConsent): void {
  if (typeof window === 'undefined') return;

  const shopify = (
    window as Window & {
      Shopify?: {
        customerPrivacy?: {
          setTrackingConsent: (
            consent: {analytics: boolean; marketing: boolean},
            callback?: () => void,
          ) => void;
        };
      };
    }
  ).Shopify;

  shopify?.customerPrivacy?.setTrackingConsent({
    analytics: consent.preferences.analytics,
    marketing: consent.preferences.marketing,
  });
}
