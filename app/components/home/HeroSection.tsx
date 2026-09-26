import {ArrowRight} from 'lucide-react';
import {Link} from 'react-router';
import {HeroVideoBackground} from '~/components/home/HeroVideoBackground';

export function HeroSection() {
  return (
    <section
      className="mr-film-hero mr-film-fullscreen"
      aria-labelledby="homepage-heading"
    >
      <HeroVideoBackground />
      <div className="mr-film-shade" aria-hidden />
      <div className="xsto-container mr-film-content">
        <div className="mr-film-copy">
          <p className="mr-film-eyebrow">
            <span className="mr-launch-dot" /> Introducing the M8 Series
          </p>
          <h1 id="homepage-heading">
            More freedom.
            <br />
            New possibilities.
          </h1>
          <p className="mr-film-intro">
            Meet M8 and M8 Pro. Four-wheel drive and intelligent self-balancing,
            ready for your next chapter.
          </p>
          <div className="mr-actions">
            <Link className="mr-button" to="/series/m8">
              Explore the M8 Series <ArrowRight size={18} aria-hidden />
            </Link>
            <Link className="mr-film-product-link" to="/#product-range">
              Compare all models <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
          <p className="mr-film-preorder">
            Reserve with a 10% deposit
            <br />
            Estimated delivery: 12 weeks
          </p>
        </div>
      </div>
    </section>
  );
}
