import {Link} from 'react-router';
import {SHOPIFY_HOME_PRODUCT_HANDLES} from '~/lib/homepage-data';
import {useActivePromotions} from '~/lib/promotions';

export function AnnouncementBar() {
  const [promotion] = useActivePromotions();
  return (
    <div className="site-announcement mr-announcement sticky top-0 z-50">
      <div className="xsto-container mr-announcement-inner">
        <p>
          Official UK distributor of <strong>XSTO</strong>
        </p>
        {promotion ? (
          <Link
            className="mr-announcement-promo"
            to={`/products/${SHOPIFY_HOME_PRODUCT_HANDLES[promotion.slot]}`}
            data-promotion={promotion.id}
          >
            <strong>{promotion.label}:</strong> {promotion.savingExVatDisplay}{' '}
            off the new XSTO {promotion.modelLabel}
            {promotion.previewing ? ' (preview)' : ''}
          </Link>
        ) : (
          <p className="mr-announcement-delivery">
            Free UK mainland wheelchair delivery
          </p>
        )}
        <Link className="mr-announcement-international" to="/international">
          International enquiries
        </Link>
      </div>
    </div>
  );
}
