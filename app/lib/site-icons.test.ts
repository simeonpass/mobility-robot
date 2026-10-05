import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {
  SITE_ICON_LINKS,
  SITE_MANIFEST_ICONS,
  SITE_ICON_VERSION,
} from './site-icons';
import {loader as pngLoader} from '~/routes/favicon[.png]';
import {loader as legacyLoader} from '~/routes/mobility-robot-favicon[.png]';
import {loader as manifestLoader} from '~/routes/site[.webmanifest]';

function bytes(path: string) {
  return readFileSync(path);
}

describe('XSTO favicon family', () => {
  it('exports genuine PNGs at the advertised dimensions', () => {
    for (const [file, size] of [
      ['xsto-favicon-32.png', 32],
      ['xsto-favicon-192.png', 192],
      ['xsto-favicon.png', 512],
      ['apple-touch-icon.png', 180],
    ] as const) {
      const image = bytes(`app/assets/${file}`);
      expect(image.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
      expect(image.readUInt32BE(16)).toBe(size);
      expect(image.readUInt32BE(20)).toBe(size);
    }
  });

  it('has an ICO fallback containing the six intended sizes', () => {
    const image = bytes('app/assets/favicon.ico');
    expect(image.readUInt16LE(2)).toBe(1);
    expect(image.readUInt16LE(4)).toBe(6);
    expect(
      Array.from({length: 6}, (_, index) => image[6 + index * 16] || 256),
    ).toEqual([16, 32, 48, 64, 128, 256]);
    expect(bytes('public/favicon.ico')).toEqual(image);
  });

  it('keeps public and legacy image files aligned with the new artwork', () => {
    const image = bytes('app/assets/xsto-favicon.png');
    expect(bytes('app/assets/favicon.png')).toEqual(image);
    expect(bytes('app/assets/mobility-robot-icon.png')).toEqual(image);
    expect(bytes('public/apple-touch-icon.png')).toEqual(
      bytes('app/assets/apple-touch-icon.png'),
    );
    expect(readFileSync('public/favicon.svg', 'utf8')).toContain(
      image.toString('base64'),
    );
  });

  it('uses the new PNG artwork for both current and legacy PNG URLs', () => {
    expect(pngLoader().headers.get('Location')).toContain('xsto-favicon.png');
    expect(legacyLoader().headers.get('Location')).toBe(
      pngLoader().headers.get('Location'),
    );
  });

  it('declares tab, Apple and versioned manifest links', () => {
    expect(
      SITE_ICON_LINKS.filter((link) => link.rel === 'icon').map(
        (link) => link.sizes,
      ),
    ).toEqual([
      '16x16 32x32 48x48 64x64 128x128 256x256',
      '32x32',
      '192x192',
      '512x512',
    ]);
    expect(
      SITE_ICON_LINKS.find((link) => link.rel === 'apple-touch-icon')?.sizes,
    ).toBe('180x180');
    expect(
      SITE_ICON_LINKS.find((link) => link.rel === 'manifest')?.href,
    ).toContain(SITE_ICON_VERSION);
    expect(
      SITE_ICON_LINKS.some((link) =>
        link.href.includes('mobility-robot-favicon'),
      ),
    ).toBe(false);
  });

  it('uses the same new icon family in the web manifest without renaming the business', async () => {
    const response = manifestLoader();
    expect(response.headers.get('Content-Type')).toBe(
      'application/manifest+json',
    );
    const manifest = (await response.json()) as {
      icons: typeof SITE_MANIFEST_ICONS;
      name: string;
      theme_color: string;
    };
    expect(manifest.icons).toEqual(SITE_MANIFEST_ICONS);
    expect(manifest.name).toBe('Mobility Robot by Bentech Medical');
    expect(manifest.theme_color).toBe('#233048');
  });
});
