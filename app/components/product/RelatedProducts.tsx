import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {HomeProductFragment} from 'storefrontapi.generated';
import {getProductDisplayName} from '~/lib/product-content';
import {getProductListPrice} from '~/lib/product-vat-variants';
import {getExVatDisplay, getIncVatDisplay} from '~/lib/product-pricing';

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
    <section aria-labelledby="related-products-heading" className="mr-product-related">
      <p className="mr-product-section-eyebrow">Find your fit</p>
      <h2
        className="mr-product-section-heading font-display"
        id="related-products-heading"
      >
        Explore the range
      </h2>

      <ul className="mr-product-related-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((product) => {
          const image = product.featuredImage;
          const price = getProductListPrice(product);
          const name = getProductDisplayName(product.handle, product.title);

          return (
            <li key={product.id}>
              <Link
                className="mr-product-related-card group block overflow-hidden bg-background"
                prefetch="intent"
                to={`/products/${product.handle}`}
              >
                <div className="mr-product-related-image flex aspect-square items-center justify-center overflow-hidden p-6">
                  {image ? (
                    <Image
                      alt={image.altText || name}
                      aspectRatio="1/1"
                      className="max-h-full w-full object-contain transition-transform group-hover:scale-[1.03]"
                      data={image}
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    />
                  ) : null}
                </div>

                <div className="border-t border-border/60 px-6 py-5">
                  <h3 className="font-display text-xl font-semibold leading-snug text-navy group-hover:text-primary">
                    {name}
                  </h3>
                  {price ? (
                    <div className="mt-3 text-sm leading-relaxed text-slate">
                      <p className="text-base font-semibold text-navy">
                        From {getExVatDisplay(price)}
                      </p>
                      <p>With VAT relief, if eligible</p>
                      <p>{getIncVatDisplay(price)} including VAT</p>
                    </div>
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
