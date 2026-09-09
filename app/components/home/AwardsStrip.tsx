import {ArrowUpRight, Award} from 'lucide-react';

// Model attribution and primary winner records: docs/rebuild/mobility-robot-rebrand.md.
const awards = [
  {
    name: 'Red Dot Award',
    detail: 'Product Design · 2025',
    url: 'https://www.red-dot.org/project/xsto-mobility-robot-81361',
  },
  {
    name: 'iF Design Award',
    detail: 'Product Design · 2025',
    url: 'https://ifdesign.com/en/winner-ranking/project/xsto-mobility-robot/680124',
  },
  {
    name: 'Good Design Award',
    detail: 'Japan · 2025',
    url: 'https://www.g-mark.org/en/gallery/winners/33173?years=2025',
  },
];

export function AwardsStrip() {
  return (
    <section className="mr-awards" aria-labelledby="m4-awards-heading">
      <div className="xsto-container mr-awards-inner">
        <div className="mr-awards-intro">
          <Award size={28} strokeWidth={1.5} aria-hidden />
          <div>
            <p>XSTO M4</p>
            <h2 id="m4-awards-heading">Award-winning design.</h2>
          </div>
        </div>
        <ul className="mr-awards-list">
          {awards.map((award) => (
            <li key={award.name}>
              <a href={award.url} target="_blank" rel="noopener noreferrer">
                <span className="mr-awards-name">{award.name}</span>
                <span className="mr-awards-detail">{award.detail}</span>
                <ArrowUpRight size={16} aria-hidden />
                <span className="sr-only">
                  {' '}— XSTO M4 winner record (opens in a new tab)
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
