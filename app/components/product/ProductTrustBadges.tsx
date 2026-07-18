import {Plane, ShieldCheck, Truck} from 'lucide-react';

const BADGES = [
  {icon: Truck, label: 'Free UK delivery'},
  {icon: ShieldCheck, label: '5-year warranty'},
  {icon: Plane, label: 'Airline approved'},
] as const;

export function ProductTrustBadges() {
  return (
    <ul className="product-trust-strip grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border/80 bg-border/80">
      {BADGES.map(({icon: Icon, label}) => (
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
