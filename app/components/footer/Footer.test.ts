import {createElement, type ReactNode} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Footer} from '../Footer';
import {FooterNewsletter} from './FooterNewsletter';
import {FOOTER_NAV_GROUPS, PRODUCT_NAV_ITEMS} from '~/lib/site-navigation';
import {XSTO_LOGO} from '~/lib/site-branding';

const state = vi.hoisted(() => ({
  status: 'idle',
  data: undefined as
    undefined | {success?: boolean; message?: string; error?: string},
}));
vi.mock('react-router', () => {
  const Link = ({
    children,
    to,
    prefetch,
    end,
    ...props
  }: {
    children: ReactNode;
    to: string;
    prefetch?: string;
    end?: boolean;
  }) => createElement('a', {...props, href: to}, children);
  return {
    Link,
    NavLink: Link,
    useFetcher: () => ({
      state: state.status,
      data: state.data,
      Form: ({children, ...props}: {children: ReactNode}) =>
        createElement('form', props, children),
    }),
  };
});

describe('premium storefront footer', () => {
  beforeEach(() => {
    state.status = 'idle';
    state.data = undefined;
  });

  it('leads with the Mobility Robot name and shows XSTO as a labelled endorsement', () => {
    const html = renderToStaticMarkup(createElement(Footer));
    expect(html).toContain('Mobility <span class="mr-lockup-accent">Robot</span>');
    expect(html).toContain('Official UK distributor of');
    expect(html).toContain(`src="${XSTO_LOGO.src}"`);
    expect(html).toContain('width="334" height="166"');
    expect(html).not.toContain('xsto-bentech-header');
    expect(html).toContain('id="site-footer"');
  });

  it('keeps all active models and key support destinations without duplicating groups', () => {
    const links = FOOTER_NAV_GROUPS.flatMap((group) =>
      group.items.map((item) => item.url),
    );
    expect(new Set(links).size).toBe(links.length);
    for (const item of PRODUCT_NAV_ITEMS) expect(links).toContain(item.url);
    for (const url of [
      '/demo',
      '/contact',
      '/support',
      '/vat-relief',
      '/account/orders',
      '/international',
    ])
      expect(links).toContain(url);
    expect(links.some((url) => url.includes('m8'))).toBe(false);
  });

  it('keeps legal links, disclosures, contact details and mobile disclosure controls', () => {
    const html = renderToStaticMarkup(createElement(Footer));
    for (const url of [
      '/privacy',
      '/terms',
      'tel:+442080504849',
      'mailto:sales@bentechmeduk.com',
    ])
      expect(html).toContain(`href="${url}"`);
    expect(html.match(/class="mr-footer-link-group"/g)).toHaveLength(3);
    expect(html).toContain('Product safety &amp; distributor information');
    expect(html).toContain('XSTO is a trademark of its manufacturer.');
  });

  it('retains the newsletter action, labelled email input and spam trap', () => {
    const html = renderToStaticMarkup(createElement(FooterNewsletter));
    expect(html).toContain('action="/api/newsletter"');
    expect(html).toContain('method="post"');
    expect(html).toContain('for="footer-newsletter-email"');
    expect(html).toContain('name="email"');
    expect(html).toContain('name="website"');
    expect(html).toContain('type="email"');
  });

  it.each(['submitting', 'loading'])(
    'prevents duplicate newsletter submissions while %s',
    (status) => {
      state.status = status;
      const html = renderToStaticMarkup(createElement(FooterNewsletter));
      expect(html).toContain('disabled=""');
      expect(html).toContain('Subscribing…');
    },
  );

  it('announces subscription feedback accessibly', () => {
    state.data = {success: true, message: 'Thank you for subscribing.'};
    expect(renderToStaticMarkup(createElement(FooterNewsletter))).toContain(
      'role="status"',
    );
    state.data = {error: 'Please try again.'};
    expect(renderToStaticMarkup(createElement(FooterNewsletter))).toContain(
      'role="alert"',
    );
  });
});
