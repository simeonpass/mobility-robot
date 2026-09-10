import {ArrowRight} from 'lucide-react';
import {Link} from 'react-router';
import {HeroVideoBackground} from '~/components/home/HeroVideoBackground';
import {SHOPIFY_HOME_PRODUCT_HANDLES} from '~/lib/homepage-data';

export function HeroSection() {
  return (
    <section className="mr-film-hero" aria-labelledby="homepage-heading">
      <HeroVideoBackground />
      <div className="mr-film-shade" aria-hidden />
      <div className="xsto-container mr-film-content">
        <div className="mr-film-copy">
          <p className="mr-film-eyebrow">XSTO X12 · See what’s possible</p>
          <h1 id="homepage-heading">
            A smarter way
            <br />
            to move.
          </h1>
          <p className="mr-film-intro">
            Discover XSTO powered wheelchairs, with personal advice,
            demonstrations and UK support from Bentech Medical.
          </p>
          <div className="mr-actions">
            <Link className="mr-button" to="/#product-range">
              Explore the range <ArrowRight size={18} aria-hidden />
            </Link>
            <Link
              className="mr-film-product-link"
              to={`/products/${SHOPIFY_HOME_PRODUCT_HANDLES['xsto-x12']}`}
            >
              Meet the X12 <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
