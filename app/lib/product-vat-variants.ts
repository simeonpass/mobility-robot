import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

/** Shopify product option that holds Standard vs VAT Relief prices. */
export const VAT_OPTION_NAME = 'VAT';
export const VAT_OPTION_STANDARD = 'Standard';
export const VAT_OPTION_RELIEF = 'VAT Relief';

export type VatSelectedOption = {
  name: string;
  value: string;
};

export type VatPricedVariant = {
  id: string;
  availableForSale?: boolean | null;
  price?: Pick<MoneyV2, 'amount' | 'currencyCode'> | null;
  selectedOptions?: VatSelectedOption[] | null;
  sellingPlanAllocations?: unknown;
};

export function isVatOptionName(name?: string | null): boolean {
  return (name ?? '').trim().toLowerCase() === VAT_OPTION_NAME.toLowerCase();
}

export function getVatOptionValue(
  selectedOptions?: VatSelectedOption[] | null,
): string | null {
  const match = selectedOptions?.find((option) => isVatOptionName(option.name));
  return match?.value?.trim() || null;
}

export function isVatReliefVariant(
  selectedOptions?: VatSelectedOption[] | null,
): boolean {
  return getVatOptionValue(selectedOptions) === VAT_OPTION_RELIEF;
}

export function isVatStandardVariant(
  selectedOptions?: VatSelectedOption[] | null,
): boolean {
  const value = getVatOptionValue(selectedOptions);
  // No VAT option → treat as standard catalog (legacy single-price products).
  return value == null || value === VAT_OPTION_STANDARD;
}

export function productHasVatOption(
  options?: Array<{name?: string | null}> | null,
): boolean {
  return (options ?? []).some((option) => isVatOptionName(option.name));
}

export function variantsHaveVatOption(
  variants?: Array<{selectedOptions?: VatSelectedOption[] | null}> | null,
): boolean {
  return (variants ?? []).some(
    (variant) => getVatOptionValue(variant.selectedOptions) != null,
  );
}

/** Colour / size options only — never expose VAT as a customer picker. */
export function filterVisibleProductOptions<
  T extends {name: string; optionValues: unknown[]},
>(productOptions: T[]): T[] {
  return productOptions.filter((option) => !isVatOptionName(option.name));
}

/** Options shown on cart line chips. */
export function filterVisibleSelectedOptions(
  selectedOptions?: VatSelectedOption[] | null,
): VatSelectedOption[] {
  return (selectedOptions ?? []).filter(
    (option) =>
      !isVatOptionName(option.name) && option.value !== 'Default Title',
  );
}

/**
 * Prefer Standard variants for colour pickers / default selection so listings
 * and addons don't surface the cheaper relief SKU by accident.
 */
export function filterStandardVatVariants<T extends VatPricedVariant>(
  variants: T[],
): T[] {
  if (!variantsHaveVatOption(variants)) return variants;
  return variants.filter((variant) => isVatStandardVariant(variant.selectedOptions));
}

function optionsShareNonVat(
  a: VatSelectedOption[] | null | undefined,
  b: VatSelectedOption[] | null | undefined,
): boolean {
  const left = (a ?? []).filter((option) => !isVatOptionName(option.name));
  const right = (b ?? []).filter((option) => !isVatOptionName(option.name));
  if (left.length !== right.length) return false;
  return left.every((option) =>
    right.some(
      (other) =>
        other.name.toLowerCase() === option.name.toLowerCase() &&
        other.value.toLowerCase() === option.value.toLowerCase(),
    ),
  );
}

/**
 * Resolve Standard or VAT Relief sibling for the same non-VAT options
 * (e.g. same Colour). Falls back to the selected variant when dual pricing
 * is not set up yet.
 */
export function resolveVatPurchaseVariant<T extends VatPricedVariant>(
  selectedVariant: T | null | undefined,
  variants: T[] | null | undefined,
  vatRelief: boolean,
): T | null | undefined {
  if (!selectedVariant) return selectedVariant;

  const list = variants?.length ? variants : [selectedVariant];
  if (!variantsHaveVatOption(list)) return selectedVariant;

  const target = vatRelief ? VAT_OPTION_RELIEF : VAT_OPTION_STANDARD;

  const sibling = list.find((variant) => {
    if (getVatOptionValue(variant.selectedOptions) !== target) return false;
    return optionsShareNonVat(
      selectedVariant.selectedOptions,
      variant.selectedOptions,
    );
  });

  return sibling ?? selectedVariant;
}

/** Cart merchandise shape used to swap Standard ↔ VAT Relief siblings. */
export type CartVatMerchandise = {
  id: string;
  selectedOptions?: VatSelectedOption[] | null;
  product?: {
    variants?: {
      nodes?: Array<VatPricedVariant> | null;
    } | null;
  } | null;
};

/**
 * Returns the merchandiseId to write on a cart line update when toggling
 * VAT relief. Falls back to the current id when dual variants are absent.
 */
export function resolveCartMerchandiseId(
  merchandise: CartVatMerchandise | null | undefined,
  vatRelief: boolean,
): string | undefined {
  if (!merchandise?.id) return undefined;

  const nodes = merchandise.product?.variants?.nodes ?? [];
  const resolved = resolveVatPurchaseVariant(
    {
      id: merchandise.id,
      selectedOptions: merchandise.selectedOptions,
    },
    nodes,
    vatRelief,
  );

  return resolved?.id ?? merchandise.id;
}

export function moneyAmount(price?: Pick<MoneyV2, 'amount'> | null): number {
  return Number(price?.amount ?? 0);
}
