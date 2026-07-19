import type {Route} from './+types/privacy';
import {ContentWithToc} from '~/components/content/ContentWithToc';
import {PageHeader, PageShell} from '~/components/content/PageShell';
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
      <PageHeader
        breadcrumbs={[{name: 'Home', path: '/'}, {name: 'Privacy'}]}
        description="Last updated: July 2026. Bentech Medical Ltd is the data controller for mobilityrobot.co.uk."
        title="Privacy Policy"
      />
      <ContentWithToc sections={privacySections} />
    </PageShell>
  );
}
