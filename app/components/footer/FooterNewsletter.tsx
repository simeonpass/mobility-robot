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
  const isSubmitting = fetcher.state !== 'idle';
  const result = fetcher.data;

  useEffect(() => {
    if (result?.success && inputRef.current) {
      inputRef.current.value = '';
    }
  }, [result?.success]);

  return (
    <section
      className="mr-footer-newsletter"
      aria-labelledby="footer-newsletter-title"
    >
      <div className="mr-footer-signup">
        <div className="mr-footer-newsletter-copy">
          <h2 id="footer-newsletter-title">Stay in the loop</h2>
          <p>Product news and offers from Mobility Robot.</p>
        </div>

        <div className="mr-footer-newsletter-form">
          <fetcher.Form
            action="/api/newsletter"
            className="mr-footer-signup-form"
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
              className="mr-footer-email"
              id="footer-newsletter-email"
              name="email"
              placeholder="Your email address"
              aria-describedby="footer-newsletter-privacy"
              ref={inputRef}
              required
              type="email"
            />
            <button
              className="mr-newsletter-button"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Subscribing…' : 'Subscribe'}
            </button>
          </fetcher.Form>
          <p className="mr-footer-privacy" id="footer-newsletter-privacy">
            How we use your details: our{' '}
            <Link className="underline underline-offset-4" to="/privacy">
              privacy policy
            </Link>
            .
          </p>

          {result?.success ? (
            <p className="mr-footer-form-message" role="status">
              {result.message}
            </p>
          ) : null}

          {result?.error ? (
            <p className="mr-footer-form-message is-error" role="alert">
              {result.error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
