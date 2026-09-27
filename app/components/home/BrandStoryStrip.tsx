import {ArrowRight} from 'lucide-react';
import {Link} from 'react-router';

export function BrandStoryStrip() {
  return (
    <aside className="mr-transition mr-story-strip" aria-label="Our story">
      <div className="xsto-container mr-transition-inner">
        <p>
          <span className="mr-story-desktop-copy">
            <strong>Bentech Medical’s XSTO range has a new home.</strong>{' '}
            Welcome to Mobility Robot.
          </span>
          <strong className="mr-story-mobile-copy">XSTO has a new home.</strong>
        </p>
        <Link to="/about#our-brand">
          Our story <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </aside>
  );
}
