import {useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductGallery} from '~/components/product/ProductGallery';
import {ProductBreadcrumbs} from '~/components/product/ProductBreadcrumbs';
import {ProductPurchasePanel} from '~/components/product/ProductPurchasePanel';
import {ProductSpecTabs} from '~/components/product/ProductSpecTabs';
import {ProductVideoHero} from '~/components/product/ProductVideoHero';
import {RelatedProducts} from '~/components/product/RelatedProducts';
import {ProductAppDownload} from '~/components/product/ProductAppDownload';
import {ProductReviews} from '~/components/product/ProductReviews';
import {
  ACCESSORIES_COLLECTION_HANDLE,
  isAccessoryCompatibleWithChair,
} from '~/lib/accessories';
import {isAccessoryProduct} from '~/lib/cart-utils';
import {
  collectGalleryMedia,
  normalizeYoutubeEmbed,
} from '~/lib/product-gallery';
import {
  buildProductTabContent,
  getProductSpecs,
} from '~/lib/product-specs';
import {Ga4ProductView} from '~/components/Ga4ProductView';
import {JsonLd} from '~/components/content/PageShell';
import {buildMeta, productJsonLd} from '~/lib/seo';
import {resolveProductSeo} from '~/lib/product-seo';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {getReviewsForProduct, summarizeReviews} from '~/lib/reviews';

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  if (!product) return [{title: 'Product | Mobility Robot'}];

  const {title, description} = resolveProductSeo({
    handle: product.handle,
    productTitle: product.title,
    productDescription: product.description,
    seoTitle: product.seo?.title,
    seoDescription: product.seo?.description,
  });

  const variant = product.selectedOrFirstAvailableVariant;
  const image = variant?.image?.url || product.images?.nodes?.[0]?.url;

  return buildMeta({
    title,
    description,
    path: `/products/${product.handle}`,
    ogType: 'product',
    image: image ?? undefined,
  });
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  const [relatedProducts, accessoryAddons] = await Promise.all([
    loadRelatedProducts(args),
    loadAccessoryAddons(args, criticalData.product.handle),
  ]);

  return {...criticalData, relatedProducts, accessoryAddons};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {product};
}

async function loadRelatedProducts({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const data = await storefront.query(RELATED_PRODUCTS_QUERY);
  const nodes = [
    data?.m4,
    data?.m4Pro,
    data?.m4b,
    data?.ezgo2,
    data?.x12,
    data?.x12Pro,
  ].filter(Boolean);

  return nodes;
}

async function loadAccessoryAddons(
  {context}: Route.LoaderArgs,
  productHandle: string,
) {
  if (isAccessoryProduct(productHandle)) return [];

  const {storefront} = context;
  const data = await storefront.query(ACCESSORY_ADDONS_QUERY, {
    variables: {handle: ACCESSORIES_COLLECTION_HANDLE},
  });

  const nodes = data?.collection?.products?.nodes ?? [];
  return nodes
    .filter(
      (product: (typeof nodes)[number]) =>
        isAccessoryCompatibleWithChair(
          {
            handle: product.handle,
            title: product.title,
            tags: product.tags,
          },
          productHandle,
        ),
    )
    .filter(
      (product: (typeof nodes)[number]) =>
        product.selectedOrFirstAvailableVariant?.availableForSale,
    )
    .slice(0, 8);
}

export default function Product() {
  const {product, relatedProducts, accessoryAddons} =
    useLoaderData<typeof loader>();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const metafieldEmbedUrl = normalizeYoutubeEmbed(
    product.youtubeEmbed?.value ?? product.videoUrl?.value,
  );

  const staticContent = getProductSpecs(product.handle);

  const galleryItems = collectGalleryMedia({
    productImages: product.images.nodes,
    mediaNodes: product.media.nodes,
    extraVideoEmbedUrls: [
      metafieldEmbedUrl,
      ...(staticContent?.videos.map((video) => video.embedUrl) ?? []),
    ],
    productTitle: product.title,
  });

  const tabContent = buildProductTabContent({
    shopifyHandle: product.handle,
    shopifyDescription: product.description,
    metafieldEmbedUrl,
  });

  const featuredVideo = tabContent.videos[0];

  const seo = resolveProductSeo({
    handle: product.handle,
    productTitle: product.title,
    productDescription: product.description,
    seoTitle: product.seo?.title,
    seoDescription: product.seo?.description,
  });

  const productReviews = getReviewsForProduct(product.handle);
  const reviewSummary = summarizeReviews(productReviews);

  const productSchema = productJsonLd({
    name: staticContent?.displayName || product.title,
    description: seo.description,
    handle: product.handle,
    sku: selectedVariant?.sku,
    image: selectedVariant?.image?.url || product.images.nodes[0]?.url,
    price: selectedVariant?.price.amount ?? '0',
    currencyCode: selectedVariant?.price.currencyCode ?? 'GBP',
    availableForSale: selectedVariant?.availableForSale ?? false,
    ratingValue: reviewSummary.count > 0 ? reviewSummary.average : undefined,
    reviewCount: reviewSummary.count > 0 ? reviewSummary.count : undefined,
  });

  return (
    <div className="product-page product-page--has-mobile-atc bg-background pb-0">
      <Ga4ProductView
        currencyCode={selectedVariant?.price.currencyCode ?? 'GBP'}
        id={selectedVariant?.id ?? product.id}
        price={selectedVariant?.price.amount ?? '0'}
        title={product.title}
        vendor={product.vendor}
      />
      <JsonLd data={productSchema} />
      <div className="xsto-container py-3 md:py-6">
        <ProductBreadcrumbs title={staticContent?.displayName ?? product.title} />

        <div className="product grid gap-5 sm:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,400px)] lg:items-start lg:gap-10 xl:gap-12">
          <div className="min-w-0">
            <ProductGallery items={galleryItems} productTitle={product.title} />
          </div>

          <div className="product-main min-w-0">
            <ProductPurchasePanel
              accessoryAddons={accessoryAddons}
              displayName={staticContent?.displayName}
              productHandle={product.handle}
              productId={product.id}
              productOptions={productOptions}
              selectedVariant={selectedVariant}
              tagline={staticContent?.tagline}
              title={product.title}
            />
          </div>
        </div>

        {featuredVideo ? (
          <ProductVideoHero productName={product.title} video={featuredVideo} />
        ) : null}

        <ProductSpecTabs content={tabContent} shopifyHandle={product.handle} />

        <ProductReviews
          productHandle={product.handle}
          productId={product.id}
          productTitle={staticContent?.displayName ?? product.title}
        />

        <RelatedProducts
          currentHandle={product.handle}
          products={relatedProducts}
        />
      </div>

      <ProductAppDownload />

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_MEDIA_FRAGMENT = `#graphql
  fragment ProductMedia on Media {
    __typename
    id
    mediaContentType
    alt
    ... on MediaImage {
      image {
        id
        url
        altText
        width
        height
      }
    }
    ... on Video {
      sources {
        url
        mimeType
      }
      previewImage {
        url
        width
        height
      }
    }
    ... on ExternalVideo {
      embedUrl
      host
      previewImage {
        url
        width
        height
      }
    }
  }
` as const;

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    quantityAvailable
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    sellingPlanAllocations(first: 10) {
      nodes {
        checkoutChargeAmount {
          amount
          currencyCode
        }
        remainingBalanceChargeAmount {
          amount
          currencyCode
        }
        priceAdjustments {
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
        }
        sellingPlan {
          id
          name
          description
          options {
            name
            value
          }
        }
      }
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 50) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    media(first: 50) {
      nodes {
        ...ProductMedia
      }
    }
    youtubeEmbed: metafield(namespace: "custom", key: "youtube_embed") {
      value
    }
    videoUrl: metafield(namespace: "custom", key: "video_url") {
      value
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
  ${PRODUCT_MEDIA_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

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

const RELATED_PRODUCTS_QUERY = `#graphql
  ${HOME_PRODUCT_FRAGMENT}
  query RelatedProducts($country: CountryCode, $language: LanguageCode)
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

const ACCESSORY_ADDONS_QUERY = `#graphql
  query AccessoryAddons(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: 50, sortKey: BEST_SELLING) {
        nodes {
          id
          handle
          title
          tags
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
          selectedOrFirstAvailableVariant {
            id
            availableForSale
            price {
              amount
              currencyCode
            }
            image {
              url
              altText
            }
            product {
              title
              handle
            }
          }
        }
      }
    }
  }
` as const;
