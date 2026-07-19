import {useMemo, useState} from 'react';
import {data, useFetcher} from 'react-router';
import type {Route} from './+types/stockists';
import {JsonLd, PageHeader, PageShell} from '~/components/content/PageShell';
import {StockistCard} from '~/components/content/StockistCard';
import {StockistsMap} from '~/components/content/StockistsMap';
import {DEALERS} from '~/lib/dealers';
import {geocodePostcode, sortDealersByDistance} from '~/lib/geo';
import {pageMeta, localBusinessListJsonLd} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: 'Authorised XSTO Stockists',
    description:
      'Find your nearest authorised XSTO stockist via Mobility Robot. Search by postcode, view on map and book a demo across the UK and Ireland.',
    path: '/stockists',
  });

export async function action({request}: Route.ActionArgs) {
  const formData = await request.formData();
  const postcode = String(formData.get('postcode') ?? '').trim();

  if (!postcode) {
    return data({error: 'Please enter a postcode.', ranked: null, origin: null});
  }

  const origin = await geocodePostcode(postcode);
  if (!origin) {
    return data({
      error: 'Postcode not found. Try a full UK or Ireland postcode.',
      ranked: null,
      origin: null,
    });
  }

  const ranked = sortDealersByDistance(DEALERS, origin).slice(0, 10);

  return data({error: null, ranked, origin});
}

export async function loader() {
  return {dealers: DEALERS};
}

export default function StockistsPage() {
  const fetcher = useFetcher<typeof action>();
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);

  const searching = fetcher.state !== 'idle';
  const rankedDealers = fetcher.data?.ranked ?? null;
  const searchOrigin = fetcher.data?.origin ?? null;
  const searchError = fetcher.data?.error ?? null;

  const displayDealers = useMemo(() => {
    if (rankedDealers) return rankedDealers.slice(0, 10);

    return DEALERS.map((dealer) => ({
      ...dealer,
      distanceKm: 0,
    }));
  }, [rankedDealers]);

  const jsonLd = localBusinessListJsonLd(
    DEALERS.map((dealer) => ({
      name: dealer.name,
      address: dealer.address,
      city: dealer.city,
      postcode: dealer.postcode,
      country: dealer.country,
      phone: dealer.phone,
      email: dealer.email,
      website: dealer.website,
      lat: dealer.lat,
      lng: dealer.lng,
    })),
  );

  return (
    <PageShell>
      <JsonLd data={jsonLd} />
      <PageHeader
        breadcrumbs={[
          {name: 'Home', path: '/'},
          {name: 'Stockists'},
        ]}
        description="Find an authorised XSTO stockist near you. Search by postcode to see the nearest locations, or browse all 17 UK and Ireland partners."
        title="Authorised Stockists"
      />

      <fetcher.Form
        className="mb-8 flex max-w-xl flex-col gap-3 sm:flex-row"
        method="post"
      >
        <label className="sr-only" htmlFor="postcode-search">
          Postcode search
        </label>
        <input
          className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-foreground"
          id="postcode-search"
          name="postcode"
          placeholder="Enter postcode (e.g. PR8 3AE)"
          required
          type="text"
        />
        <button
          className="min-h-12 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-gold-light disabled:opacity-60 sm:min-h-0"
          disabled={searching}
          type="submit"
        >
          {searching ? 'Searching…' : 'Find nearest'}
        </button>
      </fetcher.Form>

      {searchError ? (
        <p className="mb-6 text-sm text-destructive" role="alert">
          {searchError}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8">
        <StockistsMap
          dealers={DEALERS}
          onSelectDealer={(dealer) => setSelectedDealerId(dealer.name)}
          searchOrigin={searchOrigin}
          selectedDealerId={selectedDealerId}
        />

        <div className="order-first space-y-3 lg:order-none lg:space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            {rankedDealers ? 'Nearest stockists' : 'All stockists'}
          </h2>
          {displayDealers.map((dealer) => (
            <StockistCard
              dealer={dealer}
              distanceKm={rankedDealers ? dealer.distanceKm : null}
              key={dealer.name}
              onSelect={() => setSelectedDealerId(dealer.name)}
              selected={selectedDealerId === dealer.name}
            />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
