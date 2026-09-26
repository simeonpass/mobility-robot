import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  googleAdsConversionSendTo,
  initGtag,
  resetGtagForTests,
  trackAdsConversion,
  trackGenerateLead,
  trackPhoneClick,
} from './analytics';

describe('googleAdsConversionSendTo', () => {
  it('builds an AW send_to from id and label', () => {
    expect(googleAdsConversionSendTo('AW-123456789', 'AbCdeF')).toBe(
      'AW-123456789/AbCdeF',
    );
  });

  it('prefixes a bare numeric id', () => {
    expect(googleAdsConversionSendTo('123456789', 'lead')).toBe(
      'AW-123456789/lead',
    );
  });

  it('returns null when the conversion label is missing', () => {
    expect(googleAdsConversionSendTo('AW-123456789', '')).toBeNull();
    expect(googleAdsConversionSendTo('AW-123456789', null)).toBeNull();
    expect(googleAdsConversionSendTo(null, 'lead')).toBeNull();
  });
});

describe('lead and ads events', () => {
  const gtag = vi.fn();

  beforeEach(() => {
    resetGtagForTests();
    gtag.mockReset();
    vi.stubGlobal('window', {gtag, dataLayer: []});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetGtagForTests();
  });

  it('sends generate_lead with the form type', () => {
    trackGenerateLead('demo');
    expect(gtag).toHaveBeenCalledWith('event', 'generate_lead', {
      currency: 'GBP',
      lead_type: 'demo',
    });
  });

  it('sends a Google Ads conversion with send_to', () => {
    trackAdsConversion('AW-123/lead', {lead_type: 'quote'});
    expect(gtag).toHaveBeenCalledWith('event', 'conversion', {
      send_to: 'AW-123/lead',
      lead_type: 'quote',
    });
  });

  it('sends phone_click as a secondary engagement event', () => {
    trackPhoneClick();
    expect(gtag).toHaveBeenCalledWith('event', 'phone_click', {
      event_category: 'engagement',
      event_label: 'tel',
    });
  });

  it('configs GA4 and Google Ads ids once each', () => {
    vi.stubGlobal('window', {dataLayer: [] as unknown[]});
    initGtag({ga4Id: 'G-TEST', googleAdsId: 'AW-1'});
    initGtag({ga4Id: 'G-TEST', googleAdsId: 'AW-1'});
    const layer = (globalThis as {window: {dataLayer: unknown[]}}).window
      .dataLayer;
    const configs = layer.filter(
      (entry) => Array.isArray(entry) && entry[0] === 'config',
    );
    expect(configs).toEqual([
      ['config', 'G-TEST', {send_page_view: false}],
      ['config', 'AW-1'],
    ]);
  });
});
