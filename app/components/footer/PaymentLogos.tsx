function PaymentBadge({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-label={label}
      className={[
        'inline-flex h-8 min-w-[3rem] items-center justify-center rounded-md px-2.5',
        className,
      ].join(' ')}
      role="img"
    >
      {children}
    </div>
  );
}

export function PaymentLogos({
  size = 'footer',
}: {
  size?: 'footer' | 'compact';
}) {
  const height = size === 'compact' ? 'h-7' : 'h-7 sm:h-8';
  const gap = size === 'compact' ? 'gap-1.5' : 'gap-1.5 sm:gap-2';
  const text = size === 'compact' ? 'text-[0.6rem]' : 'text-[0.62rem] sm:text-[0.68rem]';

  return (
    <div
      className={`flex max-w-full flex-wrap items-center justify-center ${gap} md:justify-end`}
    >
      <PaymentBadge className={`${height} bg-[#1A1F71]`} label="Visa">
        <span className={`${text} font-bold italic tracking-[0.12em] text-white`}>
          VISA
        </span>
      </PaymentBadge>

      <PaymentBadge
        className={`${height} border border-black/10 bg-white`}
        label="Mastercard"
      >
        <svg aria-hidden className="h-[18px] w-[28px]" viewBox="0 0 32 20">
          <circle cx="11.5" cy="10" fill="#EB001B" r="7.5" />
          <circle cx="20.5" cy="10" fill="#F79E1B" r="7.5" />
          <path
            d="M16 4.6a7.5 7.5 0 0 1 0 10.8 7.5 7.5 0 0 1 0-10.8Z"
            fill="#FF5F00"
          />
        </svg>
      </PaymentBadge>

      <PaymentBadge className={`${height} bg-[#2E77BC]`} label="American Express">
        <span className={`${text} font-bold tracking-[0.1em] text-white`}>
          AMEX
        </span>
      </PaymentBadge>

      <PaymentBadge
        className={`${height} border border-black/10 bg-white`}
        label="PayPal"
      >
        <span className={`${text} font-bold tracking-tight`}>
          <span className="text-[#003087]">Pay</span>
          <span className="text-[#009CDE]">Pal</span>
        </span>
      </PaymentBadge>

      <PaymentBadge className={`${height} bg-black`} label="Apple Pay">
        <span className={`inline-flex items-center gap-1 ${text} font-medium text-white`}>
          <svg aria-hidden className="h-3 w-2.5" viewBox="0 0 14 17" fill="currentColor">
            <path d="M11.7 8.8c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9-.7 0-1.9-.8-3.1-.8C1.8 3.7.1 4.8.1 7.3c0 1.5.6 3.1 1.5 4.1.8 1 1.7 2 2.9 2 1.1 0 1.5-.7 2.9-.7s1.7.7 2.9.7c1.2 0 2-1 2.8-2 .9-1.2 1.2-2.4 1.2-2.4s-2.3-.9-2.3-3.2ZM9.6 2.4C10.2 1.7 10.6.7 10.5 0c-.9 0-2 .6-2.6 1.3-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.6Z" />
          </svg>
          Pay
        </span>
      </PaymentBadge>

      <PaymentBadge
        className={`${height} border border-black/10 bg-white`}
        label="Google Pay"
      >
        <span className={`${text} font-semibold tracking-tight text-[#3C4043]`}>
          <span className="text-[#4285F4]">G</span> Pay
        </span>
      </PaymentBadge>

      <PaymentBadge className={`${height} bg-[#FFB3C7]`} label="Klarna">
        <span className={`${text} font-bold tracking-wide text-[#0B051D]`}>
          Klarna
        </span>
      </PaymentBadge>

      <PaymentBadge className={`${height} bg-[#B2FCE4]`} label="Clearpay">
        <span className={`${text} font-bold tracking-wide text-black`}>
          clearpay
        </span>
      </PaymentBadge>
    </div>
  );
}
