import {describe, expect, it, vi} from 'vitest';
import {loader as indexLoader} from '../routes/[sitemap.xml]';
import {loader as resourceLoader} from '../routes/sitemap.$type.$page[.xml]';
import {loader as contentLoader} from '../routes/[sitemap.content.xml]';

describe('canonical storefront sitemaps', () => {
  it('lists only supported resource routes plus the custom content sitemap', async () => {
    const query = vi
      .fn()
      .mockResolvedValue(
        Object.fromEntries(
          [
            'products',
            'collections',
            'pages',
            'articles',
            'blogs',
            'metaObjects',
          ].map((type) => [type, {pagesCount: {count: 1}}]),
        ),
      );
    const response = await indexLoader({
      request: new Request('https://preview.example/sitemap.xml'),
      context: {storefront: {query}},
    } as unknown as Parameters<typeof indexLoader>[0]);
    const xml = await response.text();
    expect(xml).toContain('https://mobilityrobot.co.uk/sitemap/products/1.xml');
    expect(xml).toContain('/sitemap.content.xml');
    expect(xml).not.toContain('preview.example');
    expect(xml).not.toMatch(/sitemap\/(articles|blogs|metaObjects)/);
  });
  it('removes redirected page aliases from the generated sitemap', async () => {
    const query = vi.fn().mockResolvedValue({
      sitemap: {
        resources: {
          items: [
            {handle: 'about', updatedAt: '2026-09-08'},
            {handle: 'care-guide', updatedAt: '2026-09-08'},
          ],
        },
      },
    });
    const response = await resourceLoader({
      request: new Request('https://preview.example/sitemap/pages/1.xml'),
      params: {type: 'pages', page: '1'},
      context: {storefront: {query}},
    } as unknown as Parameters<typeof resourceLoader>[0]);
    const xml = await response.text();
    expect(xml).not.toContain('/pages/about');
    expect(xml).toContain('https://mobilityrobot.co.uk/pages/care-guide');
  });
  it('includes articles after the first Shopify page using the real /blog route', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        blog: {
          articles: {
            nodes: [{handle: 'first-guide'}],
            pageInfo: {hasNextPage: true, endCursor: 'next'},
          },
        },
      })
      .mockResolvedValueOnce({
        blog: {
          articles: {
            nodes: [{handle: 'second-guide'}],
            pageInfo: {hasNextPage: false, endCursor: 'last'},
          },
        },
      });
    const response = await contentLoader({
      context: {storefront: {query}},
    } as unknown as Parameters<typeof contentLoader>[0]);
    const xml = await response.text();
    expect(xml).toContain('https://mobilityrobot.co.uk/blog/first-guide');
    expect(xml).toContain('https://mobilityrobot.co.uk/blog/second-guide');
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[1][1].variables.after).toBe('next');
  });
});
