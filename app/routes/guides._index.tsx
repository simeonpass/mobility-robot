import {Link} from 'react-router';
import {ArrowUpRight} from 'lucide-react';
import type {Route} from './+types/guides._index';
import {PageHeader, PageShell} from '~/components/content/PageShell';
import {BUYER_GUIDES} from '~/lib/buyer-guides';
import {buildMeta} from '~/lib/seo';
import discoveryStyles from '~/styles/discovery.css?url';

export const links: Route.LinksFunction = () => [
  {rel: 'stylesheet', href: discoveryStyles},
];

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: 'Powered Wheelchair Buying Guides',
    description:
      'Understand self-levelling and stair-climbing wheelchair technology, compare XSTO models and prepare for your demonstration.',
    path: '/guides',
  });

export default function BuyerGuidesPage() {
  return (
    <PageShell className="mr-discovery">
      <p className="mr-discovery-eyebrow">Advice for your next move</p>
      <PageHeader
        breadcrumbs={[
          {name: 'Home', path: '/'},
          {name: 'Buyer guides', path: '/guides'},
        ]}
        title="More understanding. More confidence."
        description="Straightforward guides to the technology, the choices and the questions worth asking."
      />
      <div className="mr-discovery-grid">
        {BUYER_GUIDES.map((guide, index) => (
          <article className="mr-guide-card" key={guide.slug}>
            <span className="mr-guide-number" aria-hidden="true">
              0{index + 1}
            </span>
            <p className="mr-discovery-eyebrow">{guide.category}</p>
            <h2>
              <Link to={`/guides/${guide.slug}`} prefetch="intent">
                {guide.title}
              </Link>
            </h2>
            <p>{guide.summary}</p>
            <Link className="mr-discovery-link" to={`/guides/${guide.slug}`}>
              Read the guide <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
      <div className="mr-discovery-actions">
        <Link className="mr-discovery-link" to="/vat-relief">
          VAT relief explained <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
        <Link className="mr-discovery-link" to="/support">
          Delivery and warranty <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <section
        className="mr-discovery-cta"
        aria-labelledby="guides-demo-heading"
      >
        <div>
          <p className="mr-discovery-eyebrow">Your life. Your next move.</p>
          <h2 id="guides-demo-heading">Let’s make it personal.</h2>
          <p>
            A demonstration helps you explore the chair around your everyday
            needs.
          </p>
        </div>
        <Link className="mr-discovery-button" to="/demo">
          Book a demonstration <ArrowUpRight size={20} aria-hidden="true" />
        </Link>
      </section>
    </PageShell>
  );
}
