import {useEffect, useMemo, useRef, useState} from 'react';
import {Link, useSearchParams} from 'react-router';
import {BadgePercent, Check} from 'lucide-react';
import type {
  MappedProductOptions,
  OptimisticCartLineInput,
} from '@shopify/hydrogen';
import type {ProductFragment} from 'storefrontapi.generated';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {ProductForm} from '~/components/ProductForm';
import {
  ProductAccessoryAddons,
  type AddonProduct,
} from '~/components/product/ProductAccessoryAddons';
import {
  getAccessoryVariants,
  getSelectedAccessories,
} from '~/lib/product-accessories';
import {ProductCheckoutTrust} from '~/components/product/ProductCheckoutTrust';
import {ProductDeliveryEta} from '~/components/product/ProductDeliveryEta';
import {ProductPaymentOptions} from '~/components/product/ProductPaymentOptions';
import {ProductTrustBadges} from '~/components/product/ProductTrustBadges';
import {ProductX12EditionOptions} from '~/components/product/ProductX12EditionOptions';
import {useVatRelief} from '~/components/vat-relief/VatReliefProvider';
import {
  getCartDeliveryInfo,
  isForcedInStock,
  isForcedPreorder,
} from '~/lib/product-delivery';
import {
  buildVatCartAttributes,
  formatProductPrice,
  getExVatDisplay,
  getPurchaseDisplayPrice,
  getVariantDisplayPrice,
  sumMoneyV2,
} from '~/lib/product-pricing';
import {
  buildPurchaseOptions,
  isDepositPurchaseOption,
  withOptimisticSellingPlanAllocation,
  type SellingPlanAllocationNode,
} from '~/lib/selling-plans';
import {isVatDeclarationComplete} from '~/lib/vat-relief-types';
import {isXstoRangeProduct} from '~/lib/product-specs';
import {
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

const EMPTY_CHAIR_VARIANTS: ChairVariant[] = [];

export function ProductPurchasePanel({
  productHandle: pageHandle,
  title,
  displayName,
  selectedVariant: pageSelectedVariant,
  productOptions: pageProductOptions,
  productVariants: pageProductVariants = EMPTY_CHAIR_VARIANTS,
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
  const isChair = isXstoRangeProduct(pageHandle);
  const purchaseRef = useRef<HTMLDivElement>(null);
  const [inlinePurchaseVisible, setInlinePurchaseVisible] = useState(false);

  useEffect(() => {
    const target = purchaseRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setInlinePurchaseVisible(entry.isIntersecting),
      {threshold: 0.5, rootMargin: '-110px 0px -90px 0px'},
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

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
  const productVariants = activeEdition.productVariants ?? EMPTY_CHAIR_VARIANTS;
  const editionLabel =
    x12Edition && x12Choice === 'electric'
      ? X12_LEG_REST_OPTIONS[1].label
      : (displayName ?? title);

  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [paymentChoice, setPaymentChoice] = useState<'full' | 'deposit'>(() =>
    isForcedPreorder(productHandle) ? 'deposit' : 'full',
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

  const purchaseOptions = useMemo(
    () =>
      isForcedInStock(productHandle)
        ? [{kind: 'full' as const}]
        : buildPurchaseOptions({
            allocations: purchaseVariant?.sellingPlanAllocations?.nodes as
              SellingPlanAllocationNode[] | undefined,
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

  const selectedAccessories = useMemo(
    () =>
      getSelectedAccessories(
        accessoryAddons,
        selectedAddonIds,
        vatReliefActive,
      ),
    [accessoryAddons, selectedAddonIds, vatReliefActive],
  );
  const unavailableAddon = selectedAccessories.some(
    (item) => !item.purchaseVariant.availableForSale,
  );

  const canAddToCart =
    Boolean(purchaseVariant?.availableForSale) &&
    (!productVatReliefEnabled || vatFormComplete) &&
    !unavailableAddon;

  const cartAttributes = useMemo(() => {
    const vat = productVatReliefEnabled
      ? buildVatCartAttributes(declaration)
      : [];
    if (!x12Edition) return vat;
    return [...vat, x12LegRestCartAttribute(x12Choice)];
  }, [declaration, productVatReliefEnabled, x12Choice, x12Edition]);

  const standardEditionPriceLabel = x12Edition
    ? getExVatDisplay(
        (
          resolveVatPurchaseVariant(
            x12Edition.standard.selectedVariant,
            x12Edition.standard.productVariants ??
              (x12Edition.standard.selectedVariant
                ? [x12Edition.standard.selectedVariant]
                : []),
            false,
          ) ?? x12Edition.standard.selectedVariant
        )?.price,
      )
    : null;
  const proEditionPriceLabel = x12Edition?.pro
    ? getExVatDisplay(
        (
          resolveVatPurchaseVariant(
            x12Edition.pro.selectedVariant,
            x12Edition.pro.productVariants ??
              (x12Edition.pro.selectedVariant
                ? [x12Edition.pro.selectedVariant]
                : []),
            false,
          ) ?? x12Edition.pro.selectedVariant
        )?.price,
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

  const addonLines = useMemo<OptimisticCartLineInput[]>(
    () =>
      selectedAccessories.map(({purchaseVariant}) => ({
        merchandiseId: purchaseVariant.id,
        quantity: 1,
        selectedVariant: purchaseVariant,
        ...(cartAttributes.length ? {attributes: cartAttributes} : {}),
      })),
    [selectedAccessories, cartAttributes],
  );

  const addonCount = addonLines.length;

  const delivery = purchaseVariant
    ? getCartDeliveryInfo([
        {
          merchandise: {
            availableForSale: purchaseVariant.availableForSale,
            quantityAvailable: purchaseVariant.quantityAvailable,
            product: {handle: productHandle},
          },
        },
        ...addonLines.flatMap((line) => {
          const variant = line.selectedVariant as
            {product?: {handle?: string | null} | null} | undefined;
          const handle =
            variant?.product?.handle ??
            accessoryAddons.find(
              (product) =>
                product.selectedOrFirstAvailableVariant?.id ===
                  line.merchandiseId ||
                (product.variants?.nodes ?? []).some(
                  (node) => node.id === line.merchandiseId,
                ),
            )?.handle;
          if (!handle) return [];
          return [
            {
              merchandise: {
                availableForSale: true,
                product: {handle},
              },
            },
          ];
        }),
      ])
    : null;

  const chairStandardPrice = getVariantDisplayPrice(
    colourBaseVariant,
    allChairVariants,
    false,
  );
  const chairReliefPrice = getVariantDisplayPrice(
    colourBaseVariant,
    allChairVariants,
    true,
  );
  const standardPackagePrice = sumMoneyV2([
    chairStandardPrice,
    ...selectedAccessories.map(({product, standardVariant}) =>
      getVariantDisplayPrice(
        standardVariant,
        getAccessoryVariants(product),
        false,
      ),
    ),
  ]);
  const reliefPackagePrice = sumMoneyV2([
    chairReliefPrice,
    ...selectedAccessories.map(({product, standardVariant}) =>
      getVariantDisplayPrice(
        standardVariant,
        getAccessoryVariants(product),
        true,
      ),
    ),
  ]);
  const packagePrice = vatReliefActive
    ? reliefPackagePrice
    : standardPackagePrice;
  const dueTodayPrice =
    paymentChoice === 'deposit' && depositOption?.checkoutCharge
      ? sumMoneyV2([
          getPurchaseDisplayPrice(
            {
              amount: depositOption.checkoutCharge.amount,
              currencyCode:
                depositOption.checkoutCharge.currencyCode ??
                price?.currencyCode ??
                'GBP',
            },
            dualVatPricing,
            vatReliefActive,
          ),
          ...selectedAccessories.map(({product, standardVariant}) =>
            getVariantDisplayPrice(
              standardVariant,
              getAccessoryVariants(product),
              vatReliefActive,
            ),
          ),
        ])
      : packagePrice;
  const activePriceDisplay = packagePrice
    ? formatProductPrice(
        Number(packagePrice.amount),
        packagePrice.currencyCode,
        {fractionDigits: 2},
      )
    : null;
  const dueTodayDisplay = dueTodayPrice
    ? formatProductPrice(
        Number(dueTodayPrice.amount),
        dueTodayPrice.currencyCode,
        {fractionDigits: 2},
      )
    : null;
  const klarnaInstallment = packagePrice
    ? formatProductPrice(
        Number(packagePrice.amount) / 3,
        packagePrice.currencyCode,
        {fractionDigits: 2},
      )
    : null;
  // The declaration modal expects catalogue amounts; displayed totals above
  // resolve each product's VAT setup separately before adding the amounts.
  const declarationPrice = sumMoneyV2([
    colourBaseVariant?.price,
    ...selectedAccessories.map(({standardVariant}) => standardVariant.price),
  ]);

  const priceForLabel =
    paymentChoice === 'deposit' ? dueTodayDisplay : activePriceDisplay;
  const addToCartLabel =
    paymentChoice === 'deposit' ? 'Reserve with deposit' : 'Add to basket';

  const soldOutLabel = unavailableAddon
    ? 'Review unavailable accessory'
    : purchaseVariant?.availableForSale
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
      ? 'Due today'
      : vatReliefActive
        ? 'Total with VAT relief'
        : 'Total incl. VAT';

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
    <div className="product-buy-box mr-product-buy-box">
      <section aria-label="Product price" className="product-price-card">
        <ProductPriceDisplay
          incVatDisplay={
            chairStandardPrice
              ? formatProductPrice(
                  Number(chairStandardPrice.amount),
                  chairStandardPrice.currencyCode,
                  {fractionDigits: 2},
                )
              : null
          }
          exVatDisplay={
            chairReliefPrice
              ? formatProductPrice(
                  Number(chairReliefPrice.amount),
                  chairReliefPrice.currencyCode,
                  {fractionDigits: 2},
                )
              : null
          }
        />
      </section>

      <div className="mr-product-choices space-y-5" id="choose-options">
        {x12Edition ? (
          <ProductX12EditionOptions
            onChange={handleX12ChoiceChange}
            proAvailable={Boolean(x12Edition.pro)}
            proPriceLabel={proEditionPriceLabel}
            standardPriceLabel={standardEditionPriceLabel}
            value={x12Choice}
          />
        ) : null}

        <ProductForm
          addToCartClassName="btn-atc w-full mr-primary-purchase"
          addToCartLabel={addToCartLabel}
          cartAttributes={cartAttributes}
          linesOverride={cartLines}
          purchaseRef={purchaseRef}
          disabled={!canAddToCart}
          productOptions={visibleProductOptions}
          selectedVariant={purchaseVariant}
          sellingPlanId={selectedSellingPlanId}
          soldOutLabel={soldOutLabel}
        >
          <VatReliefCard
            enabled={productVatReliefEnabled}
            vatFormComplete={vatFormComplete}
            onOpen={() =>
              openProductModal({
                price: declarationPrice ?? price ?? undefined,
                initialEnabled: productVatReliefEnabled,
                initialDeclaration: declaration,
                onComplete: setProductVatRelief,
              })
            }
          />
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
          <ProductAccessoryAddons
            chairLabel={editionLabel}
            onSelectVariant={selectAddonVariant}
            onToggle={toggleAddon}
            products={accessoryAddons}
            selectedIds={selectedAddonIds}
            vatReliefActive={vatReliefActive}
          />
          <div
            className="mr-purchase-total"
            aria-live="polite"
            aria-atomic="true"
          >
            <div>
              <strong>
                {paymentChoice === 'deposit' ? 'Due today' : 'Your total'}
              </strong>
              <span>
                {addonCount
                  ? `Chair + ${addonCount} accessor${addonCount === 1 ? 'y' : 'ies'}`
                  : isChair
                    ? 'Chair only'
                    : (displayName ?? title)}{' '}
                · {vatReliefActive ? 'VAT relief applied' : 'including VAT'}
              </span>
            </div>
            <strong className="mr-purchase-total-price">{priceForLabel}</strong>
          </div>
          {unavailableAddon ? (
            <p role="alert" className="mr-addon-unavailable">
              A selected accessory is unavailable. Remove it or choose another
              option before adding to your basket.
            </p>
          ) : null}
        </ProductForm>

        {isChair ? (
          <Link className="mr-product-demo" prefetch="intent" to="/demo">
            Prefer to try it first? Book a demo <span aria-hidden>↗</span>
          </Link>
        ) : null}

        {delivery ? <ProductDeliveryEta delivery={delivery} /> : null}

        {isChair ? <ProductTrustBadges productHandle={productHandle} /> : null}

        <ProductCheckoutTrust
          klarnaInstallment={
            paymentChoice === 'deposit' ? null : klarnaInstallment
          }
        />
      </div>

      <div
        className={`product-mobile-atc${inlinePurchaseVisible ? ' is-inline-visible' : ''}`}
        aria-label="Quick purchase"
      >
        <div className="mx-auto flex max-w-[1400px] items-center gap-3">
          {stickyPrice ? (
            <div className="min-w-0 shrink">
              <p className="truncate font-display text-lg font-semibold tabular-nums leading-none tracking-[-0.03em] text-navy">
                {stickyPrice}
              </p>
              <p className="mt-1 text-xs text-slate">{stickyPriceHint}</p>
            </div>
          ) : null}
          <AddToCartButton
            className="btn-atc min-h-12 px-4 text-sm"
            disabled={!canAddToCart}
            lines={cartLines}
            onClick={() => open('cart')}
          >
            {canAddToCart ? addToCartLabel : soldOutLabel}
          </AddToCartButton>
        </div>
      </div>
    </div>
  );
}

function ProductPriceDisplay({
  incVatDisplay,
  exVatDisplay,
}: {
  incVatDisplay: string | null;
  exVatDisplay: string | null;
}) {
  if (!incVatDisplay) return null;
  return (
    <div className="mr-chair-price">
      <strong>{exVatDisplay ?? incVatDisplay}</strong>
      <p>{exVatDisplay ? 'With VAT relief, if eligible' : 'Including VAT'}</p>
      {exVatDisplay ? <p>{incVatDisplay} including VAT</p> : null}
    </div>
  );
}

function VatReliefCard({
  enabled,
  vatFormComplete,
  onOpen,
}: {
  enabled: boolean;
  vatFormComplete: boolean;
  onOpen: () => void;
}) {
  const complete = enabled && vatFormComplete;
  return (
    <section className="mr-product-vat" aria-label="VAT relief">
      <div>
        {complete ? (
          <Check size={19} aria-hidden />
        ) : (
          <BadgePercent size={19} aria-hidden />
        )}
        <span>
          <strong>
            {complete ? 'VAT relief applied' : 'Eligible for VAT relief?'}
          </strong>
          <small>
            {complete
              ? 'Your declaration is saved.'
              : 'Complete a declaration to pay the VAT-relief price.'}
          </small>
        </span>
      </div>
      <button type="button" onClick={onOpen}>
        {complete
          ? 'Edit'
          : enabled
            ? 'Complete declaration'
            : 'Claim VAT relief'}
      </button>
    </section>
  );
}
