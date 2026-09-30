import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import '~/styles/home-redesign.css';
import {AwardsStrip} from '~/components/home/AwardsStrip';
import {BrandStoryStrip} from '~/components/home/BrandStoryStrip';
import {BrandStorySections} from '~/components/home/BrandStorySections';
import {ExperienceRangeSection} from '~/components/home/ExperienceRangeSection';
import {FaqPreview} from '~/components/home/FaqPreview';
import {HeroSection} from '~/components/home/HeroSection';
import {HomeCtaSection} from '~/components/home/HomeCtaSection';
import {HomeMobileActions} from '~/components/home/HomeMobileActions';
import {
  ProductRangeGrid,
  type HomeProduct,
} from '~/components/home/ProductRangeGrid';
import {ReviewsSection} from '~/components/home/ReviewsSection';
import {TrustBar} from '~/components/TrustBar';
import {
  formatActiveSeriesList,
  HOMEPAGE_FLAGSHIP_HANDLES,
  isPausedSeries,
  SHOPIFY_HOME_PRODUCT_HANDLES,
  type HomepageFlagshipHandle,
} from '~/lib/homepage-data';
import {buildMeta} from '~/lib/seo';
import {getAllReviews, getHomepageFeaturedReviews} from '~/lib/reviews.server';
import {summarizeReviews} from '~/lib/reviews';

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: 'XSTO Powered Wheelchairs UK | Mobility Robot',
    description: isPausedSeries('m8')
      ? `Explore the XSTO ${formatActiveSeriesList()} series at Mobility Robot by Bentech Medical: self-levelling and stair-climbing powered wheelchairs with free UK delivery, VAT relief for eligible customers and UK support.`
      : 'Explore the XSTO M4, M8 and X12 series at Mobility Robot by Bentech Medical. Pre-order the new M8 and M8 Pro with a 10% deposit and UK support.',
    path: '/',
    image: undefined,
  });

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  const reviews = {
    featured: getHomepageFeaturedReviews(6),
    summary: summarizeReviews(getAllReviews()),
  };

  const aliasData = await storefront.query(HOME_PRODUCTS_ALIAS_QUERY);
  const directProducts = resolveHomeProducts(aliasData, []);
  // The normal homepage needs four chairs, not the whole accessory catalogue.
  if (directProducts.length === HOMEPAGE_FLAGSHIP_HANDLES.length) {
    return {products: directProducts, reviews};
  }

  const [catalogData, x12Data] = await Promise.all([
    storefront.query(HOME_PRODUCTS_CATALOG_QUERY),
    storefront.query(HOME_X12_PRODUCTS_QUERY),
  ]);

  const catalogProducts = dedupeProducts([
    ...((catalogData?.products?.nodes ?? []) as HomeProduct[]),
    ...((x12Data?.products?.nodes ?? []) as HomeProduct[]),
  ]);

  const products = resolveHomeProducts(aliasData, catalogProducts);

  return {products, reviews};
}

export default function Homepage() {
  const {products, reviews} = useLoaderData<typeof loader>();

  return (
    <div className="mr-home">
      <BrandStoryStrip />
      <HeroSection products={products} />
      <AwardsStrip />
      <TrustBar />
      <ProductRangeGrid products={products} />
      <BrandStorySections />
      <ExperienceRangeSection />
      <ReviewsSection {...reviews} />
      <FaqPreview />
      <HomeCtaSection />
      <HomeMobileActions />
    </div>
  );
}

const HANDLE_QUERY_KEYS: Record<HomepageFlagshipHandle, string> = {
  'xsto-m4': 'm4',
  'xsto-m8': 'm8',
  'xsto-m8-pro': 'm8Pro',
  'xsto-m4-pro': 'm4Pro',
  'xsto-m4b': 'm4b',
  'xsto-x12': 'x12',
  'xsto-x12-pro': 'x12Pro',
};

function dedupeProducts(products: HomeProduct[]): HomeProduct[] {
  const seen = new Set<string>();
  return products.filter((product) => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

type AliasProductData = Partial<
  Record<
    'm4' | 'm4Pro' | 'm4b' | 'm8' | 'm8Pro' | 'x12' | 'x12Pro',
    HomeProduct | null
  >
>;

function resolveHomeProducts(
  aliasData: AliasProductData | null | undefined,
  catalogProducts: HomeProduct[],
): HomeProduct[] {
  const byHandle = new Map(
    catalogProducts.map((product) => [product.handle, product]),
  );

  const resolved: HomeProduct[] = [];
  const usedHandles = new Set<string>();

  for (const slot of HOMEPAGE_FLAGSHIP_HANDLES) {
    const aliasKey = HANDLE_QUERY_KEYS[slot];
    const aliasProduct =
      aliasData?.[aliasKey as keyof AliasProductData] ?? null;

    if (aliasProduct?.handle && !usedHandles.has(aliasProduct.handle)) {
      resolved.push(aliasProduct);
      usedHandles.add(aliasProduct.handle);
      continue;
    }

    const shopifyHandle = SHOPIFY_HOME_PRODUCT_HANDLES[slot];
    const mappedProduct = byHandle.get(shopifyHandle);

    if (mappedProduct && !usedHandles.has(mappedProduct.handle)) {
      resolved.push(mappedProduct);
      usedHandles.add(mappedProduct.handle);
    }
  }

  return resolved;
}

const HOME_PRODUCT_FRAGMENT = `#graphql
  fragment HomeProduct on Product {
    id
    title
    handle
    featuredImage {
      id
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 50) {
      nodes {
        id
        price {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
` as const;

const HOME_PRODUCTS_ALIAS_QUERY = `#graphql
  ${HOME_PRODUCT_FRAGMENT}
  query HomeProductsByAlias($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    m8: product(handle: "xsto-m8") { ...HomeProduct }
    m8Pro: product(handle: "xsto-m8-pro") { ...HomeProduct }
    m4: product(handle: "buy-robot-wheelchair") {
      ...HomeProduct
    }
    m4Pro: product(handle: "xsto-m4-pro") {
      ...HomeProduct
    }
    m4b: product(handle: "xsto-m4b-1") {
      ...HomeProduct
    }
    x12Pro: product(handle: "xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition") { ...HomeProduct }
    x12: product(handle: "x12-all-terrain-mobility-robot") {
      ...HomeProduct
    }
  }
` as const;

const HOME_PRODUCTS_CATALOG_QUERY = `#graphql
  ${HOME_PRODUCT_FRAGMENT}
  query HomeProductsCatalog($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 50, sortKey: TITLE) {
      nodes {
        ...HomeProduct
      }
    }
  }
` as const;

const HOME_X12_PRODUCTS_QUERY = `#graphql
  ${HOME_PRODUCT_FRAGMENT}
  query HomeX12Products($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 10, query: "title:X12") {
      nodes {
        ...HomeProduct
      }
    }
  }
` as const;
