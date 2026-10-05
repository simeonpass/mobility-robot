import {SITE_MANIFEST_ICONS} from '~/lib/site-icons';

export function loader() {
  return Response.json(
    {
      name: 'Mobility Robot by Bentech Medical',
      short_name: 'Mobility Robot',
      start_url: '/',
      display: 'browser',
      background_color: '#ffffff',
      theme_color: '#233048',
      icons: SITE_MANIFEST_ICONS,
    },
    {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
}
