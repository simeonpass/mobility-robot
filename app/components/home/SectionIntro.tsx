type SectionIntroProps = {
  label: string;
  title: string;
  accent: string;
  suffix?: string;
  description?: string;
  align?: 'left' | 'center';
};

export function SectionIntro({
  label,
  title,
  accent,
  suffix,
  description,
  align = 'center',
}: SectionIntroProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`mb-10 max-w-3xl animate-fade-in ${alignClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        {label}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-[2.75rem] lg:leading-tight">
        {title}{' '}
        <span className="text-gold">{accent}</span>
        {suffix ? ` ${suffix}` : null}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
