import {BadgePercent, Headphones, ShieldCheck, Truck} from 'lucide-react';
import {Link} from 'react-router';
const items = [
  {
    icon: Truck,
    title: 'UK delivery',
    detail: 'Delivery details',
    path: '/delivery',
  },
  {
    icon: ShieldCheck,
    title: 'Warranty support',
    detail: 'Cover explained',
    path: '/warranty',
  },
  {
    icon: Headphones,
    title: 'Bentech Medical',
    detail: 'Your UK support team',
    path: '/support',
  },
  {
    icon: BadgePercent,
    title: 'VAT relief',
    detail: 'For eligible purchases',
    path: '/vat-relief',
  },
];
export function TrustBar() {
  return (
    <section className="mr-trust" aria-label="Buying with Mobility Robot">
      <ul className="xsto-container">
        {items.map(({icon: Icon, title, detail, path}) => (
          <li key={path}>
            <Icon size={25} strokeWidth={1.6} aria-hidden />
            <Link to={path}>
              <strong>{title}</strong>
              <span>{detail}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
