import {useCallback} from 'react';
import {useRouteLoaderData} from 'react-router';
import {useConsent} from '~/components/ConsentBanner';
import type {RootLoader} from '~/root';
import {
  googleAdsConversionSendTo,
  trackAdsConversion,
  trackGenerateLead,
  trackPhoneClick,
  type LeadType,
} from '~/lib/analytics';

export function useTrackLead() {
  const {analyticsAllowed, marketingAllowed} = useConsent();
  const data = useRouteLoaderData<RootLoader>('root');
  const sendTo = googleAdsConversionSendTo(
    data?.googleAdsId,
    data?.googleAdsLeadLabel,
  );

  return useCallback(
    (leadType: LeadType) => {
      if (analyticsAllowed) {
        trackGenerateLead(leadType);
      }
      if (marketingAllowed && sendTo) {
        trackAdsConversion(sendTo, {lead_type: leadType});
      }
    },
    [analyticsAllowed, marketingAllowed, sendTo],
  );
}

export function useTrackPhoneClick() {
  const {analyticsAllowed} = useConsent();

  return useCallback(() => {
    if (analyticsAllowed) trackPhoneClick();
  }, [analyticsAllowed]);
}
