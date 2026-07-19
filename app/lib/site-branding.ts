export const HEADER_LOGO = {
  dark: {
    src: '/images/xsto-bentech-header.png',
    width: 800,
    height: 250,
    alt: 'Mobility Robot — Official UK XSTO distributor, Bentech Medical Ltd',
  },
  light: {
    src: '/images/xsto-bentech-header-light.png',
    width: 800,
    height: 250,
    alt: 'Mobility Robot — Official UK XSTO distributor, Bentech Medical Ltd',
  },
} as const;

/** Display height in the header; width scales from intrinsic aspect ratio. */
export const HEADER_LOGO_DISPLAY_HEIGHT = 80;

export function headerLogoDisplayWidth(
  height = HEADER_LOGO_DISPLAY_HEIGHT,
): number {
  return Math.round(
    (HEADER_LOGO.dark.width / HEADER_LOGO.dark.height) * height,
  );
}
