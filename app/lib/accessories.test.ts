import {describe, expect, it} from 'vitest';
import {
  formatCompatibilityLabel,
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
    ).toEqual(['xsto-x12', 'xsto-x12-pro']);
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

  it('keeps CT420 joystick off chair sections', () => {
    expect(
      resolveAccessoryCompatibility({
        handle: 'ct420-handle-joystick-knob',
        title: 'CT420 Handle Joystick Knob',
      }),
    ).toEqual([]);
  });

  it('maps new Pro/X12 phone holder', () => {
    expect(
      resolveAccessoryCompatibility({
        handle: 'phone-holder-m4-pro-x12',
        title: 'Mobile Phone Holder — M4 Pro & X12',
      }),
    ).toEqual(['xsto-m4-pro', 'xsto-x12', 'xsto-x12-pro']);
  });

  it('detects M4 Pro from title', () => {
    expect(
      resolveAccessoryCompatibility({
        handle: 'some-cushion',
        title: 'Seat Cushion Large M4 Pro',
      }),
    ).toEqual(['xsto-m4-pro']);
  });

  it('formats multi-chair labels', () => {
    expect(
      formatCompatibilityLabel(['xsto-m4', 'xsto-m4b', 'xsto-m4-pro']),
    ).toBe('Fits M4, M4B & M4 Pro');
  });

  it('labels empty compatibility as spare / other', () => {
    expect(formatCompatibilityLabel([])).toBe('Spare / other');
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
