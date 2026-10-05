import {DISTRIBUTOR_DISCLAIMER} from '~/lib/content/company';

export function DistributorDisclaimer() {
  return (
    <div className="mr-footer-disclaimer">
      <p>
        <strong>Official UK distributor of XSTO</strong>
      </p>
      <p>{DISTRIBUTOR_DISCLAIMER}</p>
      <p>XSTO is a trademark of its manufacturer.</p>
    </div>
  );
}
