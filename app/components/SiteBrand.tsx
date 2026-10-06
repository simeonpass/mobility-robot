import {SITE_BRAND_NAME, XSTO_LOGO} from '~/lib/site-branding';

/**
 * Bentech Medical wordmark with the XSTO endorsement on one line beneath it.
 * The distributor's own name leads; the manufacturer's logo is a smaller,
 * labelled endorsement so the site never reads as XSTO's own.
 */
export function SiteBrand({priority = false}: {priority?: boolean}) {
  return (
    <span className="mr-lockup">
      <span className="mr-lockup-name">{SITE_BRAND_NAME}</span>
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
