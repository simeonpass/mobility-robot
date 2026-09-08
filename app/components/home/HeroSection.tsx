import {ArrowRight, ArrowUpRight, Check, Play} from 'lucide-react';
import {Link} from 'react-router';
import type {HomeProduct} from '~/components/home/ProductRangeGrid';
import {
  getHomepageProductSlot,
  HOMEPAGE_PRODUCT_THUMBS,
  SHOPIFY_HOME_PRODUCT_HANDLES,
} from '~/lib/homepage-data';

const heroModels = [
  {slot: 'xsto-m4b', name: 'XSTO M4B', detail: 'Everyday freedom'},
  {slot: 'xsto-x12', name: 'XSTO X12', detail: 'Go a step further'},
  {
    slot: 'xsto-m4-pro',
    name: 'XSTO M4 Pro',
    detail: 'Make yourself comfortable',
  },
] as const;

function imageSource(source: string, width: number) {
  const url = new URL(source);
  url.searchParams.set('width', String(width));
  url.searchParams.delete('height');
  url.searchParams.delete('crop');
  return url.toString();
}

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
            <div className="mr-hero-lineup" aria-label="Explore the XSTO range">
              {heroModels.map(({slot, name, detail}) => {
                const product = products.find(
                  (item) => getHomepageProductSlot(item.handle) === slot,
                );
                const photo = product?.featuredImage;
                const source = photo?.url ?? HOMEPAGE_PRODUCT_THUMBS[slot];
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
                        src={imageSource(source, 720)}
                        srcSet={[240, 360, 540, 720]
                          .map(
                            (width) =>
                              `${imageSource(source, width)} ${width}w`,
                          )
                          .join(', ')}
                        sizes="(max-width: 767px) 48vw, (max-width: 1100px) 24vw, 280px"
                        alt={`${name} powered wheelchair`}
                        width={photo?.width ?? 600}
                        height={photo?.height ?? 600}
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
              })}
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
