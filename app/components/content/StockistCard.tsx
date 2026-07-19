import type {Dealer} from '~/lib/dealers';
import {getDirectionsUrl} from '~/lib/dealers';

export function StockistCard({
  dealer,
  distanceKm,
  selected,
  onSelect,
}: {
  dealer: Dealer;
  distanceKm?: number | null;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <article
      className={[
        'rounded-lg border transition-colors',
        selected
          ? 'border-navy/30 bg-navy/[0.03] ring-1 ring-navy/15'
          : 'border-border/80 bg-background hover:border-navy/20',
      ].join(' ')}
    >
      <button
        className="flex w-full items-start gap-3 px-3 py-2.5 text-left"
        onClick={onSelect}
        type="button"
      >
        <span
          aria-hidden
          className={[
            'mt-1.5 size-2 shrink-0 rounded-full',
            selected ? 'bg-primary' : 'bg-navy/25',
          ].join(' ')}
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold leading-snug text-navy">
              {dealer.name}
            </span>
            {typeof distanceKm === 'number' ? (
              <span className="shrink-0 text-[0.6875rem] font-medium tabular-nums text-navy/50">
                {distanceKm.toFixed(0)} km
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block text-xs leading-snug text-navy/55">
            {dealer.city}
            {dealer.regions?.length ? ` · ${dealer.regions[0]}` : ''}
          </span>
        </span>
      </button>

      {selected ? (
        <div className="border-t border-navy/10 px-3 pb-3 pt-2.5 pl-8">
          <address className="not-italic text-xs leading-relaxed text-navy/65">
            {dealer.address}, {dealer.city}, {dealer.postcode}
          </address>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <a
              className="font-medium text-navy hover:text-primary"
              href={`tel:${dealer.phone.replace(/\s/g, '')}`}
            >
              {dealer.phone}
            </a>
            <a
              className="font-medium text-navy hover:text-primary"
              href={`mailto:${dealer.email}`}
            >
              Email
            </a>
            <a
              className="font-medium text-navy hover:text-primary"
              href={getDirectionsUrl(dealer)}
              rel="noopener noreferrer"
              target="_blank"
            >
              Directions
            </a>
            {dealer.website ? (
              <a
                className="font-medium text-navy/55 hover:text-navy"
                href={dealer.website}
                rel="noopener noreferrer"
                target="_blank"
              >
                Website
              </a>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {dealer.offers_demo ? (
              <span className="rounded-full bg-vat-price/10 px-2 py-0.5 text-[0.6875rem] font-medium text-vat-price">
                Offers demo
              </span>
            ) : null}
            {dealer.hours ? (
              <span className="text-[0.6875rem] text-navy/50">{dealer.hours}</span>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}
