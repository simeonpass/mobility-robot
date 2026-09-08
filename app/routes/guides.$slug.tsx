import {Link} from 'react-router';
import {ArrowUpRight} from 'lucide-react';
import type {Route} from './+types/guides.$slug';
import {JsonLd, PageHeader, PageShell} from '~/components/content/PageShell';
import {BUYER_GUIDES, getBuyerGuide} from '~/lib/buyer-guides';
import {buildMeta, noindexMeta, SITE_URL} from '~/lib/seo';
import discoveryStyles from '~/styles/discovery.css?url';

export const links: Route.LinksFunction = () => [
  {rel: 'stylesheet', href: discoveryStyles},
];

export function loader({params}: Route.LoaderArgs) {
  const guide = getBuyerGuide(params.slug);
  if (!guide) throw new Response('Guide not found', {status: 404});
  return {guide};
}

export const meta: Route.MetaFunction = ({data}) => {
  if (!data?.guide) return noindexMeta();
  return buildMeta({
    title: data.guide.metaTitle,
    description: data.guide.description,
    path: `/guides/${data.guide.slug}`,
    ogType: 'article',
  });
};

export default function BuyerGuidePage({loaderData}: Route.ComponentProps) {
  const {guide} = loaderData;
  const path = `/guides/${guide.slug}`;

  return (
    <PageShell className="mr-discovery">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: guide.title,
          description: guide.description,
          inLanguage: 'en-GB',
          mainEntityOfPage: `${SITE_URL}${path}`,
          author: {'@id': `${SITE_URL}/#organization`},
          publisher: {'@id': `${SITE_URL}/#organization`},
        }}
      />
      <p className="mr-discovery-eyebrow">{guide.category}</p>
      <PageHeader
        breadcrumbs={[
          {name: 'Home', path: '/'},
          {name: 'Buyer guides', path: '/guides'},
          {name: guide.title, path},
        ]}
        title={guide.title}
        description={guide.description}
      />
      <div className="mr-discovery-article-layout">
        <article className="mr-discovery-article" aria-label={guide.title}>
          {guide.sections.map((section) => (
            <section aria-labelledby={section.id} key={section.id}>
              <h2 id={section.id}>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
              {section.links ? (
                <div className="mr-discovery-article-links">
                  {section.links.map((link) => (
                    <Link key={link.to} to={link.to}>
                      {link.label} <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
          <p className="mr-discovery-note">
            Product information is based on the published XSTO range. Check the
            relevant product page and confirm current specifications and your
            chosen configuration with the team before ordering.
          </p>
        </article>
        <aside className="mr-discovery-sidebar">
          <nav aria-label="In this guide">
            <h2>In this guide</h2>
            <ol>
              {guide.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="mr-discovery-aside-cta">
            <h2>Find your next move.</h2>
            <p>Talk through your requirements with our UK team.</p>
            <Link className="mr-discovery-button" to="/demo">
              Book a demo <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <Link className="mr-discovery-link" to="/compare">
              Compare models <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>
      <section
        className="mr-discovery-related"
        aria-labelledby="related-guides-heading"
      >
        <p className="mr-discovery-eyebrow">Keep exploring</p>
        <h2 id="related-guides-heading">Your next question, answered.</h2>
        <div className="mr-discovery-grid mr-discovery-grid-two">
          {BUYER_GUIDES.filter((item) => item.slug !== guide.slug).map(
            (item) => (
              <article className="mr-guide-card" key={item.slug}>
                <h3>
                  <Link to={`/guides/${item.slug}`}>{item.title}</Link>
                </h3>
                <p>{item.summary}</p>
                <Link className="mr-discovery-link" to={`/guides/${item.slug}`}>
                  Read the guide <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </article>
            ),
          )}
        </div>
      </section>
    </PageShell>
  );
}
