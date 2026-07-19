export type VideoCategory = 'tutorial' | 'lifestyle';

export type LibraryVideo = {
  id: string;
  type: 'youtube' | 'vimeo' | 'mp4';
  /** YouTube/Vimeo ID, or absolute MP4 URL. */
  src: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: VideoCategory;
};

const XSTO_LOVABLE_ORIGIN = 'https://xsto.co.uk';

/**
 * Video library copied from the Lovable xsto.co.uk `/videos` page.
 * YouTube/Vimeo IDs and Shopify CDN MP4s are durable; the X12 training
 * MP4/poster currently host on the Lovable asset CDN under xsto.co.uk.
 */
export const VIDEO_LIBRARY: LibraryVideo[] = [
  {
    id: 'x12-training',
    type: 'mp4',
    src: `${XSTO_LOVABLE_ORIGIN}/__l5e/assets-v1/f2e8b239-5de3-4259-9736-092dedf73ac2/x12-training.mp4`,
    title: 'XSTO X12 — Full Training Video',
    description:
      'Complete operator training walkthrough for the XSTO X12 all-terrain stair-climbing robot. Covers setup, controls, driving modes, stair climbing and safety.',
    thumbnail: `${XSTO_LOVABLE_ORIGIN}/__l5e/assets-v1/42ff1a45-33a8-4670-97d8-514122bb93f3/x12-training-poster.jpg`,
    category: 'tutorial',
  },
  {
    id: 'yt-tutorial-1',
    type: 'youtube',
    src: 'oCpjrdlMNeM',
    title: 'How To: Installation & Operating',
    description:
      'Complete guide to installing and operating your XSTO M4 Power Wheelchair',
    thumbnail: 'https://img.youtube.com/vi/oCpjrdlMNeM/maxresdefault.jpg',
    category: 'tutorial',
  },
  {
    id: 'yt-tutorial-2',
    type: 'youtube',
    src: '7yaY-wFOSCs',
    title: 'How To: Using the APP',
    description:
      'Learn how to use the XSTO smartphone app to control and customize your M4 wheelchair',
    thumbnail: 'https://img.youtube.com/vi/7yaY-wFOSCs/maxresdefault.jpg',
    category: 'tutorial',
  },
  {
    id: 'yt-tutorial-3',
    type: 'youtube',
    src: 'iv61L0fGsDM',
    title: 'How To: Armrest Height Adjustment',
    description:
      'Step-by-step guide to adjusting the armrest height on your XSTO M4',
    thumbnail: 'https://img.youtube.com/vi/iv61L0fGsDM/maxresdefault.jpg',
    category: 'tutorial',
  },
  {
    id: 'yt-tutorial-4',
    type: 'youtube',
    src: 'evTyNMHXJp0',
    title: 'How To: Left-Right Control Module Swap',
    description:
      'How to swap the control module from left to right side on your XSTO M4',
    thumbnail: 'https://img.youtube.com/vi/evTyNMHXJp0/maxresdefault.jpg',
    category: 'tutorial',
  },
  {
    id: 'vimeo-1',
    type: 'vimeo',
    src: '1116519455',
    title: 'M4 Robot SMART Electric Wheelchair — Award-Winning Innovation',
    description:
      'Discover the XSTO M4 Mobility Robot – winner of both the 2025 iF Design Award and Red Dot Award. Engineered for all-terrain travel, with AI-powered balance, one-touch folding, and customisable comfort.',
    thumbnail:
      'https://i.vimeocdn.com/video/2056184051-4209379a625a2c19b6e1fc1c789be230a6266d9f52ec961b7eb0e302ea967c57-d?mw=1920&q=85',
    category: 'lifestyle',
  },
  {
    id: 'mp4-hero',
    type: 'mp4',
    src: 'https://cdn.shopify.com/videos/c/o/v/d5f5603745454554acbe9b47bf4bd41f.mp4',
    title: "XSTO M4 — World's 1st SMART Electric Wheelchair",
    description:
      "See the M4 in action — the world's first smart electric wheelchair with revolutionary design and mobility features.",
    thumbnail: 'https://img.youtube.com/vi/D-7Pt3OUdQg/maxresdefault.jpg',
    category: 'lifestyle',
  },
  {
    id: 'yt-m4',
    type: 'youtube',
    src: 'ThQG0OgSNns',
    title: 'XSTO M4 Official Introduction',
    description:
      "Official product video showcasing the M4's innovative features and award-winning design.",
    thumbnail: 'https://img.youtube.com/vi/ThQG0OgSNns/maxresdefault.jpg',
    category: 'lifestyle',
  },
  {
    id: 'yt-m4pro',
    type: 'youtube',
    src: '-v_67i4C_Tg',
    title: 'XSTO M4 Pro — Premium Edition',
    description:
      'Discover the M4 Pro with integrated headrest, electric folding, and LED safety lighting.',
    thumbnail: 'https://img.youtube.com/vi/-v_67i4C_Tg/maxresdefault.jpg',
    category: 'lifestyle',
  },
  {
    id: 'yt-x12',
    type: 'youtube',
    src: 'Zc5kZT4-Bdc',
    title: 'XSTO X12 — All-Terrain Stair Climbing Robot',
    description:
      'Watch the X12 climb stairs, conquer slopes, and navigate rugged terrain with AI control.',
    thumbnail: 'https://img.youtube.com/vi/Zc5kZT4-Bdc/maxresdefault.jpg',
    category: 'lifestyle',
  },
  {
    id: 'yt-2',
    type: 'youtube',
    src: '-dCEl_rPEhQ',
    title: 'Self-Balancing Technology Demo',
    description:
      'Watch how the M4 automatically adjusts to keep you balanced on slopes up to 15°',
    thumbnail: 'https://img.youtube.com/vi/-dCEl_rPEhQ/maxresdefault.jpg',
    category: 'lifestyle',
  },
  {
    id: 'yt-3',
    type: 'youtube',
    src: 'D-7Pt3OUdQg',
    title: 'M4 In Action — Real-World Usage',
    description:
      'See the M4 navigate indoors, outdoors, metro, grassland, and rugged terrain',
    thumbnail: 'https://img.youtube.com/vi/D-7Pt3OUdQg/maxresdefault.jpg',
    category: 'lifestyle',
  },
  {
    id: 'yt-4',
    type: 'youtube',
    src: 'aD3Bco0qJh0',
    title: 'Complete M4 Overview',
    description: 'Discover why the M4 is changing the future of power wheelchairs',
    thumbnail: 'https://img.youtube.com/vi/aD3Bco0qJh0/maxresdefault.jpg',
    category: 'lifestyle',
  },
];

export const VIDEO_PAGE_COPY = {
  title: 'See Our Wheelchairs in Action',
  description:
    'Watch demonstrations, reviews, tutorials, and real-world footage of our award-winning XSTO mobility solutions.',
  sections: {
    tutorial: {
      title: 'Tutorial Videos',
      description:
        'Step-by-step how-to guides for setting up, operating, and adjusting your XSTO wheelchair.',
    },
    lifestyle: {
      title: 'Lifestyle Videos',
      description:
        'Real-world demonstrations, product showcases, and award-winning innovation in action.',
    },
  },
} as const;

export function videosByCategory(category: VideoCategory): LibraryVideo[] {
  return VIDEO_LIBRARY.filter((video) => video.category === category);
}

export function videoPlaybackSrc(video: LibraryVideo): string {
  if (video.type === 'youtube') {
    return `https://www.youtube-nocookie.com/embed/${video.src}?autoplay=1&rel=0`;
  }
  if (video.type === 'vimeo') {
    return `https://player.vimeo.com/video/${video.src}?autoplay=1`;
  }
  return video.src;
}

export function videoTypeLabel(video: LibraryVideo): string {
  if (video.type === 'youtube') return 'YouTube';
  if (video.type === 'vimeo') return 'Vimeo';
  return 'Video';
}
