import {BadgePercent} from 'lucide-react';
import {motion, useReducedMotion} from 'framer-motion';
import {Link} from 'react-router';
import {HeroYoutubeBackground} from '~/components/home/HeroYoutubeBackground';
import {SHOPIFY_HOME_PRODUCT_HANDLES} from '~/lib/homepage-data';

const fadeUp = (delay: number, reducedMotion: boolean) =>
  reducedMotion
    ? {}
    : {
        initial: {opacity: 0, y: 20},
        animate: {opacity: 1, y: 0},
        transition: {duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const},
      };

export function HeroSection() {
  const reducedMotion = useReducedMotion() ?? false;
  const m4Url = `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4']}`;

  return (
    <section
      aria-label="Hero"
      className="home-hero relative min-h-[100svh] overflow-hidden bg-navy !p-0"
    >
      <div aria-hidden className="absolute inset-0">
        <HeroYoutubeBackground />
      </div>

      {/* Readability overlays — keep product visible, make type crisp */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-black/35"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-32 bg-gradient-to-b from-black/50 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[58%] bg-gradient-to-t from-black/80 via-black/45 to-transparent"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1400px] flex-col justify-end px-6 pb-16 pt-32 sm:px-8 md:pb-24 md:pt-36 lg:pb-28">
        <div className="max-w-2xl text-left text-white">
          <motion.p
            className="font-display mb-2 text-[1.5rem] font-medium leading-none tracking-tight text-white md:mb-3 md:text-[2rem] lg:text-[2.25rem]"
            style={{textShadow: '0 2px 24px rgba(0,0,0,0.55)'}}
            {...fadeUp(0.1, reducedMotion)}
          >
            World&apos;s First
          </motion.p>

          <motion.h1
            className="font-display mb-3 text-[1.625rem] font-semibold uppercase leading-[1.12] tracking-[0.08em] text-white sm:text-[2rem] md:mb-4 md:text-[2.5rem] md:tracking-[0.1em] lg:text-[3rem]"
            style={{textShadow: '0 2px 28px rgba(0,0,0,0.6)'}}
            {...fadeUp(0.2, reducedMotion)}
          >
            Self-Balancing Mobility Robot
          </motion.h1>

          <motion.p
            className="mb-6 max-w-lg font-sans text-base leading-relaxed text-white/90 md:mb-8 md:text-lg"
            style={{textShadow: '0 1px 16px rgba(0,0,0,0.5)'}}
            {...fadeUp(0.3, reducedMotion)}
          >
            Free UK delivery · Full warranty · VAT relief eligible
          </motion.p>

          <motion.div
            className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-3"
            {...fadeUp(0.4, reducedMotion)}
          >
            <Link
              className="btn-hero-primary font-display inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-sm font-semibold uppercase tracking-[0.14em] text-navy no-underline shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-colors hover:bg-white/95 hover:text-navy hover:no-underline md:h-14 md:px-10 md:text-[0.9375rem]"
              to={m4Url}
            >
              Shop the M4
            </Link>

            <Link
              className="btn-hero-secondary font-display inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/80 bg-black/25 px-6 text-sm font-medium text-white no-underline backdrop-blur-sm transition-colors hover:border-white hover:bg-black/40 hover:text-white hover:no-underline md:h-14"
              to="/vat-relief"
            >
              <BadgePercent
                aria-hidden
                className="size-4 shrink-0 text-white"
                strokeWidth={1.5}
              />
              Save 20% with VAT relief
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
