import {useMemo, useState} from 'react';
import {Link} from 'react-router';
import {BadgePercent, Check} from 'lucide-react';
import type {MappedProductOptions} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import type {ProductFragment} from 'storefrontapi.generated';
import {ProductForm} from '~/components/ProductForm';
import {ProductCheckoutTrust} from '~/components/product/ProductCheckoutTrust';
import {ProductDeliveryEta} from '~/components/product/ProductDeliveryEta';
import {ProductTrustBadges} from '~/components/product/ProductTrustBadges';
import {getDeliveryInfo} from '~/lib/product-delivery';
import {
  buildVatCartAttributes,
  getExVatDisplay,
  getIncVatDisplay,
  getKlarnaInstallmentDisplay,
  getVatSavingsDisplay,
} from '~/lib/product-pricing';

export type VatDeclaration = {
  email: string;
  name: string;
  address: string;
  condition: string;
};

type ProductPurchasePanelProps = {
  productHandle: string;
  title: string;
  displayName?: string;
  tagline?: string;
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  productOptions: MappedProductOptions[];
};

const EMPTY_DECLARATION: VatDeclaration = {
  email: '',
  name: '',
  address: '',
  condition: '',
};

export function ProductPurchasePanel({
  productHandle,
  title,
  displayName,
  tagline,
  selectedVariant,
  productOptions,
}: ProductPurchasePanelProps) {
  const [vatReliefEnabled, setVatReliefEnabled] = useState(false);
  const [declaration, setDeclaration] = useState<VatDeclaration>(EMPTY_DECLARATION);

  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const incVatDisplay = getIncVatDisplay(price);
  const exVatDisplay = getExVatDisplay(price);
  const vatSavings = getVatSavingsDisplay(price);
  const klarnaInstallment = getKlarnaInstallmentDisplay(price);

  const delivery = selectedVariant
    ? getDeliveryInfo({
        availableForSale: selectedVariant.availableForSale,
        quantityAvailable: selectedVariant.quantityAvailable,
      })
    : null;

  const vatFormComplete =
    declaration.email.trim().length > 0 &&
    declaration.name.trim().length > 0 &&
    declaration.address.trim().length > 0 &&
    declaration.condition.trim().length > 0;

  const canAddToCart =
    Boolean(selectedVariant?.availableForSale) &&
    (!vatReliefEnabled || vatFormComplete);

  const cartAttributes = useMemo(
    () => (vatReliefEnabled ? buildVatCartAttributes(declaration) : []),
    [declaration, vatReliefEnabled],
  );

  const addToCartLabel = vatReliefEnabled && exVatDisplay
    ? `Add to cart — ${exVatDisplay}`
    : incVatDisplay
      ? `Add to cart — ${incVatDisplay}`
      : 'Add to cart';

  return (
    <div className="product-buy-box lg:sticky lg:top-24 lg:max-w-[440px] lg:justify-self-end">
      <header className="mb-6 space-y-2">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          XSTO · Official UK distributor
        </p>
        <h1 className="font-display text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground md:text-[2rem]">
          {displayName ?? title}
        </h1>
        {tagline ? (
          <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
            {tagline}
          </p>
        ) : null}
      </header>

      <section aria-label="Pricing" className="product-price-card mb-5">
        <ProductPriceDisplay
          compareAtPrice={compareAtPrice}
          exVatDisplay={exVatDisplay}
          incVatDisplay={incVatDisplay}
          vatReliefEnabled={vatReliefEnabled}
          vatSavings={vatSavings}
        />
      </section>

      <VatReliefSection
        declaration={declaration}
        enabled={vatReliefEnabled}
        exVatDisplay={exVatDisplay}
        onDeclarationChange={setDeclaration}
        onEnabledChange={setVatReliefEnabled}
        vatSavings={vatSavings}
      />

      <div className="mt-6 space-y-4">
        <ProductForm
          addToCartClassName="btn-atc w-full"
          addToCartLabel={addToCartLabel}
          cartAttributes={cartAttributes}
          disabled={!canAddToCart}
          productHandle={productHandle}
          productOptions={productOptions}
          selectedVariant={selectedVariant}
          soldOutLabel={
            selectedVariant?.availableForSale
              ? vatReliefEnabled && !vatFormComplete
                ? 'Complete VAT declaration'
                : 'Sold out'
              : 'Sold out'
          }
        />

        {delivery ? <ProductDeliveryEta delivery={delivery} /> : null}

        <ProductTrustBadges />

        <ProductCheckoutTrust klarnaInstallment={klarnaInstallment} />
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        <Link
          className="font-medium underline-offset-2 hover:text-foreground hover:underline"
          to="/vat-relief"
        >
          Full VAT relief registration
        </Link>
        <span aria-hidden className="mx-1.5 text-border">
          ·
        </span>
        <Link
          className="font-medium underline-offset-2 hover:text-foreground hover:underline"
          to="/faq"
        >
          Eligibility FAQ
        </Link>
      </p>
    </div>
  );
}

function ProductPriceDisplay({
  incVatDisplay,
  exVatDisplay,
  compareAtPrice,
  vatSavings,
  vatReliefEnabled,
}: {
  incVatDisplay: string | null;
  exVatDisplay: string | null;
  compareAtPrice?: MoneyV2 | null;
  vatSavings: string | null;
  vatReliefEnabled: boolean;
}) {
  if (!incVatDisplay) return null;

  const primaryPrice = vatReliefEnabled && exVatDisplay ? exVatDisplay : incVatDisplay;

  return (
    <div aria-label="Price" role="group">
      <div className="flex items-start justify-between gap-3">
        <p
          className={[
            'text-[2rem] font-semibold tabular-nums leading-none tracking-[-0.03em] md:text-[2.25rem]',
            vatReliefEnabled ? 'text-vat-price' : 'text-foreground',
          ].join(' ')}
        >
          {primaryPrice}
        </p>
        {compareAtPrice ? (
          <p className="pt-1 text-right text-xs text-muted-foreground">
            <span className="block uppercase tracking-wide">RRP</span>
            <span className="line-through tabular-nums">
              {getIncVatDisplay(compareAtPrice)}
            </span>
          </p>
        ) : null}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {vatReliefEnabled ? (
          <>
            <span className="font-medium text-vat-price">VAT relief price</span>
            <span className="mx-1.5 text-border" aria-hidden>
              ·
            </span>
            <span className="line-through tabular-nums">{incVatDisplay}</span>
            <span> inc. VAT</span>
          </>
        ) : (
          <>
            {incVatDisplay} inc. VAT
            {exVatDisplay ? (
              <>
                <span className="mx-1.5 text-border" aria-hidden>
                  ·
                </span>
                <span className="font-medium tabular-nums text-vat-price">
                  {exVatDisplay}
                </span>
                <span className="text-vat-price/80"> with VAT relief</span>
                {vatSavings ? (
                  <span className="text-vat-price/80"> (save {vatSavings})</span>
                ) : null}
              </>
            ) : null}
          </>
        )}
      </p>
    </div>
  );
}

function VatReliefSection({
  enabled,
  onEnabledChange,
  declaration,
  onDeclarationChange,
  exVatDisplay,
  vatSavings,
}: {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  declaration: VatDeclaration;
  onDeclarationChange: (declaration: VatDeclaration) => void;
  exVatDisplay: string | null;
  vatSavings: string | null;
}) {
  return (
    <section
      aria-labelledby="vat-relief-heading"
      className="rounded-xl border border-border bg-secondary/30 p-4"
    >
      <label className="flex cursor-pointer items-start gap-3">
        <input
          checked={enabled}
          className="mt-1 size-4 rounded border-border"
          id="vat-relief-toggle"
          onChange={(event) => onEnabledChange(event.target.checked)}
          type="checkbox"
        />
        <span className="min-w-0">
          <span
            className="flex items-center gap-2 text-sm font-semibold text-foreground"
            id="vat-relief-heading"
          >
            <BadgePercent aria-hidden className="size-4 text-vat-price" strokeWidth={1.5} />
            I&apos;m eligible for HMRC VAT relief
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
            For chronically sick or disabled people buying for personal use.
            {exVatDisplay && vatSavings ? (
              <>
                {' '}
                Pay{' '}
                <strong className="font-semibold tabular-nums text-vat-price">
                  {exVatDisplay}
                </strong>{' '}
                instead of the inc-VAT price — save{' '}
                <strong className="font-semibold tabular-nums text-vat-price">
                  {vatSavings}
                </strong>
                .
              </>
            ) : null}
          </span>
        </span>
      </label>

      {enabled ? (
        <div className="mt-4 space-y-3 border-t border-border/70 pt-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Complete this HMRC declaration. The exact VAT amount is removed at
            checkout — no discount code needed.
          </p>

          <VatField
            autoComplete="name"
            id="vat-name"
            label="Full name"
            onChange={(value) =>
              onDeclarationChange({...declaration, name: value})
            }
            value={declaration.name}
          />
          <VatField
            autoComplete="email"
            id="vat-email"
            label="Email"
            onChange={(value) =>
              onDeclarationChange({...declaration, email: value})
            }
            type="email"
            value={declaration.email}
          />
          <VatTextArea
            id="vat-address"
            label="Address"
            onChange={(value) =>
              onDeclarationChange({...declaration, address: value})
            }
            value={declaration.address}
          />
          <VatField
            id="vat-condition"
            label="Nature of condition"
            onChange={(value) =>
              onDeclarationChange({...declaration, condition: value})
            }
            placeholder="e.g. long-term mobility impairment"
            value={declaration.condition}
          />

          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-vat-price" />
            I declare that I am chronically sick or disabled, that this product
            is for my personal use, and that I am eligible under HMRC Notice
            701/7.
          </p>
        </div>
      ) : null}
    </section>
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
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
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
        className="min-h-[72px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        required
        value={value}
      />
    </div>
  );
}
