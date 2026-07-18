import {useMemo, useState, useEffect} from 'react';
import {Link, useLocation} from 'react-router';
import {BadgePercent, Check, ShieldCheck} from 'lucide-react';
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
  getActiveCartPriceDisplay,
  getExVatDisplay,
  getIncVatDisplay,
  getKlarnaInstallmentDisplay,
  getVatSavingsDisplay,
} from '~/lib/product-pricing';
import {
  buildVatReliefRegisterUrl,
  readVatReliefRegistration,
} from '~/lib/vat-relief-session';

export type VatDeclaration = {
  email: string;
  name: string;
  address: string;
  condition: string;
};

type PriceView = 'inc-vat' | 'ex-vat';

type ProductPurchasePanelProps = {
  productHandle: string;
  title: string;
  displayName?: string;
  tagline?: string;
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  productOptions: MappedProductOptions[];
};

export function ProductPurchasePanel({
  productHandle,
  title,
  displayName,
  tagline,
  selectedVariant,
  productOptions,
}: ProductPurchasePanelProps) {
  const location = useLocation();
  const vatReliefRegisterUrl = buildVatReliefRegisterUrl(
    `${location.pathname}${location.search}`,
  );
  const [registeredProfile, setRegisteredProfile] = useState<
    ReturnType<typeof readVatReliefRegistration>
  >(null);
  const [priceView, setPriceView] = useState<PriceView>('inc-vat');
  const [declaration, setDeclaration] = useState<VatDeclaration>({
    email: '',
    name: '',
    address: '',
    condition: '',
  });

  useEffect(() => {
    const stored = readVatReliefRegistration();
    setRegisteredProfile(stored);
    if (stored) {
      setDeclaration({
        email: stored.email,
        name: stored.name,
        address: stored.address,
        condition: stored.condition,
      });
    }
  }, []);

  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const vatReliefEnabled = priceView === 'ex-vat';

  const incVatDisplay = getIncVatDisplay(price);
  const exVatDisplay = getExVatDisplay(price);
  const vatSavings = getVatSavingsDisplay(price);
  const klarnaInstallment = getKlarnaInstallmentDisplay(price);
  const activePrice = getActiveCartPriceDisplay(price, vatReliefEnabled);

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
    (!vatReliefEnabled || (Boolean(registeredProfile) && vatFormComplete));

  const cartAttributes = useMemo(
    () => (vatReliefEnabled ? buildVatCartAttributes(declaration) : []),
    [declaration, vatReliefEnabled],
  );

  const addToCartLabel = activePrice ? `Add to cart — ${activePrice}` : 'Add to cart';

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
          priceView={priceView}
          vatSavings={vatSavings}
        />
        <div className="mt-4">
          <VatPriceToggle onChange={setPriceView} value={priceView} />
        </div>
      </section>

      {vatReliefEnabled ? (
        registeredProfile ? (
          <VatReliefRegisteredSummary
            declaration={declaration}
            email={registeredProfile.email}
            registerUrl={vatReliefRegisterUrl}
          />
        ) : (
          <VatReliefRegisterPrompt registerUrl={vatReliefRegisterUrl} />
        )
      ) : (
        <VatReliefHint
          exVatDisplay={exVatDisplay}
          registerUrl="/vat-relief"
          vatSavings={vatSavings}
        />
      )}

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
              ? vatReliefEnabled && !registeredProfile
                ? 'Register for VAT relief'
                : 'Complete VAT declaration'
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
          Register for VAT relief
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

function VatPriceToggle({
  value,
  onChange,
}: {
  value: PriceView;
  onChange: (view: PriceView) => void;
}) {
  return (
    <div
      aria-label="Price display"
      className="product-vat-toggle grid grid-cols-2 gap-1 rounded-lg bg-secondary/80 p-1"
      role="group"
    >
      <button
        aria-pressed={value === 'inc-vat'}
        className={[
          'rounded-md px-3 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all',
          value === 'inc-vat'
            ? 'bg-background text-foreground shadow-soft ring-1 ring-border/60'
            : 'text-muted-foreground hover:text-foreground',
        ].join(' ')}
        onClick={() => onChange('inc-vat')}
        type="button"
      >
        Inc. VAT
      </button>
      <button
        aria-pressed={value === 'ex-vat'}
        className={[
          'rounded-md px-3 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all',
          value === 'ex-vat'
            ? 'bg-vat-price text-white shadow-soft ring-1 ring-vat-price/30'
            : 'text-muted-foreground hover:text-foreground',
        ].join(' ')}
        onClick={() => onChange('ex-vat')}
        type="button"
      >
        Ex. VAT
      </button>
    </div>
  );
}

function ProductPriceDisplay({
  priceView,
  incVatDisplay,
  exVatDisplay,
  compareAtPrice,
  vatSavings,
}: {
  priceView: PriceView;
  incVatDisplay: string | null;
  exVatDisplay: string | null;
  compareAtPrice?: MoneyV2 | null;
  vatSavings: string | null;
}) {
  if (!incVatDisplay) return null;

  const showingExVat = priceView === 'ex-vat' && exVatDisplay;

  return (
    <div aria-label="Price" role="group">
      <div className="flex items-start justify-between gap-3">
        <p
          className={[
            'text-[2rem] font-semibold tabular-nums leading-none tracking-[-0.03em] md:text-[2.25rem]',
            showingExVat ? 'text-vat-price' : 'text-foreground',
          ].join(' ')}
        >
          {showingExVat ? exVatDisplay : incVatDisplay}
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

      {showingExVat ? (
        <div className="mt-3 space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-vat-price/10 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-vat-price ring-1 ring-vat-price/20">
            <Check aria-hidden className="size-3" strokeWidth={2.5} />
            VAT relief price
          </span>
          <p className="text-sm text-muted-foreground">
            <span className="line-through tabular-nums">{incVatDisplay}</span>
            <span className="text-muted-foreground/80"> inc. VAT</span>
            {vatSavings ? (
              <span className="ml-2 font-semibold text-vat-price">
                Save {vatSavings}
              </span>
            ) : null}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Including VAT
          {exVatDisplay ? (
            <>
              <span className="mx-1.5 text-border" aria-hidden>
                ·
              </span>
              <span className="font-medium tabular-nums text-vat-price">
                {exVatDisplay}
              </span>
              <span className="text-vat-price/80"> with VAT relief</span>
            </>
          ) : null}
        </p>
      )}
    </div>
  );
}

function VatReliefHint({
  exVatDisplay,
  vatSavings,
  registerUrl,
}: {
  exVatDisplay: string | null;
  vatSavings: string | null;
  registerUrl: string;
}) {
  return (
    <div className="product-vat-hint flex gap-3 rounded-xl border border-gold/20 bg-gradient-to-br from-gold/5 to-transparent px-4 py-3.5">
      <BadgePercent
        aria-hidden
        className="mt-0.5 size-5 shrink-0 text-gold"
        strokeWidth={1.5}
      />
      <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
        Eligible for HMRC VAT relief
        {exVatDisplay && vatSavings ? (
          <>
            {' '}
            — save{' '}
            <strong className="font-semibold tabular-nums text-vat-price">
              {vatSavings}
            </strong>{' '}
            at{' '}
            <strong className="font-semibold tabular-nums text-vat-price">
              {exVatDisplay}
            </strong>
          </>
        ) : null}
        .{' '}
        <Link className="font-semibold text-foreground hover:underline" to={registerUrl}>
          Register
        </Link>{' '}
        or switch to <strong className="font-medium text-foreground">Ex. VAT</strong>.
      </p>
    </div>
  );
}

function VatReliefRegisterPrompt({registerUrl}: {registerUrl: string}) {
  return (
    <div className="mt-5 space-y-4 rounded-xl border border-gold/25 bg-gradient-to-br from-gold/10 to-transparent p-4">
      <div className="flex gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold/15 ring-1 ring-gold/25">
          <ShieldCheck
            aria-hidden
            className="size-5 text-gold"
            strokeWidth={1.5}
          />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Register for VAT relief before you buy
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            One-time HMRC declaration. We create your VAT-exempt account — sign
            in and shop at the ex-VAT price.
          </p>
        </div>
      </div>
      <Link className="btn-atc inline-flex w-full justify-center" to={registerUrl}>
        Register for VAT relief
      </Link>
    </div>
  );
}

function VatReliefRegisteredSummary({
  email,
  declaration,
  registerUrl,
}: {
  email: string;
  declaration: VatDeclaration;
  registerUrl: string;
}) {
  return (
    <div className="mt-5 space-y-2 rounded-xl border border-vat-price/25 bg-vat-price/10 px-4 py-3.5">
      <p className="flex items-center gap-2 text-sm font-semibold text-vat-price">
        <Check aria-hidden className="size-4" strokeWidth={2.5} />
        VAT relief registered
      </p>
      <p className="text-sm text-muted-foreground">
        Checkout signed in as{' '}
        <span className="font-medium text-foreground">{email}</span>
      </p>
      <p className="text-xs text-muted-foreground">
        {declaration.name} · {declaration.condition}
      </p>
      <Link className="text-xs font-semibold text-gold hover:underline" to={registerUrl}>
        Update declaration
      </Link>
    </div>
  );
}
