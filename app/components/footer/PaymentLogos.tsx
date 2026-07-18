function PaymentSlot({children, label}: {children: React.ReactNode; label: string}) {
  return (
    <div
      aria-label={label}
      className="flex h-10 w-[68px] items-center justify-center rounded border border-background/10 bg-background/5 px-1"
      role="img"
    >
      {children}
    </div>
  );
}

export function PaymentLogos() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-background/80 md:justify-end">
      <PaymentSlot label="Visa">
        <svg aria-hidden className="h-4 w-auto" viewBox="0 0 48 16">
          <text fill="currentColor" fontFamily="Arial,sans-serif" fontSize="11" fontWeight="700" x="2" y="12">
            VISA
          </text>
        </svg>
      </PaymentSlot>
      <PaymentSlot label="Mastercard">
        <svg aria-hidden className="h-5 w-auto" viewBox="0 0 32 20">
          <circle cx="12" cy="10" fill="#EB001B" r="8" />
          <circle cx="20" cy="10" fill="#F79E1B" opacity="0.95" r="8" />
        </svg>
      </PaymentSlot>
      <PaymentSlot label="American Express">
        <svg aria-hidden className="h-4 w-auto" viewBox="0 0 48 16">
          <text fill="currentColor" fontFamily="Arial,sans-serif" fontSize="7" fontWeight="700" x="1" y="11">
            AMEX
          </text>
        </svg>
      </PaymentSlot>
      <PaymentSlot label="PayPal">
        <svg aria-hidden className="h-4 w-auto" viewBox="0 0 48 16">
          <text fill="currentColor" fontFamily="Arial,sans-serif" fontSize="8" fontWeight="700" x="1" y="11">
            PayPal
          </text>
        </svg>
      </PaymentSlot>
      <PaymentSlot label="Apple Pay">
        <svg aria-hidden className="h-4 w-auto" viewBox="0 0 48 16">
          <text fill="currentColor" fontFamily="Arial,sans-serif" fontSize="7" fontWeight="600" x="1" y="11">
            Apple Pay
          </text>
        </svg>
      </PaymentSlot>
      <PaymentSlot label="Google Pay">
        <svg aria-hidden className="h-4 w-auto" viewBox="0 0 48 16">
          <text fill="currentColor" fontFamily="Arial,sans-serif" fontSize="7" fontWeight="600" x="0" y="11">
            G Pay
          </text>
        </svg>
      </PaymentSlot>
      <PaymentSlot label="Klarna">
        <svg aria-hidden className="h-4 w-auto" viewBox="0 0 48 16">
          <text fill="currentColor" fontFamily="Arial,sans-serif" fontSize="8" fontWeight="700" x="1" y="11">
            Klarna
          </text>
        </svg>
      </PaymentSlot>
      <PaymentSlot label="Clearpay">
        <svg aria-hidden className="h-4 w-auto" viewBox="0 0 48 16">
          <text fill="currentColor" fontFamily="Arial,sans-serif" fontSize="7" fontWeight="700" x="0" y="11">
            clearpay
          </text>
        </svg>
      </PaymentSlot>
    </div>
  );
}
