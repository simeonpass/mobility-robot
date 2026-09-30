import {BadgePercent} from 'lucide-react';
import type {ActivePromotion} from '~/lib/promotions';

/** Launch-offer card shown above the buy box while a promotion is live. */
export function ProductPromotionCallout({
  promotion,
}: {
  promotion: ActivePromotion;
}) {
  return (
    <aside
      className="mr-product-promo"
      aria-label={promotion.label}
      data-promotion={promotion.id}
    >
      <p className="mr-product-promo-label">
        <BadgePercent size={15} aria-hidden />
        {promotion.label}
        {promotion.previewing ? ' (preview)' : ''}
      </p>
      <p className="mr-product-promo-headline">{promotion.headline}</p>
      <p className="mr-product-promo-saving">
        {promotion.savingExVatDisplay} off with VAT relief, or{' '}
        {promotion.savingIncVatDisplay} off including VAT — already taken off
        the price below.
      </p>
      <ul className="mr-product-promo-highlights">
        {promotion.highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mr-product-promo-terms">{promotion.terms}</p>
    </aside>
  );
}
