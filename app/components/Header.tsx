import {Suspense, useEffect, useId, useRef, useState} from 'react';
import {Await, Link, NavLink, useAsyncValue, useLocation} from 'react-router';
import {ArrowRight, Search} from 'lucide-react';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {
  HEADER_CTA,
  HEADER_MOBILE_EXTRA_NAV,
  HEADER_SECONDARY_NAV,
  PRODUCT_NAV_ITEMS,
  type NavItem,
} from '~/lib/site-navigation';
import {
  getHomepageProductSlot,
  HOMEPAGE_PRODUCT_BADGES,
  type HomepageFlagshipHandle,
} from '~/lib/homepage-data';

interface HeaderProps {
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
}

/** Customer-facing brand, with the legal business as its supporting byline. */
export function MobilityRobotBrand({light = false}: {light?: boolean}) {
  return (
    <span className={`mr-brand${light ? ' mr-brand--light' : ''}`}>
      <span className="mr-brand-type">
        <span className="mr-brand-name">
          mobility <span className="mr-brand-robot">Robot</span>
          <span className="mr-brand-dot" aria-hidden="true">
            .
          </span>
        </span>
        <span className="mr-brand-byline">by Bentech Medical</span>
      </span>
    </span>
  );
}

export function Header({isLoggedIn, cart}: HeaderProps) {
  return (
    <header className="site-header site-header--solid mr-site-header">
      <div className="xsto-container mr-header-inner">
        <NavLink
          aria-label="Mobility Robot by Bentech Medical — home"
          className="site-header-logo min-w-0 shrink-0"
          end
          prefetch="intent"
          to="/"
        >
          <MobilityRobotBrand />
        </NavLink>
        <HeaderMenu isLoggedIn={isLoggedIn} viewport="desktop" />
        <HeaderCtas cart={cart} isLoggedIn={isLoggedIn} />
      </div>
    </header>
  );
}

type Viewport = 'desktop' | 'mobile';

function navLinkClass(isActive: boolean, extra = '') {
  return ['site-header-link', isActive ? 'site-header-link--active' : '', extra]
    .filter(Boolean)
    .join(' ');
}

function isPathActive(pathname: string, url: string) {
  if (url === '/') return pathname === '/';
  return pathname === url || pathname.startsWith(`${url}/`);
}

function isProductNavActive(pathname: string) {
  return PRODUCT_NAV_ITEMS.some((item) => isPathActive(pathname, item.url));
}

export function HeaderMenu({
  viewport,
  isLoggedIn,
}: {
  viewport: Viewport;
  isLoggedIn?: Promise<boolean>;
}) {
  const {close} = useAside();
  const isMobile = viewport === 'mobile';

  if (isMobile) {
    return <MobileNav close={close} isLoggedIn={isLoggedIn} />;
  }

  return (
    <nav
      aria-label="Main navigation"
      className="site-header-nav-desktop mx-auto min-w-0 flex-1 items-center justify-center gap-0.5"
      role="navigation"
    >
      <ModelsDropdown />
      {HEADER_SECONDARY_NAV.map((item) => (
        <NavLink
          className={({isActive}) => navLinkClass(isActive)}
          key={item.url}
          prefetch="intent"
          to={item.url}
        >
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
}

function getProductNavMeta(url: string) {
  const handle = url.replace(/^\/products\//, '');
  const slot = getHomepageProductSlot(handle);
  if (!slot || !(slot in HOMEPAGE_PRODUCT_BADGES)) return null;
  return HOMEPAGE_PRODUCT_BADGES[slot as HomepageFlagshipHandle];
}

function modelIconLabel(title: string) {
  if (title === 'M4 Pro') return 'M4P';
  return title.replace(/\s+/g, '').slice(0, 4);
}

function ModelsDropdown() {
  const {pathname} = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const active = isProductNavActive(pathname);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div
      className="site-header-dropdown"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
      ref={rootRef}
    >
      <button
        aria-controls={menuId}
        aria-expanded={open}
        className={[
          'site-header-link site-header-dropdown-trigger',
          active || open ? 'site-header-link--active' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => setOpen((value) => !value)}
        ref={triggerRef}
        type="button"
      >
        Wheelchairs
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div className="site-header-dropdown-panel" id={menuId}>
          <div className="site-header-dropdown-intro">
            <p className="site-header-dropdown-eyebrow">Shop XSTO</p>
            <p className="site-header-dropdown-tagline">
              Four models to explore, from everyday self-levelling chairs to the
              X12 stair-climbing wheelchair.
            </p>
          </div>

          <ul className="site-header-dropdown-grid">
            {PRODUCT_NAV_ITEMS.map((item) => {
              const meta = getProductNavMeta(item.url);
              return (
                <li key={item.url}>
                  <NavLink
                    className={({isActive}) =>
                      [
                        'site-header-dropdown-item',
                        isActive ? 'site-header-dropdown-item--active' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')
                    }
                    onClick={() => setOpen(false)}
                    prefetch="intent"
                    to={item.url}
                  >
                    {item.imageUrl ? (
                      <span
                        aria-hidden
                        className="site-header-dropdown-item-thumb"
                      >
                        <img
                          alt=""
                          className="site-header-dropdown-item-thumb-img"
                          decoding="async"
                          height={56}
                          loading="lazy"
                          src={`${item.imageUrl}?width=112&height=112`}
                          width={56}
                        />
                      </span>
                    ) : (
                      <span
                        aria-hidden
                        className="site-header-dropdown-item-icon"
                      >
                        {modelIconLabel(item.title)}
                      </span>
                    )}
                    <span className="site-header-dropdown-item-body">
                      <span className="site-header-dropdown-item-row">
                        <span className="site-header-dropdown-item-title">
                          {meta?.shortName ?? item.title}
                        </span>
                        {meta?.badge ? (
                          <span className="site-header-dropdown-item-badge">
                            {meta.badge}
                          </span>
                        ) : null}
                      </span>
                      {item.description ? (
                        <span className="site-header-dropdown-item-desc">
                          {item.description}
                        </span>
                      ) : null}
                    </span>
                    <ArrowRight
                      aria-hidden
                      className="site-header-dropdown-item-arrow"
                      strokeWidth={2}
                    />
                  </NavLink>
                </li>
              );
            })}
          </ul>

          <div className="site-header-dropdown-footer">
            <div className="site-header-dropdown-footer-links">
              <Link
                className="site-header-dropdown-footer-link site-header-dropdown-footer-link--primary"
                onClick={() => setOpen(false)}
                prefetch="intent"
                to="/collections/all"
              >
                View all chairs
              </Link>
              <Link
                className="site-header-dropdown-footer-link"
                onClick={() => setOpen(false)}
                prefetch="intent"
                to="/collections/accessories"
              >
                Accessories
              </Link>
              <Link
                className="site-header-dropdown-footer-link"
                onClick={() => setOpen(false)}
                prefetch="intent"
                to="/demo"
              >
                Book a demo
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MobileNav({
  close,
  isLoggedIn,
}: {
  close: () => void;
  isLoggedIn?: Promise<boolean>;
}) {
  return (
    <nav
      aria-label="Mobile navigation"
      className="site-header-mobile"
      role="navigation"
    >
      <Link className="mr-mobile-search" to="/search" onClick={close}>
        <Search size={20} aria-hidden /> Search products
      </Link>
      {isLoggedIn ? (
        <NavLink
          className={navLinkClass(false, 'site-header-mobile-account')}
          onClick={close}
          prefetch="intent"
          to="/account"
        >
          <Suspense fallback="Sign in">
            <Await errorElement="Sign in" resolve={isLoggedIn}>
              {(loggedIn) => (loggedIn ? 'Account' : 'Sign in')}
            </Await>
          </Suspense>
        </NavLink>
      ) : null}

      <div className="site-header-mobile-section">
        <p className="site-header-mobile-label">Shop wheelchairs</p>
        {PRODUCT_NAV_ITEMS.map((item) => (
          <MobileNavLink close={close} item={item} key={item.url} />
        ))}
      </div>

      <div className="site-header-mobile-section">
        <p className="site-header-mobile-label">Explore</p>
        {[...HEADER_SECONDARY_NAV, ...HEADER_MOBILE_EXTRA_NAV].map((item) => (
          <MobileNavLink close={close} item={item} key={item.url} />
        ))}
      </div>

      <div className="site-header-mobile-footer">
        <NavLink
          className="site-header-cta site-header-cta--mobile"
          onClick={close}
          prefetch="intent"
          to={HEADER_CTA.url}
        >
          {HEADER_CTA.title}
        </NavLink>
      </div>
    </nav>
  );
}

function MobileNavLink({item, close}: {item: NavItem; close: () => void}) {
  return (
    <NavLink
      className={({isActive}) =>
        navLinkClass(
          isActive,
          item.imageUrl
            ? 'site-header-mobile-link site-header-mobile-link--product'
            : 'site-header-mobile-link',
        )
      }
      onClick={close}
      prefetch="intent"
      to={item.url}
    >
      {item.imageUrl ? (
        <span aria-hidden className="site-header-mobile-link-thumb">
          <img
            alt=""
            className="site-header-mobile-link-thumb-img"
            decoding="async"
            height={48}
            loading="lazy"
            src={`${item.imageUrl}?width=96&height=96`}
            width={48}
          />
        </span>
      ) : null}
      <span className="site-header-mobile-link-text">
        <span>{item.title}</span>
        {item.description ? (
          <span className="site-header-mobile-link-desc">
            {item.description}
          </span>
        ) : null}
      </span>
    </NavLink>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav
      aria-label="Account and cart"
      className="site-header-ctas ml-auto flex shrink-0 items-center gap-0 sm:gap-0.5"
      role="navigation"
    >
      <NavLink
        className="site-header-cta site-header-cta--compact"
        prefetch="intent"
        to={HEADER_CTA.url}
      >
        Demo
      </NavLink>
      <NavLink
        className="site-header-cta site-header-cta--desktop"
        prefetch="intent"
        to={HEADER_CTA.url}
      >
        {HEADER_CTA.title}
      </NavLink>
      <HeaderMenuMobileToggle />
      <NavLink
        className="site-header-link site-header-link--quiet site-header-account-link"
        prefetch="intent"
        to="/account"
      >
        <Suspense fallback="Sign in">
          <Await errorElement="Sign in" resolve={isLoggedIn}>
            {(loggedIn) => (loggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();

  return (
    <button
      aria-label="Open menu"
      className="site-header-icon-btn site-header-menu-toggle"
      onClick={() => open('mobile')}
      type="button"
    >
      <svg
        aria-hidden
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        viewBox="0 0 24 24"
      >
        <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();

  return (
    <button
      aria-label="Search"
      className="site-header-icon-btn site-header-search-toggle"
      onClick={() => open('search')}
      type="button"
    >
      <svg
        aria-hidden
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <span className="sr-only">Search</span>
    </button>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      aria-label={count > 0 ? `Basket, ${count} items` : 'Basket'}
      className="site-header-icon-btn site-header-cart-btn"
      onClick={() => {
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
      type="button"
    >
      <svg
        className="mr-cart-icon"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <path d="M5 7h14l1 14H4L5 7Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      <span className="site-header-cart-label">Basket</span>
      <span className="site-header-cart-count">{count}</span>
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

function ChevronIcon({open}: {open: boolean}) {
  return (
    <svg
      aria-hidden
      className={[
        'site-header-chevron size-3.5 shrink-0',
        open ? 'site-header-chevron--open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
