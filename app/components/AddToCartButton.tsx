import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {useConsent} from '~/components/ConsentBanner';
import {toGa4Item, trackAddToCart} from '~/lib/analytics';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  className = 'btn-accent',
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  className?: string;
}) {
  const {analyticsAllowed} = useConsent();

  const handleClick = () => {
    const variant = lines[0]?.selectedVariant as
      | {
          id: string;
          product?: {title?: string};
          price?: {amount?: string; currencyCode?: string};
        }
      | undefined;

    if (analyticsAllowed && variant?.id) {
      trackAddToCart(
        toGa4Item({
          id: variant.id,
          title: variant.product?.title ?? 'Product',
          price: variant.price?.amount,
          quantity: lines[0]?.quantity ?? 1,
        }),
        variant.price?.currencyCode ?? 'GBP',
      );
    }
    onClick?.();
  };

  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <button
            className={`${className} w-full disabled:cursor-not-allowed disabled:opacity-60`}
            disabled={disabled ?? fetcher.state !== 'idle'}
            onClick={handleClick}
            type="submit"
          >
            {children}
          </button>
        </>
      )}
    </CartForm>
  );
}
