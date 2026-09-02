import {useEffect, useMemo, useRef, useState} from 'react';
import {Link, useSearchParams} from 'react-router';
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
import {ProductPaymentOptions} from '~/components/product/ProductPaymentOptions';
import {ProductReviewSummary} from '~/components/product/ProductReviewSummary';
import {ProductTrustBadges} from '~/components/product/ProductTrustBadges';
import {ProductX12EditionOptions} from '~/components/product/ProductX12EditionOptions';
import {useVatRelief} from '~/components/vat-relief/VatReliefProvider';
import {
  getDeliveryInfo,
  isForcedInStock,
  isForcedPreorder,
} from '~/lib/product-delivery';
import {
  buildVatCartAttributes,
  formatProductPrice,
  getExVatDisplay,
  getIncVatDisplay,
  getKlarnaInstallmentDisplay,
  getVatSavingsDisplay,
  sumMoneyV2,
} from '~/lib/product-pricing';
import {
  catalogToExVatAmount,
  catalogToIncVatAmount,
} from '~/lib/pricing-mode';
import {
  buildPurchaseOptions,
  isDepositPurchaseOption,
  withOptimisticSellingPlanAllocation,
  type SellingPlanAllocationNode,
} from '~/lib/selling-plans';
import {isVatDeclarationComplete} from '~/lib/vat-relief-types';
import {
  filterStandardVatVariants,
  filterVisibleProductOptions,
  resolveVatPurchaseVariant,
  variantsHaveVatOption,
} from '~/lib/product-vat-variants';
import {
  parseX12ChoiceFromSearch,
  x12ChoiceSearchParams,
  x12LegRestCartAttribute,
  X12_LEG_REST_OPTIONS,
  type X12LegRestChoice,
} from '~/lib/x12-lineup';

type ChairVariant = NonNullable<
  ProductFragment['selectedOrFirstAvailableVariant']
>;

export type ChairPurchaseSource = {
  handle: string;
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  productOptions: MappedProductOptions[];
  productVariants?: ChairVariant[];
};

type ProductPurchasePanelProps = {
  productHandle: string;
  productId?: string;
  title: string;
  displayName?: string;
  tagline?: string;
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  productOptions: MappedProductOptions[];
  productVariants?: ChairVariant[];
  accessoryAddons?: AddonProduct[];
  /** Merged X12 page: pick Standard X12 or X12 Pro without leaving this gallery. */
  x12Edition?: {
    standard: ChairPurchaseSource;
    pro: ChairPurchaseSource | null;
    initialChoice?: X12LegRestChoice;
  };
};

export function ProductPurchasePanel({
  productHandle: pageHandle,
  productId,
  title,
  displayName,
  tagline,
  selectedVariant: pageSelectedVariant,
  productOptions: pageProductOptions,
  productVariants: pageProductVariants = [],
  accessoryAddons = [],
  x12Edition,
}: ProductPurchasePanelProps) {
  const {
    declaration,
    productVatReliefEnabled,
    setProductVatRelief,
    openProductModal,
  } = useVatRelief();
  const {open} = useAside();
  const [searchParams, setSearchParams] = useSearchParams();

  const [x12Choice, setX12Choice] = useState<X12LegRestChoice>(() => {
    if (x12Edition?.initialChoice) return x12Edition.initialChoice;
    return parseX12ChoiceFromSearch(searchParams);
  });

  const activeEdition: ChairPurchaseSource = useMemo(() => {
    if (!x12Edition) {
      return {
        handle: pageHandle,
        selectedVariant: pageSelectedVariant,
        productOptions: pageProductOptions,
        productVariants: pageProductVariants,
      };
    }
    if (x12Choice === 'electric' && x12Edition.pro) {
      return x12Edition.pro;
    }
    return x12Edition.standard;
  }, [
    pageHandle,
    pageProductOptions,
    pageProductVariants,
    pageSelectedVariant,
    x12Choice,
    x12Edition,
  ]);

  const productHandle = activeEdition.handle;
  const selectedVariant = activeEdition.selectedVariant;
  const productOptions = activeEdition.productOptions;
  const productVariants = activeEdition.productVariants ?? [];
  const editionLabel =
    x12Edition && x12Choice === 'electric'
      ? X12_LEG_REST_OPTIONS[1].label
      : displayName ?? title;

  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [paymentChoice, setPaymentChoice] = useState<'full' | 'deposit'>(
    () => (isForcedPreorder(productHandle) ? 'deposit' : 'full'),
  );
  const paymentChoiceTouched = useRef(false);

  const allChairVariants = useMemo(() => {
    if (productVariants.length) return productVariants;
    return selectedVariant ? [selectedVariant] : [];
  }, [productVariants, selectedVariant]);

  const dualVatPricing = variantsHaveVatOption(allChairVariants);
  const vatFormComplete = isVatDeclarationComplete(declaration);
  const vatReliefActive = productVatReliefEnabled && vatFormComplete;

  // Colour / base selection always resolves against the Standard price SKU.
  const colourBaseVariant =
    resolveVatPurchaseVariant(selectedVariant, allChairVariants, false) ??
    selectedVariant;
  const purchaseVariant =
    resolveVatPurchaseVariant(
      colourBaseVariant,
      allChairVariants,
      vatReliefActive,
    ) ?? colourBaseVariant;

  const visibleProductOptions = useMemo(
    () => filterVisibleProductOptions(productOptions),
    [productOptions],
  );

  const price = dualVatPricing
    ? purchaseVariant?.price
    : colourBaseVariant?.price;
  const compareAtPrice = colourBaseVariant?.compareAtPrice;

  const delivery = purchaseVariant
    ? getDeliveryInfo({
        availableForSale: purchaseVariant.availableForSale,
        quantityAvailable: purchaseVariant.quantityAvailable,
        handle: productHandle,
      })
    : null;

  const purchaseOptions = useMemo(
    () =>
      isForcedInStock(productHandle)
        ? [{kind: 'full' as const}]
        : buildPurchaseOptions({
            allocations: purchaseVariant?.sellingPlanAllocations
              ?.nodes as SellingPlanAllocationNode[] | undefined,
            vatReliefEnabled: productVatReliefEnabled && !dualVatPricing,
          }),
    [dualVatPricing, productHandle, productVatReliefEnabled, purchaseVariant],
  );

  const depositOption = purchaseOptions.find(isDepositPurchaseOption) ?? null;
  const hasDepositOption = Boolean(depositOption);

  useEffect(() => {
    if (!hasDepositOption) {
      if (paymentChoice === 'deposit') setPaymentChoice('full');
      return;
    }
    // Prefer deposit for forced pre-order chairs until the shopper picks otherwise.
    if (
      !paymentChoiceTouched.current &&
      isForcedPreorder(productHandle) &&
      paymentChoice !== 'deposit'
    ) {
      setPaymentChoice('deposit');
    }
  }, [hasDepositOption, paymentChoice, productHandle]);

  const handlePaymentChoiceChange = (value: 'full' | 'deposit') => {
    paymentChoiceTouched.current = true;
    setPaymentChoice(value);
  };

  const selectedSellingPlanId =
    isForcedInStock(productHandle) || paymentChoice !== 'deposit'
      ? null
      : depositOption?.sellingPlanId;

  const canAddToCart =
    Boolean(purchaseVariant?.availableForSale) &&
    (!productVatReliefEnabled || vatFormComplete);

  const cartAttributes = useMemo(() => {
    const vat = productVatReliefEnabled
      ? buildVatCartAttributes(declaration)
      : [];
    if (!x12Edition) return vat;
    return [...vat, x12LegRestCartAttribute(x12Choice)];
  }, [declaration, productVatReliefEnabled, x12Choice, x12Edition]);

  const standardEditionPriceLabel = x12Edition
    ? getExVatDisplay(
        (resolveVatPurchaseVariant(
          x12Edition.standard.selectedVariant,
          x12Edition.standard.productVariants ??
            (x12Edition.standard.selectedVariant
              ? [x12Edition.standard.selectedVariant]
              : []),
          false,
        ) ?? x12Edition.standard.selectedVariant)?.price,
      )
    : null;
  const proEditionPriceLabel = x12Edition?.pro
    ? getExVatDisplay(
        (resolveVatPurchaseVariant(
          x12Edition.pro.selectedVariant,
          x12Edition.pro.productVariants ??
            (x12Edition.pro.selectedVariant
              ? [x12Edition.pro.selectedVariant]
              : []),
          false,
        ) ?? x12Edition.pro.selectedVariant)?.price,
      )
    : null;

  const handleX12ChoiceChange = (next: X12LegRestChoice) => {
    if (next === 'electric' && !x12Edition?.pro) return;
    setX12Choice(next);
    setSearchParams(x12ChoiceSearchParams(searchParams, next), {
      replace: true,
      preventScrollReset: true,
    });
  };

  const addonLines = useMemo(() => {
    const lines: OptimisticCartLineInput[] = [];
    for (const product of accessoryAddons) {
      const variants = product.variants?.nodes ?? [];
      const pickerVariants = filterStandardVatVariants(
        variants.filter((variant) => variant.availableForSale),
      );
      const fallback =
        product.selectedOrFirstAvailableVariant?.availableForSale
          ? [product.selectedOrFirstAvailableVariant]
          : [];
      const colourChoices = pickerVariants.length ? pickerVariants : fallback;
      const colourVariant = colourChoices.find((item) =>
        selectedAddonIds.has(item.id),
      );
      if (!colourVariant?.id) continue;

      const purchaseAddon =
        resolveVatPurchaseVariant(colourVariant, variants, vatReliefActive) ??
        colourVariant;

      lines.push({
        merchandiseId: purchaseAddon.id,
        quantity: 1,
        selectedVariant: purchaseAddon,
        ...(cartAttributes.length ? {attributes: cartAttributes} : {}),
      });
    }
    return lines;
  }, [accessoryAddons, cartAttributes, selectedAddonIds, vatReliefActive]);

  const addonCount = addonLines.length;

  const standardPackagePrice = useMemo(() => {
    if (!dualVatPricing) return null;
    const standardChair =
      resolveVatPurchaseVariant(colourBaseVariant, allChairVariants, false) ??
      colourBaseVariant;
    const addonStandards: Array<MoneyV2 | null | undefined> = [];
    for (const product of accessoryAddons) {
      const variants = product.variants?.nodes ?? [];
      const pickerVariants = filterStandardVatVariants(
        variants.filter((variant) => variant.availableForSale),
      );
      const colourVariant = pickerVariants.find((item) =>
        selectedAddonIds.has(item.id),
      );
      if (!colourVariant) continue;
      const standardAddon =
        resolveVatPurchaseVariant(colourVariant, variants, false) ??
        colourVariant;
      addonStandards.push(standardAddon.price);
    }
    return sumMoneyV2([standardChair?.price, ...addonStandards]);
  }, [
    accessoryAddons,
    allChairVariants,
    colourBaseVariant,
    dualVatPricing,
    selectedAddonIds,
  ]);

  // Always resolve the Relief package for display — do not reuse the active
  // purchase variant (that is Standard until relief is claimed).
  const reliefPackagePrice = useMemo(() => {
    if (!dualVatPricing) return null;
    const reliefChair =
      resolveVatPurchaseVariant(colourBaseVariant, allChairVariants, true) ??
      colourBaseVariant;
    const addonReliefs: Array<MoneyV2 | null | undefined> = [];
    for (const product of accessoryAddons) {
      const variants = product.variants?.nodes ?? [];
      const pickerVariants = filterStandardVatVariants(
        variants.filter((variant) => variant.availableForSale),
      );
      const colourVariant = pickerVariants.find((item) =>
        selectedAddonIds.has(item.id),
      );
      if (!colourVariant) continue;
      const reliefAddon =
        resolveVatPurchaseVariant(colourVariant, variants, true) ??
        colourVariant;
      addonReliefs.push(reliefAddon.price);
    }
    return sumMoneyV2([reliefChair?.price, ...addonReliefs]);
  }, [
    accessoryAddons,
    allChairVariants,
    colourBaseVariant,
    dualVatPricing,
    selectedAddonIds,
  ]);

  const packagePrice = useMemo(
    () =>
      dualVatPricing
        ? sumMoneyV2([
            purchaseVariant?.price,
            ...addonLines.map(
              (line) =>
                (line.selectedVariant as {price?: MoneyV2 | null} | undefined)
                  ?.price,
            ),
          ])
        : sumMoneyV2([
            colourBaseVariant?.price,
            ...addonLines.map(
              (line) =>
                (line.selectedVariant as {price?: MoneyV2 | null} | undefined)
                  ?.price,
            ),
          ]),
    [
      addonLines,
      colourBaseVariant?.price,
      dualVatPricing,
      purchaseVariant?.price,
    ],
  );

  const dueTodayPrice = useMemo(() => {
    if (paymentChoice === 'deposit' && depositOption?.checkoutCharge) {
      return sumMoneyV2([
        {
          amount: depositOption.checkoutCharge.amount,
          currencyCode:
            depositOption.checkoutCharge.currencyCode ??
            price?.currencyCode ??
            'GBP',
        },
        ...addonLines.map(
          (line) =>
            (line.selectedVariant as {price?: MoneyV2 | null} | undefined)
              ?.price,
        ),
      ]);
    }
    return packagePrice;
  }, [
    addonLines,
    depositOption,
    packagePrice,
    paymentChoice,
    price?.currencyCode,
  ]);

  const incVatDisplay = getIncVatDisplay(
    dualVatPricing
      ? standardPackagePrice
      : (colourBaseVariant?.price ?? packagePrice),
  );
  const exVatDisplay = dualVatPricing
    ? reliefPackagePrice
      ? formatProductPrice(
          Number(reliefPackagePrice.amount),
          reliefPackagePrice.currencyCode,
          {fractionDigits: 2},
        )
      : null
    : getExVatDisplay(colourBaseVariant?.price ?? packagePrice);

  const dualSavings =
    dualVatPricing && standardPackagePrice && reliefPackagePrice
      ? formatProductPrice(
          Math.max(
            0,
            Number(standardPackagePrice.amount) -
              Number(reliefPackagePrice.amount),
          ),
          standardPackagePrice.currencyCode,
          {fractionDigits: 2},
        )
      : null;

  const vatSavings = dualVatPricing
    ? dualSavings
    : getVatSavingsDisplay(colourBaseVariant?.price ?? packagePrice);
  const klarnaInstallment = getKlarnaInstallmentDisplay(
    dualVatPricing
      ? standardPackagePrice
      : (colourBaseVariant?.price ?? packagePrice),
  );
  const activePriceDisplay =
    productVatReliefEnabled && exVatDisplay ? exVatDisplay : incVatDisplay;

  const dueTodayDisplay = useMemo(() => {
    if (!dueTodayPrice) return null;
    if (dualVatPricing) {
      return formatProductPrice(
        Number(dueTodayPrice.amount),
        dueTodayPrice.currencyCode,
        {fractionDigits: 2},
      );
    }
    if (productVatReliefEnabled) {
      return formatProductPrice(
        catalogToExVatAmount(dueTodayPrice.amount),
        dueTodayPrice.currencyCode,
        {fractionDigits: 2},
      );
    }
    return paymentChoice === 'deposit'
      ? formatProductPrice(
          catalogToIncVatAmount(dueTodayPrice.amount),
          dueTodayPrice.currencyCode,
          {fractionDigits: 2},
        )
      : getIncVatDisplay(dueTodayPrice);
  }, [
    dualVatPricing,
    dueTodayPrice,
    paymentChoice,
    productVatReliefEnabled,
  ]);

  const priceForLabel =
    paymentChoice === 'deposit' ? dueTodayDisplay : activePriceDisplay;
  const baseLabel = priceForLabel
    ? paymentChoice === 'deposit'
      ? `Reserve with deposit — ${priceForLabel}`
      : `Add to cart — ${priceForLabel}`
    : paymentChoice === 'deposit'
      ? 'Reserve with deposit'
      : 'Add to cart';
  const addToCartLabel =
    addonCount > 0
      ? `${baseLabel} · ${addonCount} accessor${addonCount === 1 ? 'y' : 'ies'}`
      : baseLabel;

  const soldOutLabel = purchaseVariant?.availableForSale
    ? productVatReliefEnabled && !vatFormComplete
      ? 'Complete VAT declaration'
      : 'Sold out'
    : 'Sold out';

  const cartLines: OptimisticCartLineInput[] = purchaseVariant
    ? [
        {
          merchandiseId: purchaseVariant.id,
          quantity: 1,
          selectedVariant: withOptimisticSellingPlanAllocation(
            purchaseVariant,
            selectedSellingPlanId,
          ),
          attributes: cartAttributes,
          ...(selectedSellingPlanId
            ? {sellingPlanId: selectedSellingPlanId}
            : {}),
        },
        ...addonLines.map((line) => ({
          ...line,
          attributes: line.attributes?.length
            ? line.attributes
            : cartAttributes,
          parent: line.parent ?? {merchandiseId: purchaseVariant.id},
        })),
      ]
    : [];

  const stickyPrice = priceForLabel;
  const stickyPriceHint =
    paymentChoice === 'deposit'
      ? addonCount > 0
        ? 'Deposit + accessories due today'
        : '10% deposit due today'
      : addonCount > 0
        ? productVatReliefEnabled
          ? `Total with ${addonCount} accessor${addonCount === 1 ? 'y' : 'ies'} · VAT relief`
          : `Total with ${addonCount} accessor${addonCount === 1 ? 'y' : 'ies'} · inc. VAT`
        : productVatReliefEnabled
          ? 'VAT relief price'
          : 'inc. VAT';

  const toggleAddon = (variantId: string) => {
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(variantId)) next.delete(variantId);
      else next.add(variantId);
      return next;
    });
  };

  const selectAddonVariant = (
    previousVariantId: string | null,
    nextVariantId: string,
  ) => {
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      if (previousVariantId) next.delete(previousVariantId);
      next.add(nextVariantId);
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
        <ProductReviewSummary
          productHandle={pageHandle}
          productId={productId}
        />
        {tagline ? (
          <p className="mt-1.5 text-sm leading-snug text-slate sm:mt-2">
            {tagline}
          </p>
        ) : null}
      </header>

      <section aria-label="Pricing" className="product-price-card mb-3 sm:mb-4">
        <ProductPriceDisplay
          addonCount={addonCount}
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
            price:
              (dualVatPricing ? standardPackagePrice : packagePrice) ??
              price ??
              undefined,
            initialEnabled: productVatReliefEnabled,
            initialDeclaration: declaration,
            onComplete: setProductVatRelief,
          })
        }
        vatFormComplete={vatFormComplete}
        vatSavings={vatSavings}
      />

      <div className="mt-3 space-y-3 sm:mt-4">
        {x12Edition ? (
          <ProductX12EditionOptions
            onChange={handleX12ChoiceChange}
            proAvailable={Boolean(x12Edition.pro)}
            proPriceLabel={proEditionPriceLabel}
            standardPriceLabel={standardEditionPriceLabel}
            value={x12Choice}
          />
        ) : null}

        {depositOption ? (
          <ProductPaymentOptions
            depositAmountLabel={depositOption.depositDisplay}
            depositPlanName={
              /deposit/i.test(depositOption.name)
                ? depositOption.name
                : 'Pay 10% deposit'
            }
            onChange={handlePaymentChoiceChange}
            remainingAmountLabel={depositOption.remainingDisplay}
            value={paymentChoice}
          />
        ) : null}

        {accessoryAddons.length ? (
          <ProductAccessoryAddons
            chairLabel={editionLabel}
            onSelectVariant={selectAddonVariant}
            onToggle={toggleAddon}
            products={accessoryAddons}
            selectedIds={selectedAddonIds}
          />
        ) : null}

        <ProductForm
          addToCartClassName="btn-atc hidden w-full lg:inline-flex"
          addToCartLabel={addToCartLabel}
          addonLines={addonLines}
          cartAttributes={cartAttributes}
          disabled={!canAddToCart}
          productHandle={productHandle}
          productOptions={visibleProductOptions}
          selectedVariant={purchaseVariant}
          sellingPlanId={selectedSellingPlanId}
          soldOutLabel={soldOutLabel}
        />

        {delivery ? <ProductDeliveryEta delivery={delivery} /> : null}

        <ProductTrustBadges productHandle={productHandle} />

        <ProductCheckoutTrust
          klarnaInstallment={
            paymentChoice === 'deposit' ? null : klarnaInstallment
          }
        />
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
              <p className="mt-0.5 truncate text-sm text-slate">
                {stickyPriceHint}
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
                  ? paymentChoice === 'deposit'
                    ? `Deposit — ${stickyPrice}`
                    : `Add — ${stickyPrice}`
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
  addonCount,
}: {
  incVatDisplay: string | null;
  exVatDisplay: string | null;
  compareAtPrice?: MoneyV2 | null;
  vatSavings: string | null;
  vatReliefEnabled: boolean;
  addonCount: number;
}) {
  if (!incVatDisplay) return null;

  const primaryPrice =
    vatReliefEnabled && exVatDisplay ? exVatDisplay : incVatDisplay;

  return (
    <div aria-label="Price" role="group">
      <div className="flex items-baseline justify-between gap-3">
        <p
          className={[
            'font-display text-[1.75rem] font-semibold tabular-nums leading-none tracking-[-0.04em] sm:text-[2rem] md:text-[2.15rem]',
            vatReliefEnabled ? 'text-vat-price' : 'text-navy',
          ].join(' ')}
          key={`${primaryPrice}-${addonCount}`}
        >
          {primaryPrice}
        </p>
        {compareAtPrice && addonCount === 0 ? (
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

      {addonCount > 0 ? (
        <p className="mt-1.5 text-[0.75rem] font-medium text-primary">
          Includes {addonCount} selected accessor
          {addonCount === 1 ? 'y' : 'ies'}
        </p>
      ) : null}
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

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
            {enabled && vatFormComplete ? (
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-vat-price">
                <Check aria-hidden className="size-3.5 shrink-0" />
                Ready at checkout
              </p>
            ) : null}

            <button
              className="inline-flex items-center gap-1.5 rounded-md bg-navy px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-navy-light"
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
      </div>
    </section>
  );
}
