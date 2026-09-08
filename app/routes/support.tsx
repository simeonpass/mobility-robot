import {Link} from 'react-router';
import {
  ArrowUpRight,
  Package,
  ShieldCheck,
  Wrench,
  Undo2,
  CircleHelp,
  UserRound,
} from 'lucide-react';
import type {Route} from './+types/support';
import {PageHeader, PageShell} from '~/components/content/PageShell';
import {buildMeta} from '~/lib/seo';
import discoveryStyles from '~/styles/discovery.css?url';

export const links: Route.LinksFunction = () => [
  {rel: 'stylesheet', href: discoveryStyles},
];
export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: 'XSTO Delivery, Warranty & Support',
    description:
      'Find UK delivery information, XSTO wheelchair warranty guidance, compatible accessories, returns and aftercare contacts.',
    path: '/support',
  });

const SUPPORT_TOPICS = [
  {
    title: 'Delivery',
    icon: Package,
    text: 'Check delivery arrangements for your model and destination. Contact the team to confirm availability, timing and any setup requirements.',
    label: 'Delivery information',
    to: '/delivery',
  },
  {
    title: 'Warranty',
    icon: ShieldCheck,
    text: 'Frame, electrical, mechanical and battery cover have different terms. Read the coverage and exclusions, or register your chair with the team.',
    label: 'Warranty and registration',
    to: '/warranty',
  },
  {
    title: 'Accessories & spares',
    icon: Wrench,
    text: 'Choose accessories for your exact chair and configuration. Explore batteries, seating options, storage and control accessories.',
    label: 'Shop compatible accessories',
    to: '/collections/accessories',
  },
  {
    title: 'Returns & aftercare',
    icon: Undo2,
    text: 'Read the return conditions, including collection arrangements. For aftercare, have your model, serial number and order details ready.',
    label: 'Returns information',
    to: '/returns',
  },
  {
    title: 'Your questions',
    icon: CircleHelp,
    text: 'Find answers about the XSTO range, ordering and ownership. Our buyer guides can also help you prepare for a demonstration.',
    label: 'Frequently asked questions',
    to: '/faq',
  },
  {
    title: 'Your orders',
    icon: UserRound,
    text: 'Sign in to your customer account to view your orders and account details. For a question about an existing order, contact the UK team.',
    label: 'View your account',
    to: '/account/orders',
  },
];

export default function SupportPage() {
  return (
    <PageShell className="mr-discovery">
      <p className="mr-discovery-eyebrow">Here for the journey</p>
      <PageHeader
        breadcrumbs={[
          {name: 'Home', path: '/'},
          {name: 'Support', path: '/support'},
        ]}
        title="Support that keeps you moving."
        description="From the first question to everyday ownership, our UK team is here to help."
      />
      <div className="mr-discovery-grid">
        {SUPPORT_TOPICS.map(({icon: Icon, ...topic}) => (
          <article className="mr-guide-card mr-support-card" key={topic.to}>
            <Icon size={30} strokeWidth={1.5} aria-hidden="true" />
            <h2>{topic.title}</h2>
            <p>{topic.text}</p>
            <Link className="mr-discovery-link" to={topic.to}>
              {topic.label} <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
      <section
        className="mr-discovery-cta"
        aria-labelledby="support-contact-heading"
      >
        <div>
          <p className="mr-discovery-eyebrow">People you can talk to</p>
          <h2 id="support-contact-heading">Let’s help you move forward.</h2>
          <p>
            Tell us your model and how we can help. Bentech Medical’s UK team
            will guide you to the right next step.
          </p>
        </div>
        <Link className="mr-discovery-button" to="/contact">
          Contact the support team <ArrowUpRight size={20} aria-hidden="true" />
        </Link>
      </section>
      <div className="mr-discovery-actions">
        <Link className="mr-discovery-link" to="/stockists">
          Find a dealer <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
        <Link className="mr-discovery-link" to="/guides">
          Explore the buyer guides <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </PageShell>
  );
}
