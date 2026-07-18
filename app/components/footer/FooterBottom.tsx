import {COMPANY} from '~/lib/site-navigation';
import {PaymentLogos} from '~/components/footer/PaymentLogos';

export function FooterBottom() {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-background/10 pt-4 md:flex-row">
      <p className="text-center text-xs text-background/60 md:text-left">
        © {new Date().getFullYear()} {COMPANY.name}
      </p>
      <PaymentLogos />
    </div>
  );
}
