export function AnnouncementBar() {
  return (
    <div className="site-announcement sticky top-0 z-50 flex min-h-[var(--announcement-bar-height,2.5rem)] items-center justify-center">
      <p className="site-announcement-text px-3 py-1.5 text-center sm:px-4">
        <span className="sm:hidden">
          Official UK Distributor of XSTO · Free UK Delivery
        </span>
        <span className="hidden sm:inline">
          Official UK Distributor of XSTO · Free UK Delivery · 5-Year Frame
          Warranty
        </span>
      </p>
    </div>
  );
}
