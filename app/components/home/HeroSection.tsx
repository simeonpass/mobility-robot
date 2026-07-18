import {BadgePercent} from 'lucide-react';
import {motion, useReducedMotion} from 'framer-motion';
import {Link} from 'react-router';
import {HeroYoutubeBackground} from '~/components/home/HeroYoutubeBackground';
import {SHOPIFY_HOME_PRODUCT_HANDLES} from '~/lib/homepage-data';

const fadeUp = (delay: number, reducedMotion: boolean) =>
  reducedMotion
    ? {}
    : {
        initial: {opacity: 0, y: 28},
        animate: {opacity: 1, y: 0},
        transition: {duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] as const},
      };

export function HeroSection() {
  const reducedMotion = useReducedMotion();
  const m4Url = `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4']}`;

  return (
    <section
      aria-label="Hero"
      className="home-hero relative min-h-[100svh] overflow-hidden bg-navy"
    >
      <div aria-hidden className="absolute inset-0">
        <HeroYoutubeBackground />
      </div>

      {/* Soft wash — hides burned-in video titles so they don’t fight hero copy */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-navy/45"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-36 bg-gradient-to-b from-navy/80 to-transparent md:h-44"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[50%] bg-gradient-to-t from-navy/85 via-navy/35 to-transparent"
      />

      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-4 pb-16 pt-28 text-center md:pb-20 md:pt-32">
        <motion.p
          className="font-serif mb-5 text-[2.25rem] italic leading-none text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] md:mb-6 md:text-6xl lg:text-7xl"
          {...fadeUp(0.15, reducedMotion ?? false)}
        >
          World&apos;s First
        </motion.p>

        <motion.h1
          className="mb-6 max-w-4xl text-[1.625rem] font-bold uppercase leading-tight tracking-[0.12em] text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)] sm:text-3xl md:text-[2.75rem] md:tracking-[0.16em] lg:text-5xl lg:tracking-[0.18em]"
          {...fadeUp(0.3, reducedMotion ?? false)}
        >
          Self-Balancing Mobility Robot
        </motion.h1>

        <motion.p
          className="mb-10 max-w-xl text-lg font-medium leading-relaxed text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)] md:text-xl"
          {...fadeUp(0.42, reducedMotion ?? false)}
        >
          Free UK delivery · Full warranty · VAT relief eligible
        </motion.p>

        <motion.div
          className="flex flex-col items-center gap-4"
          {...fadeUp(0.55, reducedMotion ?? false)}
        >
          <Link
            className="hero-cta-primary btn-accent inline-flex min-w-[240px] items-center justify-center px-12 py-4 text-base font-semibold uppercase tracking-[0.2em] text-white no-underline shadow-gold-glow transition-all hover:brightness-105 hover:text-white hover:no-underline md:min-w-[260px] md:text-[0.9375rem]"
            to={m4Url}
          >
            Buy Now
          </Link>

          <Link
            className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-white/95 transition-colors hover:text-white hover:underline md:text-base"
            to="/vat-relief"
          >
            <BadgePercent aria-hidden className="size-4 shrink-0 md:size-5" strokeWidth={1.25} />
            Save 20% — VAT Relief
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
