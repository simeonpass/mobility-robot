import {ArrowRight, Phone} from 'lucide-react';
import {Link} from 'react-router';

export function HomeCtaSection() {
  return (
    <section className="mr-section">
      <div className="xsto-container">
        <div className="mr-final-cta">
          <div>
            <p className="mr-eyebrow">Your next chapter starts here</p>
            <h2>Let’s find your next move.</h2>
            <p>
              Tell us what matters to you. We’ll help you explore the range and
              arrange a demonstration.
            </p>
          </div>
          <div className="mr-actions">
            <Link className="mr-button mr-button-amber" to="/demo">
              Book a demonstration <ArrowRight size={18} aria-hidden />
            </Link>
            <a className="mr-cta-phone" href="tel:+442080504849">
              <Phone size={18} aria-hidden />
              020 8050 4849
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
