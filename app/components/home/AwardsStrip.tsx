import ifRedDotAwards from '~/assets/if-reddot-awards.webp';
import goodDesignAward from '~/assets/good-design-award.svg';

// Award records and artwork recognise the M4, not the whole range or distributor.
export function AwardsStrip() {
  return (
    <section className="mr-awards-bar" aria-labelledby="design-awards-heading">
      <div className="xsto-container mr-awards-bar-inner">
        <div className="mr-awards-bar-copy">
          <h2 id="design-awards-heading">Award-winning design</h2>
          <p>XSTO M4 · International recognition · 2025</p>
        </div>
        <div className="mr-awards-logos">
          <div className="mr-awards-pair">
            <img
              src={ifRedDotAwards}
              width={638}
              height={173}
              alt="iF Design Award 2025 and Red Dot winner 2025"
              loading="lazy"
              decoding="async"
            />
            <a
              className="mr-awards-if-link"
              href="https://ifdesign.com/en/winner-ranking/project/xsto-mobility-robot/680124"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="XSTO M4 — iF Design Award 2025 winner record (opens in a new tab)"
            />
            <a
              className="mr-awards-red-dot-link"
              href="https://www.red-dot.org/project/xsto-mobility-robot-81361"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="XSTO M4 — Red Dot 2025 winner record (opens in a new tab)"
            />
          </div>
          <a
            className="mr-awards-good-design"
            href="https://www.g-mark.org/en/gallery/winners/33173?years=2025"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="XSTO M4 — Good Design Award 2025 winner record (opens in a new tab)"
          >
            <img
              src={goodDesignAward}
              width={258}
              height={40}
              alt="Good Design Award"
              loading="lazy"
              decoding="async"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
