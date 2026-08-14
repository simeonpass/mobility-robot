import ifRedDotAwards from '~/assets/if-reddot-awards.webp';
import nhsLogo from '~/assets/nhs-logo.webp';

export function TrustBar() {
  return (
    <section
      aria-label="Why buy from us"
      className="trust-bar border-b border-navy/[0.08] bg-cream"
    >
      <div className="xsto-container">
        <div className="flex flex-col items-center gap-3 py-5 sm:flex-row sm:justify-between sm:gap-6 md:py-6">
          <div className="flex items-center justify-center gap-4 sm:gap-5">
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

          <p className="max-w-xl text-center text-[0.8125rem] leading-snug text-navy/55 sm:text-right sm:text-sm">
            Free UK delivery · 5-year warranty · UK-based support · VAT relief
            eligible
          </p>
        </div>
      </div>
    </section>
  );
}
