import {COMPANY} from '~/lib/site-navigation';
import {Link} from 'react-router';
import {PaymentLogos} from '~/components/footer/PaymentLogos';

export function FooterBottom() {
  return (
    <div className="mr-footer-bottom">
      <div className="mr-footer-company">
        <p>
          © {new Date().getFullYear()} {COMPANY.name}
        </p>
        <nav className="mr-footer-legal" aria-label="Legal">
          <Link to="/privacy">Privacy policy</Link>
          <Link to="/terms">Terms &amp; conditions</Link>
        </nav>
      </div>
      <div className="mr-footer-payments">
        <p>Payment options vary by order and eligibility.</p>
        <PaymentLogos size="compact" />
      </div>
    </div>
  );
}
