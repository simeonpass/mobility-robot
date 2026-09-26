import {isAnalyticsGranted, readStoredConsent} from './consent';

export type EnquiryForm = 'demo_request' | 'contact_enquiry';

// One tracker per mounted form. Never include submitted fields in analytics.
export function createEnquiryTracker(form: EnquiryForm) {
  let recorded = false;
  return (success: boolean) => {
    if (!success || recorded || typeof window === 'undefined') return;
    recorded = true;
    if (!isAnalyticsGranted(readStoredConsent())) return;
    try {
      window.gtag?.('event', 'generate_lead', {form_name: form});
    } catch {
      // Measurement must never interrupt a successful enquiry.
    }
  };
}
