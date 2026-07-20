import {useEffect, useState} from 'react';
import {useFetcher} from 'react-router';
import type {z} from 'zod';
import {formatZodErrors} from '~/lib/form-schemas';

type FormActionData = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export function useValidatedApiForm<T extends z.ZodType>({
  schema,
  action,
}: {
  schema: T;
  action: string;
}) {
  const fetcher = useFetcher<FormActionData>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const loading = fetcher.state !== 'idle';
  const success = submitted && fetcher.data?.ok === true;

  useEffect(() => {
    if (!fetcher.data) return;

    if (fetcher.data.ok) {
      setSubmitted(true);
      setFormError(null);
      setErrors({});
      return;
    }

    setSubmitted(false);
    if (fetcher.data.fieldErrors) {
      setErrors(fetcher.data.fieldErrors);
    }
    if (fetcher.data.error) {
      setFormError(fetcher.data.error);
    } else if (!fetcher.data.fieldErrors) {
      setFormError(
        'Something went wrong. Please try again or email sales@bentchmeduk.com.',
      );
    }
  }, [fetcher.data]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError(null);
    setSubmitted(false);

    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData.entries());
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      setErrors(formatZodErrors(parsed.error));
      return;
    }

    void fetcher.submit(JSON.stringify(parsed.data), {
      action,
      method: 'POST',
      encType: 'application/json',
    });
  }

  return {
    errors,
    formError,
    loading,
    success,
    handleSubmit,
    fetcherData: fetcher.data,
  };
}
