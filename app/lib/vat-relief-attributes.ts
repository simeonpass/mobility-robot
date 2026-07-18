import type {AttributeInput} from '@shopify/hydrogen/storefront-api-types';
import {buildVatCartAttributes} from '~/lib/product-pricing';
import {
  EMPTY_VAT_DECLARATION,
  type VatDeclaration,
} from '~/lib/vat-relief-types';

export const VAT_RELIEF_LINE_KEY = 'VAT Relief';
export const VAT_RELIEF_LINE_VALUE = 'Yes';

const VAT_DECLARATION_KEYS = [
  'VAT Declaration Email',
  'VAT Declaration Name',
  'VAT Declaration Address',
  'VAT Declaration Condition',
] as const;

const VAT_LINE_ATTRIBUTE_KEYS = [
  VAT_RELIEF_LINE_KEY,
  ...VAT_DECLARATION_KEYS,
] as const;

export function parseDeclarationFromAttributes(
  attributes?: Array<{key: string; value?: string | null}> | null,
): VatDeclaration {
  if (!attributes?.length) return EMPTY_VAT_DECLARATION;

  const read = (key: string) =>
    attributes.find((attribute) => attribute.key === key)?.value?.trim() ?? '';

  return {
    email: read('VAT Declaration Email'),
    name: read('VAT Declaration Name'),
    address: read('VAT Declaration Address'),
    condition: read('VAT Declaration Condition'),
  };
}

export function stripVatAttributes(
  attributes?: Array<{key: string; value?: string | null}> | null,
): AttributeInput[] {
  return (attributes ?? [])
    .filter((attribute) => !VAT_LINE_ATTRIBUTE_KEYS.includes(attribute.key as typeof VAT_LINE_ATTRIBUTE_KEYS[number]))
    .map((attribute) => ({
      key: attribute.key,
      value: attribute.value ?? '',
    }));
}

export function mergeVatAttributes(
  existing: Array<{key: string; value?: string | null}> | null | undefined,
  declaration: VatDeclaration,
): AttributeInput[] {
  return [
    ...stripVatAttributes(existing),
    ...buildVatCartAttributes(declaration),
  ];
}

export function toCartAttributeInputs(
  attributes?: Array<{key: string; value?: string | null}> | null,
): AttributeInput[] {
  return (attributes ?? []).map((attribute) => ({
    key: attribute.key,
    value: attribute.value ?? '',
  }));
}
