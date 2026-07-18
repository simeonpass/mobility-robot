import {useEffect, useRef} from 'react';
import {useLocation, useSearchParams} from 'react-router';
import {useConsent} from '~/components/ConsentBanner';
import {trackPageView, trackSelectPromotion} from '~/lib/analytics';
import {getReferralDiscountCode} from '~/lib/referral-discount';

export function Ga4Tracker({ga4Id}: {ga4Id?: string | null}) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const {analyticsAllowed} = useConsent();
  const promotionTracked = useRef(false);

  useEffect(() => {
    if (!ga4Id || !analyticsAllowed) return;
    trackPageView(`${location.pathname}${location.search}`, document.title);
  }, [analyticsAllowed, ga4Id, location.pathname, location.search]);

  useEffect(() => {
    if (!ga4Id || !analyticsAllowed || promotionTracked.current) return;
    const code = getReferralDiscountCode(searchParams);
    if (!code) return;
    trackSelectPromotion(code, code);
    promotionTracked.current = true;
  }, [analyticsAllowed, ga4Id, searchParams]);

  return null;
}
