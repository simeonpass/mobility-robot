import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useId} from 'react';
import {Link} from 'react-router';
import {useConsent} from '~/components/ConsentBanner';
import {toGa4Item, trackBeginCheckout} from '~/lib/analytics';
import {withOnlineStoreChannel} from '~/lib/cart-utils';
import {getDeliveryInfo} from '~/lib/product-delivery';
import {formatProductPrice} from '~/lib/product-pricing';
import {
  getVatReliefDiscountAmount,
  getVatReliefDiscountStatus,
  isVatReliefDiscountCode,
  VAT_RELIEF_DISCOUNT_CODE,
} from '~/lib/vat-relief-discount';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const isAside = layout === 'aside';
  const summaryId = useId();
  const discountCodeInputId = useId();
  const {analyticsAllowed} = useConsent();
  const vatReliefStatus = getVatReliefDiscountStatus(cart);
  const vatDiscountAmount = getVatReliefDiscountAmount(cart);
  const currencyCode =
    cart?.cost?.subtotalAmount?.currencyCode ??
    cart?.cost?.totalAmount?.currencyCode ??
    'GBP';
  const checkoutUrl = cart?.checkoutUrl
    ? withOnlineStoreChannel(cart.checkoutUrl)
    : null;
  const delivery = getDeliveryInfo({
    availableForSale: true,
    quantityAvailable: 1,
  });

  const applicableCodes =
    cart?.discountCodes
      ?.filter((discount) => discount.applicable)
      .map(({code}) => code) ?? [];

  const otherDiscountCodes = applicableCodes.filter(
    (code) => !isVatReliefDiscountCode(code),
  );

  const content = (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Estimated UK delivery
        </p>
        <p className="text-sm font-medium text-foreground">{delivery.headline}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{delivery.etaLabel}</p>
      </div>

      {vatReliefStatus.hasLine ? (
        <div className="rounded-lg border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">VAT relief declaration on file</p>
          <p className="mt-1">
            Proceed to checkout using the same email from your declaration.
            <Link className="ml-1 font-medium text-foreground hover:underline" to="/account/login">
              Sign in
            </Link>{' '}
            if you have an account — this helps Shopify apply your VAT-exempt
            customer status.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-vat-price/20 bg-vat-price/10 p-3">
          <p className="text-sm font-medium text-foreground">VAT relief available</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Select excluding VAT on the product page if you are eligible.
          </p>
        </div>
      )}

      {vatReliefStatus.hasLine &&
      vatReliefStatus.codeApplied &&
      !vatReliefStatus.codeApplicable ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-sm font-medium text-destructive">
            VAT relief discount could not be applied
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ensure the {VAT_RELIEF_DISCOUNT_CODE} discount is active in Shopify
            Admin, or contact us before checkout.
          </p>
        </div>
      ) : null}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>
            {cart?.cost?.subtotalAmount ? (
              <Money data={cart.cost.subtotalAmount} />
            ) : (
              '—'
            )}
          </span>
        </div>

        {vatReliefStatus.codeApplicable && vatDiscountAmount > 0 ? (
          <div className="flex justify-between font-medium text-vat-price">
            <span>VAT relief ({VAT_RELIEF_DISCOUNT_CODE})</span>
            <span>−{formatProductPrice(vatDiscountAmount, currencyCode)}</span>
          </div>
        ) : null}

        {otherDiscountCodes.length > 0 ? (
          <div className="flex justify-between text-muted-foreground">
            <span>Discount{otherDiscountCodes.length > 1 ? 's' : ''}</span>
            <span>{otherDiscountCodes.join(', ')}</span>
          </div>
        ) : null}

        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium text-vat-price">FREE</span>
        </div>
      </div>

      <CartDiscounts
        applicableCodes={otherDiscountCodes}
        discountCodeInputId={discountCodeInputId}
      />

      <div className="flex justify-between border-t border-border pt-4">
        <span className="text-lg font-semibold text-foreground">Total</span>
        <span className="text-lg font-semibold text-foreground">
          {cart?.cost?.totalAmount ? (
            <Money data={cart.cost.totalAmount} />
          ) : (
            '—'
          )}
        </span>
      </div>

      {vatReliefStatus.codeApplicable && vatDiscountAmount > 0 ? (
        <div className="rounded-lg border border-vat-price/20 bg-vat-price/10 p-3 text-center">
          <p className="text-sm font-medium text-vat-price">
            VAT relief applied — you&apos;re saving{' '}
            {formatProductPrice(vatDiscountAmount, currencyCode)}
          </p>
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Secure Shopify checkout · Full UK warranty &amp; support
      </p>

      {checkoutUrl ? (
        <a
          className="btn-atc w-full"
          href={checkoutUrl}
          onClick={() => {
            if (!analyticsAllowed || !cart?.lines?.nodes?.length) return;
            const items = cart.lines.nodes.map((line) =>
              toGa4Item({
                id: line.merchandise.id,
                title: line.merchandise.product.title,
                price: line.merchandise.price.amount,
                quantity: line.quantity,
              }),
            );
            trackBeginCheckout(
              items,
              Number(cart.cost?.totalAmount?.amount ?? 0),
              cart.cost?.totalAmount?.currencyCode ?? 'GBP',
            );
          }}
        >
          Proceed to checkout
          {cart?.cost?.totalAmount ? (
            <>
              {' '}
              — <Money data={cart.cost.totalAmount} />
            </>
          ) : null}
        </a>
      ) : null}
    </div>
  );

  if (isAside) {
    return (
      <div
        aria-labelledby={summaryId}
        className="shrink-0 border-t border-border bg-background px-6 py-4"
      >
        <h3 className="sr-only" id={summaryId}>
          Cart totals
        </h3>
        {content}
      </div>
    );
  }

  return (
    <aside
      aria-labelledby={summaryId}
      className="h-fit rounded-xl border border-border bg-card p-6"
    >
      <h3 className="mb-4 text-lg font-semibold text-foreground" id={summaryId}>
        Order summary
      </h3>
      {content}
    </aside>
  );
}

function CartDiscounts({
  applicableCodes,
  discountCodeInputId,
}: {
  applicableCodes: string[];
  discountCodeInputId: string;
}) {
  return (
    <section aria-label="Discount code">
      {applicableCodes.length > 0 ? (
        <div className="mb-2 flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm">
          <span>
            Code applied:{' '}
            <code className="font-medium text-foreground">
              {applicableCodes.join(', ')}
            </code>
          </span>
          <UpdateDiscountForm
            discountCodes={
              applicableCodes.filter((code) => isVatReliefDiscountCode(code))
            }
          >
            <button
              aria-label="Remove discount code"
              className="text-xs text-muted-foreground hover:text-foreground"
              type="submit"
            >
              Remove
            </button>
          </UpdateDiscountForm>
        </div>
      ) : null}

      <UpdateDiscountForm
        discountCodes={applicableCodes.filter((code) =>
          isVatReliefDiscountCode(code),
        )}
      >
        <div className="flex gap-2">
          <label className="sr-only" htmlFor={discountCodeInputId}>
            Discount code
          </label>
          <input
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            id={discountCodeInputId}
            name="discountCode"
            placeholder="Discount code (e.g. JENNI10)"
            type="text"
          />
          <button
            className="shrink-0 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-gold"
            type="submit"
          >
            Apply
          </button>
        </div>
      </UpdateDiscountForm>
    </section>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes ?? [],
      }}
      route="/cart"
    >
      {children}
    </CartForm>
  );
}
