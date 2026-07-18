export type GalleryImageItem = {
  type: 'image';
  id: string;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

export type GalleryVideoItem = {
  type: 'video';
  id: string;
  embedUrl: string;
  thumbnailUrl: string;
  title: string;
};

export type GalleryMediaItem = GalleryImageItem | GalleryVideoItem;

type ShopifyImage = {
  id?: string | null;
  url?: string | null;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

type MediaNode = {
  id: string;
  mediaContentType: string;
  alt?: string | null;
  image?: ShopifyImage | null;
  sources?: Array<{url?: string | null}> | null;
  previewImage?: {url?: string | null} | null;
  embedUrl?: string | null;
};

/** Strip Shopify CDN size suffixes and query params for deduplication. */
function normalizeImageKey(url: string): string {
  try {
    const {pathname} = new URL(url);
    return pathname
      .replace(/_\d+x\d+(?=\.[a-z]+$)/i, '')
      .replace(/\/(\d+x\d+)\//, '/')
      .toLowerCase();
  } catch {
    return url.split('?')[0].toLowerCase();
  }
}

export function collectGalleryMedia({
  productImages,
  mediaNodes,
  extraVideoEmbedUrls = [],
  productTitle,
}: {
  /** Product-level images only — not variant permutations. */
  productImages: ShopifyImage[];
  mediaNodes: MediaNode[];
  extraVideoEmbedUrls?: Array<string | null | undefined>;
  productTitle: string;
}): GalleryMediaItem[] {
  const items: GalleryMediaItem[] = [];
  const seenImages = new Set<string>();
  const seenVideos = new Set<string>();

  const addImage = (image?: ShopifyImage | null, altText?: string | null) => {
    if (!image?.url) return;
    const key = normalizeImageKey(image.url);
    if (seenImages.has(key)) return;
    seenImages.add(key);
    items.push({
      type: 'image',
      id: image.id ?? key,
      url: image.url,
      altText: altText ?? image.altText,
      width: image.width,
      height: image.height,
    });
  };

  const addVideo = ({
    id,
    embedUrl,
    thumbnailUrl,
    title,
  }: {
    id: string;
    embedUrl: string;
    thumbnailUrl?: string | null;
    title?: string;
  }) => {
    const normalizedEmbed = normalizeYoutubeEmbed(embedUrl);
    if (!normalizedEmbed || seenVideos.has(normalizedEmbed)) return;
    seenVideos.add(normalizedEmbed);
    const videoId = extractYoutubeVideoId(normalizedEmbed);
    items.push({
      type: 'video',
      id,
      embedUrl: normalizedEmbed,
      thumbnailUrl:
        thumbnailUrl ??
        (videoId
          ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
          : ''),
      title: title ?? 'Product video',
    });
  };

  // Product-level images from Shopify (deduped, no variant permutations).
  productImages.forEach((image) => addImage(image));

  // Videos from product media (images in media are skipped — covered by product.images).
  for (const node of mediaNodes) {
    if (node.mediaContentType === 'VIDEO') {
      addVideo({
        id: node.id,
        embedUrl: node.sources?.[0]?.url ?? '',
        thumbnailUrl: node.previewImage?.url,
        title: node.alt ?? 'Product video',
      });
      continue;
    }

    if (node.mediaContentType === 'EXTERNAL_VIDEO' && node.embedUrl) {
      addVideo({
        id: node.id,
        embedUrl: node.embedUrl,
        thumbnailUrl: node.previewImage?.url,
        title: node.alt ?? 'Product video',
      });
    }
  }

  for (const embedUrl of extraVideoEmbedUrls) {
    const normalized = normalizeYoutubeEmbed(embedUrl);
    if (!normalized) continue;
    addVideo({
      id: `extra-video-${normalized}`,
      embedUrl: normalized,
      title: `${productTitle} video`,
    });
  }

  return items;
}

export function isDirectVideoUrl(url: string): boolean {
  return /\.mp4($|\?)/i.test(url);
}

export function normalizeYoutubeEmbed(value?: string | null): string | null {
  if (!value) return null;

  if (value.includes('youtube-nocookie.com/embed/')) {
    return value;
  }

  if (value.includes('youtube.com/embed/')) {
    return value.replace('youtube.com', 'youtube-nocookie.com');
  }

  const watchMatch = value.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
  );
  if (watchMatch?.[1]) {
    return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}`;
  }

  // Local public assets (e.g. /videos/x12/demo.mp4) or remote MP4/HTTP URLs.
  if (value.startsWith('/') || value.startsWith('http')) {
    return value;
  }

  return null;
}

export function extractYoutubeVideoId(embedUrl: string): string | null {
  const match = embedUrl.match(/embed\/([\w-]+)/);
  return match?.[1] ?? null;
}
