import {Plane, ShieldCheck, Truck} from 'lucide-react';
import {getHomepageProductSlot} from '~/lib/homepage-data';

type Badge = {
  icon: typeof Truck;
  label: string;
};

const BASE_BADGES: Badge[] = [
  {icon: Truck, label: 'Free UK delivery'},
  {icon: ShieldCheck, label: '5-year warranty'},
];

/** M4-series models with travel-battery FAQ support for airline wording. */
const AIRLINE_ELIGIBLE_SLOTS = new Set([
  'xsto-m4',
  'xsto-m4-pro',
  'xsto-m4b',
]);

const AIRLINE_BADGE: Badge = {
  icon: Plane,
  label: 'Travel battery option',
};

export function isAirlineBadgeEligible(handle?: string | null): boolean {
  if (!handle) return false;
  const slot = getHomepageProductSlot(handle);
  return slot != null && AIRLINE_ELIGIBLE_SLOTS.has(slot);
}

type ProductTrustBadgesProps = {
  /** Shopify product handle — used to scope travel/airline messaging. */
  productHandle?: string | null;
};

export function ProductTrustBadges({productHandle}: ProductTrustBadgesProps) {
  const badges = isAirlineBadgeEligible(productHandle)
    ? [...BASE_BADGES, AIRLINE_BADGE]
    : BASE_BADGES;

  return (
    <ul
      className={[
        'product-trust-strip grid gap-px overflow-hidden rounded-lg border border-border/80 bg-border/80',
        badges.length === 3 ? 'grid-cols-3' : 'grid-cols-2',
      ].join(' ')}
    >
      {badges.map(({icon: Icon, label}) => (
        <li
          className="flex flex-col items-center gap-1.5 bg-background px-2 py-2.5 text-center"
          key={label}
        >
          <Icon
            aria-hidden
            className="size-3.5 text-navy"
            strokeWidth={1.5}
          />
          <span className="text-[0.625rem] font-semibold leading-tight text-navy">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
