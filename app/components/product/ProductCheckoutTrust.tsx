import {Lock, RotateCcw} from 'lucide-react';
import {PaymentLogos} from '~/components/footer/PaymentLogos';

const ASSURANCES = [
  {icon: RotateCcw, label: '14-day returns'},
  {icon: Lock, label: 'Secure checkout'},
] as const;

export function ProductCheckoutTrust({
  klarnaInstallment,
}: {
  klarnaInstallment?: string | null;
}) {
  return (
    <div className="product-checkout-trust space-y-2.5 rounded-lg border border-border/80 px-3 py-3">
      {klarnaInstallment ? (
        <p className="text-center text-[0.8125rem] leading-snug text-slate">
          Pay in 3 with{' '}
          <span className="font-semibold text-navy">Klarna</span>
          {' '}from{' '}
          <span className="font-semibold tabular-nums text-navy">
            {klarnaInstallment}
          </span>
          <span className="text-slate">/month</span>
        </p>
      ) : null}

      <ul className="flex justify-center gap-5">
        {ASSURANCES.map(({icon: Icon, label}) => (
          <li
            className="flex items-center gap-1.5 text-[0.6875rem] font-medium text-navy"
            key={label}
          >
            <Icon
              aria-hidden
              className="size-3.5 shrink-0 text-navy/70"
              strokeWidth={1.5}
            />
            {label}
          </li>
        ))}
      </ul>

      <div className="border-t border-border/60 pt-2.5">
        <p className="mb-2 text-center text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate">
          Accepted at checkout
        </p>
        <div className="flex justify-center">
          <PaymentLogos size="compact" />
        </div>
      </div>
    </div>
  );
}
