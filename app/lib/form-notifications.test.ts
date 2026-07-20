import {describe, expect, it} from 'vitest';
import {
  formatFormFieldsText,
  isFormEmailConfigured,
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
