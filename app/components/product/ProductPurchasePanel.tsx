import {useMemo, useState} from 'react';
import {Link} from 'react-router';
import {BadgePercent, Check, Pencil} from 'lucide-react';
import type {MappedProductOptions, OptimisticCartLineInput} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import type {ProductFragment} from 'storefrontapi.generated';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
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
  const {open} = useAside();

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

  const soldOutLabel = selectedVariant?.availableForSale
    ? productVatReliefEnabled && !vatFormComplete
      ? 'Complete VAT declaration'
      : 'Sold out'
    : 'Sold out';

  const cartLines: OptimisticCartLineInput[] = selectedVariant
    ? [
        {
          merchandiseId: selectedVariant.id,
          quantity: 1,
          selectedVariant,
          attributes: cartAttributes,
        },
        ...addonLines.map((line) => ({
          ...line,
          parent: line.parent ?? {merchandiseId: selectedVariant.id},
        })),
      ]
    : [];

  const stickyPrice =
    productVatReliefEnabled && exVatDisplay ? exVatDisplay : incVatDisplay;

  const toggleAddon = (variantId: string) => {
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(variantId)) next.delete(variantId);
      else next.add(variantId);
      return next;
    });
  };

  return (
    <div className="product-buy-box lg:sticky lg:top-24">
      <header className="mb-3 border-b border-border/70 pb-3 sm:mb-4 sm:pb-4">
        <p className="mb-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-primary">
          XSTO UK
        </p>
        <h1 className="font-display text-[1.45rem] font-semibold leading-[1.15] tracking-[-0.03em] text-navy sm:text-[1.65rem] md:text-[1.85rem]">
          {displayName ?? title}
        </h1>
        {tagline ? (
          <p className="mt-1.5 text-sm leading-snug text-slate sm:mt-2">
            {tagline}
          </p>
        ) : null}
      </header>

      <section aria-label="Pricing" className="product-price-card mb-3 sm:mb-4">
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

      <div className="mt-3 space-y-3 sm:mt-4">
        <ProductForm
          addToCartClassName="btn-atc hidden w-full lg:inline-flex"
          addToCartLabel={addToCartLabel}
          addonLines={addonLines}
          cartAttributes={cartAttributes}
          disabled={!canAddToCart}
          productHandle={productHandle}
          productOptions={productOptions}
          selectedVariant={selectedVariant}
          soldOutLabel={soldOutLabel}
        />

        {delivery ? <ProductDeliveryEta delivery={delivery} /> : null}

        <ProductTrustBadges />

        {accessoryAddons.length ? (
          <ProductAccessoryAddons
            chairLabel={displayName ?? title}
            onToggle={toggleAddon}
            products={accessoryAddons}
            selectedIds={selectedAddonIds}
          />
        ) : null}

        <ProductCheckoutTrust klarnaInstallment={klarnaInstallment} />
      </div>

      <p className="mt-4 text-center text-[0.6875rem] text-slate">
        <Link
          className="font-medium text-navy underline-offset-2 hover:underline"
          to="/vat-relief"
        >
          How VAT relief works
        </Link>
        <span aria-hidden className="mx-1.5 text-border">
          ·
        </span>
        <Link
          className="font-medium text-navy underline-offset-2 hover:underline"
          to="/faq"
        >
          Eligibility FAQ
        </Link>
      </p>

      <div className="product-mobile-atc">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3">
          {stickyPrice ? (
            <div className="min-w-0 shrink">
              <p className="truncate font-display text-lg font-semibold tabular-nums leading-none tracking-[-0.03em] text-navy">
                {stickyPrice}
              </p>
              <p className="mt-0.5 truncate text-[0.65rem] text-slate">
                {productVatReliefEnabled ? 'VAT relief price' : 'inc. VAT'}
              </p>
            </div>
          ) : null}
          <AddToCartButton
            className="btn-atc min-h-12 flex-1 px-4 text-sm"
            disabled={!canAddToCart}
            lines={cartLines}
            onClick={() => open('cart')}
          >
            {!selectedVariant?.availableForSale
              ? soldOutLabel
              : !canAddToCart
                ? soldOutLabel
                : stickyPrice
                  ? `Add — ${stickyPrice}`
                  : 'Add to cart'}
          </AddToCartButton>
        </div>
      </div>
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
      <div className="flex items-baseline justify-between gap-3">
        <p
          className={[
            'font-display text-[1.75rem] font-semibold tabular-nums leading-none tracking-[-0.04em] sm:text-[2rem] md:text-[2.15rem]',
            vatReliefEnabled ? 'text-vat-price' : 'text-navy',
          ].join(' ')}
        >
          {primaryPrice}
        </p>
        {compareAtPrice ? (
          <p className="text-right text-[0.65rem] uppercase tracking-[0.12em] text-slate">
            <span className="block">RRP</span>
            <span className="text-sm font-medium normal-case tracking-normal line-through tabular-nums">
              {getIncVatDisplay(compareAtPrice)}
            </span>
          </p>
        ) : null}
      </div>

      <p className="mt-1.5 text-sm leading-snug text-slate">
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
            <span className="tabular-nums text-navy/80">{incVatDisplay}</span>
            <span> inc. VAT</span>
            {exVatDisplay ? (
              <>
                <span className="mx-1.5 text-border" aria-hidden>
                  ·
                </span>
                <span className="font-semibold tabular-nums text-vat-price">
                  {exVatDisplay}
                </span>
                <span className="text-vat-price"> with VAT relief</span>
                {vatSavings ? (
                  <span className="text-vat-price"> (save {vatSavings})</span>
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
      className="rounded-lg border border-navy/10 bg-navy/[0.03] px-3.5 py-3"
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-navy text-white">
          <BadgePercent aria-hidden className="size-3.5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h2
            className="text-sm font-semibold text-navy"
            id="vat-relief-heading"
          >
            HMRC VAT relief
          </h2>
          <p className="mt-0.5 text-[0.8125rem] leading-snug text-slate">
            {enabled && vatFormComplete ? (
              <>
                Declaration saved
                {exVatDisplay && vatSavings ? (
                  <>
                    {' '}
                    — pay{' '}
                    <strong className="font-semibold tabular-nums text-navy">
                      {exVatDisplay}
                    </strong>{' '}
                    (save {vatSavings})
                  </>
                ) : null}
              </>
            ) : (
              <>
                Eligible? Pay the ex-VAT price
                {vatSavings ? (
                  <>
                    {' '}
                    and save{' '}
                    <strong className="font-semibold tabular-nums text-navy">
                      {vatSavings}
                    </strong>
                  </>
                ) : null}
                .
              </>
            )}
          </p>

          {enabled && vatFormComplete ? (
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-vat-price">
              <Check aria-hidden className="size-3.5" />
              Ready at checkout
            </p>
          ) : null}

          <button
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-navy px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-navy-light"
            onClick={onOpen}
            type="button"
          >
            {enabled ? (
              <>
                <Pencil aria-hidden className="size-3" />
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
