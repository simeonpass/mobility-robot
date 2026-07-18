import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {HomeProductFragment} from 'storefrontapi.generated';

type RelatedProductsProps = {
  products: HomeProductFragment[];
  currentHandle: string;
};

export function RelatedProducts({
  products,
  currentHandle,
}: RelatedProductsProps) {
  const related = products.filter(
    (product) => product.handle !== currentHandle,
  );

  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-products-heading" className="mt-16">
      <h2
        className="mb-8 text-2xl font-bold text-foreground"
        id="related-products-heading"
      >
        Explore the range
      </h2>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((product) => {
          const image = product.featuredImage;
          const price = product.priceRange.minVariantPrice;

          return (
            <li key={product.id}>
              <Link
                className="xsto-card group block"
                prefetch="intent"
                to={`/products/${product.handle}`}
              >
                <div className="aspect-square overflow-hidden bg-secondary">
                  {image ? (
                    <Image
                      alt={image.altText || product.title}
                      aspectRatio="1/1"
                      className="size-full object-cover transition-transform group-hover:scale-105"
                      data={image}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : null}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-foreground group-hover:text-gold">
                    {product.title}
                  </h3>
                  {price ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      From <Money data={price} />
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
