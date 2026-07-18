const inputClassName =
  'w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-base text-foreground transition-colors placeholder:text-muted-foreground/80 focus-visible:border-navy/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/15 sm:text-sm';
const labelClassName = 'mb-1.5 block text-sm font-medium text-foreground';
const errorClassName = 'mt-1.5 text-xs text-destructive';

export function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm" htmlFor={id}>
      <span className={labelClassName}>{label}</span>
      {children}
      {error ? (
        <span className={errorClassName} id={`${id}-error`} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClassName} {...props} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${inputClassName} min-h-28`}
      {...props}
    />
  );
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={inputClassName} {...props} />;
}

export function SubmitButton({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <button
      className="btn-accent min-h-11 w-full sm:w-auto sm:min-w-[11rem] disabled:opacity-60"
      disabled={loading}
      type="submit"
    >
      {loading ? 'Sending…' : children}
    </button>
  );
}

export function FormSuccess({children}: {children: React.ReactNode}) {
  return (
    <div
      className="rounded-xl border border-vat-price/30 bg-vat-price/10 p-6 text-center"
      role="status"
    >
      <p className="text-lg font-semibold text-foreground">{children}</p>
    </div>
  );
}

export {inputClassName, labelClassName, errorClassName};
