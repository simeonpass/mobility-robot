import {Link} from 'react-router';
import {ArrowUpRight} from 'lucide-react';
import type {Route} from './+types/compare';
import {PageHeader, PageShell} from '~/components/content/PageShell';
import {
  HOMEPAGE_COMPARISON_ROWS,
  HOMEPAGE_PRODUCT_THUMBS,
} from '~/lib/homepage-data';
import {buildMeta} from '~/lib/seo';
import discoveryStyles from '~/styles/discovery.css?url';

export const links: Route.LinksFunction = () => [
  {rel: 'stylesheet', href: discoveryStyles},
];

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: 'Compare XSTO M4, M4B, M4 Pro & X12',
    description:
      'Compare XSTO wheelchair range, weight, seating and stair-climbing capability. Find the differences between M4, M4B, M4 Pro and X12.',
    path: '/compare',
  });

const MODEL_FOCUS = [
  'Everyday self-levelling',
  'Revised wheels and footrest',
  'More seating adjustment',
  'Stair-climbing technology',
];

const FEATURES = [
  {label: 'Self-levelling', values: ['Yes', 'Yes', 'Yes', 'Yes']},
  {label: 'Stair climbing', values: ['No', 'No', 'No', 'Suitable stairs only']},
  {
    label: 'Distinctive feature',
    values: [
      'Modular design',
      'Folding footrest',
      'Backrest recline and seat tilt',
      'X12 / X12 Pro leg-rest options',
    ],
  },
];

export default function ComparePage() {
  const rows = HOMEPAGE_COMPARISON_ROWS;
  return (
    <PageShell className="mr-discovery">
      <p className="mr-discovery-eyebrow">Find your fit</p>
      <PageHeader
        breadcrumbs={[
          {name: 'Home', path: '/'},
          {name: 'Compare models', path: '/compare'},
        ]}
        title="Different possibilities. One clear comparison."
        description="Choose around your daily life: seating, transport, terrain and the places you want to reach."
      />
      <p className="mr-discovery-scroll-hint">
        On a smaller screen, scroll the table to compare all four models.
      </p>
      {/* Keyboard users need to focus this region to scroll all comparison columns. */}
      {/* eslint-disable jsx-a11y/no-noninteractive-tabindex */}
      <div
        className="mr-discovery-table-scroll"
        role="region"
        tabIndex={0}
        aria-label="XSTO wheelchair comparison; scroll horizontally to view all models"
      >
        <table className="mr-discovery-table">
          <caption className="sr-only">
            Published specifications for XSTO M4, M4B, M4 Pro and X12 powered
            wheelchairs
          </caption>
          <thead>
            <tr>
              <th scope="col">Find your fit</th>
              {rows.map((model) => (
                <th scope="col" key={model.handle}>
                  <img
                    src={`${HOMEPAGE_PRODUCT_THUMBS[model.handle === 'xsto-x12-pro' ? 'xsto-x12' : model.handle]}?width=300`}
                    width={150}
                    height={150}
                    alt=""
                    loading="lazy"
                  />
                  <h2>XSTO {model.model}</h2>
                  <Link to={`/products/${model.shopifyHandle}`}>
                    View price &amp; options{' '}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Focus</th>
              {MODEL_FOCUS.map((value) => (
                <td key={value}>{value}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Advertised range</th>
              {rows.map((model) => (
                <td key={model.handle}>
                  Up to {model.range}
                  {model.handle === 'xsto-x12' ? ' (dual batteries)' : ''}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Published total weight</th>
              {rows.map((model) => (
                <td key={model.handle}>{model.weight}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">User capacity</th>
              {rows.map((model) => (
                <td key={model.handle}>{model.capacity}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Folded dimensions</th>
              {rows.map((model) => (
                <td key={model.handle}>{model.foldedSize}</td>
              ))}
            </tr>
            {FEATURES.map((feature) => (
              <tr key={feature.label}>
                <th scope="row">{feature.label}</th>
                {feature.values.map((value, index) => (
                  <td key={rows[index].handle}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* eslint-enable jsx-a11y/no-noninteractive-tabindex */}
      <p className="mr-discovery-note">
        Ranges are advertised maximums and vary with terrain, speed, load,
        temperature and battery configuration. Published weights and dimensions
        can vary by configuration. X12 stair capability depends on staircase
        suitability, conditions, assessment and training. Confirm current
        specifications before purchase.
      </p>
      <div className="mr-discovery-actions">
        <Link className="mr-discovery-button" to="/demo">
          Help me choose <ArrowUpRight size={20} aria-hidden="true" />
        </Link>
        <Link
          className="mr-discovery-link"
          to="/guides/choosing-an-xsto-wheelchair"
        >
          Read the buying guide <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <section
        className="mr-discovery-grid mr-discovery-grid-two mr-discovery-related"
        aria-label="Before you decide"
      >
        <article className="mr-guide-card">
          <p className="mr-discovery-eyebrow">Clear prices</p>
          <h2>Know which price applies.</h2>
          <p>
            Open each model for its current price and available options. VAT
            relief applies to eligible customers making qualifying purchases and
            requires a declaration.
          </p>
          <Link className="mr-discovery-link" to="/vat-relief">
            VAT relief explained <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </article>
        <article className="mr-guide-card">
          <p className="mr-discovery-eyebrow">More than a specification</p>
          <h2>Try the chair for your life.</h2>
          <p>
            Seating, controls, transfers and transport all deserve a closer
            look. Tell us what matters in your day so we can help you explore
            the range.
          </p>
          <Link className="mr-discovery-link" to="/demo">
            Book your demonstration{' '}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </article>
      </section>
    </PageShell>
  );
}
