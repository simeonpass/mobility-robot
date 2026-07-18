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

      {/* Top blend — keeps announcement bar + header legible over bright video */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 bg-gradient-to-b from-navy via-navy/70 to-transparent md:h-48"
      />

      {/* Centre vignette — light touch so video stays visible */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(15,23,42,0.45)_100%)]"
      />

      {/* Bottom weight for copy + CTAs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-navy via-navy/50 to-transparent md:from-navy/90 md:via-navy/35"
      />

      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-4 pb-16 pt-28 text-center md:pb-20 md:pt-32">
        <motion.p
          className="font-serif mb-4 text-[2rem] italic leading-none text-primary-foreground md:text-5xl lg:text-6xl"
          {...fadeUp(0.15, reducedMotion ?? false)}
        >
          World&apos;s First
        </motion.p>

        <motion.h1
          className="font-display mb-6 max-w-4xl text-lg font-semibold uppercase tracking-[0.2em] text-primary-foreground md:text-3xl lg:text-[2.125rem] lg:tracking-[0.22em]"
          {...fadeUp(0.3, reducedMotion ?? false)}
        >
          Self-Balancing Mobility Robot
        </motion.h1>

        <motion.p
          className="mb-4 max-w-2xl text-base leading-relaxed text-primary-foreground/90 md:text-lg md:leading-relaxed lg:max-w-3xl lg:text-xl"
          {...fadeUp(0.42, reducedMotion ?? false)}
        >
          XSTO is more than a powered wheelchair — it&apos;s a self-balancing
          mobility robot that climbs slopes, handles kerbs and uneven ground,
          and folds small enough for everyday travel.
        </motion.p>

        <motion.p
          className="mb-10 max-w-xl text-sm leading-relaxed text-primary-foreground/75 md:text-base"
          {...fadeUp(0.5, reducedMotion ?? false)}
        >
          From the award-winning M4 to the all-terrain X12 stair-climber — free UK
          delivery, full warranty and VAT relief from Bentech Medical Ltd, official
          UK distributor.
        </motion.p>

        <motion.div
          className="flex flex-col items-center gap-4"
          {...fadeUp(0.62, reducedMotion ?? false)}
        >
          <Link
            className="hero-cta-primary inline-flex min-w-[220px] items-center justify-center border-2 border-primary-foreground px-12 py-3.5 text-sm font-semibold uppercase tracking-[0.24em] text-primary-foreground transition-all hover:bg-primary-foreground hover:text-navy hover:shadow-luxe"
            to={m4Url}
          >
            Buy Now
          </Link>

          <Link
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary-foreground/90 transition-colors hover:text-primary-foreground hover:underline"
            to="/vat-relief"
          >
            <BadgePercent aria-hidden className="size-3.5 shrink-0" strokeWidth={1.25} />
            Save 20% — VAT Relief
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
