import {XSTO_LOGO} from '~/lib/site-branding';

/**
 * Mobility Robot wordmark with the XSTO endorsement on one line beneath it.
 * The site's own name leads, with "Robot" in the accent colour; the
 * manufacturer's logo is a smaller, labelled endorsement so the site never
 * reads as XSTO's own.
 */
export function SiteBrand({priority = false}: {priority?: boolean}) {
  return (
    <span className="mr-lockup">
      <span className="mr-lockup-name">
        Mobility <span className="mr-lockup-accent">Robot</span>
      </span>
      <span className="mr-lockup-endorsement">
        <span className="mr-lockup-label">Official UK distributor of</span>
        <img
          {...XSTO_LOGO}
          className="mr-lockup-xsto"
          fetchPriority={priority ? 'high' : 'auto'}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      </span>
    </span>
  );
}
