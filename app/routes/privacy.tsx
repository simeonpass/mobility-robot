import {Link} from 'react-router';
import type {Route} from './+types/privacy';
import {ContentWithToc} from '~/components/content/ContentWithToc';
import {JsonLd, PageShell} from '~/components/content/PageShell';
import {privacySections} from '~/lib/content/legal';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: 'Privacy Policy',
    description:
      'How Bentech Medical Ltd collects, uses and protects your personal data on mobilityrobot.co.uk.',
    path: '/privacy',
  });

export default function PrivacyPage() {
  return (
    <PageShell>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Privacy Policy — Mobility Robot',
          description:
            'Privacy policy for mobilityrobot.co.uk operated by Bentech Medical Ltd.',
        }}
      />

      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-navy text-white">
        <div className="px-5 py-8 sm:px-8 md:px-10 md:py-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
            Legal
          </p>
          <h1 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            Privacy policy
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80">
            How Bentech Medical Ltd collects, uses and protects your personal
            data when you use mobilityrobot.co.uk. Effective July 2026.
          </p>
        </div>
      </section>

      <nav aria-label="Breadcrumb" className="mt-5 text-xs text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="hover:text-gold" prefetch="intent" to="/">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="font-medium text-foreground">
            Privacy
          </li>
        </ol>
      </nav>

      <div className="mt-10">
        <ContentWithToc sections={privacySections} />
      </div>
    </PageShell>
  );
}
