import {Await, Link} from 'react-router';
import {Suspense, useId} from 'react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {AnnouncementBar} from '~/components/AnnouncementBar';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  isLoggedIn,
}: PageLayoutProps) {
  return (
    <Aside.Provider>
      <div className="flex min-h-screen flex-col">
        <AnnouncementBar />
        <CartAside cart={cart} />
        <SearchAside />
        <MobileMenuAside isLoggedIn={isLoggedIn} />
        <Header cart={cart} isLoggedIn={isLoggedIn} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside heading="Cart" hideHeader type="cart">
      <Suspense fallback={<p className="px-6 py-8 text-muted-foreground">Loading cart…</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();
  return (
    <Aside heading="Search" type="search">
      <div className="predictive-search">
        <br />
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <>
              <input
                list={queriesDatalistId}
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search"
                ref={inputRef}
                type="search"
              />
              &nbsp;
              <button onClick={goToSearch} type="button">
                Search
              </button>
            </>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            if (state === 'loading' && term.current) {
              return <div>Loading...</div>;
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <>
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  closeSearch={closeSearch}
                  products={products}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  closeSearch={closeSearch}
                  collections={collections}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  closeSearch={closeSearch}
                  pages={pages}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                  >
                    <p>
                      View all results for <q>{term.current}</q>
                      &nbsp; →
                    </p>
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

function MobileMenuAside({isLoggedIn}: {isLoggedIn: Promise<boolean>}) {
  return (
    <Aside heading="Menu" type="mobile">
      <HeaderMenu isLoggedIn={isLoggedIn} viewport="mobile" />
    </Aside>
  );
}
