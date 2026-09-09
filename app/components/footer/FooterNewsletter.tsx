import {Link, useFetcher} from 'react-router';
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
    <div className="mr-footer-newsletter border-b border-white/10">
      <div className="mr-footer-signup xsto-container flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="max-w-md">
          <p className="font-display text-lg font-semibold tracking-tight text-white">
            Stay in the loop
          </p>
          <p className="mt-1 text-sm leading-relaxed text-white/75">
            Product news and offers from Mobility Robot.
          </p>
        </div>

        <div className="w-full max-w-lg">
          <fetcher.Form
            action="/api/newsletter"
            className="flex gap-2 items-stretch"
            method="post"
          >
            <div
              aria-hidden="true"
              className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
            >
              <label htmlFor="footer-newsletter-website">Website</label>
              <input
                autoComplete="off"
                id="footer-newsletter-website"
                name="website"
                tabIndex={-1}
                type="text"
              />
            </div>
            <label className="sr-only" htmlFor="footer-newsletter-email">
              Email address
            </label>
            <input
              autoComplete="email"
              className="min-h-12 min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/65 transition-colors focus:border-white/35 focus:bg-white/8"
              id="footer-newsletter-email"
              name="email"
              placeholder="Your email address"
              ref={inputRef}
              required
              type="email"
            />
            <button
              className="mr-newsletter-button min-h-12 shrink-0 px-3 text-sm md:px-5"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Subscribing…' : 'Subscribe'}
            </button>
          </fetcher.Form>
          <p className="mt-2 text-xs leading-relaxed text-white/70">
            How we use your details: our{' '}
            <Link className="underline underline-offset-4" to="/privacy">
              privacy policy
            </Link>
            .
          </p>

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
