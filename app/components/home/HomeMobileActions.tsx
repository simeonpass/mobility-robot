import {CalendarDays, Phone} from 'lucide-react';
import {Link} from 'react-router';

export function HomeMobileActions() {
  return (
    <nav
      className="mr-mobile-actions"
      aria-label="Get help choosing a wheelchair"
    >
      <Link
        className="mr-mobile-actions-primary"
        to="/demo"
        data-enquiry-action="demo"
        data-enquiry-placement="home_mobile"
      >
        <CalendarDays size={18} aria-hidden />
        Book a demo
      </Link>
      <a
        className="mr-mobile-actions-secondary"
        href="tel:+442080504849"
        data-enquiry-action="call"
        data-enquiry-placement="home_mobile"
      >
        <Phone size={18} aria-hidden />
        Call us
      </a>
    </nav>
  );
}
