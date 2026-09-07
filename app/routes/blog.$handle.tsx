import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/blog.$handle';
import {JsonLd, PageShell} from '~/components/content/PageShell';
import {
  getLocalBlogPost,
  getRelatedLocalBlogPosts,
} from '~/lib/local-blog';
import {buildMeta, articleJsonLd, breadcrumbJsonLd} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  const article = data?.article;
  return buildMeta({
    title: article?.title || 'Article',
    description:
      article?.excerpt ||
      'Mobility guides and power wheelchair advice from Mobility Robot.',
    path: `/blog/${article?.slug ?? ''}`,
    ogType: 'article',
    image: article?.featuredImage,
  });
};

export async function loader({params}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) throw new Response('Not found', {status: 404});

  const article = getLocalBlogPost(handle);
  if (!article) throw new Response(null, {status: 404});

  const relatedArticles = getRelatedLocalBlogPosts(handle, 3);
  return {article, relatedArticles};
}

export default function BlogArticlePage() {
  const {article, relatedArticles} = useLoaderData<typeof loader>();

  const publishedAt = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(article.publishedAt));

  return (
    <PageShell className="max-w-3xl">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            {name: 'Home', path: '/'},
            {name: 'Blog', path: '/blog'},
            {name: article.title},
          ]),
          articleJsonLd({
            title: article.title,
            description: article.excerpt,
            path: `/blog/${article.slug}`,
            publishedAt: article.publishedAt,
            modifiedAt: article.publishedAt,
            author: article.author,
            image: article.featuredImage,
          }),
        ]}
      />

      <article>
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              className="font-medium text-gold no-underline hover:underline"
              prefetch="intent"
              to={`/blog?category=${article.category}`}
            >
              {article.categoryLabel}
            </Link>
            <span className="text-muted-foreground">·</span>
            <time className="text-muted-foreground" dateTime={article.publishedAt}>
              {publishedAt}
            </time>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{article.readTime} min read</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {article.title}
          </h1>
          {article.excerpt ? (
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {article.excerpt}
            </p>
          ) : null}
          <p className="mt-3 text-sm text-muted-foreground">
            By {article.author}
          </p>
        </header>

        {article.featuredImage ? (
          <img
            alt=""
            className="mb-8 aspect-[16/9] w-full rounded-2xl object-cover"
            decoding="async"
            height={630}
            loading="eager"
            src={article.featuredImage}
            width={1200}
          />
        ) : null}

        <div
          className="blog-prose prose prose-neutral max-w-none text-foreground prose-headings:scroll-mt-24 prose-headings:font-semibold prose-a:text-gold prose-strong:text-foreground prose-table:text-sm prose-th:text-left prose-img:rounded-xl"
          dangerouslySetInnerHTML={{__html: article.contentHtml}}
        />

        {article.tags.length > 0 ? (
          <ul className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
            {article.tags.map((tag) => (
              <li
                className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground"
                key={tag}
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </article>

      <section
        aria-labelledby="blog-cta-heading"
        className="mt-12 rounded-2xl border border-border bg-secondary/40 p-6 md:p-8"
      >
        <h2 className="text-xl font-semibold text-foreground" id="blog-cta-heading">
          Talk to the UK XSTO team
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Bentech Medical Ltd is the official UK distributor. Get help choosing a
          chair, claiming VAT relief, or booking a demo.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="btn-primary" prefetch="intent" to="/demo">
            Book a demo
          </Link>
          <Link
            className="inline-flex items-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground no-underline hover:border-navy/30"
            prefetch="intent"
            to="/collections/all"
          >
            Shop the range
          </Link>
          <Link
            className="inline-flex items-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground no-underline hover:border-navy/30"
            prefetch="intent"
            to="/vat-relief"
          >
            VAT relief
          </Link>
        </div>
      </section>

      {relatedArticles.length > 0 ? (
        <section
          aria-labelledby="related-articles"
          className="mt-12 border-t border-border pt-10"
        >
          <h2
            className="text-xl font-semibold text-foreground"
            id="related-articles"
          >
            Related articles
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {relatedArticles.map((related) => (
              <li key={related.slug}>
                <Link
                  className="block h-full rounded-xl border border-border bg-card p-4 no-underline transition-colors hover:border-gold"
                  prefetch="intent"
                  to={`/blog/${related.slug}`}
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    {related.categoryLabel}
                  </p>
                  <h3 className="mt-1.5 text-sm font-semibold leading-snug text-foreground">
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
