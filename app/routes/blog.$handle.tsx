import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/blog.$handle';
import {Image} from '@shopify/hydrogen';
import {JsonLd, PageShell} from '~/components/content/PageShell';
import {BLOG_ARTICLE_QUERY, BLOG_HANDLE} from '~/lib/blog-queries';
import {buildMeta, articleJsonLd, breadcrumbJsonLd} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  const article = data?.article;
  const title = article?.seo?.title || article?.title || 'Article';
  const description =
    article?.seo?.description ||
    article?.excerpt ||
    'News and mobility guides from Mobility Robot.';

  return buildMeta({
    title,
    description,
    path: `/blog/${data?.article?.handle ?? ''}`,
    ogType: 'article',
    image: data?.article?.image?.url,
  });
};

export async function loader({context, params}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) throw new Response('Not found', {status: 404});

  const {blog} = await context.storefront.query(BLOG_ARTICLE_QUERY, {
    variables: {blogHandle: BLOG_HANDLE, articleHandle: handle},
  });

  const article = blog?.articleByHandle;
  if (!article) throw new Response(null, {status: 404});

  const relatedArticles = (
    blog?.articles?.nodes?.filter(
      (node: {handle: string}) => node.handle !== handle,
    ) ?? []
  ).slice(0, 3);

  return {article, relatedArticles};
}

export default function BlogArticlePage() {
  const {article, relatedArticles} = useLoaderData<typeof loader>();

  const publishedAt = article.publishedAt
    ? new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(article.publishedAt))
    : null;

  return (
    <PageShell className="max-w-4xl">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            {name: 'Home', path: '/'},
            {name: 'Blog', path: '/blog'},
            {name: article.title},
          ]),
          articleJsonLd({
            title: article.title,
            description: article.excerpt || article.seo?.description || '',
            path: `/blog/${article.handle}`,
            publishedAt: article.publishedAt,
            modifiedAt: article.publishedAt,
            author: article.author?.name || 'XSTO Team',
            image: article.image?.url,
          }),
        ]}
      />

      <article>
        <header className="mb-8">
          <p className="text-sm font-medium text-gold">XSTO News</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
            {article.title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {publishedAt ? (
              <time dateTime={article.publishedAt}>{publishedAt}</time>
            ) : null}
            {article.author?.name ? (
              <>
                {' '}
                · <span>{article.author.name}</span>
              </>
            ) : null}
          </p>
        </header>

        {article.image ? (
          <Image
            alt={article.image.altText || article.title}
            className="mb-8 w-full rounded-xl"
            data={article.image}
            loading="eager"
            sizes="(min-width: 768px) 800px, 100vw"
          />
        ) : null}

        <div
          className="prose prose-neutral max-w-none text-foreground [&_a]:text-gold [&_img]:rounded-lg"
          dangerouslySetInnerHTML={{__html: article.contentHtml}}
        />
      </article>

      {relatedArticles.length > 0 ? (
        <section aria-labelledby="related-articles" className="mt-12 border-t border-border pt-10">
          <h2 className="text-xl font-semibold text-foreground" id="related-articles">
            Related articles
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {relatedArticles.map((related: {id: string; handle: string; title: string}) => (
              <li key={related.id}>
                <Link
                  className="block rounded-xl border border-border p-4 no-underline hover:border-gold"
                  prefetch="intent"
                  to={`/blog/${related.handle}`}
                >
                  <h3 className="text-sm font-semibold text-foreground">
                    {related.title}
                  </h3>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PageShell>
  );
}
