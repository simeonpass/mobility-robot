import {ArrowUpRight, Award} from 'lucide-react';
import {Link} from 'react-router';

// These awards recognise the XSTO M4, not every model or the UK distributor.
const awards = [
  {
    name: 'Red Dot',
    category: 'Product Design Award',
    location: 'Germany',
    url: 'https://www.red-dot.org/project/xsto-mobility-robot-81361',
  },
  {
    name: 'iF Design',
    category: 'iF Design Award',
    location: 'Germany',
    url: 'https://ifdesign.com/en/winner-ranking/project/xsto-mobility-robot/680124',
  },
  {
    name: 'Good Design',
    category: 'Good Design Award',
    location: 'Japan',
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
                <span className="mr-design-award-year">
                  <Award size={19} strokeWidth={1.6} aria-hidden /> Winner 2025
                </span>
                <span className="mr-design-award-name">{award.name}</span>
                <span className="mr-design-award-category">{award.category}</span>
                <span className="mr-design-award-detail">
                  {award.location} · XSTO M4 <ArrowUpRight size={16} aria-hidden />
                </span>
                <span className="sr-only"> — view the award record (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
