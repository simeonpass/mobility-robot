import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

const styles = [
  'app',
  'brand-shell',
  'home-redesign',
  'product-redesign',
  'hero-motion',
  'discovery',
].map((name) => readFileSync(`app/styles/${name}.css`, 'utf8'));

function tokenRgb(name: string) {
  const value = styles[0].match(
    new RegExp(`--brand-${name}-hsl: ([^;]+)`),
  )?.[1];
  if (!value) throw new Error(`Missing palette token: ${name}`);
  const [h, s, l] = value.split(' ').map(parseFloat);
  const saturation = s / 100;
  const lightness = l / 100;
  const a = saturation * Math.min(lightness, 1 - lightness);
  return [0, 8, 4].map((n) => {
    const k = (n + h / 30) % 12;
    return Math.round(
      255 * (lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))),
    );
  });
}

function contrastOnWhite(rgb: number[]) {
  const linear = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance =
    linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  return 1.05 / (luminance + 0.05);
}

describe('joint XSTO / Bentech colour palette', () => {
  it('uses the colours sampled from the approved joint logo', () => {
    expect(tokenRgb('red')).toEqual([209, 32, 48]);
    expect(tokenRgb('navy')).toEqual([27, 41, 85]);
    expect(tokenRgb('ink')).toEqual([35, 48, 72]);
  });

  it('keeps normal-sized text and white button labels at WCAG AA contrast', () => {
    for (const token of [
      'red',
      'red-hover',
      'navy',
      'navy-deep',
      'navy-light',
      'ink',
    ]) {
      expect(contrastOnWhite(tokenRgb(token))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('keeps existing action aliases on the shared logo-red token', () => {
    for (const token of ['primary', 'accent', 'gold', 'xsto-orange']) {
      expect(styles[0]).toContain(`--${token}: var(--brand-red-hsl);`);
    }
  });

  it('does not reintroduce the retired electric-blue and amber brand accents', () => {
    for (const stylesheet of styles) {
      expect(stylesheet).not.toMatch(
        /#(?:2155ed|f2a23a|163fc7|1944c5|1743c3)\b|225 85% 53%|rgba\(33, 85, 237/i,
      );
    }
  });
});
