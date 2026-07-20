import {
  Suspense,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {Await, Link, NavLink, useAsyncValue, useLocation} from 'react-router';
import {ArrowRight} from 'lucide-react';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {
  HEADER_LOGO,
  HEADER_LOGO_DISPLAY_HEIGHT,
  headerLogoDisplayWidth,
} from '~/lib/site-branding';
import {
  HEADER_CTA,
  HEADER_MOBILE_EXTRA_NAV,
  HEADER_SECONDARY_NAV,
  PRODUCT_NAV_GROUPS,
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

const SCROLL_BLEND_DISTANCE = 180;

export function Header({isLoggedIn, cart}: HeaderProps) {
  const {pathname} = useLocation();
  const isHome = pathname === '/';
  const [scrollBlend, setScrollBlend] = useState(isHome ? 0 : 1);

  useEffect(() => {
    if (!isHome) {
      setScrollBlend(1);
      return;
    }

    const onScroll = () => {
      setScrollBlend(Math.min(window.scrollY / SCROLL_BLEND_DISTANCE, 1));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const headerClass = isHome
    ? 'site-header site-header--home'
    : 'site-header site-header--solid';
  const headerStyle = isHome
    ? ({'--header-scroll-blend': scrollBlend} as CSSProperties)
    : undefined;

  return (
    <header className={headerClass} style={headerStyle}>
      <div className="xsto-container flex h-20 items-center gap-0.5 sm:h-[5.25rem] sm:gap-3 lg:h-[5.5rem] lg:gap-5">
        <NavLink
          aria-label="Mobility Robot home"
          className="site-header-logo min-w-0 shrink-0"
          end
          prefetch="intent"
          to="/"
        >
          <img
            alt={HEADER_LOGO.dark.alt}
            className="h-16 w-auto max-w-[min(100%,14rem)] overflow-visible rounded-none bg-transparent object-contain object-left sm:h-[4.25rem] sm:max-w-[17rem] md:h-[4.75rem] md:max-w-none lg:h-20"
            decoding="async"
            fetchPriority="high"
            height={HEADER_LOGO_DISPLAY_HEIGHT}
            src={HEADER_LOGO.dark.src}
            width={headerLogoDisplayWidth()}
          />
        </NavLink>

        <HeaderMenu isLoggedIn={isLoggedIn} viewport="desktop" />

        <HeaderCtas cart={cart} isLoggedIn={isLoggedIn} />
      </div>
    </header>
  );
}

type Viewport = 'desktop' | 'mobile';

function navLinkClass(isActive: boolean, extra = '') {
  return [
    'site-header-link',
    isActive ? 'site-header-link--active' : '',
    extra,
  ]
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
    return (
      <MobileNav
        close={close}
        isLoggedIn={isLoggedIn}
      />
    );
  }

  return (
    <nav
      aria-label="Main navigation"
      className="mx-auto hidden min-w-0 items-center gap-0.5 md:flex"
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
  if (title === 'EzGo2') return 'EZ';
  if (title === 'M4 Pro') return 'M4P';
  if (title === 'X12 Pro') return 'X12P';
  return title.replace(/\s+/g, '').slice(0, 4);
}

function ModelsDropdown() {
  const {pathname} = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
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
      if (event.key === 'Escape') setOpen(false);
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
    <div className="site-header-dropdown" ref={rootRef}>
      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        className={[
          'site-header-link site-header-dropdown-trigger',
          active || open ? 'site-header-link--active' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        Models
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div
          className="site-header-dropdown-panel"
          id={menuId}
          role="menu"
        >
          <div className="site-header-dropdown-intro">
            <p className="site-header-dropdown-eyebrow">Shop XSTO</p>
            <p className="site-header-dropdown-tagline">
              Foldable powered wheelchairs — from everyday self-levelling to
              all-terrain stair climbers.
            </p>
          </div>

          <div className="site-header-dropdown-grid">
            {PRODUCT_NAV_GROUPS.map((group) => (
              <div
                className="site-header-dropdown-group"
                data-series={group.title}
                key={group.title}
              >
                <p className="site-header-dropdown-label">{group.title}</p>
                <ul className="site-header-dropdown-list">
                  {group.items.map((item) => {
                    const meta = getProductNavMeta(item.url);
                    return (
                      <li key={item.url}>
                        <NavLink
                          className={({isActive}) =>
                            [
                              'site-header-dropdown-item',
                              isActive
                                ? 'site-header-dropdown-item--active'
                                : '',
                            ]
                              .filter(Boolean)
                              .join(' ')
                          }
                          onClick={() => setOpen(false)}
                          prefetch="intent"
                          role="menuitem"
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
              </div>
            ))}
          </div>

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
        <p className="site-header-mobile-label">Models</p>
        {PRODUCT_NAV_GROUPS.map((group) => (
          <div className="site-header-mobile-group" key={group.title}>
            <p className="site-header-mobile-group-title">{group.title}</p>
            {group.items.map((item) => (
              <MobileNavLink close={close} item={item} key={item.url} />
            ))}
          </div>
        ))}
      </div>

      <div className="site-header-mobile-section">
        <p className="site-header-mobile-label">Explore</p>
        {[...HEADER_SECONDARY_NAV, ...HEADER_MOBILE_EXTRA_NAV].map((item) => (
          <MobileNavLink close={close} item={item} key={item.url} />
        ))}
      </div>

      <NavLink
        className="site-header-cta site-header-cta--mobile"
        onClick={close}
        prefetch="intent"
        to={HEADER_CTA.url}
      >
        {HEADER_CTA.title}
      </NavLink>
    </nav>
  );
}

function MobileNavLink({
  item,
  close,
}: {
  item: NavItem;
  close: () => void;
}) {
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
      className="ml-auto flex shrink-0 items-center gap-0 sm:gap-0.5 md:gap-1.5"
      role="navigation"
    >
      <NavLink
        className="site-header-cta site-header-cta--compact md:hidden"
        prefetch="intent"
        to={HEADER_CTA.url}
      >
        Demo
      </NavLink>
      <NavLink
        className="site-header-cta hidden md:inline-flex"
        prefetch="intent"
        to={HEADER_CTA.url}
      >
        {HEADER_CTA.title}
      </NavLink>
      <HeaderMenuMobileToggle />
      <NavLink
        className="site-header-link site-header-link--quiet hidden sm:inline-flex"
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
      className="site-header-icon-btn inline-flex md:hidden"
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
      className="site-header-icon-btn"
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
      aria-label={count > 0 ? `Cart, ${count} items` : 'Cart'}
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
      <span className="hidden sm:inline">Cart</span>
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
