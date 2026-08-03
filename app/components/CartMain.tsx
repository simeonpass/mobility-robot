import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};

function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const lineChildren = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(lineChildren)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}

export function CartMain({layout, cart: originalCart}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);
  const {close} = useAside();
  const isAside = layout === 'aside';

  const lines = cart?.lines?.nodes ?? [];
  const linesCount = lines.length > 0;
  const cartHasItems = (cart?.totalQuantity ?? 0) > 0;
  const childrenMap = getLineItemChildrenMap(lines);
  const itemCount = cart?.totalQuantity ?? 0;

  if (isAside) {
    return (
      <section
        aria-label="Cart drawer"
        className="cart-drawer flex h-full min-h-0 flex-col bg-background"
      >
        <div className="cart-drawer-header flex shrink-0 items-center gap-3 border-b border-border bg-secondary/50 px-4 py-3.5">
          <div className="flex size-10 items-center justify-center rounded-full bg-gold/15 ring-1 ring-gold/25">
            <CartIcon />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Your Cart
          </h2>
          <div className="ml-auto flex items-center gap-2.5">
            {cartHasItems ? (
              <span className="rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            ) : null}
            <button
              aria-label="Close cart"
              className="inline-flex size-10 items-center justify-center rounded-lg text-2xl leading-none text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              onClick={close}
              type="button"
            >
              ×
            </button>
          </div>
        </div>

        {!linesCount ? (
          <CartEmpty onContinue={close} variant="drawer" />
        ) : (
          <>
            {/*
              Single touch-scroll region for lines + totals/VAT.
              Checkout stays pinned so the body can always be flicked on mobile.
            */}
            <div className="cart-drawer-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-3">
              <ul className="space-y-3" aria-label="Cart line items">
                {lines.map((line) => {
                  if (
                    'parentRelationship' in line &&
                    line.parentRelationship?.parent
                  ) {
                    return null;
                  }
                  return (
                    <CartLineItem
                      childrenMap={childrenMap}
                      key={line.id}
                      layout={layout}
                      line={line}
                    />
                  );
                })}
              </ul>
              {cartHasItems && cart ? (
                <div className="mt-4 pb-2">
                  <CartSummary cart={cart} layout={layout} section="body" />
                </div>
              ) : null}
            </div>
            {cartHasItems && cart ? (
              <CartSummary cart={cart} layout={layout} section="footer" />
            ) : null}
          </>
        )}
      </section>
    );
  }

  return (
    <section aria-label="Cart page" className="mx-auto max-w-3xl">
      {!linesCount ? (
        <CartEmpty variant="page" />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <ul className="space-y-4" aria-label="Cart line items">
            {lines.map((line) => {
              if (
                'parentRelationship' in line &&
                line.parentRelationship?.parent
              ) {
                return null;
              }
              return (
                <CartLineItem
                  childrenMap={childrenMap}
                  key={line.id}
                  layout={layout}
                  line={line}
                />
              );
            })}
          </ul>
          {cartHasItems && cart ? (
            <CartSummary cart={cart} layout={layout} />
          ) : null}
        </div>
      )}
    </section>
  );
}

function CartIcon() {
  return (
    <svg
      aria-hidden
      className="size-5 text-gold"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
    >
      <path
        d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

function CartEmpty({
  onContinue,
  variant,
}: {
  onContinue?: () => void;
  variant: 'drawer' | 'page';
}) {
  const {close} = useAside();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-secondary ring-1 ring-border">
        <CartIcon />
      </div>
      <h3 className="text-xl font-semibold text-foreground">
        Your cart is empty
      </h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Add some products to get started with your order.
      </p>
      <Link
        className="mt-6 inline-flex rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-gold-light"
        onClick={() => {
          close();
          onContinue?.();
        }}
        prefetch="intent"
        to={variant === 'drawer' ? '/#product-range' : '/'}
      >
        Continue shopping
      </Link>
    </div>
  );
}
