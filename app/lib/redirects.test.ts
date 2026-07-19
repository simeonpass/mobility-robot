import {describe, expect, it} from 'vitest';
import {LEGACY_REDIRECTS, resolveLegacyRedirect} from './redirects';

function requestFor(path: string) {
  return new Request(`https://mobilityrobot.co.uk${path}`);
}

describe('resolveLegacyRedirect', () => {
  for (const [source, target] of Object.entries(LEGACY_REDIRECTS)) {
    if (source === target) continue;
    it(`301 ${source} → ${target}`, () => {
      const result = resolveLegacyRedirect(requestFor(source));
      expect(result?.destination).toBe(target);
      expect(result?.cacheControl).toContain('max-age=3600');
    });
  }

  it('skips identity legacy entries', () => {
    expect(resolveLegacyRedirect(requestFor('/products/xsto-m4-pro'))).toBeNull();
  });

  it('redirects blog article paths', () => {
    const result = resolveLegacyRedirect(
      requestFor('/blogs/news/welcome-to-xsto'),
    );
    expect(result?.destination).toBe('/blog/welcome-to-xsto');
  });

  it('strips variant query params on legacy product URLs', () => {
    const result = resolveLegacyRedirect(
      requestFor('/products/buy-robot-wheelchair?variant=123&color=red'),
    );
    expect(result?.destination).toBe('/products/buy-robot-wheelchair?color=red');
  });

  it('redirects prefixed legacy product handles', () => {
    const result = resolveLegacyRedirect(
      requestFor('/products/xsto-m4-pro-long-range'),
    );
    expect(result?.destination).toBe('/products/xsto-m4-pro');
  });


  it('does not redirect canonical X12 Pro Shopify handle', () => {
    expect(
      resolveLegacyRedirect(
        requestFor(
          '/products/xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition',
        ),
      ),
    ).toBeNull();
  });

  it('returns null for unknown paths', () => {
    expect(resolveLegacyRedirect(requestFor('/collections/all'))).toBeNull();
  });

  it('does not redirect live /demo or /quote routes', () => {
    expect(resolveLegacyRedirect(requestFor('/demo'))).toBeNull();
    expect(resolveLegacyRedirect(requestFor('/quote'))).toBeNull();
  });
});
