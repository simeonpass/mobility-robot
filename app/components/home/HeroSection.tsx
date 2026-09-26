import {ArrowRight} from 'lucide-react';
import {Link} from 'react-router';
import {HeroVideoBackground} from '~/components/home/HeroVideoBackground';

export function HeroSection() {
  return (
    <section className="mr-film-hero" aria-labelledby="homepage-heading">
      <HeroVideoBackground />
      <div className="mr-film-shade" aria-hidden />
      <div className="xsto-container mr-film-content">
        <div className="mr-film-copy">
          <p className="mr-film-eyebrow">
            XSTO powered wheelchairs · Official UK distributor
          </p>
          <h1 id="homepage-heading">
            A smarter way
            <br />
            to move.
          </h1>
          <p className="mr-film-intro">
            Try an XSTO wheelchair in person before you buy. VAT relief for
            eligible customers, with UK advice and aftercare from Bentech
            Medical.
          </p>
          <div className="mr-actions">
            <Link className="mr-button" to="/demo">
              Book a demo <ArrowRight size={18} aria-hidden />
            </Link>
            <Link className="mr-film-product-link" to="/#product-range">
              Explore the range <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
