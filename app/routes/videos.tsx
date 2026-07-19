import type {Route} from './+types/videos';
import {PageHeader, PageShell} from '~/components/content/PageShell';
import {VideosLibrary} from '~/components/videos/VideosLibrary';
import {buildMeta} from '~/lib/seo';
import {VIDEO_PAGE_COPY} from '~/lib/videos-data';

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: 'Videos | XSTO Self-Balancing Wheelchair Demos & Tutorials',
    description:
      'Watch demonstrations, tutorials, and reviews of XSTO M4 and M4 Pro self-balancing power wheelchairs. See award-winning mobility technology in action.',
    path: '/videos',
  });

export default function VideosPage() {
  return (
    <PageShell>
      <PageHeader
        breadcrumbs={[
          {name: 'Home', path: '/'},
          {name: 'Videos'},
        ]}
        description={VIDEO_PAGE_COPY.description}
        title={VIDEO_PAGE_COPY.title}
      />
      <VideosLibrary />
    </PageShell>
  );
}
