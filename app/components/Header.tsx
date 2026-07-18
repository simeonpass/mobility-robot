import {Suspense, useEffect, useState} from 'react';
import {Await, NavLink, useAsyncValue, useLocation} from 'react-router';
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
import {MAIN_NAV} from '~/lib/site-navigation';

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

  const headerClass = isHome ? 'site-header site-header--home' : 'site-header site-header--solid';
  const headerStyle = isHome
    ? ({'--header-scroll-blend': scrollBlend} as React.CSSProperties)
    : undefined;

  return (
    <header className={headerClass} style={headerStyle}>
      <div className="xsto-container flex h-16 items-center gap-4">
        <NavLink
          aria-label="XSTO UK home"
          className="shrink-0"
          end
          prefetch="intent"
          to="/"
        >
          <img
            alt={HEADER_LOGO.dark.alt}
            className="h-14 w-auto rounded-none object-contain"
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

function navLinkClass(isActive: boolean) {
  return [
    'site-header-link',
    isActive ? 'site-header-link--active' : '',
  ].join(' ');
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

  return (
    <nav
      aria-label={isMobile ? 'Mobile navigation' : 'Main navigation'}
      className={
        isMobile
          ? 'flex flex-col gap-1'
          : 'mx-auto hidden items-center gap-1 md:flex'
      }
      role="navigation"
    >
      {isMobile && isLoggedIn ? (
        <NavLink
          className={navLinkClass(false)}
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
      {MAIN_NAV.map((item) => (
        <NavLink
          className={({isActive}) => navLinkClass(isActive)}
          end={item.url === '/'}
          key={item.url}
          onClick={isMobile ? close : undefined}
          prefetch="intent"
          to={item.url}
        >
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav
      aria-label="Account and cart"
      className="ml-auto flex shrink-0 items-center gap-2 md:gap-3"
      role="navigation"
    >
      <HeaderMenuMobileToggle />
      <NavLink className="site-header-link hidden sm:inline-flex" prefetch="intent" to="/account">
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
    <button className="site-header-link" onClick={() => open('search')} type="button">
      Search
    </button>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      className="site-header-link inline-flex items-center gap-1.5"
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
      Cart
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
