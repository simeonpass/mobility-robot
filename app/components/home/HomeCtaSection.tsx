import {Link} from 'react-router';
import {SectionIntro} from '~/components/home/SectionIntro';
import {SHOPIFY_HOME_PRODUCT_HANDLES} from '~/lib/homepage-data';

export function HomeCtaSection() {
  const m4Url = `/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-m4']}`;

  return (
    <section className="xsto-section bg-background">
      <div className="xsto-container">
        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-cream px-6 py-12 text-center shadow-soft md:px-12 md:py-16">
          <SectionIntro
            accent="yourself."
            description="From £1,995. Free UK delivery. Full UK warranty & support."
            label="Take the next step"
            title="Try it"
          />

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link className="btn-accent min-w-[11rem]" prefetch="intent" to={m4Url}>
              Buy now
            </Link>
            <Link
              className="inline-flex min-w-[11rem] items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-gold hover:text-gold"
              prefetch="intent"
              to="/demo"
            >
              Book a demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
