export function AnnouncementBar() {
  return (
    <div className="sticky top-0 z-50 flex min-h-[var(--announcement-bar-height,2.5rem)] items-center justify-center border-b border-border/60 bg-background">
      <p className="px-3 py-1.5 text-center font-sans text-[0.6875rem] font-medium leading-snug tracking-wide text-navy sm:px-4 sm:text-sm">
        <span className="sm:hidden">
          Welcome to Mobility Robot — home of XSTO in the UK
        </span>
        <span className="hidden sm:inline">
          Welcome to Mobility Robot, the home of XSTO products in the UK
        </span>
      </p>
    </div>
  );
}
