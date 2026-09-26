import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createEnquiryTracker} from './lead-tracking';
import {DEFAULT_CONSENT} from './consent';

describe('confirmed enquiry measurement', () => {
  const gtag = vi.fn();
  let consent = DEFAULT_CONSENT;
  beforeEach(() => {
    gtag.mockReset();
    consent = {...DEFAULT_CONSENT, choice: 'granted', preferences: {analytics: true, marketing: false}};
    vi.stubGlobal('window', {gtag});
    vi.stubGlobal('localStorage', {getItem: () => JSON.stringify(consent)});
  });
  afterEach(() => vi.unstubAllGlobals());
  it('counts only confirmed success, once, without form fields or invented value', () => {
    const track = createEnquiryTracker('demo_request');
    track(false);
    expect(gtag).not.toHaveBeenCalled();
    track(true);
    track(true);
    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'generate_lead', {form_name: 'demo_request'});
  });
  it('distinguishes contact enquiries', () => {
    createEnquiryTracker('contact_enquiry')(true);
    expect(gtag).toHaveBeenCalledWith('event', 'generate_lead', {form_name: 'contact_enquiry'});
  });
  it('does not backfill enquiries submitted without consent', () => {
    consent = DEFAULT_CONSENT;
    const track = createEnquiryTracker('demo_request');
    track(true);
    consent = {...consent, choice: 'granted', preferences: {analytics: true, marketing: true}};
    track(true);
    expect(gtag).not.toHaveBeenCalled();
  });
  it('does not track marketing-only consent', () => {
    consent = {...consent, preferences: {analytics: false, marketing: true}};
    createEnquiryTracker('demo_request')(true);
    expect(gtag).not.toHaveBeenCalled();
  });
  it('keeps the form usable when measurement fails', () => {
    gtag.mockImplementation(() => {throw new Error('blocked');});
    expect(() => createEnquiryTracker('demo_request')(true)).not.toThrow();
  });
});
