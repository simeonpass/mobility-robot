import {useMemo, useState} from 'react';
import {Link} from 'react-router';
import {BadgePercent, Check, Pencil} from 'lucide-react';
import type {MappedProductOptions, OptimisticCartLineInput} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import type {ProductFragment} from 'storefrontapi.generated';
import {ProductForm} from '~/components/ProductForm';
import {
  ProductAccessoryAddons,
  type AddonProduct,
} from '~/components/product/ProductAccessoryAddons';
import {ProductCheckoutTrust} from '~/components/product/ProductCheckoutTrust';
import {ProductDeliveryEta} from '~/components/product/ProductDeliveryEta';
import {ProductTrustBadges} from '~/components/product/ProductTrustBadges';
import {useVatRelief} from '~/components/vat-relief/VatReliefProvider';
import {getDeliveryInfo} from '~/lib/product-delivery';
import {
  buildVatCartAttributes,
  getExVatDisplay,
  getIncVatDisplay,
  getKlarnaInstallmentDisplay,
  getVatSavingsDisplay,
} from '~/lib/product-pricing';
import {isVatDeclarationComplete} from '~/lib/vat-relief-types';

type ProductPurchasePanelProps = {
  productHandle: string;
  title: string;
  displayName?: string;
  tagline?: string;
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  productOptions: MappedProductOptions[];
  accessoryAddons?: AddonProduct[];
};

export function ProductPurchasePanel({
  productHandle,
  title,
  displayName,
  tagline,
  selectedVariant,
  productOptions,
  accessoryAddons = [],
}: ProductPurchasePanelProps) {
  const {
    declaration,
    productVatReliefEnabled,
    setProductVatRelief,
    openProductModal,
  } = useVatRelief();

  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(
    () => new Set(),
  );

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

  const vatFormComplete = isVatDeclarationComplete(declaration);

  const canAddToCart =
    Boolean(selectedVariant?.availableForSale) &&
    (!productVatReliefEnabled || vatFormComplete);

  const cartAttributes = useMemo(
    () =>
      productVatReliefEnabled ? buildVatCartAttributes(declaration) : [],
    [declaration, productVatReliefEnabled],
  );

  const addonLines = useMemo(() => {
    const lines: OptimisticCartLineInput[] = [];
    for (const product of accessoryAddons) {
      const variant = product.selectedOrFirstAvailableVariant;
      if (!variant?.id || !selectedAddonIds.has(variant.id)) continue;
      lines.push({
        merchandiseId: variant.id,
        quantity: 1,
        selectedVariant: variant,
      });
    }
    return lines;
  }, [accessoryAddons, selectedAddonIds]);

  const addonCount = addonLines.length;
  const baseLabel = productVatReliefEnabled && exVatDisplay
    ? `Add to cart — ${exVatDisplay}`
    : incVatDisplay
      ? `Add to cart — ${incVatDisplay}`
      : 'Add to cart';
  const addToCartLabel =
    addonCount > 0
      ? `${baseLabel} + ${addonCount} add-on${addonCount === 1 ? '' : 's'}`
      : baseLabel;

  const toggleAddon = (variantId: string) => {
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(variantId)) next.delete(variantId);
      else next.add(variantId);
      return next;
    });
  };

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
          vatReliefEnabled={productVatReliefEnabled}
          vatSavings={vatSavings}
        />
      </section>

      <VatReliefCard
        enabled={productVatReliefEnabled}
        exVatDisplay={exVatDisplay}
        onOpen={() =>
          openProductModal({
            price: price ?? undefined,
            initialEnabled: productVatReliefEnabled,
            initialDeclaration: declaration,
            onComplete: setProductVatRelief,
          })
        }
        vatFormComplete={vatFormComplete}
        vatSavings={vatSavings}
      />

      <div className="mt-6 space-y-4">
        {accessoryAddons.length ? (
          <ProductAccessoryAddons
            chairLabel={displayName ?? title}
            onToggle={toggleAddon}
            products={accessoryAddons}
            selectedIds={selectedAddonIds}
          />
        ) : null}

        <ProductForm
          addToCartClassName="btn-atc w-full"
          addToCartLabel={addToCartLabel}
          addonLines={addonLines}
          cartAttributes={cartAttributes}
          disabled={!canAddToCart}
          productHandle={productHandle}
          productOptions={productOptions}
          selectedVariant={selectedVariant}
          soldOutLabel={
            selectedVariant?.availableForSale
              ? productVatReliefEnabled && !vatFormComplete
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

function VatReliefCard({
  enabled,
  vatFormComplete,
  exVatDisplay,
  vatSavings,
  onOpen,
}: {
  enabled: boolean;
  vatFormComplete: boolean;
  exVatDisplay: string | null;
  vatSavings: string | null;
  onOpen: () => void;
}) {
  return (
    <section
      aria-labelledby="vat-relief-heading"
      className="rounded-xl border border-border bg-secondary/30 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background">
          <BadgePercent aria-hidden className="size-4 text-foreground" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <h2
            className="text-sm font-semibold text-foreground"
            id="vat-relief-heading"
          >
            HMRC VAT relief
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {enabled && vatFormComplete ? (
              <>
                Declaration saved
                {exVatDisplay && vatSavings ? (
                  <>
                    {' '}
                    — pay{' '}
                    <strong className="font-semibold tabular-nums text-foreground">
                      {exVatDisplay}
                    </strong>{' '}
                    (save {vatSavings})
                  </>
                ) : null}
              </>
            ) : (
              <>
                Chronically sick or disabled? You may pay the ex-VAT price
                {vatSavings ? (
                  <>
                    {' '}
                    and save{' '}
                    <strong className="font-semibold tabular-nums text-foreground">
                      {vatSavings}
                    </strong>
                  </>
                ) : null}
                .
              </>
            )}
          </p>

          {enabled && vatFormComplete ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <Check aria-hidden className="size-3.5" />
              Ready to apply at checkout
            </p>
          ) : null}

          <button
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/30"
            onClick={onOpen}
            type="button"
          >
            {enabled ? (
              <>
                <Pencil aria-hidden className="size-3.5" />
                {vatFormComplete ? 'Edit declaration' : 'Complete declaration'}
              </>
            ) : (
              'Check eligibility & claim relief'
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
