import {useEffect, useRef} from 'react';
import {useLocation, useSearchParams} from 'react-router';
import {useConsent} from '~/components/ConsentBanner';
import {trackPageView, trackSelectPromotion} from '~/lib/analytics';
import {getAiReferralSource} from '~/lib/ai-referral';
import {getReferralDiscountCode} from '~/lib/referral-discount';
import {trackEnquiryIntent} from '~/lib/enquiry-intent';

export function Ga4Tracker({ga4Id}: {ga4Id?: string | null}) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const {analyticsAllowed} = useConsent();
  const promotionTracked = useRef(false);
  const aiReferralTracked = useRef(false);
  const landing = useRef<{source: string | null; path: string} | null>(null);
  useEffect(() => {
    if (!landing.current) landing.current = {source: getAiReferralSource(window.location.href, document.referrer), path: window.location.pathname};
    if (!ga4Id || !analyticsAllowed || !window.gtag || aiReferralTracked.current || !landing.current.source) return;
    window.gtag('event', 'ai_referral', {ai_source: landing.current.source, landing_page: landing.current.path});
    aiReferralTracked.current = true;
  }, [analyticsAllowed, ga4Id]);

  useEffect(() => {
    if (!ga4Id || !analyticsAllowed) return;
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>(
        'a[data-enquiry-action]',
      );
      if (!link) return;
      trackEnquiryIntent(
        link.dataset.enquiryAction ?? '',
        link.dataset.enquiryPlacement ?? '',
        link.dataset.enquiryModel,
      );
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [analyticsAllowed, ga4Id]);

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
