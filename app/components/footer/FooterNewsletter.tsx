import {useFetcher} from 'react-router';
import {useEffect, useRef} from 'react';

type NewsletterResponse = {
  success?: boolean;
  error?: string;
  message?: string;
};

export function FooterNewsletter() {
  const fetcher = useFetcher<NewsletterResponse>();
  const inputRef = useRef<HTMLInputElement>(null);
  const isSubmitting = fetcher.state === 'submitting';
  const result = fetcher.data;

  useEffect(() => {
    if (result?.success && inputRef.current) {
      inputRef.current.value = '';
    }
  }, [result?.success]);

  return (
    <div className="border-b border-white/10 bg-navy-soft">
      <div className="xsto-container flex flex-col gap-5 py-8 md:flex-row md:items-end md:justify-between md:gap-10 md:py-10">
        <div className="max-w-md">
          <p className="font-display text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-white/45">
            Newsletter
          </p>
          <p className="mt-2 font-display text-xl font-semibold tracking-tight text-white md:text-2xl">
            Stay updated
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            Exclusive offers and first look at new XSTO models — straight to your
            inbox.
          </p>
        </div>

        <div className="w-full max-w-lg">
          <fetcher.Form
            action="/api/newsletter"
            className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
            method="post"
          >
            <label className="sr-only" htmlFor="footer-newsletter-email">
              Email address
            </label>
            <input
              autoComplete="email"
              className="min-h-12 min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/40 transition-colors focus:border-white/35 focus:bg-white/8"
              id="footer-newsletter-email"
              name="email"
              placeholder="Your email address"
              ref={inputRef}
              required
              type="email"
            />
            <button
              className="btn-checkout min-h-12 shrink-0 px-6 text-sm"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Subscribing…' : 'Subscribe'}
            </button>
          </fetcher.Form>

          {result?.success ? (
            <p className="mt-3 text-sm text-white/65" role="status">
              {result.message}
            </p>
          ) : null}

          {result?.error ? (
            <p className="mt-3 text-sm text-red-300" role="alert">
              {result.error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
