import {Form, useActionData, useNavigation} from 'react-router';

type NewsletterActionData = {
  newsletter?: {
    success?: boolean;
    error?: string;
    message?: string;
  };
};

export function NewsletterSignup() {
  const actionData = useActionData<NewsletterActionData>();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' &&
    navigation.formData?.get('action') === 'newsletter';

  const newsletterResult = actionData?.newsletter;

  return (
    <section className="bg-gradient-navy py-16 md:py-24">
      <div className="xsto-container max-w-2xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-primary-foreground md:text-3xl">
          Stay Updated
        </h2>
        <p className="mt-2 text-primary-foreground/80">
          Get news on new models, demos and VAT relief guidance.
        </p>

        <Form className="mt-8 flex flex-col gap-3 sm:flex-row" method="post">
          <input name="action" type="hidden" value="newsletter" />
          <label className="sr-only" htmlFor="newsletter-email">
            Email address
          </label>
          <input
            autoComplete="email"
            className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-foreground shadow-soft"
            id="newsletter-email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
          <button
            className="btn-accent shrink-0 disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Subscribing…' : 'Subscribe'}
          </button>
        </Form>

        {newsletterResult?.success ? (
          <p className="mt-4 text-sm text-gold-light" role="status">
            {newsletterResult.message}
          </p>
        ) : null}

        {newsletterResult?.error ? (
          <p className="mt-4 text-sm text-destructive-foreground" role="alert">
            {newsletterResult.error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
