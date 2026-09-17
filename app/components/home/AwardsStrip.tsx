import {ArrowUpRight} from 'lucide-react';
import {Link} from 'react-router';
import ifDesignLogo from '~/assets/award-if-design-2025.webp';
import redDotLogo from '~/assets/award-red-dot-2025.webp';
import goodDesignLogo from '~/assets/award-good-design-2025.webp';

// These awards recognise the XSTO M4, not every model or the UK distributor.
const awards = [
  {
    name: 'iF Design Award 2025',
    src: ifDesignLogo,
    width: 344,
    height: 172,
    url: 'https://ifdesign.com/en/winner-ranking/project/xsto-mobility-robot/680124',
  },
  {
    name: 'Red Dot Winner 2025',
    src: redDotLogo,
    width: 280,
    height: 153,
    url: 'https://www.red-dot.org/project/xsto-mobility-robot-81361',
  },
  {
    name: 'Good Design Award 2025',
    src: goodDesignLogo,
    width: 404,
    height: 112,
    url: 'https://www.g-mark.org/en/gallery/winners/33173?years=2025',
  },
];

export function AwardsStrip() {
  return (
    <section className="mr-design-awards" aria-labelledby="design-awards-heading">
      <div className="xsto-container mr-design-awards-grid">
        <div className="mr-design-awards-intro">
          <p className="mr-eyebrow">International recognition</p>
          <h2 id="design-awards-heading">Award-winning design.</h2>
          <p>The XSTO M4. Three international design awards in 2025.</p>
          <Link to="/products/buy-robot-wheelchair" className="mr-text-link">
            Discover the M4 <ArrowUpRight size={17} aria-hidden />
          </Link>
        </div>
        <ul className="mr-design-awards-list">
          {awards.map((award) => (
            <li key={award.name}>
              <a href={award.url} target="_blank" rel="noopener noreferrer">
                <img
                  alt={award.name}
                  decoding="async"
                  height={award.height}
                  src={award.src}
                  width={award.width}
                />
                <span className="sr-only">
                  {' '}
                  — XSTO M4 winner record (opens in a new tab)
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
