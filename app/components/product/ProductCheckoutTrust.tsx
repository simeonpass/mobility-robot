import {Lock, RotateCcw} from 'lucide-react';

const ASSURANCES = [
  {icon: RotateCcw, label: '14-day returns'},
  {icon: Lock, label: 'Secure checkout'},
] as const;

function PaymentMark({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div
      aria-label={label}
      className="flex h-7 min-w-[2.75rem] items-center justify-center rounded-md border border-border/70 bg-background px-2 shadow-sm"
      role="img"
    >
      {children}
    </div>
  );
}

export function ProductCheckoutTrust({
  klarnaInstallment,
}: {
  klarnaInstallment?: string | null;
}) {
  return (
    <div className="product-checkout-trust space-y-4 rounded-xl border border-border/80 bg-secondary/20 px-4 py-4">
      {klarnaInstallment ? (
        <p className="text-center text-sm leading-relaxed text-muted-foreground">
          Pay in 3 with{' '}
          <span className="font-semibold text-foreground">Klarna</span>
          {' '}from{' '}
          <span className="font-semibold tabular-nums text-foreground">
            {klarnaInstallment}
          </span>
          <span className="text-muted-foreground">/month</span>
        </p>
      ) : null}

      <ul className="flex justify-center gap-6">
        {ASSURANCES.map(({icon: Icon, label}) => (
          <li
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
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

      <div className="border-t border-border/60 pt-3">
        <p className="mb-2.5 text-center text-[0.625rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Accepted at checkout
        </p>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <PaymentMark label="Visa">
            <span className="text-[0.6rem] font-bold tracking-wide text-[#1A1F71]">
              VISA
            </span>
          </PaymentMark>
          <PaymentMark label="Mastercard">
            <svg aria-hidden className="h-3.5 w-auto" viewBox="0 0 32 20">
              <circle cx="12" cy="10" fill="#EB001B" r="8" />
              <circle cx="20" cy="10" fill="#F79E1B" opacity="0.95" r="8" />
            </svg>
          </PaymentMark>
          <PaymentMark label="American Express">
            <span className="text-[0.55rem] font-bold text-[#006FCF]">AMEX</span>
          </PaymentMark>
          <PaymentMark label="PayPal">
            <span className="text-[0.55rem] font-bold text-[#003087]">PayPal</span>
          </PaymentMark>
          <PaymentMark label="Apple Pay">
            <span className="text-[0.55rem] font-semibold text-foreground"> Pay</span>
          </PaymentMark>
          <PaymentMark label="Klarna">
            <span className="text-[0.55rem] font-bold text-[#17120F]">Klarna</span>
          </PaymentMark>
          <PaymentMark label="Clearpay">
            <span className="text-[0.55rem] font-bold text-[#00C2A8]">clearpay</span>
          </PaymentMark>
        </div>
      </div>
    </div>
  );
}
