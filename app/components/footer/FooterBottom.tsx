import {COMPANY} from '~/lib/site-navigation';
import {PaymentLogos} from '~/components/footer/PaymentLogos';

export function FooterBottom() {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-white/15 pt-3.5 md:flex-row">
      <p className="text-center text-xs text-white/70 md:text-left">
        © {new Date().getFullYear()} {COMPANY.name}
      </p>
      <div className="w-full md:w-auto">
        <p className="mb-1.5 text-center text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/55 md:text-right">
          Accepted at checkout
        </p>
        <PaymentLogos />
      </div>
    </div>
  );
}
