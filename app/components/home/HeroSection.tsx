import {ArrowRight, ArrowUpRight, Check, Play} from 'lucide-react';
import {Link} from 'react-router';
import type {HomeProduct} from '~/components/home/ProductRangeGrid';
import {
  HOMEPAGE_PRODUCT_THUMBS,
  SHOPIFY_HOME_PRODUCT_HANDLES,
} from '~/lib/homepage-data';

export function HeroSection({product}: {product?: HomeProduct}) {
  const image = product?.featuredImage;
  const source = image?.url ?? HOMEPAGE_PRODUCT_THUMBS['xsto-x12'];
  const imageUrl = new URL(source);
  imageUrl.searchParams.set('width', '1000');

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
      <section className="mr-hero">
        <div className="xsto-container mr-hero-grid">
          <div className="mr-hero-copy">
            <p className="mr-eyebrow">
              Intelligent mobility. More possibilities.
            </p>
            <h1>
              A bigger world.
              <br />A smarter way
              <br />
              <span>to move.</span>
            </h1>
            <p className="mr-hero-intro">
              Discover XSTO powered wheelchairs that rethink the everyday. From
              self-levelling comfort to stair-climbing capability. Find the one
              that moves you.
            </p>
            <div className="mr-actions">
              <Link className="mr-button" to="/#product-range">
                Explore the range <ArrowRight size={18} aria-hidden />
              </Link>
              <Link className="mr-button mr-button-outline" to="/videos">
                <Play size={17} aria-hidden /> See it in action
              </Link>
            </div>
            <p className="mr-hero-note">
              <Check size={18} aria-hidden /> XSTO technology. Bentech Medical
              expertise.
            </p>
          </div>
          <div className="mr-hero-art">
            <span className="mr-hero-word" aria-hidden>
              X12
            </span>
            <img
              src={imageUrl.toString()}
              alt="XSTO X12 stair-climbing powered wheelchair"
              width={image?.width ?? 1000}
              height={image?.height ?? 1000}
              fetchPriority="high"
              decoding="async"
            />
            <Link
              className="mr-hero-tag"
              to={`/products/${product?.handle ?? SHOPIFY_HOME_PRODUCT_HANDLES['xsto-x12']}`}
              prefetch="intent"
            >
              <strong>
                Meet the XSTO X12 <ArrowUpRight size={18} aria-hidden />
              </strong>
              <span>Stair-climbing. Self-levelling. More possibility.</span>
            </Link>
            <small className="mr-hero-caption">
              Photography may show optional equipment.
            </small>
          </div>
        </div>
      </section>
    </>
  );
}
