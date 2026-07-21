import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, type OptimisticCart} from '@shopify/hydrogen';
import {useId} from 'react';
import {Link} from 'react-router';
import {BadgePercent} from 'lucide-react';
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
  /**
   * Aside drawer can split scrollable body (VAT + totals) from a sticky
   * checkout footer so the cart always scrolls on mobile.
   */
  section?: 'body' | 'footer' | 'all';
};

export function CartSummary({
  cart,
  layout,
  section = 'all',
}: CartSummaryProps) {
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
      className="group mb-3 w-full rounded-xl border-2 border-vat-price/40 bg-vat-price/10 px-3.5 py-3.5 text-left shadow-sm transition-colors hover:border-vat-price hover:bg-vat-price/15"
      onClick={openBulkVatModal}
      type="button"
    >
      <span className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-vat-price text-white">
          <BadgePercent aria-hidden className="size-4" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-vat-price">
              Claim HMRC VAT relief
            </span>
            <span className="rounded-full bg-vat-price px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Save 20%
            </span>
          </span>
          <span className="mt-1 block text-xs leading-snug text-foreground/80">
            Eligible on {linesWithoutVatRelief.length}{' '}
            {linesWithoutVatRelief.length === 1 ? 'item' : 'items'} — tap to
            declare and remove VAT.
          </span>
        </span>
      </span>
    </button>
  ) : null;

  const totalsSection = totals ? (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between gap-3">
        <span className="text-muted-foreground">
          {totals.hasDeposit
            ? 'Due today'
            : totals.hasVatRelief
              ? 'Subtotal (inc. VAT)'
              : 'Subtotal'}
        </span>
        <span className="font-semibold tabular-nums text-foreground">
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
        <div className="flex justify-between gap-3 rounded-lg bg-vat-price/10 px-2.5 py-2 text-vat-price">
          <span className="font-medium">VAT relief</span>
          <span className="font-semibold tabular-nums">
            −
            {formatProductPrice(totals.vatRemoved, currencyCode, {
              fractionDigits: 2,
            })}
          </span>
        </div>
      ) : null}

      {applicableCodes.length > 0 ? (
        <div className="flex justify-between gap-3 text-muted-foreground">
          <span>Discount{applicableCodes.length > 1 ? 's' : ''}</span>
          <span>{applicableCodes.join(', ')}</span>
        </div>
      ) : null}

      <div className="flex justify-between gap-3">
        <span className="text-muted-foreground">Shipping</span>
        <span className="font-semibold text-foreground">FREE</span>
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
    if (section === 'footer') {
      return (
        <div className="cart-drawer-footer shrink-0 border-t border-border bg-background px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.18)]">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-foreground">
              {totals?.hasDeposit
                ? 'Due today'
                : totals?.hasVatRelief && !totals.vatReliefApplied
                  ? 'Estimated total'
                  : 'Total'}
            </span>
            <span className="text-lg font-bold tabular-nums text-foreground">
              {totals
                ? formatProductPrice(totals.total, currencyCode, {
                    fractionDigits: 2,
                  })
                : '—'}
            </span>
          </div>
          <div className="space-y-2">
            {checkoutSection}
            <p className="text-center text-[11px] text-muted-foreground">
              Secure Shopify checkout
            </p>
          </div>
        </div>
      );
    }

    // section === 'body' (or default for aside body usage)
    return (
      <div
        aria-labelledby={summaryId}
        className="rounded-xl border border-border bg-secondary/35 p-3.5"
      >
        <h3 className="sr-only" id={summaryId}>
          Cart totals
        </h3>

        {vatReliefPrompt}

        {totals?.hasVatRelief ? (
          <p className="mb-3 rounded-lg border border-vat-price/25 bg-vat-price/10 px-3 py-2 text-xs font-medium text-vat-price">
            VAT relief applied to eligible items.
            {!totals.vatReliefApplied
              ? ' Exact amount confirmed at checkout.'
              : null}
          </p>
        ) : null}

        {totalsSection}
      </div>
    );
  }

  return (
    <aside
      aria-labelledby={summaryId}
      className="h-fit rounded-xl border border-border bg-card p-6 shadow-soft"
    >
      <h3 className="mb-4 text-lg font-semibold text-foreground" id={summaryId}>
        Order summary
      </h3>

      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-secondary/50 p-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Estimated UK delivery
          </p>
          <p className="text-sm font-medium text-foreground">{delivery.headline}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{delivery.etaLabel}</p>
        </div>

        {totals?.hasVatRelief ? (
          <div className="rounded-lg border border-vat-price/30 bg-vat-price/10 p-3 text-sm">
            <p className="font-semibold text-vat-price">VAT relief on eligible items</p>
            <p className="mt-1 text-foreground/80">
              The exact VAT amount is removed automatically at checkout.
              <Link
                className="ml-1 font-medium text-foreground hover:underline"
                to="/account/login"
              >
                Sign in
              </Link>{' '}
              with the same email if you have an account.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-vat-price/35 bg-vat-price/10 p-3.5">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-vat-price text-white">
                <BadgePercent aria-hidden className="size-4" strokeWidth={2} />
              </span>
              <div>
                <p className="text-sm font-semibold text-vat-price">
                  VAT relief available
                </p>
                <p className="mt-0.5 text-xs text-foreground/80">
                  Claim HMRC VAT relief on eligible mobility products and save
                  20%.
                </p>
                {showCartVatPrompt ? (
                  <button
                    className="mt-2.5 inline-flex rounded-lg bg-vat-price px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:brightness-110"
                    onClick={openBulkVatModal}
                    type="button"
                  >
                    Claim VAT relief
                  </button>
                ) : null}
              </div>
            </div>
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
              : totals?.hasVatRelief && !totals?.vatReliefApplied
                ? 'Estimated total'
                : 'Total'}
          </span>
          <span className="text-lg font-semibold tabular-nums text-foreground">
            {totals
              ? formatProductPrice(totals.total, currencyCode, {fractionDigits: 2})
              : '—'}
          </span>
        </div>

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
        <div className="mb-2 flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm">
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
