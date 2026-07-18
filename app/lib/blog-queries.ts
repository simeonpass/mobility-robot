export const BLOG_HANDLE = 'news';

export const BLOG_ARTICLES_QUERY = `#graphql
  query BlogArticles(
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      articles(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
      ) {
        nodes {
          ...BlogArticleCard
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
  fragment BlogArticleCard on Article {
    id
    handle
    title
    excerpt
    publishedAt
    author: authorV2 {
      name
    }
    image {
      id
      altText
      url
      width
      height
    }
    blog {
      handle
    }
  }
` as const;

export const BLOG_ARTICLE_QUERY = `#graphql
  query BlogArticle(
    $blogHandle: String!
    $articleHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    blog(handle: $blogHandle) {
      handle
      title
      articleByHandle(handle: $articleHandle) {
        handle
        title
        contentHtml
        excerpt
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          title
          description
        }
      }
      articles(first: 4, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          id
          handle
          title
          excerpt
          publishedAt
          image {
            id
            altText
            url
            width
            height
          }
        }
      }
    }
  }
` as const;

export const BLOG_ARTICLE_HANDLES_QUERY = `#graphql
  query BlogArticleHandles($blogHandle: String!) {
    blog(handle: $blogHandle) {
      articles(first: 250) {
        nodes {
          handle
          publishedAt
        }
      }
    }
  }
` as const;
