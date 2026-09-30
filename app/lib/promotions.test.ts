import {describe, expect, it} from 'vitest';
import {
  getActivePromotions,
  promotionForHandle,
  promotionForSlot,
  PROMOTIONS,
} from '~/lib/promotions';

const during = new Date('2026-10-15T12:00:00Z');
const before = new Date('2026-09-20T12:00:00Z');
const after = new Date('2026-11-02T12:00:00Z');

describe('M4B October launch price', () => {
  it('runs from launch evening to 31 October 2026 (UK time) only', () => {
    expect(getActivePromotions(null, before)).toEqual([]);
    expect(getActivePromotions(null, after)).toEqual([]);
    expect(getActivePromotions(null, new Date('2026-09-30T21:29:59Z'))).toEqual([]);
    expect(getActivePromotions(null, new Date('2026-09-30T21:30:00Z'))).toHaveLength(1);
    expect(getActivePromotions(null, new Date('2026-10-31T23:59:59Z'))).toHaveLength(1);
    expect(getActivePromotions(null, new Date('2026-11-01T00:00:00Z'))).toEqual([]);
  });

  it('describes the saving both ways and names the model', () => {
    const [promotion] = getActivePromotions(null, during);
    expect(promotion.slot).toBe('xsto-m4b');
    expect(promotion.modelLabel).toBe('M4B');
    expect(promotion.savingExVatDisplay).toBe('£500');
    expect(promotion.savingIncVatDisplay).toBe('£600');
    expect(promotion.highlights).toEqual([
      'Improved folding footrest',
      'New front suspension',
    ]);
    expect(promotion.previewing).toBe(false);
  });

  it('can be previewed before it starts with ?promo=preview', () => {
    const request = new Request('https://mobilityrobot.co.uk/?promo=preview');
    const [promotion] = getActivePromotions(request, before);
    expect(promotion?.previewing).toBe(true);
    expect(getActivePromotions(request, after)).toEqual([]);
  });

  it('resolves by slot and by Shopify handle', () => {
    const live = getActivePromotions(null, during);
    expect(promotionForSlot(live, 'xsto-m4b')?.id).toBe(PROMOTIONS[0].id);
    expect(promotionForSlot(live, 'xsto-m4')).toBeNull();
    expect(promotionForHandle(live, 'xsto-m4b-1')?.id).toBe(PROMOTIONS[0].id);
    expect(promotionForHandle(live, 'buy-robot-wheelchair')).toBeNull();
  });
});
