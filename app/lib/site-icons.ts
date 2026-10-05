import icon32 from '~/assets/xsto-favicon-32.png';
import icon192 from '~/assets/xsto-favicon-192.png';
import icon512 from '~/assets/xsto-favicon.png';
import appleIcon from '~/assets/apple-touch-icon.png';
import ico from '~/assets/favicon.ico';

export const SITE_ICON_VERSION = 'xsto-navy-20261005';

// Asset imports become content-hashed URLs, avoiding the retired icon cache.
export const SITE_ICON_LINKS = [
  {
    rel: 'icon',
    type: 'image/x-icon',
    sizes: '16x16 32x32 48x48 64x64 128x128 256x256',
    href: ico,
  },
  {rel: 'icon', type: 'image/png', sizes: '32x32', href: icon32},
  {rel: 'icon', type: 'image/png', sizes: '192x192', href: icon192},
  {rel: 'icon', type: 'image/png', sizes: '512x512', href: icon512},
  {rel: 'apple-touch-icon', sizes: '180x180', href: appleIcon},
  {rel: 'manifest', href: `/site.webmanifest?v=${SITE_ICON_VERSION}`},
];

export const SITE_MANIFEST_ICONS = [
  {src: icon192, sizes: '192x192', type: 'image/png', purpose: 'any'},
  {src: icon512, sizes: '512x512', type: 'image/png', purpose: 'any'},
];
