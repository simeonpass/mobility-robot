export function loader() {
  return Response.json({
    name: 'Mobility Robot by Bentech Medical',
    short_name: 'Mobility Robot',
    start_url: '/',
    display: 'browser',
    background_color: '#ffffff',
    theme_color: '#233048',
    icons: [{src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'any'}],
  }, {headers: {'Content-Type': 'application/manifest+json', 'Cache-Control': 'public, max-age=3600'}});
}
