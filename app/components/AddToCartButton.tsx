import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {useEffect, useRef} from 'react';
import type {FetcherWithComponents} from 'react-router';
import {useConsent} from '~/components/ConsentBanner';
import {useCartFeedback} from '~/components/CartFeedback';
import {toGa4Item, trackAddToCart} from '~/lib/analytics';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  className = 'btn-accent',
  pendingLabel = 'Adding…',
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  className?: string;
  /** Label shown while the cart request is in flight. */
  pendingLabel?: string;
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

  // Remount when merchandise / selling plan changes so the hidden CartForm
  // payload cannot linger on a stale full-pay line after choosing deposit.
  const formKey = lines
    .map(
      (line) =>
        `${line.merchandiseId}:${line.sellingPlanId ?? ''}:${line.quantity ?? 1}`,
    )
    .join('|');

  return (
    <CartForm
      key={formKey || 'empty'}
      route="/cart"
      inputs={{lines}}
      action={CartForm.ACTIONS.LinesAdd}
    >
      {(fetcher) => (
        <AddToCartSubmit
          analytics={analytics}
          className={className}
          disabled={disabled}
          fetcher={fetcher}
          lines={lines}
          onClick={handleClick}
          pendingLabel={pendingLabel}
        >
          {children}
        </AddToCartSubmit>
      )}
    </CartForm>
  );
}

function AddToCartSubmit({
  analytics,
  children,
  className,
  disabled,
  fetcher,
  lines,
  onClick,
  pendingLabel,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  className: string;
  disabled?: boolean;
  fetcher: FetcherWithComponents<unknown>;
  lines: Array<OptimisticCartLineInput>;
  onClick: () => void;
  pendingLabel: string;
}) {
  const {notifyAdded} = useCartFeedback();
  const wasSubmitting = useRef(false);
  const pending = fetcher.state !== 'idle';

  useEffect(() => {
    if (fetcher.state === 'submitting' || fetcher.state === 'loading') {
      wasSubmitting.current = true;
      return;
    }

    if (fetcher.state === 'idle' && wasSubmitting.current) {
      wasSubmitting.current = false;
      const variant = lines[0]?.selectedVariant as
        | {
            product?: {title?: string};
            image?: {url?: string | null} | null;
          }
        | undefined;
      const title = variant?.product?.title?.trim() || 'Item';
      const quantity = lines.reduce(
        (sum, line) => sum + (line.quantity ?? 1),
        0,
      );

      notifyAdded({
        title,
        quantity,
        imageUrl: variant?.image?.url ?? null,
      });
    }
  }, [fetcher.state, lines, notifyAdded]);

  return (
    <>
      <input
        name="analytics"
        type="hidden"
        value={JSON.stringify(analytics)}
      />
      <button
        aria-busy={pending}
        className={`${className} w-full disabled:cursor-not-allowed disabled:opacity-60`}
        disabled={disabled ?? pending}
        onClick={onClick}
        type="submit"
      >
        {pending ? pendingLabel : children}
      </button>
    </>
  );
}
