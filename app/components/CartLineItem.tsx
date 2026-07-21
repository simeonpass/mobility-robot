import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, Money, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {useAside} from './Aside';
import {useConsent} from '~/components/ConsentBanner';
import {toGa4Item, trackRemoveFromCart} from '~/lib/analytics';
import {isAccessoryProduct, lineHasVatRelief} from '~/lib/cart-utils';
import {toCartAttributeInputs} from '~/lib/vat-relief-attributes';
import {getLineCatalogGross} from '~/lib/vat-relief';
import {
  getLineAmountDueToday,
  resolveLineSellingPlanAllocation,
} from '~/lib/selling-plans';
import {useVatRelief} from '~/components/vat-relief/VatReliefProvider';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {getProductDisplayName} from '~/lib/product-content';

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
  const {id, merchandise, quantity, attributes, cost} = line;
  const sellingPlanAllocation = resolveLineSellingPlanAllocation(line);
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const {analyticsAllowed} = useConsent();
  const lineItemChildren = childrenMap[id];
  const vatRelief = lineHasVatRelief(attributes);
  const accessory = isAccessoryProduct(product.handle);
  const displayName = getProductDisplayName(product.handle, product.title);
  const {openCartModal} = useVatRelief();
  const vatEligible = !accessory;
  const isAside = layout === 'aside';
  const isDepositLine = Boolean(sellingPlanAllocation?.sellingPlan?.id);
  const depositPlanName = sellingPlanAllocation?.sellingPlan?.name;
  const dueTodayAmount = getLineAmountDueToday(line);
  const lineTotalMoney = {
    amount: String(
      isDepositLine
        ? dueTodayAmount
        : getLineCatalogGross({quantity, merchandise, cost, attributes}),
    ),
    currencyCode: merchandise.price.currencyCode,
  };

  return (
    <li className="list-none">
      <div
        className={[
          'rounded-xl border border-border bg-card',
          isAside ? 'p-3 shadow-sm' : 'p-4 shadow-sm',
        ].join(' ')}
      >
        <div className="flex items-start gap-2.5">
          {image ? (
            <Link
              className={[
                'relative shrink-0 overflow-hidden rounded-md border border-border/60 bg-background',
                isAside ? 'size-14' : 'size-24 sm:size-28',
              ].join(' ')}
              onClick={() => isAside && close()}
              prefetch="intent"
              to={lineItemUrl}
            >
              <Image
                alt={title}
                className="size-full object-contain p-1.5"
                data={image}
                height={isAside ? 64 : 112}
                loading="lazy"
                width={isAside ? 64 : 112}
              />
            </Link>
          ) : null}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {accessory ? 'Accessory' : product.vendor || 'XSTO'}
                </p>
                <Link
                  className={[
                    'mt-0.5 block font-semibold leading-tight text-foreground hover:text-gold',
                    isAside ? 'text-sm' : 'text-base sm:text-lg',
                  ].join(' ')}
                  onClick={() => isAside && close()}
                  prefetch="intent"
                  to={lineItemUrl}
                >
                  {displayName}
                </Link>
                {title !== product.title && title !== 'Default Title' ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{title}</p>
                ) : null}
                {!isDepositLine ? (
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    <Money data={merchandise.price} /> each
                  </div>
                ) : null}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {isDepositLine ? 'Due today' : 'Total'}
                </p>
                <div className="mt-0.5 text-base font-semibold text-foreground">
                  <Money data={lineTotalMoney} />
                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {vatRelief ? (
                <span className="rounded-full bg-vat-price/15 px-2 py-0.5 text-[10px] font-semibold text-vat-price">
                  VAT relief applied
                </span>
              ) : null}
              {isDepositLine ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-950">
                  {depositPlanName && /deposit/i.test(depositPlanName)
                    ? depositPlanName
                    : '10% deposit'}
                </span>
              ) : null}
              {selectedOptions.map((option) =>
                option.value === 'Default Title' ? null : (
                  <span
                    className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground"
                    key={option.name}
                  >
                    {option.name}: {option.value}
                  </span>
                ),
              )}
            </div>

            {isDepositLine ? (
              <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
                Deposit due today
                {sellingPlanAllocation?.checkoutChargeAmount?.amount ? (
                  <>
                    {' '}
                    (
                    <Money
                      data={{
                        amount:
                          sellingPlanAllocation.checkoutChargeAmount.amount,
                        currencyCode: merchandise.price.currencyCode,
                      }}
                    />
                    )
                  </>
                ) : null}
                . Balance due before dispatch
                {sellingPlanAllocation?.remainingBalanceChargeAmount?.amount ? (
                  <>
                    {' '}
                    (
                    <Money
                      data={{
                        amount:
                          sellingPlanAllocation.remainingBalanceChargeAmount
                            .amount,
                        currencyCode: merchandise.price.currencyCode,
                      }}
                    />
                    )
                  </>
                ) : null}
                .
              </p>
            ) : null}

            {vatEligible ? (
              <button
                className={
                  vatRelief
                    ? 'mt-2 text-xs font-medium text-vat-price underline-offset-2 hover:underline'
                    : 'mt-2 inline-flex items-center rounded-md border border-vat-price/35 bg-vat-price/10 px-2.5 py-1 text-xs font-semibold text-vat-price transition-colors hover:bg-vat-price/15'
                }
                onClick={() =>
                  openCartModal({
                    lines: [
                      {id, quantity, attributes, productTitle: product.title},
                    ],
                    price: merchandise.price,
                    title: vatRelief
                      ? 'Edit VAT declaration'
                      : 'Claim HMRC VAT relief',
                    subtitle: product.title,
                    initialEnabled: vatRelief,
                  })
                }
                type="button"
              >
                {vatRelief ? 'Edit VAT declaration' : 'Claim VAT relief — save 20%'}
              </button>
            ) : null}

            <CartLineQuantity
              compact={isAside}
              line={line}
              onRemove={() => {
                if (!analyticsAllowed) return;
                trackRemoveFromCart(
                  toGa4Item({
                    id: merchandise.id,
                    title: product.title,
                    price: merchandise.price.amount,
                    quantity,
                  }),
                  merchandise.price.currencyCode,
                );
              }}
            />
          </div>
        </div>
      </div>

      {lineItemChildren ? (
        <ul className="ml-3 mt-2 space-y-2 border-l border-border pl-3">
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
  compact = false,
}: {
  line: CartLine;
  onRemove?: () => void;
  compact?: boolean;
}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic, attributes} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div
      className={[
        'flex items-center justify-between gap-2 border-t border-border/50',
        compact ? 'mt-2 pt-2' : 'mt-4 pt-4',
      ].join(' ')}
    >
      <div className="flex items-center gap-1.5">
        <CartLineUpdateButton
          attributes={attributes}
          lineId={lineId}
          quantity={prevQuantity}
        >
          <button
            aria-label="Decrease quantity"
            className={[
              'inline-flex items-center justify-center rounded-md border border-border text-foreground hover:border-gold disabled:opacity-40',
              compact ? 'size-7 text-sm' : 'size-9',
            ].join(' ')}
            disabled={quantity <= 1 || !!isOptimistic}
            type="submit"
          >
            −
          </button>
        </CartLineUpdateButton>
        <span className="min-w-6 text-center text-sm font-semibold">
          {quantity}
        </span>
        <CartLineUpdateButton
          attributes={attributes}
          lineId={lineId}
          quantity={nextQuantity}
        >
          <button
            aria-label="Increase quantity"
            className={[
              'inline-flex items-center justify-center rounded-md border border-border text-foreground hover:border-gold disabled:opacity-40',
              compact ? 'size-7 text-sm' : 'size-9',
            ].join(' ')}
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
        className="text-xs text-muted-foreground hover:text-destructive disabled:opacity-40"
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
  lineId,
  quantity,
  attributes,
}: {
  children: React.ReactNode;
  lineId: string;
  quantity: number;
  attributes?: CartLine['attributes'];
}) {
  const lines: CartLineUpdateInput[] = [
    {
      id: lineId,
      quantity,
      attributes: toCartAttributeInputs(attributes),
    },
  ];
  const lineIds = [lineId];

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
