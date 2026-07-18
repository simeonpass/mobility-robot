import {Form, useFetcher} from 'react-router';
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
    <div className="bg-primary py-3 md:py-4">
      <div className="xsto-container flex flex-col items-center justify-between gap-2 sm:flex-row sm:gap-4">
        <div className="text-center sm:text-left">
          <h4 className="text-sm font-semibold text-primary-foreground md:text-base">
            Stay Updated
          </h4>
          <p className="text-xs text-primary-foreground/80">
            Get exclusive offers and be first to hear about new products.
          </p>
        </div>

        <fetcher.Form
          action="/api/newsletter"
          className="flex w-full max-w-md flex-col gap-2 sm:w-auto sm:flex-row"
          method="post"
        >
          <label className="sr-only" htmlFor="footer-newsletter-email">
            Email address
          </label>
          <input
            autoComplete="email"
            className="min-w-0 flex-1 rounded-md border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/50"
            id="footer-newsletter-email"
            name="email"
            placeholder="Your email"
            ref={inputRef}
            required
            type="email"
          />
          <button
            className="shrink-0 rounded-md bg-primary-foreground px-4 py-2 text-sm font-semibold text-primary transition-opacity hover:opacity-90 disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Subscribing…' : 'Subscribe'}
          </button>
        </fetcher.Form>
      </div>

      {result?.success ? (
        <p
          className="xsto-container mt-2 text-center text-xs text-primary-foreground/90 sm:text-right"
          role="status"
        >
          {result.message}
        </p>
      ) : null}

      {result?.error ? (
        <p
          className="xsto-container mt-2 text-center text-xs text-destructive-foreground sm:text-right"
          role="alert"
        >
          {result.error}
        </p>
      ) : null}
    </div>
  );
}
