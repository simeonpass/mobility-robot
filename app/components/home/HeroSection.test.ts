import {createElement, type ReactNode} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {HeroSection} from './HeroSection';

vi.mock('react-router', () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: ReactNode;
    className?: string;
  }) => createElement('a', {href: to, className}, children),
}));

vi.mock('./HeroVideoBackground', () => ({
  HeroVideoBackground: () => createElement('div', {'data-hero-video': true}),
}));

describe('homepage hero', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('leads with a demo booking and keeps range exploration second', () => {
    const html = renderToStaticMarkup(createElement(HeroSection));
    expect(html).toContain('href="/demo"');
    expect(html).toContain('Book a demo');
    expect(html).toContain('href="/#product-range"');
    expect(html).toContain('Explore the range');
    expect(html).not.toContain('Meet the X12');
  });
});
