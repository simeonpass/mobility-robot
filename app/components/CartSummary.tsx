import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, type OptimisticCart} from '@shopify/hydrogen';
import {useId} from 'react';
import {Link} from 'react-router';
import {useConsent} from '~/components/ConsentBanner';
import {toGa4Item, trackBeginCheckout} from '~/lib/analytics';
import {withOnlineStoreChannel, isAccessoryProduct, lineHasVatRelief} from '~/lib/cart-utils';
import {getCartDeliveryInfo} from '~/lib/product-delivery';
import {formatProductPrice} from '~/lib/product-pricing';
import {getCartTotals} from '~/lib/vat-relief';
import {useVatRelief} from '~/components/vat-relief/VatReliefProvider';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const isAside = layout === 'aside';
  const summaryId = useId();
  const discountCodeInputId = useId();
  const {analyticsAllowed} = useConsent();
  const totals = getCartTotals(cart);
  const currencyCode =
    cart?.cost?.subtotalAmount?.currencyCode ??
    cart?.cost?.totalAmount?.currencyCode ??
    'GBP';
  const checkoutUrl = cart?.checkoutUrl
    ? withOnlineStoreChannel(cart.checkoutUrl)
    : null;
  const cartLines = cart?.lines?.nodes ?? [];
  const delivery = getCartDeliveryInfo(cartLines);
  const {openCartModal} = useVatRelief();
  const vatEligibleLines = cartLines.filter(
    (line) =>
      !isAccessoryProduct(line.merchandise.product.handle) &&
      !('parentRelationship' in line && line.parentRelationship?.parent),
  );
  const linesWithoutVatRelief = vatEligibleLines.filter(
    (line) => !lineHasVatRelief(line.attributes),
  );
  const showCartVatPrompt = linesWithoutVatRelief.length > 0;

  const applicableCodes =
    cart?.discountCodes
      ?.filter((discount) => discount.applicable)
      .map(({code}) => code) ?? [];

  const openBulkVatModal = () => {
    openCartModal({
      lines: linesWithoutVatRelief.map((line) => ({
        id: line.id,
        quantity: line.quantity,
        attributes: line.attributes,
        productTitle: line.merchandise.product.title,
      })),
      title: 'Claim HMRC VAT relief',
      subtitle:
        linesWithoutVatRelief.length === 1
          ? linesWithoutVatRelief[0]?.merchandise.product.title
          : `${linesWithoutVatRelief.length} eligible items in your cart`,
      initialEnabled: true,
    });
  };

  const vatReliefPrompt = showCartVatPrompt ? (
    <button
      className="mb-3 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-left text-sm transition-colors hover:border-foreground/20"
      onClick={openBulkVatModal}
      type="button"
    >
      <span className="block font-medium text-foreground">
        Claim HMRC VAT relief
      </span>
      <span className="mt-0.5 block text-xs text-muted-foreground">
        Eligible on {linesWithoutVatRelief.length}{' '}
        {linesWithoutVatRelief.length === 1 ? 'item' : 'items'} — save 20% VAT
      </span>
    </button>
  ) : null;

  const totalsSection = totals ? (
    <div className="space-y-1.5 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">
          {totals.hasDeposit ? 'Due today' : 'Subtotal (inc. VAT)'}
        </span>
        <span className="font-medium text-foreground">
          {formatProductPrice(totals.subtotalIncVat, currencyCode, {
            fractionDigits: 2,
          })}
        </span>
      </div>

      {totals.hasDeposit ? (
        <p className="text-xs text-muted-foreground">
          Remaining balance is due before dispatch.
        </p>
      ) : null}

      {totals.hasVatRelief && totals.vatRemoved > 0 ? (
        <div className="flex justify-between text-foreground">
          <span>VAT relief</span>
          <span>
            −
            {formatProductPrice(totals.vatRemoved, currencyCode, {
              fractionDigits: 2,
            })}
          </span>
        </div>
      ) : null}

      {applicableCodes.length > 0 ? (
        <div className="flex justify-between text-muted-foreground">
          <span>Discount{applicableCodes.length > 1 ? 's' : ''}</span>
          <span>{applicableCodes.join(', ')}</span>
        </div>
      ) : null}

      <div className="flex justify-between">
        <span className="text-muted-foreground">Shipping</span>
        <span className="font-medium text-foreground">FREE</span>
      </div>
    </div>
  ) : null;

  const checkoutSection = checkoutUrl ? (
    <a
      className="btn-checkout w-full flex-col gap-0.5 py-3.5 !text-white no-underline hover:!text-white"
      href={checkoutUrl}
      onClick={() => {
        if (!analyticsAllowed || !cart?.lines?.nodes?.length || !totals) return;
        const items = cart.lines.nodes.map((line) =>
          toGa4Item({
            id: line.merchandise.id,
            title: line.merchandise.product.title,
            price: line.merchandise.price.amount,
            quantity: line.quantity,
          }),
        );
        trackBeginCheckout(items, totals.total, currencyCode);
      }}
    >
      <span className="text-white">Proceed to checkout</span>
      {totals ? (
        <span className="text-sm font-semibold text-white/95">
          {formatProductPrice(totals.total, currencyCode, {fractionDigits: 2})}
        </span>
      ) : null}
    </a>
  ) : null;

  if (isAside) {
    return (
      <div
        aria-labelledby={summaryId}
        className="shrink-0 border-t border-border bg-background px-4 py-3"
      >
        <h3 className="sr-only" id={summaryId}>
          Cart totals
        </h3>

        {vatReliefPrompt}

        {totals?.hasVatRelief ? (
          <p className="mb-2 text-xs text-muted-foreground">
            VAT relief applied — no VAT charged when you check out with your
            declaration email (sign in if you have an account).
          </p>
        ) : null}

        {totalsSection}

        <div className="mt-3 flex justify-between border-t border-border pt-3">
          <span className="text-base font-semibold text-foreground">
            {totals?.hasDeposit
              ? 'Due today'
              : totals?.isEstimated
                ? 'Estimated total'
                : 'Total'}
          </span>
          <span className="text-base font-semibold text-foreground">
            {totals
              ? formatProductPrice(totals.total, currencyCode, {fractionDigits: 2})
              : '—'}
          </span>
        </div>
        {totals?.isEstimated && !totals.hasDeposit ? (
          <p className="mt-1 text-[11px] text-muted-foreground">
            {totals.hasVatRelief
              ? 'Ex VAT on relief items; VAT confirmed at checkout.'
              : 'Includes estimated 20% VAT; confirmed at checkout.'}
          </p>
        ) : null}

        <div className="mt-3 space-y-2">
          {checkoutSection}
          <p className="text-center text-[11px] text-muted-foreground">
            Secure Shopify checkout
          </p>
        </div>
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

      <div className="space-y-4">
        <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Estimated UK delivery
          </p>
          <p className="text-sm font-medium text-foreground">{delivery.headline}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{delivery.etaLabel}</p>
        </div>

        {totals?.hasVatRelief ? (
          <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm">
            <p className="font-medium text-foreground">VAT relief on eligible items</p>
            <p className="mt-1 text-muted-foreground">
              You pay the ex-VAT catalog price. At checkout, tax is waived for
              your declaration email —{' '}
              <Link
                className="font-medium text-foreground hover:underline"
                to="/account/login"
              >
                sign in
              </Link>{' '}
              with that email if you have an account.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-secondary/30 p-3">
            <p className="text-sm font-medium text-foreground">VAT relief available</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Claim HMRC VAT relief on eligible mobility products in your cart.
            </p>
            {showCartVatPrompt ? (
              <button
                className="mt-2 text-sm font-medium text-foreground underline-offset-2 hover:underline"
                onClick={openBulkVatModal}
                type="button"
              >
                Open VAT relief declaration
              </button>
            ) : null}
          </div>
        )}

        {totalsSection}

        <CartDiscounts
          applicableCodes={applicableCodes}
          discountCodeInputId={discountCodeInputId}
        />

        <div className="flex justify-between border-t border-border pt-4">
          <span className="text-lg font-semibold text-foreground">
            {totals?.hasDeposit
              ? 'Due today'
              : totals?.isEstimated
                ? 'Estimated total'
                : 'Total'}
          </span>
          <span className="text-lg font-semibold text-foreground">
            {totals
              ? formatProductPrice(totals.total, currencyCode, {fractionDigits: 2})
              : '—'}
          </span>
        </div>
        {totals?.isEstimated && !totals.hasDeposit ? (
          <p className="text-xs text-muted-foreground">
            {totals.hasVatRelief
              ? 'Ex VAT on relief items; VAT confirmed at checkout.'
              : 'Includes estimated 20% VAT; confirmed at checkout.'}
          </p>
        ) : null}

        <p className="text-xs text-muted-foreground">
          Secure Shopify checkout · Full UK warranty &amp; support
        </p>

        {checkoutSection}
      </div>
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
          <UpdateDiscountForm discountCodes={applicableCodes}>
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

      <UpdateDiscountForm discountCodes={applicableCodes}>
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
