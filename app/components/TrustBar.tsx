import {BadgePercent, Headphones, ShieldCheck, Truck} from 'lucide-react';
import ifRedDotAwards from '~/assets/if-reddot-awards.webp';
import nhsLogo from '~/assets/nhs-logo.webp';

const TRUST_ITEMS = [
  {
    icon: Truck,
    label: 'Free UK Delivery',
    sublabel: 'On all wheelchairs',
  },
  {
    icon: ShieldCheck,
    label: '5-Year Warranty',
    sublabel: 'Frame coverage',
  },
  {
    icon: Headphones,
    label: 'UK-Based Support',
    sublabel: 'Expert advice',
  },
  {
    icon: BadgePercent,
    label: 'VAT Relief',
    sublabel: 'Eligible purchases',
  },
] as const;

export function TrustBar() {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto px-4">
        <div className="grid grid-cols-2 gap-4 py-8 md:grid-cols-4 md:gap-8 md:py-10">
          {TRUST_ITEMS.map(({icon: Icon, label, sublabel}) => (
            <div
              className="flex items-center justify-center gap-3"
              key={label}
            >
              <Icon
                aria-hidden
                className="size-5 shrink-0 text-primary"
                strokeWidth={1.25}
              />
              <div>
                <p className="text-sm font-medium leading-tight text-foreground">
                  {label}
                </p>
                <p className="mt-0.5 text-xs leading-tight text-muted-foreground">
                  {sublabel}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 border-t border-border/60 py-6 md:gap-12">
          <img
            alt="iF Design Award and Red Dot Award 2025"
            className="h-10 rounded-none object-contain opacity-80 md:h-12"
            decoding="async"
            height={48}
            src={ifRedDotAwards}
            width={120}
          />

          <img
            alt="NHS"
            className="h-9 rounded-none object-contain opacity-80 md:h-10"
            decoding="async"
            height={40}
            src={nhsLogo}
            width={80}
          />
        </div>

        <div className="flex justify-center border-t border-border/60 py-5">
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary md:text-sm">
            Official UK Distributor of XSTO
          </span>
        </div>
      </div>
    </section>
  );
}
