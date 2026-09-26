import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/series.$series';
import {PageHeader, PageShell} from '~/components/content/PageShell';
import {PRODUCT_NAV_GROUPS} from '~/lib/site-navigation';
import {buildMeta} from '~/lib/seo';
import {ProductVideoHero} from '~/components/product/ProductVideoHero';
import {M8_FULL_VIDEO_URL, HOMEPAGE_HERO_POSTER_URL} from '~/lib/homepage-data';
import '~/styles/home-redesign.css';
import productStyles from '~/styles/product-redesign.css?url';

export const links: Route.LinksFunction = () => [
  {rel: 'stylesheet', href: productStyles},
];
const summaries: Record<string, string> = {
  m4: 'Everyday self-levelling, with a choice of seating, wheels and folding features. Meet M4, M4B and M4 Pro.',
  m8: 'Meet the new four-wheel-drive mobility robots. The same self-balancing platform, with two ways to find your comfort.',
  x12: 'Explore stair-climbing capability for suitable stairs, with assessment and training. Choose X12 or X12 Pro with an electric elevating leg rest.',
};
export function loader({params}: Route.LoaderArgs) {
  const key = params.series ?? '';
  const group = PRODUCT_NAV_GROUPS.find(
    (g) => g.title.toLowerCase() === `${key} series`,
  );
  if (!group || !summaries[key]) throw new Response('Not found', {status: 404});
  return {group, key, summary: summaries[key]};
}
export const meta: Route.MetaFunction = ({data}) =>
  data
    ? buildMeta({
        title: `XSTO ${data.group.title}`,
        description: data.summary,
        path: `/series/${data.key}`,
      })
    : [];

export default function SeriesPage() {
  const {group, key, summary} = useLoaderData<typeof loader>();
  return (
    <PageShell className="mr-home mr-series-page">
      <p className="mr-eyebrow">
        {key === 'm8' ? 'New · Available to pre-order' : 'Find your freedom'}
      </p>
      <PageHeader
        title={`XSTO ${group.title}`}
        description={summary}
        breadcrumbs={[
          {name: 'Home', path: '/'},
          {name: group.title, path: `/series/${key}`},
        ]}
      />
      <nav className="mr-series-links" aria-label="Product series">
        {PRODUCT_NAV_GROUPS.map((g) => (
          <Link
            key={g.title}
            to={`/series/${g.title.split(' ')[0].toLowerCase()}`}
            aria-current={g.title === group.title ? 'page' : undefined}
          >
            {g.title}
          </Link>
        ))}
      </nav>
      <div className="mr-series-models">
        {group.items.map((item, index) => (
          <article className="mr-product-card" key={item.url}>
            <Link to={item.url} className="mr-card-visual">
              <img
                src={`${item.imageUrl}?width=900`}
                alt={`XSTO ${item.title}`}
                width={900}
                height={900}
                loading="lazy"
              />
            </Link>
            <div className="mr-card-body">
              <h2>XSTO {item.title}</h2>
              <p>{item.description}</p>
              {key === 'm8' && (
                <>
                  <ul className="mr-series-features">
                    <li>Four-wheel drive &amp; self-balancing</li>
                    <li>Powered seat elevation: 450–730 mm</li>
                    <li>
                      {index === 0
                        ? 'Manual reclining backrest, 90–125°'
                        : 'Powered reclining backrest, 90–135°'}
                    </li>
                    <li>
                      {index === 0 ? 'Manual leg rest' : 'Powered leg rest'}
                    </li>
                  </ul>
                  <div className="mr-series-price">
                    <strong>{index === 0 ? '£7,000' : '£8,000'} + VAT</strong>
                    <p>{index === 0 ? '£8,400' : '£9,600'} including VAT</p>
                  </div>
                  <p className="mr-series-deposit">
                    10% deposit: {index === 0 ? '£700' : '£800'} + VAT
                    <br />
                    <small>
                      {index === 0 ? '£840' : '£960'} including VAT due today
                    </small>
                  </p>
                  <p>
                    Estimated delivery: 12 weeks from pre-order. Remaining 90%
                    payable before dispatch.
                  </p>
                </>
              )}
              <Link className="mr-button" to={item.url}>
                {key === 'm8' ? 'Explore & pre-order' : 'Explore model'}{' '}
                <span aria-hidden>↗</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
      {key === 'm8' && (
        <>
          <p className="mr-range-note">
            VAT relief is subject to eligibility and a completed declaration.
            Optional equipment may be shown. Manufacturer specifications and
            maximum range depend on configuration and conditions.{' '}
            <Link to="/vat-relief">VAT relief explained</Link>.
          </p>
          <ProductVideoHero
            productName="M8 Series"
            video={{
              title: 'XSTO M8 Series in motion',
              embedUrl: M8_FULL_VIDEO_URL,
              poster: HOMEPAGE_HERO_POSTER_URL,
            }}
          />
        </>
      )}
      <div className="mr-series-help">
        <h2>Not sure which model fits your life?</h2>
        <p>
          Talk it through with Bentech Medical, the official UK distributor of
          XSTO.
        </p>
        <Link className="mr-text-link" to="/contact">
          Speak to our UK team ↗
        </Link>
      </div>
    </PageShell>
  );
}
