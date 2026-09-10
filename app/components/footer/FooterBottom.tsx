import {COMPANY} from '~/lib/site-navigation';
import {PaymentLogos} from '~/components/footer/PaymentLogos';

export function FooterBottom() {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-4 md:flex-row md:items-center">
      <p className="text-center text-xs text-white/70 md:text-left">
        © {new Date().getFullYear()} {COMPANY.name}
      </p>
      <div className="w-full md:w-auto">
        <p className="mb-2 text-center text-xs text-white/70 md:text-right">
          Payment options vary by order and eligibility.
        </p>
        <PaymentLogos size="compact" />
      </div>
    </div>
  );
}
