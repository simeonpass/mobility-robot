import {ArrowRight} from 'lucide-react';
import {Link} from 'react-router';
import {SHOPIFY_HOME_PRODUCT_HANDLES} from '~/lib/homepage-data';
import {useActivePromotions} from '~/lib/promotions';

/** Full-width special-offer strip under the hero while a promotion is live. */
export function PromotionStrip() {
  const [promotion] = useActivePromotions();
  if (!promotion) return null;
  const href = `/products/${SHOPIFY_HOME_PRODUCT_HANDLES[promotion.slot]}`;
  return (
    <section
      className="mr-offer-strip"
      aria-label={`Special offer on the XSTO ${promotion.modelLabel}`}
      data-promotion={promotion.id}
    >
      <div className="xsto-container mr-offer-strip-inner">
        <p className="mr-offer-strip-kicker">
          Special offer · {promotion.offerName}
          {promotion.previewing ? ' (preview)' : ''}
        </p>
        <div className="mr-offer-strip-body">
          <p className="mr-offer-strip-saving">
            <span>Save</span>
            <strong>{promotion.savingExVatDisplay}</strong>
            <span>on the new XSTO {promotion.modelLabel}</span>
          </p>
          <p className="mr-offer-strip-detail">
            {promotion.savingExVatDisplay} off with VAT relief, if eligible, or{' '}
            {promotion.savingIncVatDisplay} off including VAT. Until 31 October,
            while stocks last.
          </p>
          <Link className="mr-button mr-button-amber" to={href} prefetch="intent">
            Shop the {promotion.modelLabel} offer
            <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
