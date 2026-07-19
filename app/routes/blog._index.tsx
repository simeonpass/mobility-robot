import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/blog._index';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {PageHeader, PageShell} from '~/components/content/PageShell';
import {BLOG_ARTICLES_QUERY, BLOG_HANDLE} from '~/lib/blog-queries';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) =>
  pageMeta({
    title: data?.blog?.seo?.title || 'News & Updates',
    description:
      data?.blog?.seo?.description ||
      'Latest news, guides and updates from Mobility Robot and Bentech Medical Ltd.',
    path: '/blog',
  });

export async function loader({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {pageBy: 9});
  const {blog} = await context.storefront.query(BLOG_ARTICLES_QUERY, {
    variables: {blogHandle: BLOG_HANDLE, ...paginationVariables},
  });

  if (!blog) {
    throw new Response('Blog not found', {status: 404});
  }

  return {blog};
}

type BlogArticleCard = {
  id: string;
  handle: string;
  title: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  image?: {
    altText?: string | null;
    url: string;
    width?: number | null;
    height?: number | null;
  } | null;
};

export default function BlogIndexPage() {
  const {blog} = useLoaderData<typeof loader>();

  return (
    <PageShell>
      <PageHeader
        description="News, product updates and mobility guides from the official UK XSTO distributor."
        title={blog.title || 'News & Updates'}
      />

      <PaginatedResourceSection<BlogArticleCard>
        connection={blog.articles}
        resourcesClassName="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {({node: article}) => (
          <BlogCard article={article} key={article.id} />
        )}
      </PaginatedResourceSection>
    </PageShell>
  );
}

function BlogCard({article}: {article: BlogArticleCard}) {
  const publishedAt = article.publishedAt
    ? new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(article.publishedAt))
    : null;

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      <Link className="block no-underline" prefetch="intent" to={`/blog/${article.handle}`}>
        {article.image ? (
          <Image
            alt={article.image.altText || article.title}
            aspectRatio="16/9"
            className="w-full object-cover"
            data={article.image}
            loading="lazy"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
        ) : null}
        <div className="p-5">
          {publishedAt ? (
            <time className="text-xs text-muted-foreground" dateTime={article.publishedAt!}>
              {publishedAt}
            </time>
          ) : null}
          <h2 className="mt-1 text-lg font-semibold text-foreground">{article.title}</h2>
          {article.excerpt ? (
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {article.excerpt}
            </p>
          ) : null}
          <span className="mt-3 inline-block text-sm font-semibold text-gold">
            Read article →
          </span>
        </div>
      </Link>
    </article>
  );
}

