import {BadgePercent} from 'lucide-react';
import {motion, useReducedMotion} from 'framer-motion';
import {Link} from 'react-router';
import {HeroVideoBackground} from '~/components/home/HeroVideoBackground';
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
  const x12Url = `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-x12']}`;

  return (
    <section
      aria-label="Hero"
      className="home-hero relative min-h-[min(85svh,30rem)] overflow-hidden bg-[#5a6b82] !p-0 md:min-h-[100svh]"
    >
      <div aria-hidden className="absolute inset-0">
        <HeroVideoBackground />
      </div>

      {/* Soft scrims — keep type readable without crushing the video */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-navy/[0.12]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-28 bg-gradient-to-b from-navy/25 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[48%] bg-gradient-to-t from-navy/55 via-navy/22 to-transparent"
      />

      <div className="relative z-10 mx-auto flex min-h-[min(85svh,30rem)] w-full max-w-[1400px] flex-col justify-end px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-28 md:min-h-[100svh] md:px-8 md:pb-20 md:pt-36 lg:pb-24">
        <div className="home-hero-copy w-full max-w-2xl text-left text-white">
          <motion.h1
            className="home-hero-title font-display text-white"
            style={{textShadow: '0 2px 18px rgba(24,40,72,0.35)'}}
            {...fadeUp(0.1, reducedMotion)}
          >
            Introducing the{' '}
            <span className="home-hero-title-product">XSTO X12</span>
          </motion.h1>

          <motion.p
            className="home-hero-support font-sans"
            style={{textShadow: '0 1px 12px rgba(24,40,72,0.3)'}}
            {...fadeUp(0.2, reducedMotion)}
          >
            Stair-climbing and all-terrain mobility — climbs steps up to 40°
            with AI-powered mode switching.
          </motion.p>

          <motion.div
            className="home-hero-cta-group"
            {...fadeUp(0.3, reducedMotion)}
          >
            <Link
              className="btn-hero-primary font-display inline-flex h-12 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold uppercase tracking-[0.14em] text-navy no-underline shadow-[0_8px_28px_rgba(24,40,72,0.22)] transition-colors hover:bg-white/95 hover:text-navy hover:no-underline sm:px-8 md:h-14 md:px-10 md:text-[0.9375rem]"
              to={x12Url}
            >
              Shop the X12
            </Link>

            <Link
              className="btn-hero-secondary font-display inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/70 bg-white/15 px-4 text-center text-[0.8125rem] font-medium leading-snug tracking-wide text-white no-underline backdrop-blur-sm transition-colors hover:border-white hover:bg-white/25 hover:text-white hover:no-underline sm:px-6 md:h-14 md:text-sm"
              to="/vat-relief"
            >
              <BadgePercent
                aria-hidden
                className="size-3.5 shrink-0 text-white md:size-4"
                strokeWidth={1.5}
              />
              <span className="sm:hidden">VAT relief — pay no VAT</span>
              <span className="hidden sm:inline">
                Eligible customers pay no VAT.
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
