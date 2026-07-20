import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {HomeProductFragment} from 'storefrontapi.generated';
import {getProductDisplayName} from '~/lib/product-content';

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
    <section aria-labelledby="related-products-heading" className="mt-12 md:mt-14">
      <h2
        className="mb-5 font-display text-xl font-semibold tracking-[-0.02em] text-navy md:text-2xl"
        id="related-products-heading"
      >
        Explore the range
      </h2>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((product) => {
          const image = product.featuredImage;
          const price = product.priceRange.minVariantPrice;
          const name = getProductDisplayName(product.handle, product.title);

          return (
            <li key={product.id}>
              <Link
                className="group block overflow-hidden rounded-lg border border-border/80 bg-background transition-shadow hover:shadow-soft"
                prefetch="intent"
                to={`/products/${product.handle}`}
              >
                <div className="flex aspect-square items-center justify-center overflow-hidden bg-white p-3">
                  {image ? (
                    <Image
                      alt={image.altText || name}
                      aspectRatio="1/1"
                      className="max-h-full w-full object-contain transition-transform group-hover:scale-[1.03]"
                      data={image}
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
                    />
                  ) : null}
                </div>

                <div className="border-t border-border/60 px-3 py-3">
                  <h3 className="text-sm font-semibold leading-snug text-navy group-hover:text-primary">
                    {name}
                  </h3>
                  {price ? (
                    <p className="mt-1 text-xs text-slate">
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
