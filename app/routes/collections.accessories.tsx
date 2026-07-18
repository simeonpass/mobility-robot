import {useLoaderData} from 'react-router';
import type {Route} from './+types/collections.accessories';
import {Analytics} from '@shopify/hydrogen';
import {AccessoriesCatalog} from '~/components/accessories/AccessoriesCatalog';
import {JsonLd} from '~/components/content/PageShell';
import {Ga4CollectionView} from '~/components/Ga4CollectionView';
import {
  ACCESSORIES_COLLECTION_HANDLE,
  ACCESSORY_CHAIR_SECTIONS,
  type AccessoryChairSlot,
} from '~/lib/accessories';
import {buildMeta, breadcrumbJsonLd, itemListJsonLd} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  const title = data?.collection?.title || 'Wheelchair Accessories';
  return buildMeta({
    title,
    description:
      data?.collection?.description ||
      'Shop XSTO wheelchair accessories by chair compatibility — M4, M4B, M4 Pro, X12 and X12 Pro. Free UK delivery from the official UK distributor.',
    path: '/collections/accessories',
  });
};

export async function loader({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const url = new URL(request.url);
  const chairParam = url.searchParams.get('chair');

  const activeSlot = resolveChairFilter(chairParam);

  const {collection} = await storefront.query(ACCESSORIES_COLLECTION_QUERY, {
    variables: {handle: ACCESSORIES_COLLECTION_HANDLE},
  });

  if (!collection) {
    throw new Response('Accessories collection not found', {status: 404});
  }

  return {
    collection,
    products: collection.products.nodes,
    activeSlot,
  };
}

function resolveChairFilter(
  chairParam: string | null,
): AccessoryChairSlot | 'all' {
  if (!chairParam) return 'all';
  const match = ACCESSORY_CHAIR_SECTIONS.find(
    (section) => section.id === chairParam || section.slot === chairParam,
  );
  return match?.slot ?? 'all';
}

export default function AccessoriesCollection() {
  const {collection, products, activeSlot} = useLoaderData<typeof loader>();

  const breadcrumbItems = [
    {name: 'Home', path: '/'},
    {name: 'Collections', path: '/collections/all'},
    {name: collection.title},
  ];

  const listSchema = itemListJsonLd({
    name: collection.title,
    items: products.map((product: (typeof products)[number]) => ({
      name: product.title,
      url: `/products/${product.handle}`,
    })),
  });

  return (
    <div className="accessories-page bg-background">
      <div className="xsto-container py-10 md:py-14">
        <Ga4CollectionView
          listName={collection.title}
          products={products.map((product: (typeof products)[number]) => ({
            id: product.id,
            title: product.title,
            handle: product.handle,
            priceAmount: product.priceRange.minVariantPrice.amount,
          }))}
        />
        <JsonLd data={[breadcrumbJsonLd(breadcrumbItems), listSchema]} />

        <header className="mb-10 max-w-3xl md:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Shop by compatibility
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {collection.title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
            {collection.description?.trim() ||
              'Find bags, batteries, cushions and mounts organised by the XSTO chair they fit. Pick your model below, or browse everything.'}
          </p>
        </header>

        <AccessoriesCatalog activeSlot={activeSlot} products={products} />

        <Analytics.CollectionView
          data={{
            collection: {
              id: collection.id,
              handle: collection.handle,
            },
          }}
        />
      </div>
    </div>
  );
}

const ACCESSORIES_COLLECTION_QUERY = `#graphql
  query AccessoriesCollection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(first: 50, sortKey: TITLE) {
        nodes {
          id
          handle
          title
          tags
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
      }
    }
  }
` as const;
