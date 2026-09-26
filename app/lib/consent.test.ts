import {describe, expect, it} from 'vitest';
import {isAnalyticsGranted, isMarketingGranted, type StoredConsent} from './consent';

const granted = (preferences: StoredConsent['preferences']): StoredConsent => ({
  choice: 'granted',
  preferences,
  updatedAt: '2026-09-18',
});

describe('consent flags', () => {
  it('treats analytics and marketing as separate grants', () => {
    expect(
      isAnalyticsGranted(granted({analytics: true, marketing: false})),
    ).toBe(true);
    expect(
      isMarketingGranted(granted({analytics: true, marketing: false})),
    ).toBe(false);
    expect(
      isMarketingGranted(granted({analytics: false, marketing: true})),
    ).toBe(true);
  });

  it('does not treat a pending banner as consent', () => {
    expect(
      isMarketingGranted({
        choice: 'pending',
        preferences: {analytics: true, marketing: true},
        updatedAt: '',
      }),
    ).toBe(false);
  });
});
