import {describe, expect, it} from 'vitest';
import {getSearchModelHandle, urlWithTrackingParams} from './search';

describe('product search', () => {
  it('preserves spaces, ampersands and non-ASCII characters in search links', () => {
    const term = 'M4 Pro & café';
    const url = urlWithTrackingParams({baseUrl: '/search', term, trackingParams: 'source=predictive'});
    const params = new URL(url, 'https://mobilityrobot.co.uk').searchParams;
    expect(params.get('q')).toBe(term);
    expect(params.get('source')).toBe('predictive');
  });
  it('finds the actual chair for exact model searches', () => {
    expect(getSearchModelHandle('M4')).toBe('buy-robot-wheelchair');
    expect(getSearchModelHandle(' XSTO M4 Pro ')).toBe('xsto-m4-pro');
    expect(getSearchModelHandle('m4b')).toBe('xsto-m4b-1');
    expect(getSearchModelHandle('X12 Pro')).toBe('x12-all-terrain-mobility-robot');
  });
  it('keeps accessory searches focused on the requested accessory', () => {
    expect(getSearchModelHandle('M4 battery')).toBeNull();
    expect(getSearchModelHandle('M4 headrest')).toBeNull();
    expect(getSearchModelHandle('')).toBeNull();
  });
});
