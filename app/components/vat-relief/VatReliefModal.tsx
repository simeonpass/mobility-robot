import {CartForm} from '@shopify/hydrogen';
import type {FetcherWithComponents} from 'react-router';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {BadgePercent, Check, ShieldCheck, X} from 'lucide-react';
import {useEffect, useId, useRef} from 'react';
import {Link} from 'react-router';
import {
  getExVatDisplay,
  getIncVatDisplay,
  getVatSavingsDisplay,
} from '~/lib/product-pricing';
import {mergeVatAttributes, stripVatAttributes} from '~/lib/vat-relief-attributes';
import {
  isVatDeclarationComplete,
  type VatDeclaration,
} from '~/lib/vat-relief-types';
import {registerVatReliefCustomer} from '~/lib/vat-relief-register';
import {saveVatReliefRegistration} from '~/lib/vat-relief-session';
import type {AttributeInput} from '@shopify/hydrogen/storefront-api-types';

export type VatReliefModalCartLine = {
  id: string;
  quantity: number;
  attributes?: Array<{key: string; value?: string | null}> | null;
  productTitle?: string;
};

type VatReliefModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  price?: MoneyV2 | null;
  declaration: VatDeclaration;
  onDeclarationChange: (declaration: VatDeclaration) => void;
  vatReliefEnabled: boolean;
  onVatReliefEnabledChange: (enabled: boolean) => void;
  onClose: () => void;
  mode: 'product' | 'cart';
  cartLines?: VatReliefModalCartLine[];
  onProductConfirm?: (enabled: boolean, declaration: VatDeclaration) => void;
};

export function VatReliefModal({
  open,
  title,
  subtitle,
  price,
  declaration,
  onDeclarationChange,
  vatReliefEnabled,
  onVatReliefEnabledChange,
  onClose,
  mode,
  cartLines = [],
  onProductConfirm,
}: VatReliefModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const complete = isVatDeclarationComplete(declaration);
  const incVatDisplay = getIncVatDisplay(price);
  const exVatDisplay = getExVatDisplay(price);
  const vatSavings = getVatSavingsDisplay(price);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleProductSubmit = () => {
    if (vatReliefEnabled && !complete) return;
    if (vatReliefEnabled && complete) {
      saveVatReliefRegistration({
        ...declaration,
        registeredAt: new Date().toISOString(),
      });
      void registerVatReliefCustomer(declaration);
    }
    onProductConfirm?.(vatReliefEnabled, declaration);
    onClose();
  };

  const cartUpdateLines = cartLines.map((line) => ({
    id: line.id,
    quantity: line.quantity,
    attributes: vatReliefEnabled
      ? mergeVatAttributes(line.attributes, declaration)
      : stripVatAttributes(line.attributes),
  }));

  const submitDisabled = vatReliefEnabled && !complete;

  return (
    <div
      aria-labelledby={titleId}
      aria-modal
      className="fixed inset-0 z-[60] flex items-end justify-center bg-navy/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
    >
      <button
        aria-label="Close VAT relief dialog"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />

      <div
        className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-strong sm:rounded-2xl"
        ref={dialogRef}
      >
        <div className="border-b border-border bg-navy px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                <BadgePercent aria-hidden className="size-3.5" />
                HMRC VAT relief
              </div>
              <h2
                className="text-xl font-semibold tracking-tight text-white"
                id={titleId}
              >
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-1 text-sm text-white/75">{subtitle}</p>
              ) : null}
            </div>
            <button
              aria-label="Close"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              onClick={onClose}
              type="button"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>

          {price && incVatDisplay && exVatDisplay && vatSavings ? (
            <div className="mt-4 rounded-xl border border-white/15 bg-white/10 px-4 py-3">
              <p className="text-sm text-white/80">
                <span className="line-through tabular-nums">{incVatDisplay}</span>
                <span className="mx-2 text-white/40">→</span>
                <span className="text-lg font-semibold tabular-nums text-white">
                  {exVatDisplay}
                </span>
                <span className="ml-2 text-sm text-emerald-200">
                  save {vatSavings}
                </span>
              </p>
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            <section className="rounded-xl border border-border bg-secondary/30 p-4">
              <div className="flex gap-3">
                <ShieldCheck
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-foreground"
                />
                <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <p className="font-medium text-foreground">
                    Who qualifies for VAT relief?
                  </p>
                  <p>
                    If you are chronically sick or disabled and buying this
                    product for your personal use, you may not have to pay VAT
                    under HMRC rules (Notice 701/7).
                  </p>
                  <p>
                    We waive VAT at checkout for your declaration email (sign in
                    with that account) — no discount code needed. Your declaration
                    is stored with your order for HMRC compliance.
                  </p>
                </div>
              </div>
            </section>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4">
              <input
                checked={vatReliefEnabled}
                className="mt-1 size-4 rounded border-border"
                onChange={(event) =>
                  onVatReliefEnabledChange(event.target.checked)
                }
                type="checkbox"
              />
              <span className="text-sm leading-relaxed text-foreground">
                <span className="font-semibold">
                  I confirm I am eligible for HMRC VAT relief
                </span>
                <span className="mt-1 block text-muted-foreground">
                  This product is for my personal use and I meet the eligibility
                  criteria for zero-rated VAT on mobility aids.
                </span>
              </span>
            </label>

            {vatReliefEnabled ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Your HMRC declaration
                </p>
                <VatField
                  autoComplete="name"
                  id="vat-modal-name"
                  label="Full name"
                  onChange={(value) =>
                    onDeclarationChange({...declaration, name: value})
                  }
                  value={declaration.name}
                />
                <VatField
                  autoComplete="email"
                  id="vat-modal-email"
                  label="Email"
                  onChange={(value) =>
                    onDeclarationChange({...declaration, email: value})
                  }
                  type="email"
                  value={declaration.email}
                />
                <VatTextArea
                  id="vat-modal-address"
                  label="Address"
                  onChange={(value) =>
                    onDeclarationChange({...declaration, address: value})
                  }
                  value={declaration.address}
                />
                <VatField
                  id="vat-modal-condition"
                  label="Nature of condition"
                  onChange={(value) =>
                    onDeclarationChange({...declaration, condition: value})
                  }
                  placeholder="e.g. long-term mobility impairment"
                  value={declaration.condition}
                />
                <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                  <Check
                    aria-hidden
                    className="mt-0.5 size-3.5 shrink-0 text-foreground"
                  />
                  I declare that the information above is true and that I am
                  eligible under HMRC Notice 701/7.
                </p>
              </div>
            ) : null}

            <p className="text-xs text-muted-foreground">
              <Link className="font-medium text-foreground hover:underline" to="/vat-relief">
                Full VAT relief guide
              </Link>
              <span aria-hidden className="mx-1.5">
                ·
              </span>
              <Link className="font-medium text-foreground hover:underline" to="/faq">
                Eligibility FAQ
              </Link>
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border bg-background px-6 py-4 sm:flex-row sm:justify-end">
          <button
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium text-foreground hover:bg-secondary"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>

          {mode === 'product' ? (
            <button
              className="btn-checkout inline-flex h-11 flex-1 items-center justify-center px-5 sm:flex-none sm:min-w-[12rem]"
              disabled={submitDisabled}
              onClick={handleProductSubmit}
              type="button"
            >
              {vatReliefEnabled ? 'Save VAT declaration' : 'Continue without relief'}
            </button>
          ) : (
            <VatReliefCartApplyForm
              cartUpdateLines={cartUpdateLines}
              declaration={declaration}
              onClose={onClose}
              submitDisabled={submitDisabled}
              vatReliefEnabled={vatReliefEnabled}
            />
          )}
        </div>
      </div>
    </div>
  );
}

type CartUpdateLine = {
  id: string;
  quantity: number;
  attributes: AttributeInput[];
};

type CartActionData = {
  errors?: Array<{message?: string}> | null;
};

function VatReliefCartApplyForm({
  cartUpdateLines,
  declaration,
  vatReliefEnabled,
  submitDisabled,
  onClose,
}: {
  cartUpdateLines: CartUpdateLine[];
  declaration: VatDeclaration;
  vatReliefEnabled: boolean;
  submitDisabled: boolean;
  onClose: () => void;
}) {
  return (
    <CartForm
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines: cartUpdateLines}}
      route="/cart"
    >
      {(fetcher) => (
        <VatReliefCartApplyButton
          declaration={declaration}
          fetcher={fetcher}
          onClose={onClose}
          submitDisabled={submitDisabled}
          vatReliefEnabled={vatReliefEnabled}
        />
      )}
    </CartForm>
  );
}

function VatReliefCartApplyButton({
  fetcher,
  declaration,
  vatReliefEnabled,
  submitDisabled,
  onClose,
}: {
  fetcher: FetcherWithComponents<CartActionData>;
  declaration: VatDeclaration;
  vatReliefEnabled: boolean;
  submitDisabled: boolean;
  onClose: () => void;
}) {
  const wasSubmitting = useRef(false);

  useEffect(() => {
    if (fetcher.state === 'submitting' || fetcher.state === 'loading') {
      wasSubmitting.current = true;
      return;
    }

    if (!wasSubmitting.current || fetcher.state !== 'idle') return;

    wasSubmitting.current = false;

    const errors = fetcher.data?.errors;
    if (errors?.length) return;

    if (vatReliefEnabled && isVatDeclarationComplete(declaration)) {
      saveVatReliefRegistration({
        ...declaration,
        registeredAt: new Date().toISOString(),
      });
      void registerVatReliefCustomer(declaration);
    }

    onClose();
  }, [fetcher.state, fetcher.data, declaration, onClose, vatReliefEnabled]);

  return (
    <button
      className="btn-checkout inline-flex h-11 w-full items-center justify-center px-5 sm:min-w-[12rem]"
      disabled={submitDisabled || fetcher.state !== 'idle'}
      type="submit"
    >
      {fetcher.state !== 'idle'
        ? 'Applying…'
        : vatReliefEnabled
          ? 'Apply VAT relief'
          : 'Remove VAT relief'}
    </button>
  );
}

function VatField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground" htmlFor={id}>
        {label}
      </label>
      <input
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required
        type={type}
        value={value}
      />
    </div>
  );
}

function VatTextArea({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground" htmlFor={id}>
        {label}
      </label>
      <textarea
        autoComplete="street-address"
        className="min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        required
        value={value}
      />
    </div>
  );
}
