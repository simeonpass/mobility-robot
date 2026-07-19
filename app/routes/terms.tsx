import type {Route} from './+types/terms';
import {ContentWithToc} from '~/components/content/ContentWithToc';
import {PageHeader, PageShell} from '~/components/content/PageShell';
import {termsSections} from '~/lib/content/legal';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: 'Terms & Conditions',
    description:
      'Terms of use and purchase for mobilityrobot.co.uk, operated by Bentech Medical Ltd, official UK XSTO distributor.',
    path: '/terms',
  });

export default function TermsPage() {
  return (
    <PageShell>
      <PageHeader
        breadcrumbs={[{name: 'Home', path: '/'}, {name: 'Terms'}]}
        description="Please read these terms carefully before using our website or placing an order."
        title="Terms & Conditions"
      />
      <ContentWithToc sections={termsSections} />
    </PageShell>
  );
}
