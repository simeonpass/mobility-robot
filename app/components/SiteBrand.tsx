import {SITE_BRAND_NAME, XSTO_LOGO} from '~/lib/site-branding';

/**
 * Mobility Robot wordmark with XSTO shown as a smaller, labelled endorsement.
 * The site owner's name leads; the manufacturer's logo sits beside it so the
 * site never reads as XSTO's own.
 */
export function SiteBrand({priority = false}: {priority?: boolean}) {
  return (
    <span className="mr-lockup">
      <span className="mr-lockup-name">{SITE_BRAND_NAME}</span>
      <span aria-hidden className="mr-lockup-divider" />
      <span className="mr-lockup-endorsement">
        <span className="mr-lockup-label">Official UK distributor</span>
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
