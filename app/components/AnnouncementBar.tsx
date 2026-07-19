export function AnnouncementBar() {
  return (
    <div className="site-announcement sticky top-0 z-50 flex min-h-[var(--announcement-bar-height,2.5rem)] items-center justify-center">
      <p className="site-announcement-text px-3 py-1.5 text-center sm:px-4">
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
