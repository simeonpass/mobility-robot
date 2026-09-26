import {describe, expect, it} from 'vitest';
import {migrateBlogHtml, migrateBlogText} from './blog-migration';

const handle = 'discover-the-new-xsto-m4-wheelchair';

describe('reviewed legacy blog migration', () => {
  it('updates old store names in reviewed excerpts only', () => {
    expect(migrateBlogText(handle, 'Available at XSTO.co.uk.')).toBe('Available at Mobility Robot.');
    expect(migrateBlogText('unreviewed-history', 'XSTO.co.uk')).toBe('XSTO.co.uk');
  });
  it('links directly to canonical products and preserves query strings and anchors', () => {
    expect(migrateBlogHtml(handle, '<a href="https://xsto.co.uk/products/xsto-m4-electric-wheelchair?utm_source=blog&amp;a=b#details">XSTO.co.uk</a>'))
      .toBe('<a href="/products/buy-robot-wheelchair?utm_source=blog&amp;a=b#details">Mobility Robot</a>');
  });
  it('does not rewrite image sources or unrelated domains', () => {
    const html = '<img src="https://xsto.co.uk/photo.jpg"><a href="https://en.xsto.com/">XSTO</a><a href="https://xsto.co.uk.example.com/">Other</a>';
    expect(migrateBlogHtml(handle, html)).toBe(html);
  });
  it('supports the old homepage with either quote style', () => {
    expect(migrateBlogHtml(handle, "<a href='https://www.xsto.co.uk'>XSTO.co.uk</a>"))
      .toBe("<a href='/'>Mobility Robot</a>");
  });
});
