import {describe, expect, it} from 'vitest';
import {
  formatCompatibilityLabel,
  accessoryFitsX12,
  prioritizeAccessoryAddons,
  resolveAccessoryCompatibility,
} from '~/lib/accessories';

describe('resolveAccessoryCompatibility', () => {
  it('prefers curated handle map over incomplete tags', () => {
    expect(
      resolveAccessoryCompatibility({
        handle: 'rear-cover-m4',
        title: 'Rear Cover — M4',
        tags: ['rear-cover', 'm4', 'colour', 'accessory'],
      }),
    ).toEqual(['xsto-m4', 'xsto-m4b']);
  });

  it('uses Shopify tags when no curated handle match', () => {
    expect(
      resolveAccessoryCompatibility({
        handle: 'mystery-part',
        title: 'Mystery Part',
        tags: ['compatible-x12', 'compatible-x12-pro'],
      }),
    ).toEqual(['xsto-x12']);
  });

  it('uses curated handle map', () => {
    expect(
      resolveAccessoryCompatibility({
        handle: 'armrest-bag',
        title: 'Armrest Bag',
      }),
    ).toEqual(['xsto-m4', 'xsto-m4b']);
  });

  it('maps high back rest / neck support to M4 and M4B only', () => {
    expect(
      resolveAccessoryCompatibility({
        handle: 'ergonomic-chairs-for-back-support',
        title: 'High Back Rest & Neck Support Cushion',
      }),
    ).toEqual(['xsto-m4', 'xsto-m4b']);
  });

  it('detects M4 Pro from title', () => {
    expect(
      resolveAccessoryCompatibility({
        handle: 'some-cushion',
        title: 'Seat Cushion Large M4 Pro',
      }),
    ).toEqual(['xsto-m4-pro']);
  });

  it('maps live X12-shared accessories onto the X12 slot', () => {
    expect(
      resolveAccessoryCompatibility({
        handle: 'cooling-seat-cushion-m4-pro-x12',
        title: 'Cooling Seat Cushion — M4 Pro & X12, X12 Pro',
      }),
    ).toEqual(['xsto-m4-pro', 'xsto-x12']);
    expect(
      resolveAccessoryCompatibility({
        handle: 'x12-x12-pro-battery-25-2v-25-6ah',
        title: 'X12 & X12 Pro Battery — 25.2V 25.6Ah',
      }),
    ).toEqual(['xsto-x12']);
    expect(
      resolveAccessoryCompatibility({
        handle: 'adjustable-headrest-m4-pro',
        title: 'Adjustable Headrest — M4 Pro, X12, X12 Pro',
      }),
    ).toEqual(['xsto-m4-pro', 'xsto-x12']);
  });

  it('formats multi-chair labels', () => {
    expect(
      formatCompatibilityLabel(['xsto-m4', 'xsto-m4b', 'xsto-m4-pro']),
    ).toBe('Fits M4, M4B & M4 Pro');
  });
});

describe('accessoryFitsX12', () => {
  it('matches X12 accessories and shared X12 parts, not chairs or M4-only parts', () => {
    expect(accessoryFitsX12('cooling-seat-cushion-m4-pro-x12')).toBe(true);
    expect(accessoryFitsX12('cup-holder-for-all-models')).toBe(true);
    expect(accessoryFitsX12('adjustable-headrest-m4-pro')).toBe(true);
    expect(accessoryFitsX12('x12-all-terrain-mobility-robot')).toBe(false);
    expect(accessoryFitsX12('rear-cover-m4')).toBe(false);
  });
});

describe('prioritizeAccessoryAddons', () => {
  it('puts featured addons first', () => {
    expect(
      prioritizeAccessoryAddons([
        {handle: 'armrest-bag'},
        {handle: 'rear-cover-m4'},
        {handle: 'flashlight-holder'},
      ]).map((product) => product.handle),
    ).toEqual(['rear-cover-m4', 'armrest-bag', 'flashlight-holder']);
  });
});
