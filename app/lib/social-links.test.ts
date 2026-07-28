import {describe, expect, it} from 'vitest';
import {organizationJsonLd} from '~/lib/seo';
import {SOCIAL_LINKS} from '~/lib/site-navigation';

describe('SOCIAL_LINKS', () => {
  it('uses the official xstomobility accounts from the previous site', () => {
    expect(SOCIAL_LINKS.map((link) => link.href)).toEqual([
      'https://www.facebook.com/xstomobility',
      'https://www.instagram.com/xstomobility',
      'https://www.youtube.com/@xstomobility',
      'https://www.tiktok.com/@xstomobility',
    ]);
  });

  it('does not keep the broken xstouk placeholders', () => {
    for (const link of SOCIAL_LINKS) {
      expect(link.href.toLowerCase()).not.toContain('xstouk');
    }
  });

  it('exposes social profiles on Organization JSON-LD', () => {
    const schema = organizationJsonLd() as {sameAs?: string[]};
    expect(schema.sameAs).toEqual(SOCIAL_LINKS.map((link) => link.href));
  });
});
