import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  SITE_NAME,
  SITE_URL,
} from '~/lib/const';

export {SITE_URL, SITE_NAME} from '~/lib/const';

export type OgType = 'website' | 'article' | 'product';

export type BuildMetaInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  imageWidth?: number;
  imageHeight?: number;
  ogType?: OgType;
  robots?: string;
};

export type BreadcrumbItem = {
  name: string;
  path?: string;
};

type ProductJsonLdInput = {
  name: string;
  description: string;
  handle: string;
  sku?: string | null;
  image?: string | null;
  price: string;
  currencyCode: string;
  availableForSale: boolean;
};

type ArticleJsonLdInput = {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  modifiedAt?: string | null;
  author?: string | null;
  image?: string | null;
};

type LocalBusinessInput = {
  name: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  lat: number;
  lng: number;
};

const TITLE_SUFFIX = ` | ${SITE_NAME}`;
const MAX_TITLE = 60;
const MAX_DESCRIPTION = 160;

export function truncateTitle(title: string): string {
  const withSuffix = title.includes(SITE_NAME) ? title : `${title}${TITLE_SUFFIX}`;
  if (withSuffix.length <= MAX_TITLE) return withSuffix;
  const budget = MAX_TITLE - TITLE_SUFFIX.length - 1;
  return `${title.slice(0, Math.max(budget, 20)).trim()}…${TITLE_SUFFIX}`;
}

export function truncateDescription(description: string): string {
  const trimmed = description.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= MAX_DESCRIPTION) return trimmed;
  return `${trimmed.slice(0, MAX_DESCRIPTION - 1).trim()}…`;
}

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return normalized === '/' ? SITE_URL : `${SITE_URL}${normalized}`;
}

export function buildMeta({
  title,
  description,
  path,
  image,
  imageWidth = DEFAULT_OG_IMAGE_WIDTH,
  imageHeight = DEFAULT_OG_IMAGE_HEIGHT,
  ogType = 'website',
  robots,
}: BuildMetaInput) {
  const fullTitle = truncateTitle(title);
  const metaDescription = truncateDescription(description);
  const url = absoluteUrl(path);
  const ogImage = image || DEFAULT_OG_IMAGE;

  const tags: Array<Record<string, string>> = [
    {title: fullTitle},
    {name: 'description', content: metaDescription},
    {tagName: 'link', rel: 'canonical', href: url},
    {property: 'og:title', content: fullTitle},
    {property: 'og:description', content: metaDescription},
    {property: 'og:url', content: url},
    {property: 'og:type', content: ogType},
    {property: 'og:image', content: ogImage},
    {property: 'og:image:width', content: String(imageWidth)},
    {property: 'og:image:height', content: String(imageHeight)},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: fullTitle},
    {name: 'twitter:description', content: metaDescription},
    {name: 'twitter:image', content: ogImage},
    {tagName: 'link', rel: 'alternate', hrefLang: 'en-GB', href: url},
  ];

  if (robots) {
    tags.push({name: 'robots', content: robots});
  }

  return tags;
}

/** @deprecated Use buildMeta — kept for existing content routes. */
export function pageMeta({
  title,
  description,
  path,
  ogType = 'website',
  image,
  robots,
}: BuildMetaInput) {
  return buildMeta({title, description, path, ogType, image, robots});
}

export function noindexMeta(extra?: Omit<BuildMetaInput, 'robots'>) {
  const robots = 'noindex, nofollow';
  if (!extra) {
    return [{name: 'robots', content: robots}];
  }
  return buildMeta({...extra, robots});
}

export const NOINDEX_HEADERS = {
  'X-Robots-Tag': 'noindex, nofollow',
} as const;

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bentech Medical Ltd',
    alternateName: ['Mobility Robot', 'XSTO UK'],
    url: SITE_URL,
    logo: `${SITE_URL}/images/xsto-bentech-header.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Unit 2 Old Forge Road',
      addressLocality: 'Wimborne',
      addressRegion: 'Dorset',
      postalCode: 'BH21 7RR',
      addressCountry: 'GB',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+44-208-050-4849',
      contactType: 'customer service',
      email: 'support@mobilityrobot.co.uk',
      areaServed: 'GB',
      availableLanguage: 'English',
    },
  };
}

export function websiteJsonLd(includeSearchAction = true) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    publisher: {'@id': `${SITE_URL}/#organization`},
  };

  if (includeSearchAction) {
    schema.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    };
  }

  return schema;
}

export function sitewideJsonLdGraph(includeSearchAction = true) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {...organizationJsonLd(), '@id': `${SITE_URL}/#organization`},
      websiteJsonLd(includeSearchAction),
    ],
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path ? absoluteUrl(item.path) : undefined,
    })),
  };
}

export function productJsonLd({
  name,
  description,
  handle,
  sku,
  image,
  price,
  currencyCode,
  availableForSale,
}: ProductJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: truncateDescription(description),
    image: image || DEFAULT_OG_IMAGE,
    sku: sku || undefined,
    brand: {'@type': 'Brand', name: 'XSTO'},
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/products/${handle}`),
      priceCurrency: currencyCode || 'GBP',
      price,
      availability: availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {'@type': 'Organization', name: 'Bentech Medical Ltd'},
    },
  };
}

export function faqJsonLd(
  items: Array<{question: string; answer: string}>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function localBusinessJsonLd(dealer: LocalBusinessInput) {
  return {
    '@type': 'LocalBusiness',
    name: dealer.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: dealer.address,
      addressLocality: dealer.city,
      postalCode: dealer.postcode,
      addressCountry: dealer.country,
    },
    telephone: dealer.phone,
    email: dealer.email,
    url: dealer.website || absoluteUrl('/stockists'),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: dealer.lat,
      longitude: dealer.lng,
    },
  };
}

export function localBusinessListJsonLd(
  dealers: LocalBusinessInput[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: dealers.map((dealer, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: localBusinessJsonLd(dealer),
    })),
  };
}

export function itemListJsonLd({
  name,
  items,
}: {
  name: string;
  items: Array<{name: string; url: string}>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.url),
    })),
  };
}

export function articleJsonLd({
  title,
  description,
  path,
  publishedAt,
  modifiedAt,
  author,
  image,
}: ArticleJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: truncateDescription(description),
    datePublished: publishedAt,
    dateModified: modifiedAt || publishedAt,
    author: {
      '@type': 'Person',
      name: author || 'XSTO Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bentech Medical Ltd',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/xsto-bentech-header.png`,
      },
    },
    mainEntityOfPage: absoluteUrl(path),
    image: image || DEFAULT_OG_IMAGE,
  };
}

export function jsonLdScript(
  data: Record<string, unknown> | Array<Record<string, unknown>>,
) {
  return {
    __html: JSON.stringify(data),
  };
}
