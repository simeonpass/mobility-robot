import {Plane, ShieldCheck, Truck} from 'lucide-react';

const BADGES = [
  {icon: Truck, label: 'Free UK delivery', sublabel: 'Mainland orders'},
  {icon: ShieldCheck, label: '5-year warranty', sublabel: 'Frame cover'},
  {icon: Plane, label: 'Airline approved', sublabel: 'Travel battery'},
] as const;

export function ProductTrustBadges() {
  return (
    <ul className="product-trust-strip grid grid-cols-3 gap-2">
      {BADGES.map(({icon: Icon, label, sublabel}) => (
        <li
          className="flex flex-col items-center rounded-lg border border-border/80 bg-secondary/30 px-2 py-3 text-center"
          key={label}
        >
          <span className="mb-2 flex size-9 items-center justify-center rounded-full bg-background shadow-soft ring-1 ring-border/60">
            <Icon
              aria-hidden
              className="size-4 text-navy"
              strokeWidth={1.25}
            />
          </span>
          <span className="text-[0.6875rem] font-semibold leading-tight text-foreground">
            {label}
          </span>
          <span className="mt-0.5 text-[0.625rem] leading-tight text-muted-foreground">
            {sublabel}
          </span>
        </li>
      ))}
    </ul>
  );
}
