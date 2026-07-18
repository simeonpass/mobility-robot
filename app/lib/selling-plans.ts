import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {formatProductPrice} from '~/lib/product-pricing';
import {exVatFromGross} from '~/lib/vat-math';

type MoneyLike = Pick<MoneyV2, 'amount' | 'currencyCode'>;

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
    options?: Array<{name: string; value: string}> | null;
  };
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

function formatChargeDisplay(
  money: MoneyLike,
  vatReliefEnabled: boolean,
): string {
  const amount = vatReliefEnabled
    ? exVatFromGross(money.amount)
    : Number(money.amount);
  return formatProductPrice(amount, money.currencyCode, {
    fractionDigits: 2,
  });
}

export function isDepositPurchaseOption(
  option: PurchaseOption,
): option is Extract<PurchaseOption, {kind: 'deposit'}> {
  return option.kind === 'deposit';
}
