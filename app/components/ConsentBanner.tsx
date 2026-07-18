import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router';
import {
  DEFAULT_CONSENT,
  isAnalyticsGranted,
  readStoredConsent,
  syncShopifyTrackingConsent,
  writeStoredConsent,
  type ConsentPreferences,
  type StoredConsent,
} from '~/lib/consent';
import {loadGa4Script} from '~/lib/analytics';

type ConsentContextValue = {
  consent: StoredConsent;
  analyticsAllowed: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (preferences: ConsentPreferences) => void;
  showPreferences: boolean;
  setShowPreferences: (open: boolean) => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error('useConsent must be used within ConsentProvider');
  }
  return ctx;
}

export function ConsentProvider({
  children,
  ga4Id,
}: {
  children: React.ReactNode;
  ga4Id?: string | null;
}) {
  const [consent, setConsent] = useState<StoredConsent>(DEFAULT_CONSENT);
  const [showPreferences, setShowPreferences] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredConsent();
    setConsent(stored);
    setHydrated(true);
    syncShopifyTrackingConsent(stored);
    if (isAnalyticsGranted(stored) && ga4Id) {
      loadGa4Script(ga4Id);
    }
  }, [ga4Id]);

  const persist = (next: StoredConsent) => {
    const stamped = {...next, updatedAt: new Date().toISOString()};
    writeStoredConsent(stamped);
    syncShopifyTrackingConsent(stamped);
    setConsent(stamped);
    if (isAnalyticsGranted(stamped) && ga4Id) {
      loadGa4Script(ga4Id);
    }
  };

  const acceptAll = () => {
    persist({
      choice: 'granted',
      preferences: {analytics: true, marketing: true},
      updatedAt: '',
    });
    setShowPreferences(false);
  };

  const rejectAll = () => {
    persist({
      choice: 'denied',
      preferences: {analytics: false, marketing: false},
      updatedAt: '',
    });
    setShowPreferences(false);
  };

  const savePreferences = (preferences: ConsentPreferences) => {
    persist({
      choice: 'granted',
      preferences,
      updatedAt: '',
    });
    setShowPreferences(false);
  };

  const value = useMemo(
    () => ({
      consent,
      analyticsAllowed: isAnalyticsGranted(consent),
      acceptAll,
      rejectAll,
      savePreferences,
      showPreferences,
      setShowPreferences,
    }),
    [consent, showPreferences],
  );

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {hydrated && consent.choice === 'pending' && !showPreferences ? (
        <ConsentBanner />
      ) : showPreferences ? (
        <ConsentPreferencesPanel />
      ) : null}
    </ConsentContext.Provider>
  );
}

function ConsentBanner() {
  const {acceptAll, rejectAll, setShowPreferences} = useConsent();

  return (
    <div
      aria-labelledby="consent-banner-title"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background p-3 shadow-strong sm:p-4 md:p-6"
      role="dialog"
    >
      <div className="xsto-container flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-foreground" id="consent-banner-title">
            Cookie preferences
          </p>
          <p className="mt-1 text-[0.8125rem] leading-snug text-muted-foreground sm:text-sm">
            Essential cookies for cart and checkout. Analytics only if you accept.{' '}
            <Link className="text-gold hover:underline" to="/privacy">
              Privacy policy
            </Link>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <button
            className="btn-secondary min-h-11 text-sm"
            onClick={rejectAll}
            type="button"
          >
            Reject
          </button>
          <button
            className="btn-secondary min-h-11 text-sm"
            onClick={() => setShowPreferences(true)}
            type="button"
          >
            Preferences
          </button>
          <button
            className="btn-atc col-span-2 min-h-11 text-sm sm:col-span-1"
            onClick={acceptAll}
            type="button"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}

function ConsentPreferencesPanel() {
  const {consent, savePreferences, rejectAll, setShowPreferences} = useConsent();
  const [analytics, setAnalytics] = useState(consent.preferences.analytics);
  const [marketing, setMarketing] = useState(consent.preferences.marketing);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-navy/40 p-4 md:items-center md:justify-center">
      <div className="w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-strong">
        <h2 className="text-lg font-semibold text-foreground">Cookie preferences</h2>
        <div className="mt-4 space-y-4">
          <label className="flex items-start gap-3">
            <input checked disabled type="checkbox" />
            <span>
              <span className="block text-sm font-medium text-foreground">Essential</span>
              <span className="text-sm text-muted-foreground">
                Required for cart, checkout and account.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input
              checked={analytics}
              onChange={(event) => setAnalytics(event.target.checked)}
              type="checkbox"
            />
            <span>
              <span className="block text-sm font-medium text-foreground">Analytics</span>
              <span className="text-sm text-muted-foreground">
                Google Analytics — page views and ecommerce events.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input
              checked={marketing}
              onChange={(event) => setMarketing(event.target.checked)}
              type="checkbox"
            />
            <span>
              <span className="block text-sm font-medium text-foreground">Marketing</span>
              <span className="text-sm text-muted-foreground">
                Shop Chat and promotional measurement.
              </span>
            </span>
          </label>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button className="btn-secondary text-sm" onClick={rejectAll} type="button">
            Reject all
          </button>
          <button
            className="btn-secondary text-sm"
            onClick={() => setShowPreferences(false)}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn-atc text-sm"
            onClick={() => savePreferences({analytics, marketing})}
            type="button"
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
}
