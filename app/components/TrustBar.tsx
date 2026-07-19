import {BadgePercent, Headphones, ShieldCheck, Truck} from 'lucide-react';
import ifRedDotAwards from '~/assets/if-reddot-awards.webp';
import nhsLogo from '~/assets/nhs-logo.webp';

const TRUST_ITEMS = [
  {
    icon: Truck,
    label: 'Free UK Delivery',
    sublabel: 'On every wheelchair',
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
    <section
      aria-label="Why buy from us"
      className="trust-bar border-b border-navy/[0.08] bg-[#f3f1ed]"
    >
      <div className="xsto-container">
        <div className="flex flex-col gap-4 py-5 md:py-6 lg:flex-row lg:items-center lg:gap-0 lg:py-5">
          <ul className="m-0 grid list-none grid-cols-2 gap-y-4 p-0 sm:grid-cols-4 sm:gap-0 lg:min-w-0 lg:flex-1">
            {TRUST_ITEMS.map(({icon: Icon, label, sublabel}, index) => (
              <li
                className="relative flex items-center gap-2.5 px-1 sm:px-3 lg:px-4"
                key={label}
              >
                {index > 0 ? (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 hidden h-8 w-px -translate-y-1/2 bg-navy/10 sm:block"
                  />
                ) : null}
                <Icon
                  aria-hidden
                  className="size-4 shrink-0 text-navy/45"
                  strokeWidth={1.5}
                />
                <div className="min-w-0">
                  <p className="text-[0.8125rem] font-semibold leading-snug tracking-[-0.01em] text-navy sm:text-sm">
                    {label}
                  </p>
                  <p className="mt-0.5 text-[0.6875rem] leading-snug text-navy/45 sm:text-xs">
                    {sublabel}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between gap-4 border-t border-navy/10 pt-4 sm:justify-center lg:ml-2 lg:shrink-0 lg:justify-end lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6 xl:ml-4 xl:pl-8">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <img
                alt="iF Design Award and Red Dot Award 2025"
                className="h-8 w-auto object-contain object-left sm:h-9"
                decoding="async"
                height={36}
                src={ifRedDotAwards}
                width={150}
              />
              <span aria-hidden className="h-6 w-px shrink-0 bg-navy/12" />
              <img
                alt="NHS"
                className="h-6 w-auto object-contain sm:h-7"
                decoding="async"
                height={28}
                src={nhsLogo}
                width={70}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
