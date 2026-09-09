import {Link} from 'react-router';
import {ArrowUpRight} from 'lucide-react';
import type {HomeProductFragment} from 'storefrontapi.generated';
import {
  getHomepageProductSlot,
  HOMEPAGE_FLAGSHIP_HANDLES,
  HOMEPAGE_PRODUCT_BADGES,
  SHOPIFY_HOME_PRODUCT_HANDLES,
  type HomepageFlagshipHandle,
} from '~/lib/homepage-data';
import {getProductDisplayName} from '~/lib/product-content';
import {getProductListPrice} from '~/lib/product-vat-variants';
import {getExVatDisplay, getIncVatDisplay} from '~/lib/product-pricing';

export type HomeProduct = HomeProductFragment;
const descriptions: Record<HomepageFlagshipHandle, string> = {
  'xsto-m4':
    'Self-levelling control and electric seat lifting for your everyday.',
  'xsto-m4b':
    'A fresh take on the M4 platform, with redesigned front wheels and a folding footrest.',
  'xsto-m4-pro':
    'More seating adjustment, an integrated headrest and electric folding.',
  'xsto-x12':
    'Stair-climbing capability for suitable stairs, with assessment and training.',
};
const mobileDescriptions: Record<HomepageFlagshipHandle, string> = {
  'xsto-m4': 'Everyday self-levelling',
  'xsto-m4b': 'Updated wheels & footrest',
  'xsto-m4-pro': 'Extra seating adjustment',
  'xsto-x12': 'Stair climbing, with assessment & training',
};
function productImageSrc(url: string, width: number): string {
  const parsed = new URL(url);
  parsed.searchParams.set('width', String(width));
  parsed.searchParams.delete('height');
  parsed.searchParams.delete('crop');
  return parsed.toString();
}

export function ProductRangeGrid({products}: {products: HomeProduct[]}) {
  const flagshipProducts = HOMEPAGE_FLAGSHIP_HANDLES.flatMap((slot) => {
    const product = products.find(
      (item) => item.handle === SHOPIFY_HOME_PRODUCT_HANDLES[slot],
    );
    return product ? [product] : [];
  });
  return (
    <section className="mr-section" id="product-range">
      <div className="xsto-container">
        <div className="mr-section-intro">
          <div>
            <p className="mr-eyebrow">The XSTO range</p>
            <h2>
              Four models.
              <br />A world of possibilities.
            </h2>
            <p>
              Start with the way you want to live. We’ll help you find the chair
              to match.
            </p>
          </div>
          <Link className="mr-text-link" to="/compare">
            Compare all models <ArrowUpRight size={18} aria-hidden />
          </Link>
        </div>
        {flagshipProducts.length ? (
          <div className="mr-product-grid">
            {flagshipProducts.map((product) => {
              const slot = getHomepageProductSlot(
                product.handle,
              ) as HomepageFlagshipHandle;
              const meta = HOMEPAGE_PRODUCT_BADGES[slot];
              const name = getProductDisplayName(product.handle, product.title);
              const price = getProductListPrice(product);
              const image = product.featuredImage;
              return (
                <article className="mr-product-card" key={product.id}>
                  <Link
                    className="mr-product-card-link"
                    to={`/products/${product.handle}`}
                    prefetch="intent"
                    aria-labelledby={`range-${product.handle}`}
                  >
                    <div className="mr-card-visual">
                      <span className="mr-card-badge">{meta.badge}</span>
                      {image ? (
                        <img
                          alt={image.altText || name}
                          src={productImageSrc(image.url, 800)}
                          srcSet={`${productImageSrc(image.url, 400)} 400w, ${productImageSrc(image.url, 600)} 600w, ${productImageSrc(image.url, 800)} 800w`}
                          sizes="(min-width: 1200px) 23vw, 46vw"
                          width={image.width ?? 800}
                          height={image.height ?? 800}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : null}
                    </div>
                    <div className="mr-card-body">
                      <h3 id={`range-${product.handle}`}>{meta.shortName}</h3>
                      <p>
                        <span className="mr-desktop-copy">
                          {descriptions[slot]}
                        </span>
                        <span className="mr-mobile-copy">
                          {mobileDescriptions[slot]}
                        </span>
                      </p>
                      <div className="mr-card-pricing">
                        <span>From </span>
                        <strong>{getExVatDisplay(price)}</strong>
                        <p>With VAT relief, if eligible</p>
                        <p>{getIncVatDisplay(price)} including VAT</p>
                      </div>
                      <span className="mr-text-link">
                        <span className="mr-desktop-copy">
                          {meta.exploreLabel}
                        </span>
                        <span className="mr-mobile-copy">View model</span>
                        <ArrowUpRight size={18} aria-hidden />
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <p>
            Explore the{' '}
            <Link className="mr-text-link" to="/collections/all">
              full product range
            </Link>{' '}
            or{' '}
            <Link className="mr-text-link" to="/contact">
              ask our team
            </Link>{' '}
            for current availability.
          </p>
        )}
        <p className="mr-range-note">
          All prices in GBP. VAT relief requires eligibility and a declaration.
          Photography may show optional equipment.{' '}
          <Link to="/vat-relief">VAT relief explained</Link>.
        </p>
      </div>
    </section>
  );
}
