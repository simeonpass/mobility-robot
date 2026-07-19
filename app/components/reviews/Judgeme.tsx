import {useEffect, useId} from 'react';
import {useLocation, useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';
import type {JudgemeConfig} from '~/lib/judgeme';
import {judgemeProductId} from '~/lib/judgeme';

declare global {
  interface Window {
    jdgm?: {
      SHOP_DOMAIN?: string;
      PLATFORM?: string;
      PUBLIC_TOKEN?: string;
    };
    jdgm_preloader?: () => void;
  }
}

let preloaderPromise: Promise<void> | null = null;

function loadJudgemePreloader(config: JudgemeConfig): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  window.jdgm = window.jdgm || {};
  window.jdgm.SHOP_DOMAIN = config.shopDomain;
  window.jdgm.PLATFORM = 'shopify';
  window.jdgm.PUBLIC_TOKEN = config.publicToken;

  if (window.jdgm_preloader) return Promise.resolve();
  if (preloaderPromise) return preloaderPromise;

  preloaderPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-judgeme-preloader]',
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Judge.me preloader failed to load')),
      );
      return;
    }

    const script = document.createElement('script');
    script.src = `${config.cdnHost}/widget_preloader.js`;
    script.async = true;
    script.dataset.judgemePreloader = 'true';
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Judge.me preloader failed to load'));
    document.body.appendChild(script);
  });

  return preloaderPromise;
}

function refreshJudgemeWidgets(delayMs: number) {
  window.setTimeout(() => {
    try {
      window.jdgm_preloader?.();
    } catch {
      // Judge.me may throw if DOM nodes are mid-update during navigation.
    }
  }, delayMs);
}

export function useJudgemeConfig(): JudgemeConfig | null {
  const data = useRouteLoaderData<RootLoader>('root');
  return data?.judgeme ?? null;
}

/**
 * Oxygen-safe Judge.me bootstrap.
 * Avoids the official package's `installed.js`, which can infinite-refresh on Oxygen.
 */
export function JudgemeBootstrap({config}: {config: JudgemeConfig | null}) {
  const location = useLocation();

  useEffect(() => {
    if (!config) return;

    let cancelled = false;

    void loadJudgemePreloader(config)
      .then(() => {
        if (!cancelled) refreshJudgemeWidgets(config.delay);
      })
      .catch(() => {
        // Leave widgets empty if CDN is blocked — page still works.
      });

    return () => {
      cancelled = true;
    };
  }, [config, location.pathname, location.search]);

  return null;
}

function JudgemeWidgetShell({
  className,
  widget,
  productId,
}: {
  className?: string;
  widget: string;
  productId?: string;
}) {
  const reactId = useId();
  const location = useLocation();

  useEffect(() => {
    refreshJudgemeWidgets(400);
  }, [location.pathname, productId, widget, reactId]);

  return (
    <div
      className={['jdgm-widget', widget, className].filter(Boolean).join(' ')}
      data-id={productId ? judgemeProductId(productId) : undefined}
      key={`${widget}-${productId ?? 'store'}-${location.pathname}`}
    />
  );
}

export function JudgemePreviewBadge({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  return (
    <JudgemeWidgetShell
      className={className}
      productId={productId}
      widget="jdgm-preview-badge"
    />
  );
}

export function JudgemeReviewWidget({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  return (
    <JudgemeWidgetShell
      className={className}
      productId={productId}
      widget="jdgm-review-widget"
    />
  );
}

export function JudgemeCarousel({className}: {className?: string}) {
  return <JudgemeWidgetShell className={className} widget="jdgm-carousel" />;
}

export function JudgemeAllReviewsRating({className}: {className?: string}) {
  return (
    <JudgemeWidgetShell
      className={className}
      widget="jdgm-all-reviews-rating"
    />
  );
}
