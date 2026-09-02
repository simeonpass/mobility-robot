import {SHOPIFY_HOME_PRODUCT_HANDLES} from '~/lib/homepage-data';

/** Query param used on the merged X12 product page. */
export const X12_LEG_REST_PARAM = 'legrest';

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

/** Live Shopify X12 Pro product — kept as a SKU, hidden as its own listing. */
export function isX12ProShopifyHandle(handle: string): boolean {
  const h = handle.trim().toLowerCase();
  if (!h) return false;
  return (
    h === X12_PRO_SHOPIFY_HANDLE ||
    h === 'xsto-x12-pro' ||
    h.startsWith('xsto-x12-pro-')
  );
}

export function parseX12LegRest(
  value: string | null | undefined,
): X12LegRestChoice {
  if (!value) return 'standard';
  const v = value.trim().toLowerCase();
  if (v === 'electric' || v === 'pro' || v === 'elevating') return 'electric';
  return 'standard';
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
