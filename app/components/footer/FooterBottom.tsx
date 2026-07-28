import {COMPANY} from '~/lib/site-navigation';
import {PaymentLogos} from '~/components/footer/PaymentLogos';

export function FooterBottom() {
  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-6 md:flex-row md:items-end">
      <p className="text-center text-xs text-white/45 md:text-left">
        © {new Date().getFullYear()} {COMPANY.name}
      </p>
      <div className="w-full md:w-auto">
        <p className="mb-2.5 text-center font-display text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-white/40 md:text-right">
          Accepted at checkout
        </p>
        <PaymentLogos size="compact" />
      </div>
    </div>
  );
}
