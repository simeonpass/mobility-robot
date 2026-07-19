import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {ComparisonStrip} from '~/components/home/ComparisonStrip';
import {ExperienceRangeSection} from '~/components/home/ExperienceRangeSection';
import {FaqPreview} from '~/components/home/FaqPreview';
import {HeroSection} from '~/components/home/HeroSection';
import {HomeCtaSection} from '~/components/home/HomeCtaSection';
import {
  ProductRangeGrid,
  type HomeProduct,
} from '~/components/home/ProductRangeGrid';
import {TrustBar} from '~/components/TrustBar';
import {
  HOMEPAGE_PRODUCT_HANDLES,
  SHOPIFY_HOME_PRODUCT_HANDLES,
  heroYoutubePosterUrl,
  type HomepageProductHandle,
} from '~/lib/homepage-data';
import {buildMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: 'XSTO Powered Wheelchairs UK',
    description:
      'Official UK store for XSTO foldable powered wheelchairs. M4, M4 Pro, M4B, X12 and X12 Pro — free UK delivery, VAT relief eligible.',
    path: '/',
    image: undefined,
  });

export function links() {
  return [
    {
      rel: 'preload',
      as: 'image',
      href: heroYoutubePosterUrl(),
      fetchPriority: 'high',
    },
  ];
}

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const [aliasData, catalogData, x12Data] = await Promise.all([
    storefront.query(HOME_PRODUCTS_ALIAS_QUERY),
    storefront.query(HOME_PRODUCTS_CATALOG_QUERY),
    storefront.query(HOME_X12_PRODUCTS_QUERY),
  ]);

  const catalogProducts = dedupeProducts([
    ...((catalogData?.products?.nodes ?? []) as HomeProduct[]),
    ...((x12Data?.products?.nodes ?? []) as HomeProduct[]),
  ]);

  const products = resolveHomeProducts(aliasData, catalogProducts);

  return {products};
}

export default function Homepage() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <div className="home">
      <HeroSection />
      <TrustBar />
      <ProductRangeGrid products={products} />
      <ComparisonStrip />
      <ExperienceRangeSection />
      <FaqPreview />
      <HomeCtaSection />
    </div>
  );
}

const HANDLE_QUERY_KEYS: Record<HomepageProductHandle, string> = {
  'xsto-m4': 'm4',
  'xsto-m4-pro': 'm4Pro',
  'xsto-m4b': 'm4b',
  'xsto-ezgo2': 'ezgo2',
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
  Record<'m4' | 'm4Pro' | 'm4b' | 'ezgo2' | 'x12' | 'x12Pro', HomeProduct | null>
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

  for (const slot of HOMEPAGE_PRODUCT_HANDLES) {
    const aliasKey = HANDLE_QUERY_KEYS[slot];
    const aliasProduct = aliasData?.[aliasKey as keyof AliasProductData] ?? null;

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
    }
  }
` as const;

const HOME_PRODUCTS_ALIAS_QUERY = `#graphql
  ${HOME_PRODUCT_FRAGMENT}
  query HomeProductsByAlias($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    m4: product(handle: "buy-robot-wheelchair") {
      ...HomeProduct
    }
    m4Pro: product(handle: "xsto-m4-pro") {
      ...HomeProduct
    }
    m4b: product(handle: "xsto-m4b-1") {
      ...HomeProduct
    }
    ezgo2: product(handle: "xsto-ezgo2-carbon-fiber-power-wheelchair") {
      ...HomeProduct
    }
    x12: product(handle: "x12-all-terrain-mobility-robot") {
      ...HomeProduct
    }
    x12Pro: product(handle: "xsto-x12-pro-ai-stair-climbing-mobility-wheelchair-pro-edition") {
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
