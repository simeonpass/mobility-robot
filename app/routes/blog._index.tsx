import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/blog._index';
import {PageHeader, PageShell} from '~/components/content/PageShell';
import {
  filterLocalBlogPosts,
  getLocalBlogCategories,
  type LocalBlogPost,
} from '~/lib/local-blog';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: 'Mobility Blog & Power Wheelchair Guides',
    description:
      'UK guides to foldable power wheelchairs, stair climbing chairs, VAT relief, maintenance and accessible travel from Mobility Robot — official XSTO distributor.',
    path: '/blog',
  });

export async function loader({request}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const allPosts = filterLocalBlogPosts('all');
  const posts = filterLocalBlogPosts(category);
  const categories = getLocalBlogCategories();

  return {
    posts,
    totalCount: allPosts.length,
    categories,
    activeCategory: category && category !== 'all' ? category : 'all',
  };
}

export default function BlogIndexPage() {
  const {posts, totalCount, categories, activeCategory} =
    useLoaderData<typeof loader>();

  return (
    <PageShell>
      <PageHeader
        description="Practical UK guides on power wheelchairs, stair climbing, VAT relief, maintenance and accessible living — written for Mobility Robot customers."
        title="Mobility Blog"
      />

      <div className="mt-8 flex flex-wrap gap-2">
        <CategoryChip
          active={activeCategory === 'all'}
          href="/blog"
          label={`All (${totalCount})`}
        />
        {categories.map((category) => (
          <CategoryChip
            active={activeCategory === category.id}
            href={`/blog?category=${category.id}`}
            key={category.id}
            label={`${category.label} (${category.count})`}
          />
        ))}
      </div>

      {posts.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          No articles in this category yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </PageShell>
  );
}

function CategoryChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      className={[
        'inline-flex rounded-full border px-3.5 py-1.5 text-sm no-underline transition-colors',
        active
          ? 'border-navy bg-navy text-white'
          : 'border-border bg-card text-foreground hover:border-navy/40',
      ].join(' ')}
      prefetch="intent"
      to={href}
    >
      {label}
    </Link>
  );
}

function BlogCard({post}: {post: LocalBlogPost}) {
  const publishedAt = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(post.publishedAt));

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-medium">
      <Link
        className="flex flex-1 flex-col no-underline"
        prefetch="intent"
        to={`/blog/${post.slug}`}
      >
        {post.featuredImage ? (
          <div className="aspect-[16/9] overflow-hidden bg-secondary">
            <img
              alt=""
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              decoding="async"
              height={630}
              loading="lazy"
              src={post.featuredImage}
              width={1200}
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-secondary px-2.5 py-0.5 font-medium text-foreground">
              {post.categoryLabel}
            </span>
            <time dateTime={post.publishedAt}>{publishedAt}</time>
            <span aria-hidden>·</span>
            <span>{post.readTime} min read</span>
          </div>
          <h2 className="mt-3 text-lg font-semibold leading-snug text-foreground group-hover:text-gold">
            {post.title}
          </h2>
          {post.excerpt ? (
            <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          ) : null}
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-gold">
            Read article
            <span aria-hidden className="ml-1 transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
}
