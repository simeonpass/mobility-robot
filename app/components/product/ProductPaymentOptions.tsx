type PaymentChoice = 'full' | 'deposit';

type ProductPaymentOptionsProps = {
  value: PaymentChoice;
  onChange: (value: PaymentChoice) => void;
  depositAmountLabel: string;
  remainingAmountLabel?: string | null;
  depositPlanName?: string;
  hideKlarnaNote?: boolean;
};

export function ProductPaymentOptions({
  value,
  onChange,
  depositAmountLabel,
  remainingAmountLabel,
  depositPlanName = 'Pay 10% deposit',
  hideKlarnaNote = true,
}: ProductPaymentOptionsProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-navy">Payment options</legend>

      <label
        className={[
          'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
          value === 'full'
            ? 'border-navy bg-navy/[0.04]'
            : 'border-border hover:border-navy/30',
        ].join(' ')}
      >
        <input
          checked={value === 'full'}
          className="mt-1 size-4 accent-navy"
          name="purchase-option"
          onChange={() => onChange('full')}
          type="radio"
          value="full"
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-navy">
            Pay in full
          </span>
          <span className="mt-0.5 block text-[0.8125rem] text-slate">
            Pay the full amount today at checkout.
          </span>
        </span>
      </label>

      <label
        className={[
          'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
          value === 'deposit'
            ? 'border-navy bg-navy/[0.04]'
            : 'border-border hover:border-navy/30',
        ].join(' ')}
      >
        <input
          checked={value === 'deposit'}
          className="mt-1 size-4 accent-navy"
          name="purchase-option"
          onChange={() => onChange('deposit')}
          type="radio"
          value="deposit"
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-navy">
            {depositPlanName}
          </span>
          <span className="mt-0.5 block text-[0.8125rem] text-slate">
            Pay{' '}
            <strong className="font-semibold tabular-nums text-navy">
              {depositAmountLabel}
            </strong>{' '}
            now to reserve your place
            {remainingAmountLabel ? (
              <>
                ; balance{' '}
                <strong className="font-semibold tabular-nums text-navy">
                  {remainingAmountLabel}
                </strong>{' '}
                due before dispatch
              </>
            ) : (
              '; balance due before dispatch'
            )}
            .
          </span>
          {hideKlarnaNote ? (
            <span className="mt-1 block text-[0.75rem] text-slate">
              Deposits are typically paid by card at checkout.
            </span>
          ) : null}
        </span>
      </label>
    </fieldset>
  );
}
