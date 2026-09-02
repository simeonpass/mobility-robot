import {
  X12_LEG_REST_OPTIONS,
  type X12LegRestChoice,
} from '~/lib/x12-lineup';

type ProductX12EditionOptionsProps = {
  value: X12LegRestChoice;
  onChange: (value: X12LegRestChoice) => void;
  standardPriceLabel: string | null;
  proPriceLabel: string | null;
  proAvailable: boolean;
};

export function ProductX12EditionOptions({
  value,
  onChange,
  standardPriceLabel,
  proPriceLabel,
  proAvailable,
}: ProductX12EditionOptionsProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-navy">Choose your X12</legend>
      <p className="text-[0.8125rem] leading-snug text-slate">
        Same chair and photos — X12 Pro adds an electric elevating leg rest.
      </p>

      {X12_LEG_REST_OPTIONS.map((option) => {
        const isPro = option.id === 'electric';
        const disabled = isPro && !proAvailable;
        const selected = value === option.id;
        const priceLabel = isPro ? proPriceLabel : standardPriceLabel;

        return (
          <label
            className={[
              'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
              disabled ? 'cursor-not-allowed opacity-50' : '',
              selected
                ? 'border-navy bg-navy/[0.04]'
                : 'border-border hover:border-navy/30',
            ].join(' ')}
            key={option.id}
          >
            <input
              checked={selected}
              className="mt-1 size-4 accent-navy"
              disabled={disabled}
              name="x12-edition"
              onChange={() => onChange(option.id)}
              type="radio"
              value={option.id}
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-navy">
                  {option.label}
                </span>
                {priceLabel ? (
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-navy">
                    {priceLabel}
                  </span>
                ) : null}
              </span>
              <span className="mt-0.5 block text-[0.8125rem] text-slate">
                {option.description}
                {isPro && !proAvailable ? ' — currently unavailable' : ''}
              </span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
