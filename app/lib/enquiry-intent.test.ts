import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {demoModel, trackEnquiryIntent} from './enquiry-intent';
import {DEFAULT_CONSENT} from './consent';

describe('enquiry intent', () => {
  const gtag = vi.fn();
  let consent = DEFAULT_CONSENT;
  beforeEach(() => {
    gtag.mockReset();
    consent = {
      ...DEFAULT_CONSENT,
      choice: 'granted',
      preferences: {analytics: true, marketing: false},
    };
    vi.stubGlobal('window', {gtag});
    vi.stubGlobal('localStorage', {getItem: () => JSON.stringify(consent)});
  });
  afterEach(() => vi.unstubAllGlobals());

  it('records intent, not a completed lead, with only approved dimensions', () => {
    trackEnquiryIntent('demo', 'product_summary', 'M8 Pro');
    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'enquiry_intent', {
      enquiry_action: 'demo',
      placement: 'product_summary',
      product_model: 'M8 Pro',
    });
  });
  it('requires analytics consent and honours revocation', () => {
    consent = DEFAULT_CONSENT;
    trackEnquiryIntent('call', 'home_mobile');
    consent = {
      ...DEFAULT_CONSENT,
      choice: 'granted',
      preferences: {analytics: false, marketing: true},
    };
    trackEnquiryIntent('demo', 'product_mobile', 'M8');
    expect(gtag).not.toHaveBeenCalled();
  });
  it('rejects arbitrary dimensions and never forwards free text', () => {
    trackEnquiryIntent('email', 'home_mobile');
    trackEnquiryIntent('demo', 'someone@example.com');
    expect(gtag).not.toHaveBeenCalled();
    trackEnquiryIntent('demo', 'product_purchase', 'someone@example.com');
    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'enquiry_intent', {
      enquiry_action: 'demo',
      placement: 'product_purchase',
    });
  });
  it('does not interrupt navigation if measurement is blocked', () => {
    gtag.mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() =>
      trackEnquiryIntent('demo', 'product_mobile', 'M8'),
    ).not.toThrow();
  });
  it('only accepts supported demo models from links', () => {
    expect(demoModel('M8 Pro')).toBe('M8 Pro');
    expect(demoModel('unknown')).toBe('');
    expect(demoModel(null)).toBe('');
  });
});
