import {useState} from 'react';
import {Play} from 'lucide-react';
import {isDirectVideoUrl} from '~/lib/product-gallery';

type ProductVideoPlayerProps = {
  src: string;
  title: string;
  className?: string;
  autoPlay?: boolean;
  /** Optional poster image shown before the user starts a direct MP4. */
  poster?: string;
};

/**
 * Renders a local/remote MP4 with `<video>`, or a YouTube (etc.) embed with `<iframe>`.
 * Direct MP4s are click-to-load so giant public/ assets are never fetched until play.
 */
export function ProductVideoPlayer({
  src,
  title,
  className = 'size-full border-0',
  autoPlay = false,
  poster,
}: ProductVideoPlayerProps) {
  const [started, setStarted] = useState(autoPlay);

  if (isDirectVideoUrl(src)) {
    if (!started) {
      return (
        <button
          className="group relative block size-full overflow-hidden bg-navy"
          onClick={() => setStarted(true)}
          type="button"
        >
          {poster ? (
            <img
              alt={title}
              className="size-full object-cover opacity-90"
              decoding="async"
              loading="lazy"
              src={poster}
            />
          ) : (
            <div className="size-full bg-gradient-to-br from-navy via-navy to-secondary" />
          )}
          <span className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary-foreground/95 text-navy shadow-luxe transition-transform group-hover:scale-105">
            <Play aria-hidden className="ml-0.5 size-6 fill-current" strokeWidth={0} />
          </span>
          <span className="sr-only">Play {title}</span>
        </button>
      );
    }

    return (
      <video
        autoPlay={autoPlay || started}
        className={className}
        controls
        playsInline
        preload="none"
        src={src}
        title={title}
      />
    );
  }

  return (
    <iframe
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className={className}
      src={
        autoPlay
          ? `${src}${src.includes('?') ? '&' : '?'}autoplay=1`
          : src
      }
      title={title}
    />
  );
}
