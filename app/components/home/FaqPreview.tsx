import {Link} from 'react-router';
import {ArrowRight} from 'lucide-react';
const faqs = [
  [
    'What makes an XSTO wheelchair different?',
    'The range combines electric mobility with features such as self-levelling control and adjustable seating. The M4 and M4B focus on everyday use, the M4 Pro adds more seating adjustment, and the X12 adds stair-climbing capability. Compare the models around the places you need to go.',
  ],
  [
    'Can all XSTO wheelchairs climb stairs?',
    'No. The X12 is the stair-climbing model in this range. The M4, M4B and M4 Pro are not stair-climbing chairs. For the X12, suitable stair dimensions, surface conditions, an assessment and proper training are essential.',
  ],
  [
    'Can I try a wheelchair before buying?',
    'Yes. Request a demonstration with the UK team. Tell us which models interest you, your location and the everyday situations you would like to try. The team will confirm availability and arrangements.',
  ],
  [
    'How does VAT relief work?',
    'Qualifying customers can buy eligible products without VAT for personal or domestic use. Eligibility is not automatic; you must complete a declaration. Both VAT-relief and VAT-inclusive prices are shown. Read the VAT relief guide or ask the team for help.',
  ],
  [
    'Do you deliver outside the UK?',
    'Please enquire before ordering internationally. Product availability, local support, delivery, import charges and destination requirements need to be confirmed for your country. The UK delivery offer does not apply to overseas orders.',
  ],
];
export function FaqPreview() {
  return (
    <section className="mr-section mr-soft">
      <div className="xsto-container mr-faq-grid">
        <div>
          <p className="mr-eyebrow">Good to know</p>
          <h2>
            Let’s make
            <br />
            things clearer.
          </h2>
          <p>
            Choosing a wheelchair is personal. We’re here to help you understand
            your options.
          </p>
          <Link className="mr-text-link" to="/contact">
            Talk to our team <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
        <div>
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
          <Link className="mr-text-link mt-6" to="/faq">
            View all FAQs <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
