import {ArrowRight, ArrowUpRight, Check, Play} from 'lucide-react';
import {Link} from 'react-router';
import m4bSmall from '~/assets/hero/m4b-360.webp';
import m4bLarge from '~/assets/hero/m4b-720.webp';
import m4ProSmall from '~/assets/hero/m4-pro-360.webp';
import m4ProLarge from '~/assets/hero/m4-pro-720.webp';
import x12Small from '~/assets/hero/x12-360.webp';
import x12Large from '~/assets/hero/x12-720.webp';
import type {HomeProduct} from '~/components/home/ProductRangeGrid';
import {
  getHomepageProductSlot,
  SHOPIFY_HOME_PRODUCT_HANDLES,
} from '~/lib/homepage-data';

const heroModels = [
  {
    slot: 'xsto-m4b',
    name: 'XSTO M4B',
    detail: 'Everyday freedom',
    small: m4bSmall,
    large: m4bLarge,
    width: 720,
    height: 781,
  },
  {
    slot: 'xsto-x12',
    name: 'XSTO X12',
    detail: 'Go a step further',
    small: x12Small,
    large: x12Large,
    width: 720,
    height: 924,
  },
  {
    slot: 'xsto-m4-pro',
    name: 'XSTO M4 Pro',
    detail: 'Make yourself comfortable',
    small: m4ProSmall,
    large: m4ProLarge,
    width: 720,
    height: 799,
  },
] as const;

export function HeroSection({products}: {products: HomeProduct[]}) {
  return (
    <>
      <aside className="mr-transition" aria-label="Our new website">
        <div className="xsto-container mr-transition-inner">
          <p>
            <strong>Bentech Medical’s XSTO range has a new home.</strong>{' '}
            Welcome to Mobility Robot.
          </p>
          <Link to="/about#our-brand">
            Our story <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </aside>
      <section className="mr-hero" aria-labelledby="homepage-heading">
        <div className="xsto-container mr-hero-grid">
          <div className="mr-hero-copy">
            <p className="mr-eyebrow">
              XSTO powered wheelchairs · UK distributor
            </p>
            <h1 id="homepage-heading">
              A bigger world.
              <br />A smarter way <span>to move.</span>
            </h1>
            <p className="mr-hero-intro">
              From everyday journeys to new possibilities. Find your XSTO
              powered wheelchair, with personal advice and UK support from
              Bentech Medical.
            </p>
            <div className="mr-actions">
              <Link className="mr-button" to="/#product-range">
                Explore the range <ArrowRight size={18} aria-hidden />
              </Link>
              <Link
                className="mr-text-link mr-hero-video-link"
                to="/#experience-range"
              >
                <Play size={17} aria-hidden /> See them in action
              </Link>
            </div>
            <p className="mr-hero-note">
              <Check size={18} aria-hidden /> XSTO technology. Bentech Medical
              expertise.
            </p>
          </div>
          <div className="mr-hero-showcase">
            <div
              className="mr-hero-lineup"
              role="group"
              aria-label="Explore the XSTO range"
            >
              {heroModels.map(
                ({slot, name, detail, small, large, width, height}) => {
                  const product = products.find(
                    (item) => getHomepageProductSlot(item.handle) === slot,
                  );
                  const featured = slot === 'xsto-x12';

                  return (
                    <Link
                      key={slot}
                      className={`mr-hero-model${featured ? ' mr-hero-model-featured' : ''}`}
                      to={`/products/${product?.handle ?? SHOPIFY_HOME_PRODUCT_HANDLES[slot]}`}
                      prefetch="intent"
                      aria-label={`Explore ${name}`}
                    >
                      <div className="mr-hero-model-photo">
                        <img
                          src={large}
                          srcSet={`${small} 360w, ${large} 720w`}
                          sizes={
                            featured
                              ? '(max-width: 767px) 58vw, (max-width: 1023px) 36vw, 280px'
                              : '(max-width: 767px) 48vw, (max-width: 1023px) 30vw, 230px'
                          }
                          alt={`${name} powered wheelchair`}
                          width={width}
                          height={height}
                          loading="eager"
                          fetchPriority={featured ? 'high' : 'auto'}
                          decoding="async"
                        />
                      </div>
                      <span className="mr-hero-model-name">
                        {name} <ArrowUpRight size={15} aria-hidden />
                      </span>
                      <span className="mr-hero-model-detail">{detail}</span>
                    </Link>
                  );
                },
              )}
            </div>
            <div className="mr-hero-showcase-footer">
              <Link className="mr-text-link" to="/compare">
                Compare all four models <ArrowRight size={16} aria-hidden />
              </Link>
              <small>Photography may show optional equipment.</small>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
