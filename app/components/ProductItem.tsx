import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  HomeProductFragment,
  ProductItemFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {getProductDisplayName} from '~/lib/product-content';
import {getProductListPrice} from '~/lib/product-vat-variants';

export function ProductItem({
  product,
  loading,
}: {
  product: ProductItemFragment | HomeProductFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const name = getProductDisplayName(product.handle, product.title);
  const listPrice = getProductListPrice(product);
  return (
    <Link
      className="product-item"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {image && (
        <div className="flex aspect-square items-center justify-center overflow-hidden">
          <Image
            alt={image.altText || name}
            className="max-h-full object-contain"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        </div>
      )}
      <h4>{name}</h4>
      <small>
        <Money data={listPrice} />
      </small>
    </Link>
  );
}
