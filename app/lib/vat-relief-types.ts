export type VatDeclaration = {
  email: string;
  name: string;
  address: string;
  condition: string;
};

export const EMPTY_VAT_DECLARATION: VatDeclaration = {
  email: '',
  name: '',
  address: '',
  condition: '',
};

export function isVatDeclarationComplete(declaration: VatDeclaration): boolean {
  return (
    declaration.email.trim().length > 0 &&
    declaration.name.trim().length > 0 &&
    declaration.address.trim().length > 0 &&
    declaration.condition.trim().length > 0
  );
}
