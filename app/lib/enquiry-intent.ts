import {isAnalyticsGranted, readStoredConsent} from './consent';

export const DEMO_MODELS = [
  'M4',
  'M4 Pro',
  'M4B',
  'M8',
  'M8 Pro',
  'X12',
  'X12 Pro',
] as const;
export type DemoModel = (typeof DEMO_MODELS)[number];

export function demoModel(value: string | null): DemoModel | '' {
  return DEMO_MODELS.find((model) => model === value) ?? '';
}

/** Measure intent separately from confirmed enquiries; never send form fields. */
export function trackEnquiryIntent(
  action: string,
  placement: string,
  model?: string,
) {
  if (typeof window === 'undefined' || !isAnalyticsGranted(readStoredConsent()))
    return;
  if (!['demo', 'call'].includes(action)) return;
  if (
    ![
      'home_mobile',
      'product_summary',
      'product_purchase',
      'product_mobile',
    ].includes(placement)
  )
    return;
  try {
    window.gtag?.('event', 'enquiry_intent', {
      enquiry_action: action,
      placement,
      ...(demoModel(model ?? null)
        ? {product_model: demoModel(model ?? null)}
        : {}),
    });
  } catch {
    // A blocked analytics provider must never interrupt navigation or a call.
  }
}
