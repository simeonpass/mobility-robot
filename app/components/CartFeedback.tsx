import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {useAside} from '~/components/Aside';

export type CartFeedbackPayload = {
  title: string;
  quantity?: number;
  imageUrl?: string | null;
};

type CartFeedbackContextValue = {
  notifyAdded: (payload: CartFeedbackPayload) => void;
};

const CartFeedbackContext = createContext<CartFeedbackContextValue | null>(
  null,
);

const AUTO_DISMISS_MS = 4500;

export function CartFeedbackProvider({children}: {children: ReactNode}) {
  const [payload, setPayload] = useState<CartFeedbackPayload | null>(null);
  const [visible, setVisible] = useState(false);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {open} = useAside();
  const titleId = useId();

  const clearTimer = useCallback(() => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearTimer();
    setVisible(false);
  }, [clearTimer]);

  const notifyAdded = useCallback(
    (next: CartFeedbackPayload) => {
      clearTimer();
      setPayload(next);
      setVisible(true);
      dismissTimer.current = setTimeout(() => {
        setVisible(false);
      }, AUTO_DISMISS_MS);
    },
    [clearTimer],
  );

  useEffect(() => () => clearTimer(), [clearTimer]);

  return (
    <CartFeedbackContext.Provider value={{notifyAdded}}>
      {children}
      <div
        aria-atomic="true"
        aria-live="polite"
        className={[
          'cart-feedback',
          visible && payload ? 'cart-feedback--visible' : '',
        ].join(' ')}
      >
        {payload ? (
          <div
            aria-labelledby={titleId}
            className="cart-feedback__panel"
            role="status"
          >
            <div className="cart-feedback__media" aria-hidden>
              {payload.imageUrl ? (
                <img
                  alt=""
                  className="cart-feedback__image"
                  height={56}
                  src={payload.imageUrl}
                  width={56}
                />
              ) : (
                <span className="cart-feedback__check">✓</span>
              )}
            </div>
            <div className="cart-feedback__body">
              <p className="cart-feedback__eyebrow" id={titleId}>
                Added to cart
              </p>
              <p className="cart-feedback__title">
                {payload.quantity && payload.quantity > 1
                  ? `${payload.quantity} × ${payload.title}`
                  : payload.title}
              </p>
            </div>
            <div className="cart-feedback__actions">
              <button
                className="cart-feedback__view"
                onClick={() => {
                  dismiss();
                  open('cart');
                }}
                type="button"
              >
                View cart
              </button>
              <button
                aria-label="Dismiss"
                className="cart-feedback__close"
                onClick={dismiss}
                type="button"
              >
                ×
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </CartFeedbackContext.Provider>
  );
}

export function useCartFeedback() {
  const ctx = useContext(CartFeedbackContext);
  if (!ctx) {
    throw new Error('useCartFeedback must be used within CartFeedbackProvider');
  }
  return ctx;
}
