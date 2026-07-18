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
        'rounded-xl border bg-card p-4 shadow-sm transition-colors',
        selected ? 'border-gold ring-2 ring-gold/20' : 'border-border',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {dealer.name}
          </h3>
          {dealer.regions?.length ? (
            <p className="mt-1 text-xs font-medium text-gold">
              {dealer.regions.join(' · ')}
            </p>
          ) : null}
        </div>
        {typeof distanceKm === 'number' ? (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
            {distanceKm.toFixed(1)} km
          </span>
        ) : null}
      </div>

      <address className="mt-3 not-italic text-sm text-muted-foreground">
        {dealer.address}
        <br />
        {dealer.city}
        <br />
        {dealer.postcode}
      </address>

      <div className="mt-3 space-y-1 text-sm">
        <p>
          <a className="text-foreground hover:text-gold" href={`tel:${dealer.phone.replace(/\s/g, '')}`}>
            {dealer.phone}
          </a>
        </p>
        <p>
          <a className="text-foreground hover:text-gold" href={`mailto:${dealer.email}`}>
            {dealer.email}
          </a>
        </p>
        {dealer.hours ? (
          <p className="text-muted-foreground">{dealer.hours}</p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {dealer.offers_demo ? (
          <span className="rounded-full bg-vat-price/10 px-2 py-0.5 text-xs font-medium text-vat-price">
            Offers demo
          </span>
        ) : null}
        {onSelect ? (
          <button
            className="text-xs font-medium text-gold hover:text-gold-dark"
            onClick={onSelect}
            type="button"
          >
            Show on map
          </button>
        ) : null}
        <a
          className="text-xs font-medium text-gold hover:text-gold-dark"
          href={getDirectionsUrl(dealer)}
          rel="noopener noreferrer"
          target="_blank"
        >
          Get directions
        </a>
        {dealer.website ? (
          <a
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
            href={dealer.website}
            rel="noopener noreferrer"
            target="_blank"
          >
            Website
          </a>
        ) : null}
      </div>
    </article>
  );
}
