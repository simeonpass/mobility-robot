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
      <section className="mr-hero">
        <div className="xsto-container mr-hero-grid">
          <div className="mr-hero-copy">
            <p className="mr-eyebrow">XSTO powered wheelchairs</p>
            <h1>
              A smarter way <span>to move.</span>
            </h1>
            <p className="mr-hero-intro">
              Find the right chair for your everyday, with expert advice and UK
              support from Bentech Medical.
            </p>
            <div className="mr-actions">
              <Link className="mr-button" to="/#product-range">
                Shop wheelchairs <ArrowRight size={18} aria-hidden />
              </Link>
              <Link className="mr-text-link mr-hero-video-link" to="/videos">
                <Play size={17} aria-hidden /> See it in action
              </Link>
            </div>
            <p className="mr-hero-note">
              <Check size={18} aria-hidden /> XSTO technology. Bentech Medical
              expertise.
            </p>
          </div>
          <div className="mr-hero-art">
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
