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
    <div className="border-b border-border bg-secondary/60 py-3 md:py-3.5">
      <div className="xsto-container flex flex-col items-center justify-between gap-2.5 sm:flex-row sm:gap-4">
        <div className="text-center sm:text-left">
          <p className="text-sm font-semibold text-foreground md:text-base">
            Stay Updated
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
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
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            id="footer-newsletter-email"
            name="email"
            placeholder="Your email"
            ref={inputRef}
            required
            type="email"
          />
          <button
            className="btn-accent shrink-0 px-4 py-2 text-sm"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Subscribing…' : 'Subscribe'}
          </button>
        </fetcher.Form>
      </div>

      {result?.success ? (
        <p
          className="xsto-container mt-3 text-center text-xs text-muted-foreground sm:text-right"
          role="status"
        >
          {result.message}
        </p>
      ) : null}

      {result?.error ? (
        <p
          className="xsto-container mt-3 text-center text-xs text-destructive sm:text-right"
          role="alert"
        >
          {result.error}
        </p>
      ) : null}
    </div>
  );
}
