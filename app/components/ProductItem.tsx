import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  HomeProductFragment,
  ProductItemFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {getProductDisplayName} from '~/lib/product-content';

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
  return (
    <Link
      className="product-item"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {image && (
        <Image
          alt={image.altText || name}
          aspectRatio="1/1"
          data={image}
          loading={loading}
          sizes="(min-width: 45em) 400px, 100vw"
        />
      )}
      <h4>{name}</h4>
      <small>
        <Money data={product.priceRange.minVariantPrice} />
      </small>
    </Link>
  );
}
