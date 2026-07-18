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
    <div className={`mb-8 max-w-3xl animate-fade-in sm:mb-10 ${alignClass}`}>
      <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        {label}
      </p>
      <h2 className="font-display mt-2.5 text-[1.65rem] font-semibold leading-tight tracking-tight text-foreground sm:mt-3 sm:text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-tight">
        {title}{' '}
        <span className="text-gold">{accent}</span>
        {suffix ? ` ${suffix}` : null}
      </h2>
      {description ? (
        <p className="mt-3 font-sans text-[0.9375rem] leading-relaxed text-muted-foreground sm:mt-4 sm:text-base md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
