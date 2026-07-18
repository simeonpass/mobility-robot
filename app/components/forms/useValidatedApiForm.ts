import {useEffect, useState} from 'react';
import {useFetcher} from 'react-router';
import type {z} from 'zod';
import {formatZodErrors} from '~/lib/form-schemas';

export function useValidatedApiForm<T extends z.ZodType>({
  schema,
  action,
}: {
  schema: T;
  action: string;
}) {
  const fetcher = useFetcher<{ok?: boolean}>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const loading = fetcher.state !== 'idle';
  const success = submitted && fetcher.data?.ok === true;

  useEffect(() => {
    if (fetcher.data?.ok) {
      setSubmitted(true);
    }
  }, [fetcher.data]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
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

  return {errors, loading, success, handleSubmit, fetcherData: fetcher.data};
}
