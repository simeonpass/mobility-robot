import {useEffect, useMemo, useRef, useState} from 'react';
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
  const listRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!selectedDealerId || !listRef.current) return;
    const selected = listRef.current.querySelector(
      `[data-dealer="${CSS.escape(selectedDealerId)}"]`,
    );
    selected?.scrollIntoView({block: 'nearest', behavior: 'smooth'});
  }, [selectedDealerId]);

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
    <PageShell className="!pb-10 md:!pb-12">
      <JsonLd data={jsonLd} />
      <PageHeader
        breadcrumbs={[
          {name: 'Home', path: '/'},
          {name: 'Stockists'},
        ]}
        description="Search by postcode for the nearest authorised partner, or browse the map and pick a stockist from the list."
        title="Authorised Stockists"
      />

      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-border bg-[#f7f6f4] p-3 sm:flex-row sm:items-end sm:p-4">
        <fetcher.Form className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end" method="post">
          <div className="min-w-0 flex-1">
            <label
              className="mb-1 block text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-navy/50"
              htmlFor="postcode-search"
            >
              Find nearest
            </label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground"
              id="postcode-search"
              name="postcode"
              placeholder="e.g. PR8 3AE"
              required
              type="text"
            />
          </div>
          <button
            className="min-h-11 shrink-0 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light disabled:opacity-60"
            disabled={searching}
            type="submit"
          >
            {searching ? 'Searching…' : 'Search'}
          </button>
        </fetcher.Form>
        <p className="shrink-0 text-xs text-navy/50 sm:pb-2.5 sm:text-right">
          {rankedDealers
            ? `${displayDealers.length} nearest results`
            : `${DEALERS.length} UK & Ireland partners`}
        </p>
      </div>

      {searchError ? (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {searchError}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,22rem)] lg:items-stretch lg:gap-5">
        <div className="h-[min(58vh,28rem)] min-h-[18rem] sm:h-[min(62vh,34rem)] lg:h-[min(70vh,40rem)]">
          <StockistsMap
            dealers={DEALERS}
            onSelectDealer={(dealer) => setSelectedDealerId(dealer.name)}
            searchOrigin={searchOrigin}
            selectedDealerId={selectedDealerId}
          />
        </div>

        <aside className="flex max-h-[min(50vh,24rem)] min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-background sm:max-h-[min(55vh,28rem)] lg:max-h-none lg:h-[min(70vh,40rem)]">
          <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
            <h2 className="text-sm font-semibold text-navy">
              {rankedDealers ? 'Nearest stockists' : 'All stockists'}
            </h2>
            <span className="text-[0.6875rem] text-navy/45">
              Tap a pin or a name
            </span>
          </div>
          <div
            className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain p-2 sm:p-2.5"
            ref={listRef}
          >
            {displayDealers.map((dealer) => (
              <div data-dealer={dealer.name} key={dealer.name}>
                <StockistCard
                  dealer={dealer}
                  distanceKm={rankedDealers ? dealer.distanceKm : null}
                  onSelect={() => setSelectedDealerId(dealer.name)}
                  selected={selectedDealerId === dealer.name}
                />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
