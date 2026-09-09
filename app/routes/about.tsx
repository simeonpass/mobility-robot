import {Link} from 'react-router';
import type {Route} from './+types/about';
import {ArrowRight, Handshake, Headphones, ShieldCheck} from 'lucide-react';
import {JsonLd, PageShell} from '~/components/content/PageShell';
import {
  ABOUT_FACTS,
  ABOUT_INTRO,
  ABOUT_VALUE_PROPS,
  DISTRIBUTOR_DISCLAIMER,
} from '~/lib/content/company';
import {HOMEPAGE_PRODUCT_THUMBS} from '~/lib/homepage-data';
import {breadcrumbJsonLd, pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: 'About Mobility Robot | Official UK XSTO Distributor',
    description:
      'Meet Mobility Robot, operated by Bentech Medical Limited, the official UK distributor of XSTO powered wheelchairs and mobility technology.',
    path: '/about',
  });

const VALUE_ICONS = [Handshake, ShieldCheck, Headphones] as const;
const breadcrumbs = [{name: 'Home', path: '/'}, {name: 'About'}] as const;

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([...breadcrumbs])} />
      <section className="mr-about-head">
        <div className="xsto-container">
          <nav aria-label="Breadcrumb" className="mr-about-breadcrumb">
            <Link prefetch="intent" to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">About Mobility Robot</span>
          </nav>
          <p className="mr-about-eyebrow">Mobility Robot by Bentech Medical</p>
          <h1>Intelligent technology.<br />Human support.</h1>
          <p className="mr-about-lead">
            We bring the XSTO range closer, with advice, demonstrations and
            aftercare from a UK team.
          </p>
        </div>
      </section>
      <PageShell className="mr-about-body">
        <section aria-labelledby="about-story-heading" className="mr-about-story" id="our-brand">
          <div>
            <p className="mr-about-eyebrow">A new home for a familiar range</p>
            <h2 id="about-story-heading">A new name.<br />A familiar connection.</h2>
            <div className="mr-about-story-copy">
              {ABOUT_INTRO.map((paragraph) => <p key={paragraph.slice(0, 48)}>{paragraph}</p>)}
            </div>
            <div className="mr-about-actions">
              <Link className="mr-about-primary" prefetch="intent" to="/collections/all">
                Meet the range <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <Link className="mr-about-link" prefetch="intent" to="/contact">
                Talk to us <ArrowRight aria-hidden="true" size={18} />
              </Link>
            </div>
          </div>
          <div className="mr-about-product">
            <img
              alt="XSTO M4B self-levelling powered wheelchair"
              decoding="async"
              height={700}
              loading="lazy"
              src={`${HOMEPAGE_PRODUCT_THUMBS['xsto-m4b']}?width=900`}
              width={700}
            />
          </div>
        </section>

        <section aria-label="About our business" className="mr-about-facts">
          <dl>
            {ABOUT_FACTS.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="about-values-heading" className="mr-about-values">
          <p className="mr-about-eyebrow">The people behind Mobility Robot</p>
          <h2 id="about-values-heading">XSTO innovation.<br />Bentech Medical support.</h2>
          <ul>
            {ABOUT_VALUE_PROPS.map((prop, index) => {
              const Icon = VALUE_ICONS[index] ?? Handshake;
              return (
                <li key={prop.title}>
                  <Icon aria-hidden="true" size={28} strokeWidth={1.5} />
                  <h3>{prop.title}</h3>
                  <p>{prop.description}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="about-next-heading" className="mr-about-next">
          <div>
            <p className="mr-about-eyebrow">Let’s find your next move</p>
            <h2 id="about-next-heading">Experience the difference.</h2>
            <p>
              Book a demonstration or speak to the Bentech Medical team about
              the right model for your needs.
            </p>
          </div>
          <div className="mr-about-actions">
            <Link className="mr-demo-button" prefetch="intent" to="/demo">
              Book a demo <ArrowRight aria-hidden="true" size={18} />
            </Link>
            <Link className="mr-about-light-link" prefetch="intent" to="/stockists">Find a stockist</Link>
          </div>
        </section>
        <p className="mr-about-distributor">{DISTRIBUTOR_DISCLAIMER}</p>
      </PageShell>
    </>
  );
}
