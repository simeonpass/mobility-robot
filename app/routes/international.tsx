import {Link} from 'react-router';
import {ArrowUpRight} from 'lucide-react';
import type {Route} from './+types/international';
import {PageHeader, PageShell} from '~/components/content/PageShell';
import {COMPANY} from '~/lib/site-navigation';
import {buildMeta} from '~/lib/seo';
import discoveryStyles from '~/styles/discovery.css?url';

export const links: Route.LinksFunction = () => [
  {rel: 'stylesheet', href: discoveryStyles},
];
export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: 'International XSTO Wheelchair Enquiries',
    description:
      'Enquire about XSTO wheelchairs from outside the UK. Confirm country availability, delivery, taxes and support before ordering.',
    path: '/international',
  });

export default function InternationalPage() {
  return (
    <PageShell className="mr-discovery">
      <p className="mr-discovery-eyebrow">
        More possibilities, wherever you are
      </p>
      <PageHeader
        breadcrumbs={[
          {name: 'Home', path: '/'},
          {name: 'International enquiries', path: '/international'},
        ]}
        title="Your world. Your next move."
        description="Interested in XSTO from outside the UK? Let’s start with your location and what you need."
      />
      <div className="mr-discovery-contact-layout">
        <section aria-labelledby="international-process-heading">
          <h2 id="international-process-heading">
            Tell us where you want to go.
          </h2>
          <p>
            Mobility Robot is operated by Bentech Medical Limited, the official
            UK distributor of XSTO. If you are outside the UK, please contact us
            before placing an order.
          </p>
          <ol className="mr-discovery-steps">
            <li>
              <h3>Your country and model.</h3>
              <p>
                Tell us your destination and the chair you are interested in.
                Retailers can include their company name and website.
              </p>
            </li>
            <li>
              <h3>Availability and support.</h3>
              <p>
                We need to confirm supply arrangements and what local or
                cross-border support is available for your destination.
              </p>
            </li>
            <li>
              <h3>A clear quote before you buy.</h3>
              <p>
                Delivery options, import charges, tax treatment and warranty
                arrangements need to be confirmed for your country.
              </p>
            </li>
          </ol>
        </section>
        <aside className="mr-discovery-contact-card">
          <p className="mr-discovery-eyebrow">Outside the UK?</p>
          <h2>Start an international enquiry.</h2>
          <p>
            Email your country, postcode and preferred model so the team can
            discuss the arrangements with you.
          </p>
          <a
            className="mr-discovery-button"
            href={`mailto:${COMPANY.email}?subject=International%20XSTO%20enquiry`}
          >
            Email the team <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          <Link className="mr-discovery-link" to="/contact">
            Use our contact form <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <p className="mr-discovery-notice">
            Prices shown on this website are in GBP. Free UK mainland delivery
            and UK VAT-relief information do not describe overseas delivery or
            local taxes.
          </p>
        </aside>
      </div>
      <section
        className="mr-discovery-cta"
        aria-labelledby="international-range-heading"
      >
        <div>
          <p className="mr-discovery-eyebrow">Start with the possibilities</p>
          <h2 id="international-range-heading">
            Find the model that interests you.
          </h2>
          <p>Compare the range before you contact our UK team.</p>
        </div>
        <Link className="mr-discovery-button" to="/compare">
          Compare models <ArrowUpRight size={20} aria-hidden="true" />
        </Link>
      </section>
    </PageShell>
  );
}
