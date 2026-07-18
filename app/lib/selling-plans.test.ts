import {describe, expect, it} from 'vitest';
import {
  buildPurchaseOptions,
  getLineAmountDueToday,
  pickDepositAllocation,
  resolveLineSellingPlanAllocation,
  withOptimisticSellingPlanAllocation,
  type SellingPlanAllocationNode,
} from './selling-plans';

const depositAllocation = {
  checkoutChargeAmount: {amount: '399.50', currencyCode: 'GBP' as const},
  remainingBalanceChargeAmount: {
    amount: '3595.50',
    currencyCode: 'GBP' as const,
  },
  sellingPlan: {
    id: 'gid://shopify/SellingPlan/1',
    name: 'Pay 10% deposit',
    description: null,
    options: [{name: 'Payment', value: '10% deposit'}],
  },
} satisfies SellingPlanAllocationNode;

describe('pickDepositAllocation', () => {
  it('prefers deposit-named plans', () => {
    const other: SellingPlanAllocationNode = {
      ...depositAllocation,
      sellingPlan: {
        id: 'gid://shopify/SellingPlan/2',
        name: 'Subscribe monthly',
        options: [],
      },
    };
    expect(
      pickDepositAllocation([other, depositAllocation])?.sellingPlan.id,
    ).toBe('gid://shopify/SellingPlan/1');
  });
});

describe('buildPurchaseOptions', () => {
  it('always includes full pay and adds deposit when allocated', () => {
    const options = buildPurchaseOptions({
      allocations: [depositAllocation],
      vatReliefEnabled: false,
    });
    expect(options).toHaveLength(2);
    expect(options[0]).toEqual({kind: 'full'});
    expect(options[1]).toMatchObject({
      kind: 'deposit',
      sellingPlanId: 'gid://shopify/SellingPlan/1',
      depositDisplay: '£399.50',
    });
  });

  it('returns only full pay when no allocations', () => {
    expect(
      buildPurchaseOptions({allocations: [], vatReliefEnabled: false}),
    ).toEqual([{kind: 'full'}]);
  });
});

describe('deposit cart amount helpers', () => {
  it('uses checkoutChargeAmount as amount due today', () => {
    expect(
      getLineAmountDueToday({
        quantity: 1,
        merchandise: {price: {amount: '3995.0', currencyCode: 'GBP'}},
        sellingPlanAllocation: depositAllocation,
      }),
    ).toBe(399.5);
  });

  it('falls back to catalog price without a selling plan', () => {
    expect(
      getLineAmountDueToday({
        quantity: 2,
        merchandise: {price: {amount: '100.00', currencyCode: 'GBP'}},
      }),
    ).toBe(200);
  });

  it('resolves optimistic allocation from merchandise stash', () => {
    const variant = withOptimisticSellingPlanAllocation(
      {
        sellingPlanAllocations: {nodes: [depositAllocation]},
      },
      'gid://shopify/SellingPlan/1',
    ) as {
      optimisticSellingPlanAllocation?: SellingPlanAllocationNode;
    };
    const allocation = resolveLineSellingPlanAllocation({
      merchandise: variant,
    });
    expect(allocation?.sellingPlan.id).toBe('gid://shopify/SellingPlan/1');
    expect(getLineAmountDueToday({merchandise: variant, quantity: 1})).toBe(
      399.5,
    );
  });
});
