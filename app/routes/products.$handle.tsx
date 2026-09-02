import {redirect, useLoaderData, useSearchParams} from 'react-router';
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
  mergeAccessoryProducts,
  prioritizeAccessoryAddons,
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
import {getProductDisplayName} from '~/lib/product-content';
import {filterVisibleSelectedOptions} from '~/lib/product-vat-variants';
import {isHiddenStorefrontProductHandle} from '~/lib/homepage-data';
import {
  isX12CanonicalHandle,
  isX12ProShopifyHandle,
  parseX12LegRest,
  X12_LEG_REST_PARAM,
  X12_PRO_SHOPIFY_HANDLE,
  x12MergedPath,
} from '~/lib/x12-lineup';

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

  if (isX12ProShopifyHandle(handle)) {
    throw redirect(x12MergedPath('electric'), 301);
  }

  const selectedOptions = getSelectedProductOptions(request);

  const [{product}, siblingData] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions},
    }),
    isX12CanonicalHandle(handle)
      ? storefront.query(PRODUCT_QUERY, {
          variables: {
            handle: X12_PRO_SHOPIFY_HANDLE,
            selectedOptions,
          },
        })
      : Promise.resolve({product: null}),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
    x12ProProduct: siblingData?.product ?? null,
  };
}

async function loadRelatedProducts({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const data = await storefront.query(RELATED_PRODUCTS_QUERY);
  const nodes = [data?.m4, data?.m4Pro, data?.m4b, data?.x12].filter(
    (product): product is NonNullable<typeof product> =>
      Boolean(product) && !isHiddenStorefrontProductHandle(product.handle),
  );

  return nodes;
}

async function loadAccessoryAddons(
  {context}: Route.LoaderArgs,
  productHandle: string,
) {
  if (isAccessoryProduct(productHandle)) return [];

  const {storefront} = context;
  const [collectionData, forcedData] = await Promise.all([
    storefront.query(ACCESSORY_ADDONS_QUERY, {
      variables: {handle: ACCESSORIES_COLLECTION_HANDLE},
    }),
    storefront.query(FORCED_ADDON_PRODUCTS_QUERY),
  ]);

  const nodes = prioritizeAccessoryAddons(
    mergeAccessoryProducts(
      collectionData?.collection?.products?.nodes ?? [],
      [forcedData?.rearCoverM4],
    ).filter(
      (product: {handle: string; title: string; tags?: string[]}) =>
        isAccessoryCompatibleWithChair(
          {
            handle: product.handle,
            title: product.title,
            tags: product.tags,
          },
          productHandle,
        ),
    ),
  );

  // All compatible accessories for this chair (no short “frequently bought” cap).
  return nodes.filter(
    (product: (typeof nodes)[number]) =>
      product.selectedOrFirstAvailableVariant?.availableForSale ||
      product.variants?.nodes?.some(
        (variant: {availableForSale?: boolean | null}) =>
          variant.availableForSale,
      ),
  );
}

export default function Product() {
  const {product, relatedProducts, accessoryAddons, x12ProProduct} =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  const proSelectedVariant = useOptimisticVariant(
    x12ProProduct?.selectedOrFirstAvailableVariant ??
      product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(x12ProProduct ?? product),
  );

  useSelectedOptionInUrlParam(
    filterVisibleSelectedOptions(selectedVariant.selectedOptions),
  );

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const proProductOptions = x12ProProduct
    ? getProductOptions({
        ...x12ProProduct,
        selectedOrFirstAvailableVariant: proSelectedVariant,
      })
    : [];

  const x12Choice = parseX12LegRest(searchParams.get(X12_LEG_REST_PARAM));

  const metafieldEmbedUrl = normalizeYoutubeEmbed(
    product.youtubeEmbed?.value ?? product.videoUrl?.value,
  );

  const staticContent = getProductSpecs(product.handle);
  const displayName = getProductDisplayName(product.handle, product.title);

  const galleryItems = collectGalleryMedia({
    productImages: product.images.nodes,
    mediaNodes: product.media.nodes,
    extraVideoEmbedUrls: [
      metafieldEmbedUrl,
      ...(staticContent?.videos.map((video) => video.embedUrl) ?? []),
    ],
    productTitle: displayName,
  });

  const tabContent = buildProductTabContent({
    shopifyHandle: product.handle,
    shopifyTitle: product.title,
    shopifyDescription: product.description,
    shopifyDescriptionHtml: product.descriptionHtml,
    shopifyTags: product.tags,
    metafieldEmbedUrl,
  });

  const featuredVideo = tabContent.videos[0];

  const seo = resolveProductSeo({
    handle: product.handle,
    productTitle: displayName,
    productDescription: product.description,
    seoTitle: product.seo?.title,
    seoDescription: product.seo?.description,
  });

  const productReviews = getReviewsForProduct(product.handle);
  const reviewSummary = summarizeReviews(productReviews);

  const productSchema = productJsonLd({
    name: displayName,
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
        title={displayName}
        vendor={product.vendor}
      />
      <JsonLd data={productSchema} />
      <div className="xsto-container py-3 md:py-6">
        <ProductBreadcrumbs title={displayName} />

        <div className="product grid gap-5 sm:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,400px)] lg:items-start lg:gap-10 xl:gap-12">
          <div className="min-w-0">
            <ProductGallery items={galleryItems} productTitle={displayName} />
          </div>

          <div className="product-main min-w-0">
            <ProductPurchasePanel
              accessoryAddons={accessoryAddons}
              displayName={displayName}
              productHandle={product.handle}
              productId={product.id}
              productOptions={productOptions}
              productVariants={
                (
                  product as typeof product & {
                    variants?: {
                      nodes?: Array<
                        NonNullable<typeof selectedVariant>
                      >;
                    };
                  }
                ).variants?.nodes ?? []
              }
              selectedVariant={selectedVariant}
              tagline={staticContent?.tagline ?? tabContent.tagline}
              title={displayName}
              x12Edition={
                isX12CanonicalHandle(product.handle)
                  ? {
                      initialChoice: x12Choice,
                      standard: {
                        handle: product.handle,
                        selectedVariant,
                        productOptions,
                        productVariants:
                          (
                            product as typeof product & {
                              variants?: {
                                nodes?: Array<
                                  NonNullable<typeof selectedVariant>
                                >;
                              };
                            }
                          ).variants?.nodes ?? [],
                      },
                      pro: x12ProProduct
                        ? {
                            handle: x12ProProduct.handle,
                            selectedVariant: proSelectedVariant,
                            productOptions: proProductOptions,
                            productVariants:
                              (
                                x12ProProduct as typeof x12ProProduct & {
                                  variants?: {
                                    nodes?: Array<
                                      NonNullable<typeof proSelectedVariant>
                                    >;
                                  };
                                }
                              ).variants?.nodes ?? [],
                          }
                        : null,
                    }
                  : undefined
              }
            />
          </div>
        </div>

        {featuredVideo ? (
          <ProductVideoHero productName={displayName} video={featuredVideo} />
        ) : null}

        <ProductSpecTabs content={tabContent} shopifyHandle={product.handle} />

        <ProductReviews
          productHandle={product.handle}
          productId={product.id}
          productTitle={displayName}
        />

        <RelatedProducts
          currentHandle={product.handle}
          products={relatedProducts.filter(
            (item) => !isHiddenStorefrontProductHandle(item.handle),
          )}
        />
      </div>

      <ProductAppDownload />

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: displayName,
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
    tags
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
    variants(first: 100) {
      nodes {
        ...ProductVariant
      }
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
    x12: product(handle: "x12-all-terrain-mobility-robot") {
      ...HomeProduct
    }
  }
` as const;

const ADDON_PRODUCT_FIELDS = `#graphql
  fragment AddonProductFields on Product {
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
    variants(first: 25) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
        image {
          url
          altText
        }
        selectedOptions {
          name
          value
        }
        product {
          title
          handle
        }
      }
    }
    selectedOrFirstAvailableVariant {
      id
      title
      availableForSale
      price {
        amount
        currencyCode
      }
      image {
        url
        altText
      }
      selectedOptions {
        name
        value
      }
      product {
        title
        handle
      }
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
      products(first: 100, sortKey: BEST_SELLING) {
        nodes {
          ...AddonProductFields
        }
      }
    }
  }
  ${ADDON_PRODUCT_FIELDS}
` as const;

const FORCED_ADDON_PRODUCTS_QUERY = `#graphql
  query ForcedAddonProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    rearCoverM4: product(handle: "rear-cover-m4") {
      ...AddonProductFields
    }
  }
  ${ADDON_PRODUCT_FIELDS}
` as const;
