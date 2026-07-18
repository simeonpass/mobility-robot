import {describe, expect, it} from 'vitest';
import {
  buildPurchaseOptions,
  pickDepositAllocation,
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
