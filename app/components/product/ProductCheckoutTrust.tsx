import {Lock} from 'lucide-react';
import {Link} from 'react-router';
export function ProductCheckoutTrust({
  klarnaInstallment,
}: {
  klarnaInstallment?: string | null;
}) {
  return (
    <div className="mr-checkout-note">
      <p>
        <Lock size={14} aria-hidden /> Secure checkout with Shopify
      </p>
      <Link to="/returns">Returns information</Link>
      {klarnaInstallment ? (
        <details>
          <summary>Payment options</summary>
          <p>
            Klarna Pay in 3: three interest-free payments of {klarnaInstallment}
            , subject to eligibility and availability at checkout.
          </p>
        </details>
      ) : null}
    </div>
  );
}
