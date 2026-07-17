import type {Route} from './+types/returns';
import {ContentWithToc} from '~/components/content/ContentWithToc';
import {PageHeader, PageShell} from '~/components/content/PageShell';
import {returnsSections} from '~/lib/content/warranty-returns';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: 'Returns Policy',
    description:
      '14-day UK returns, condition requirements and £250 collection fee for large XSTO mobility products.',
    path: '/returns',
  });

export default function ReturnsPage() {
  return (
    <PageShell>
      <PageHeader
        breadcrumbs={[{name: 'Home', path: '/'}, {name: 'Returns'}]}
        description="Your statutory rights and our returns process for XSTO powered wheelchairs purchased from Bentech Medical Ltd."
        title="Returns Policy"
      />
      <ContentWithToc sections={returnsSections} />
    </PageShell>
  );
}
