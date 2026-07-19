import {formatProductPrice} from '~/lib/product-pricing';
import {
  exVatFromCatalog,
  incVatFromCatalog,
  roundMoney,
} from '~/lib/vat-math';

type MoneyLike = {
  amount: string;
  currencyCode?: string;
};

/** Stashed on selectedVariant → optimistic merchandise so cart UI can show deposit before the cart query returns. */
export const OPTIMISTIC_SELLING_PLAN_ALLOCATION_KEY =
  'optimisticSellingPlanAllocation' as const;

export type SellingPlanAllocationNode = {
  checkoutChargeAmount?: MoneyLike | null;
  remainingBalanceChargeAmount?: MoneyLike | null;
  priceAdjustments?: Array<{
    price?: MoneyLike | null;
    compareAtPrice?: MoneyLike | null;
  }> | null;
  sellingPlan: {
    id: string;
    name: string;
    description?: string | null;
    options?: Array<{
      name?: string | null;
      value?: string | null;
    }> | null;
  };
};

export type CartLineSellingPlanSource = {
  sellingPlanAllocation?: {
    checkoutChargeAmount?: MoneyLike | null;
    remainingBalanceChargeAmount?: MoneyLike | null;
    sellingPlan?: {
      id?: string | null;
      name?: string | null;
      description?: string | null;
    } | null;
  } | null;
  merchandise?: {
    price?: MoneyLike | null;
    [OPTIMISTIC_SELLING_PLAN_ALLOCATION_KEY]?: SellingPlanAllocationNode | null;
  } | null;
  cost?: {
    totalAmount?: MoneyLike | null;
    amountPerQuantity?: MoneyLike | null;
  } | null;
  quantity?: number | null;
};

export type PurchaseOption =
  | {kind: 'full'}
  | {
      kind: 'deposit';
      sellingPlanId: string;
      name: string;
      description?: string | null;
      checkoutCharge: MoneyLike;
      remainingBalance: MoneyLike | null;
      /** Display amount for the deposit (respects VAT-relief toggle when provided). */
      depositDisplay: string;
      remainingDisplay: string | null;
    };

/**
 * Pick the best deposit-style selling plan allocation for the UI.
 * Prefers plans whose name/options mention deposit / %, otherwise first allocation.
 */
export function pickDepositAllocation(
  allocations: SellingPlanAllocationNode[] | null | undefined,
): SellingPlanAllocationNode | null {
  if (!allocations?.length) return null;

  const scored = allocations.map((allocation) => {
    const haystack = [
      allocation.sellingPlan.name,
      allocation.sellingPlan.description ?? '',
      ...(allocation.sellingPlan.options?.map((o) => `${o.name} ${o.value}`) ??
        []),
    ]
      .join(' ')
      .toLowerCase();

    let score = 0;
    if (haystack.includes('deposit')) score += 3;
    if (haystack.includes('10%') || haystack.includes('10 %')) score += 2;
    if (haystack.includes('pre-order') || haystack.includes('preorder')) {
      score += 1;
    }
    return {allocation, score};
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.allocation ?? null;
}

export function getDepositChargeAmount(
  allocation: SellingPlanAllocationNode,
): MoneyLike | null {
  if (allocation.checkoutChargeAmount?.amount) {
    return allocation.checkoutChargeAmount;
  }
  const adjusted = allocation.priceAdjustments?.[0]?.price;
  return adjusted?.amount ? adjusted : null;
}

export function buildPurchaseOptions({
  allocations,
  vatReliefEnabled,
}: {
  allocations: SellingPlanAllocationNode[] | null | undefined;
  vatReliefEnabled: boolean;
}): PurchaseOption[] {
  const options: PurchaseOption[] = [{kind: 'full'}];
  const deposit = pickDepositAllocation(allocations);
  if (!deposit) return options;

  const checkoutCharge = getDepositChargeAmount(deposit);
  if (!checkoutCharge) return options;

  const remaining = deposit.remainingBalanceChargeAmount ?? null;

  const depositDisplay = formatChargeDisplay(checkoutCharge, vatReliefEnabled);
  const remainingDisplay = remaining
    ? formatChargeDisplay(remaining, vatReliefEnabled)
    : null;

  options.push({
    kind: 'deposit',
    sellingPlanId: deposit.sellingPlan.id,
    name: deposit.sellingPlan.name,
    description: deposit.sellingPlan.description,
    checkoutCharge,
    remainingBalance: remaining,
    depositDisplay,
    remainingDisplay,
  });

  return options;
}

/**
 * Selling-plan checkout charges are % of tax-exclusive catalog.
 * Relief path: show catalog deposit (ex VAT). Otherwise show inc VAT (× 1.2).
 */
function formatChargeDisplay(
  money: MoneyLike,
  vatReliefEnabled: boolean,
): string {
  const amount = vatReliefEnabled
    ? exVatFromCatalog(money.amount)
    : incVatFromCatalog(money.amount);
  return formatProductPrice(amount, money.currencyCode ?? 'GBP', {
    fractionDigits: 2,
  });
}

export function isDepositPurchaseOption(
  option: PurchaseOption,
): option is Extract<PurchaseOption, {kind: 'deposit'}> {
  return option.kind === 'deposit';
}

/**
 * Resolve selling-plan allocation from a cart line, including optimistic ATC
 * merchandise where Hydrogen has not yet returned `sellingPlanAllocation`.
 */
export function resolveLineSellingPlanAllocation(
  line: CartLineSellingPlanSource | null | undefined,
): SellingPlanAllocationNode | null {
  if (!line) return null;
  const live = line.sellingPlanAllocation;
  if (live?.sellingPlan?.id) {
    return {
      checkoutChargeAmount: live.checkoutChargeAmount ?? null,
      remainingBalanceChargeAmount: live.remainingBalanceChargeAmount ?? null,
      sellingPlan: {
        id: live.sellingPlan.id,
        name: live.sellingPlan.name ?? 'Deposit',
        description: live.sellingPlan.description ?? null,
      },
    };
  }
  const optimistic =
    line.merchandise?.[OPTIMISTIC_SELLING_PLAN_ALLOCATION_KEY] ?? null;
  return optimistic?.sellingPlan?.id ? optimistic : null;
}

export function isDepositCartLine(
  line: CartLineSellingPlanSource | null | undefined,
): boolean {
  return Boolean(resolveLineSellingPlanAllocation(line)?.sellingPlan?.id);
}

/**
 * Amount due at checkout for this line. Deposit / pre-order plans use
 * `checkoutChargeAmount` (Shopify cart `cost` stays at full catalog price).
 */
export function getLineAmountDueToday(
  line: CartLineSellingPlanSource,
): number {
  const allocation = resolveLineSellingPlanAllocation(line);
  const charge = allocation?.checkoutChargeAmount?.amount;
  if (charge != null && charge !== '') {
    return roundMoney(Number(charge));
  }
  const quantity = line.quantity ?? 1;
  const unit = Number(
    line.merchandise?.price?.amount ??
      line.cost?.amountPerQuantity?.amount ??
      0,
  );
  if (unit > 0) return roundMoney(unit * quantity);
  return roundMoney(Number(line.cost?.totalAmount?.amount ?? 0));
}

export function sumCartAmountDueToday(
  lines: CartLineSellingPlanSource[] | null | undefined,
): number {
  return roundMoney(
    (lines ?? []).reduce((sum, line) => sum + getLineAmountDueToday(line), 0),
  );
}

/**
 * Attach allocation onto selectedVariant so Hydrogen optimistic cart
 * (merchandise = selectedVariant) can show deposit before the server responds.
 */
export function withOptimisticSellingPlanAllocation<T>(
  variant: T,
  sellingPlanId: string | null | undefined,
): T {
  if (!variant || !sellingPlanId || typeof variant !== 'object') return variant;
  const nodes = (
    variant as {
      sellingPlanAllocations?: {nodes?: SellingPlanAllocationNode[] | null};
    }
  ).sellingPlanAllocations?.nodes;
  const allocation = nodes?.find(
    (node) => node.sellingPlan.id === sellingPlanId,
  );
  if (!allocation) return variant;
  return {
    ...variant,
    [OPTIMISTIC_SELLING_PLAN_ALLOCATION_KEY]: {
      checkoutChargeAmount: allocation.checkoutChargeAmount ?? null,
      remainingBalanceChargeAmount:
        allocation.remainingBalanceChargeAmount ?? null,
      sellingPlan: allocation.sellingPlan,
    },
  };
}
