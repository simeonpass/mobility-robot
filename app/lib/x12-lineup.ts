import {SHOPIFY_HOME_PRODUCT_HANDLES} from '~/lib/homepage-data';

/** Query param used on the merged X12 product page. */
export const X12_LEG_REST_PARAM = 'legrest';

export const X12_EDITION_OPTION_NAME = 'Edition';
export const X12_EDITION_STANDARD_VALUE = 'X12';
export const X12_EDITION_PRO_VALUE = 'X12 Pro';

export type X12LegRestChoice = 'standard' | 'electric';

export const X12_CANONICAL_HANDLE =
  SHOPIFY_HOME_PRODUCT_HANDLES['xsto-x12'];

export const X12_PRO_SHOPIFY_HANDLE =
  SHOPIFY_HOME_PRODUCT_HANDLES['xsto-x12-pro'];

export const X12_MERGED_PATH = `/products/${X12_CANONICAL_HANDLE}`;

export const X12_LEG_REST_OPTIONS = [
  {
    id: 'standard' as const,
    label: 'X12',
    description: 'Standard leg rest',
  },
  {
    id: 'electric' as const,
    label: 'X12 Pro',
    description: 'Electric elevating leg rest',
  },
] as const;

export function x12MergedPath(
  choice: X12LegRestChoice = 'standard',
): string {
  if (choice === 'electric') {
    return `${X12_MERGED_PATH}?${X12_LEG_REST_PARAM}=electric`;
  }
  return X12_MERGED_PATH;
}

export function isX12CanonicalHandle(handle: string): boolean {
  const h = handle.trim().toLowerCase();
  return h === X12_CANONICAL_HANDLE || h === 'xsto-x12';
}

/** Legacy standalone X12 Pro handle — redirected, hidden from listings. */
export function isX12ProShopifyHandle(handle: string): boolean {
  const h = handle.trim().toLowerCase();
  if (!h) return false;
  return (
    h === X12_PRO_SHOPIFY_HANDLE ||
    h === 'xsto-x12-pro' ||
    h.startsWith('xsto-x12-pro-')
  );
}

export function isX12EditionOptionName(name?: string | null): boolean {
  return (name ?? '').trim().toLowerCase() === 'edition';
}

export function getX12EditionValue(
  selectedOptions?: Array<{name: string; value: string}> | null,
): string | null {
  const match = selectedOptions?.find((option) =>
    isX12EditionOptionName(option.name),
  );
  return match?.value?.trim() || null;
}

export function x12EditionValueFromChoice(choice: X12LegRestChoice): string {
  return choice === 'electric'
    ? X12_EDITION_PRO_VALUE
    : X12_EDITION_STANDARD_VALUE;
}

export function parseX12LegRest(
  value: string | null | undefined,
): X12LegRestChoice {
  if (!value) return 'standard';
  const v = value.trim().toLowerCase();
  if (
    v === 'electric' ||
    v === 'pro' ||
    v === 'elevating' ||
    v === 'x12 pro' ||
    v.includes('pro')
  ) {
    return 'electric';
  }
  return 'standard';
}

export function parseX12ChoiceFromSearch(searchParams: {
  get: (name: string) => string | null;
}): X12LegRestChoice {
  const edition =
    searchParams.get(X12_EDITION_OPTION_NAME) ?? searchParams.get('edition');
  if (edition) return parseX12LegRest(edition);
  return parseX12LegRest(searchParams.get(X12_LEG_REST_PARAM));
}

export function withX12EditionSelectedOptions(
  handle: string,
  selectedOptions: Array<{name: string; value: string}>,
  requestUrl: string,
): Array<{name: string; value: string}> {
  if (!isX12CanonicalHandle(handle)) return selectedOptions;
  if (selectedOptions.some((option) => isX12EditionOptionName(option.name))) {
    return selectedOptions;
  }
  const url = new URL(requestUrl);
  const choice = parseX12ChoiceFromSearch(url.searchParams);
  return [
    ...selectedOptions,
    {
      name: X12_EDITION_OPTION_NAME,
      value: x12EditionValueFromChoice(choice),
    },
  ];
}

export function productHasX12EditionOption<
  T extends {selectedOptions?: Array<{name: string; value: string}> | null},
>(variants?: T[] | null): boolean {
  return (variants ?? []).some(
    (variant) => getX12EditionValue(variant.selectedOptions) != null,
  );
}

export function variantsForX12Edition<
  T extends {selectedOptions?: Array<{name: string; value: string}> | null},
>(variants: T[] | null | undefined, choice: X12LegRestChoice): T[] {
  const list = variants ?? [];
  if (!productHasX12EditionOption(list)) {
    return choice === 'electric' ? [] : list;
  }
  const wanted = x12EditionValueFromChoice(choice);
  return list.filter(
    (variant) => getX12EditionValue(variant.selectedOptions) === wanted,
  );
}

export function x12LegRestCartAttribute(choice: X12LegRestChoice): {
  key: string;
  value: string;
} {
  return {
    key: 'Edition',
    value: choice === 'electric' ? 'X12 Pro' : 'X12',
  };
}

export function x12ChoiceSearchParams(
  current: URLSearchParams,
  choice: X12LegRestChoice,
): URLSearchParams {
  const params = new URLSearchParams(current);
  params.set(X12_EDITION_OPTION_NAME, x12EditionValueFromChoice(choice));
  if (choice === 'electric') params.set(X12_LEG_REST_PARAM, 'electric');
  else params.delete(X12_LEG_REST_PARAM);
  return params;
}
