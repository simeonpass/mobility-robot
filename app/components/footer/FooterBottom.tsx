import {COMPANY} from '~/lib/site-navigation';
import {PaymentLogos} from '~/components/footer/PaymentLogos';

export function FooterBottom() {
  return (
    <div className="mt-2.5 flex flex-col items-center justify-between gap-2 border-t border-white/12 pt-2.5 md:flex-row">
      <p className="text-center text-[0.6875rem] text-white/55 md:text-left">
        © {new Date().getFullYear()} {COMPANY.name}
      </p>
      <div className="w-full md:w-auto">
        <p className="mb-1 text-center text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/45 md:text-right">
          Accepted at checkout
        </p>
        <PaymentLogos size="compact" />
      </div>
    </div>
  );
}
