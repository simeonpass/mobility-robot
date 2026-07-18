import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {useAside} from './Aside';
import {useConsent} from '~/components/ConsentBanner';
import {toGa4Item, trackRemoveFromCart} from '~/lib/analytics';
import {
  getLineDisplayAmount,
  isAccessoryProduct,
  lineHasVatRelief,
} from '~/lib/cart-utils';
import {formatProductPrice} from '~/lib/product-pricing';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise, quantity, attributes} = line;
  const {product, title, image, selectedOptions, price} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const {analyticsAllowed} = useConsent();
  const lineItemChildren = childrenMap[id];
  const vatRelief = lineHasVatRelief(attributes);
  const unitAmount = getLineDisplayAmount({
    amount: price.amount,
    currencyCode: price.currencyCode,
    vatRelief,
  });
  const lineTotal = getLineDisplayAmount({
    amount: line.cost?.totalAmount?.amount ?? price.amount,
    currencyCode: price.currencyCode,
    vatRelief,
  });
  const accessory = isAccessoryProduct(product.handle);

  return (
    <li className="list-none">
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
        <div className="flex items-start gap-4">
          {image ? (
            <Link
              className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-background sm:size-28"
              onClick={() => layout === 'aside' && close()}
              prefetch="intent"
              to={lineItemUrl}
            >
              <Image
                alt={title}
                className="size-full object-contain p-2"
                data={image}
                height={112}
                loading="lazy"
                width={112}
              />
            </Link>
          ) : null}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {accessory ? 'Accessory' : product.vendor || 'XSTO'}
                </p>
                <Link
                  className="mt-1 block text-base font-semibold leading-tight text-foreground hover:text-gold sm:text-lg"
                  onClick={() => layout === 'aside' && close()}
                  prefetch="intent"
                  to={lineItemUrl}
                >
                  {product.title}
                </Link>
                {title !== product.title && title !== 'Default Title' ? (
                  <p className="mt-1 text-sm text-muted-foreground">{title}</p>
                ) : null}
                <p
                  className={[
                    'mt-1 text-sm',
                    vatRelief ? 'font-medium text-vat-price' : 'text-muted-foreground',
                  ].join(' ')}
                >
                  {unitAmount} each
                  {vatRelief ? ' · ex. VAT' : ''}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Total
                </p>
                <p
                  className={[
                    'mt-1 text-lg font-semibold',
                    vatRelief ? 'text-vat-price' : 'text-foreground',
                  ].join(' ')}
                >
                  {lineTotal}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {vatRelief ? (
                <span className="rounded-full border border-vat-price/30 bg-vat-price/10 px-2 py-0.5 text-[10px] font-medium text-vat-price">
                  VAT Free
                </span>
              ) : null}
              {selectedOptions.map((option) =>
                option.value === 'Default Title' ? null : (
                  <span
                    className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                    key={option.name}
                  >
                    {option.name}: {option.value}
                  </span>
                ),
              )}
            </div>

            <CartLineQuantity
          line={line}
          onRemove={() => {
            if (!analyticsAllowed) return;
            trackRemoveFromCart(
              toGa4Item({
                id: merchandise.id,
                title: product.title,
                price: price.amount,
                quantity,
              }),
              price.currencyCode,
            );
          }}
        />
          </div>
        </div>
      </div>

      {lineItemChildren ? (
        <ul className="ml-4 mt-3 space-y-3 border-l border-border pl-4">
          {lineItemChildren.map((childLine) => (
            <CartLineItem
              childrenMap={childrenMap}
              key={childLine.id}
              layout={layout}
              line={childLine}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function CartLineQuantity({
  line,
  onRemove,
}: {
  line: CartLine;
  onRemove?: () => void;
}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/50 pt-4">
      <div className="flex items-center gap-2">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            aria-label="Decrease quantity"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-foreground hover:border-gold disabled:opacity-40"
            disabled={quantity <= 1 || !!isOptimistic}
            type="submit"
          >
            −
          </button>
        </CartLineUpdateButton>
        <span className="min-w-8 text-center text-sm font-semibold">
          {quantity}
        </span>
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            aria-label="Increase quantity"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-foreground hover:border-gold disabled:opacity-40"
            disabled={!!isOptimistic}
            type="submit"
          >
            +
          </button>
        </CartLineUpdateButton>
      </div>
      <CartLineRemoveButton
        disabled={!!isOptimistic}
        lineIds={[lineId]}
        onRemove={onRemove}
      />
    </div>
  );
}

function CartLineRemoveButton({
  lineIds,
  disabled,
  onRemove,
}: {
  lineIds: string[];
  disabled: boolean;
  onRemove?: () => void;
}) {
  return (
    <CartForm
      action={CartForm.ACTIONS.LinesRemove}
      fetcherKey={getUpdateKey(lineIds)}
      inputs={{lineIds}}
      route="/cart"
    >
      <button
        className="text-sm text-muted-foreground hover:text-destructive disabled:opacity-40"
        disabled={disabled}
        onClick={onRemove}
        type="submit"
      >
        Remove
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      action={CartForm.ACTIONS.LinesUpdate}
      fetcherKey={getUpdateKey(lineIds)}
      inputs={{lines}}
      route="/cart"
    >
      {children}
    </CartForm>
  );
}

function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
