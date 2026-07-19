import type {Route} from './+types/collections.all';
import {Link, useLoaderData} from 'react-router';
import {ShopAllCatalog} from '~/components/shop/ShopAllCatalog';
import {JsonLd} from '~/components/content/PageShell';
import {Ga4CollectionView} from '~/components/Ga4CollectionView';
import {ACCESSORIES_COLLECTION_HANDLE} from '~/lib/accessories';
import {partitionShopAllProducts} from '~/lib/shop-all';
import {buildMeta, breadcrumbJsonLd, itemListJsonLd} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: 'Shop All XSTO Wheelchairs & Accessories',
    description:
      'Browse the full XSTO range — EzGo2, M4, M4B, M4 Pro, X12 and X12 Pro — plus accessories. Official UK distributor with free delivery.',
    path: '/collections/all',
  });

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const [{products}, {collection}] = await Promise.all([
    storefront.query(CATALOG_QUERY),
    storefront.query(ACCESSORIES_FOR_SHOP_ALL_QUERY, {
      variables: {handle: ACCESSORIES_COLLECTION_HANDLE},
    }),
  ]);

  const accessoriesFromCollection = collection?.products.nodes ?? [];
  const {chairs, accessories} = partitionShopAllProducts(
    products.nodes,
    accessoriesFromCollection,
  );

  return {
    products: products.nodes,
    chairs,
    accessories,
  };
}

export default function Collection() {
  const {chairs, accessories} = useLoaderData<typeof loader>();
  const ordered = [...chairs, ...accessories];

  const breadcrumbItems = [
    {name: 'Home', path: '/'},
    {name: 'Shop all'},
  ];

  const listSchema = itemListJsonLd({
    name: 'XSTO power chairs & accessories',
    items: ordered.map((product) => ({
      name: product.title,
      url: `/products/${product.handle}`,
    })),
  });

  return (
    <div className="shop-all-page bg-background">
      <div className="relative overflow-hidden border-b border-border/60 bg-navy text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 15% 20%, hsl(354 73% 47% / 0.22), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 80%, hsl(216 36% 40% / 0.45), transparent 50%)',
          }}
        />
        <div className="xsto-container relative py-12 md:py-16 lg:py-20">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
            Mobility Robot · Official UK XSTO store
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl md:leading-tight">
            Shop the XSTO range
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
            Power chairs first — EzGo2 through X12 Pro — then accessories for
            the chair you choose. Free UK delivery from Bentech Medical Ltd.
          </p>
          <nav
            aria-label="On this page"
            className="mt-8 flex flex-wrap gap-3"
          >
            <a
              className="inline-flex min-h-11 items-center rounded-md border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white no-underline backdrop-blur-sm transition-colors hover:bg-white/15 hover:no-underline"
              href="#power-chairs"
            >
              Power chairs
            </a>
            <a
              className="inline-flex min-h-11 items-center rounded-md border border-white/25 bg-transparent px-4 text-sm font-semibold text-white/90 no-underline transition-colors hover:bg-white/10 hover:no-underline"
              href="#accessories"
            >
              Accessories
            </a>
            <Link
              className="inline-flex min-h-11 items-center rounded-md px-4 text-sm font-semibold text-white/80 no-underline underline-offset-4 hover:text-white hover:underline"
              prefetch="intent"
              to="/quote"
            >
              Need help choosing?
            </Link>
          </nav>
        </div>
      </div>

      <div className="xsto-container py-10 md:py-14">
        <Ga4CollectionView
          listName="Shop all"
          products={ordered.map((product) => ({
            id: product.id,
            title: product.title,
            handle: product.handle,
            priceAmount: product.priceRange.minVariantPrice.amount,
          }))}
        />
        <JsonLd data={[breadcrumbJsonLd(breadcrumbItems), listSchema]} />
        <ShopAllCatalog accessories={accessories} chairs={chairs} />
      </div>
    </div>
  );
}

const PRODUCT_CARD_FIELDS = `#graphql
  fragment ShopAllProductCard on Product {
    id
    handle
    title
    tags
    productType
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
` as const;

const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: 50, sortKey: TITLE) {
      nodes {
        ...ShopAllProductCard
      }
    }
  }
  ${PRODUCT_CARD_FIELDS}
` as const;

const ACCESSORIES_FOR_SHOP_ALL_QUERY = `#graphql
  query AccessoriesForShopAll(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: 50, sortKey: TITLE) {
        nodes {
          ...ShopAllProductCard
        }
      }
    }
  }
  ${PRODUCT_CARD_FIELDS}
` as const;
