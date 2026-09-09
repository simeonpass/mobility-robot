import {DISTRIBUTOR_DISCLAIMER} from '~/lib/content/company';

export function DistributorDisclaimer() {
  return (
    <div className="max-w-4xl space-y-2 text-xs leading-relaxed text-white/70">
      <p className="font-semibold text-white/90">Official UK distributor of XSTO</p>
      <p>{DISTRIBUTOR_DISCLAIMER}</p>
      <p>XSTO is a trademark of its manufacturer.</p>
    </div>
  );
}
