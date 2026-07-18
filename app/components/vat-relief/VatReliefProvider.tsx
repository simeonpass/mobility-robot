import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  parseDeclarationFromAttributes,
} from '~/lib/vat-relief-attributes';
import {readVatReliefRegistration} from '~/lib/vat-relief-session';
import {
  EMPTY_VAT_DECLARATION,
  isVatDeclarationComplete,
  type VatDeclaration,
} from '~/lib/vat-relief-types';
import {
  VatReliefModal,
  type VatReliefModalCartLine,
} from '~/components/vat-relief/VatReliefModal';

type ProductModalRequest = {
  price?: MoneyV2 | null;
  initialEnabled?: boolean;
  initialDeclaration?: VatDeclaration;
  onComplete: (enabled: boolean, declaration: VatDeclaration) => void;
};

type CartModalRequest = {
  lines: VatReliefModalCartLine[];
  price?: MoneyV2 | null;
  title: string;
  subtitle?: string;
  initialDeclaration?: VatDeclaration;
  initialEnabled?: boolean;
};

type VatReliefContextValue = {
  openProductModal: (request: ProductModalRequest) => void;
  openCartModal: (request: CartModalRequest) => void;
  declaration: VatDeclaration;
  productVatReliefEnabled: boolean;
  setProductVatRelief: (
    enabled: boolean,
    declaration: VatDeclaration,
  ) => void;
};

const VatReliefContext = createContext<VatReliefContextValue | null>(null);

function loadStoredDeclaration(): VatDeclaration {
  const stored = readVatReliefRegistration();
  if (!stored) return EMPTY_VAT_DECLARATION;
  return {
    email: stored.email,
    name: stored.name,
    address: stored.address,
    condition: stored.condition,
  };
}

function loadStoredVatReliefEnabled(): boolean {
  return isVatDeclarationComplete(loadStoredDeclaration());
}

export function VatReliefProvider({children}: {children: ReactNode}) {
  const [declaration, setDeclaration] = useState<VatDeclaration>(
    EMPTY_VAT_DECLARATION,
  );
  const [productVatReliefEnabled, setProductVatReliefEnabled] = useState(
    loadStoredVatReliefEnabled,
  );
  const [productRequest, setProductRequest] = useState<ProductModalRequest | null>(
    null,
  );
  const [cartRequest, setCartRequest] = useState<CartModalRequest | null>(null);
  const [modalEnabled, setModalEnabled] = useState(false);
  const [modalDeclaration, setModalDeclaration] = useState<VatDeclaration>(
    EMPTY_VAT_DECLARATION,
  );

  useEffect(() => {
    const stored = loadStoredDeclaration();
    setDeclaration(stored);
    if (isVatDeclarationComplete(stored)) {
      setProductVatReliefEnabled(true);
    }
  }, []);

  const openProductModal = useCallback((request: ProductModalRequest) => {
    setCartRequest(null);
    setProductRequest(request);
    setModalEnabled(request.initialEnabled ?? false);
    setModalDeclaration(request.initialDeclaration ?? loadStoredDeclaration());
  }, []);

  const openCartModal = useCallback((request: CartModalRequest) => {
    setProductRequest(null);
    setCartRequest(request);
    setModalEnabled(request.initialEnabled ?? true);
    setModalDeclaration(
      request.initialDeclaration ??
        (request.lines[0]?.attributes
          ? parseDeclarationFromAttributes(request.lines[0].attributes)
          : loadStoredDeclaration()),
    );
  }, []);

  const closeModal = useCallback(() => {
    setProductRequest(null);
    setCartRequest(null);
  }, []);

  const setProductVatRelief = useCallback(
    (enabled: boolean, nextDeclaration: VatDeclaration) => {
      setProductVatReliefEnabled(enabled);
      setDeclaration(nextDeclaration);
    },
    [],
  );

  const value = useMemo(
    () => ({
      openProductModal,
      openCartModal,
      declaration,
      productVatReliefEnabled,
      setProductVatRelief,
    }),
    [
      openProductModal,
      openCartModal,
      declaration,
      productVatReliefEnabled,
      setProductVatRelief,
    ],
  );

  const modalOpen = Boolean(productRequest || cartRequest);
  const modalTitle = cartRequest?.title ?? 'Claim HMRC VAT relief';
  const modalSubtitle =
    cartRequest?.subtitle ??
    (productRequest ? 'Complete your declaration before adding to cart.' : undefined);
  const modalPrice = cartRequest?.price ?? productRequest?.price ?? null;

  return (
    <VatReliefContext.Provider value={value}>
      {children}
      <VatReliefModal
        cartLines={cartRequest?.lines}
        declaration={modalDeclaration}
        mode={cartRequest ? 'cart' : 'product'}
        onClose={closeModal}
        onDeclarationChange={setModalDeclaration}
        onProductConfirm={(enabled, nextDeclaration) => {
          productRequest?.onComplete(enabled, nextDeclaration);
          setProductVatRelief(enabled, nextDeclaration);
        }}
        onVatReliefEnabledChange={setModalEnabled}
        open={modalOpen}
        price={modalPrice}
        subtitle={modalSubtitle}
        title={modalTitle}
        vatReliefEnabled={modalEnabled}
      />
    </VatReliefContext.Provider>
  );
}

export function useVatRelief() {
  const context = useContext(VatReliefContext);
  if (!context) {
    throw new Error('useVatRelief must be used within VatReliefProvider');
  }
  return context;
}
