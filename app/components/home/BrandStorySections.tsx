import {ArrowRight} from 'lucide-react';
import {Link} from 'react-router';

const benefits = [
  [
    '01 / CHOOSE WITH CONFIDENCE',
    'Real advice. From real people.',
    'Talk through your daily routine with Bentech Medical, the official UK distributor of XSTO.',
  ],
  [
    '02 / EXPERIENCE THE DIFFERENCE',
    'Try the technology for yourself.',
    'A demonstration helps you assess seating, controls, transfers and the way the chair handles.',
  ],
  [
    '03 / KEEP MOVING',
    'Support beyond the purchase.',
    'Speak to our UK team for warranty questions, compatible accessories and aftercare.',
  ],
];
const guides = [
  [
    'Understanding the technology',
    'Self-levelling wheelchairs, explained.',
    'What the technology does and what to try during a demonstration.',
    'self-levelling-wheelchairs',
  ],
  [
    'Planning your next move',
    'A guide to stair-climbing wheelchairs.',
    'The questions to ask about stairs, training and your everyday routes.',
    'stair-climbing-wheelchairs',
  ],
  [
    'Find your fit',
    'Which XSTO is right for you?',
    'A practical way to compare the M4, M4B, M4 Pro and X12.',
    'choosing-an-xsto-wheelchair',
  ],
];

export function BrandStorySections() {
  return (
    <>
      <section className="mr-section mr-feature-section">
        <div className="xsto-container">
          <div className="mr-feature">
            <div className="mr-feature-image">
              <img
                src="/images/about-hero.jpg"
                alt="Discover the XSTO powered wheelchair range with Bentech Medical"
                width={1000}
                height={750}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="mr-feature-copy">
              <p className="mr-eyebrow">Technology with a purpose</p>
              <h2>Made for the moments that matter.</h2>
              <p>
                Meeting friends. Joining the conversation. Taking a different
                route. The right mobility technology should make more room for
                your life.
              </p>
              <p>
                Explore electric seat lifting, responsive self-levelling and the
                X12’s stair-climbing capability with someone who knows the
                range.
              </p>
              <Link className="mr-button mr-button-amber" to="/demo">
                Experience it for yourself <ArrowRight size={18} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="mr-section mr-soft mr-support-section">
        <div className="xsto-container">
          <div className="mr-section-intro">
            <div>
              <p className="mr-eyebrow">The people behind Mobility Robot</p>
              <h2>
                XSTO innovation.
                <br />
                Bentech Medical support.
              </h2>
            </div>
          </div>
          <div className="mr-three-grid">
            {benefits.map(([label, title, copy]) => (
              <article className="mr-benefit" key={label}>
                <p className="mr-eyebrow">{label}</p>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="mr-section mr-guides-section">
        <div className="xsto-container">
          <div className="mr-section-intro">
            <div>
              <p className="mr-eyebrow">
                A little knowledge. A lot of confidence.
              </p>
              <h2>Your questions, explored.</h2>
            </div>
            <Link className="mr-text-link" to="/guides">
              All buyer guides <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
          <div className="mr-three-grid">
            {guides.map(([label, title, copy, slug]) => (
              <Link className="mr-guide-card" key={slug} to={`/guides/${slug}`}>
                <p className="mr-eyebrow">{label}</p>
                <h3>{title}</h3>
                <p>{copy}</p>
                <span className="mr-text-link" aria-hidden>
                  <span className="mr-desktop-copy">Read the guide</span>
                  <ArrowRight size={18} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
