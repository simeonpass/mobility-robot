import {describe, expect, it} from 'vitest';
import {
  formatFormFieldsText,
  isFormEmailConfigured,
  resolveResendFrom,
} from './form-notifications';

describe('isFormEmailConfigured', () => {
  it('is false when no provider is set', () => {
    expect(isFormEmailConfigured({})).toBe(false);
    expect(isFormEmailConfigured({RESEND_API_KEY: '  '})).toBe(false);
  });

  it('is true for Resend or Formspree', () => {
    expect(isFormEmailConfigured({RESEND_API_KEY: 're_test'})).toBe(true);
    expect(
      isFormEmailConfigured({
        FORMSPREE_ENDPOINT: 'https://formspree.io/f/abc',
      }),
    ).toBe(true);
  });
});

describe('resolveResendFrom', () => {
  it('falls back away from onboarding@resend.dev', () => {
    expect(resolveResendFrom('XSTO UK <onboarding@resend.dev>')).toBe(
      'XSTO UK <noreply@mobilityrobot.co.uk>',
    );
  });

  it('keeps verified domain addresses', () => {
    expect(resolveResendFrom('XSTO UK <noreply@mobilityrobot.co.uk>')).toBe(
      'XSTO UK <noreply@mobilityrobot.co.uk>',
    );
  });
});

describe('formatFormFieldsText', () => {
  it('skips empty values and formats labels', () => {
    expect(
      formatFormFieldsText({
        Name: 'Alex',
        Notes: '',
        Phone: null,
        Topic: 'Demo booking',
      }),
    ).toBe('Name: Alex\n\nTopic: Demo booking');
  });
});
