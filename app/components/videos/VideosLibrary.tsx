import {useEffect, useId, useState} from 'react';
import {Play} from 'lucide-react';
import {ProductVideoPlayer} from '~/components/product/ProductVideoPlayer';
import {
  VIDEO_PAGE_COPY,
  videoPlaybackSrc,
  videosByCategory,
  videoTypeLabel,
  type LibraryVideo,
  type VideoCategory,
} from '~/lib/videos-data';

const SECTIONS: VideoCategory[] = ['tutorial', 'lifestyle'];

export function VideosLibrary() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeVideo = [
    ...videosByCategory('tutorial'),
    ...videosByCategory('lifestyle'),
  ].find((video) => video.id === activeId);

  useEffect(() => {
    if (!activeId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveId(null);
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [activeId]);

  return (
    <>
      <div className="space-y-14 md:space-y-16">
        {SECTIONS.map((category) => {
          const section = VIDEO_PAGE_COPY.sections[category];
          const videos = videosByCategory(category);
          return (
            <section aria-labelledby={`videos-${category}`} key={category}>
              <div className="mb-6 max-w-2xl md:mb-8">
                <h2
                  className="font-display text-2xl font-semibold tracking-tight text-navy md:text-3xl"
                  id={`videos-${category}`}
                >
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-navy/60 md:text-base">
                  {section.description}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    onPlay={() => setActiveId(video.id)}
                    video={video}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {activeVideo ? (
        <VideoModal onClose={() => setActiveId(null)} video={activeVideo} />
      ) : null}
    </>
  );
}

function VideoCard({
  video,
  onPlay,
}: {
  video: LibraryVideo;
  onPlay: () => void;
}) {
  const titleId = useId();

  return (
    <button
      aria-labelledby={titleId}
      className="group overflow-hidden rounded-2xl border border-border/70 bg-card text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-medium"
      onClick={onPlay}
      type="button"
    >
      <div className="relative aspect-video overflow-hidden bg-navy">
        {video.thumbnail ? (
          <img
            alt=""
            className="size-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
            decoding="async"
            loading="lazy"
            src={video.thumbnail}
          />
        ) : (
          <div className="size-full bg-navy/80" />
        )}
        <div className="absolute inset-0 bg-navy/20 transition-colors group-hover:bg-navy/10" />
        <span className="absolute left-3 top-3 rounded-md bg-navy/85 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-white">
          {video.category === 'tutorial' ? 'Tutorial' : 'Lifestyle'}
        </span>
        <span className="absolute right-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-navy">
          {videoTypeLabel(video)}
        </span>
        <span className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy shadow-luxe transition-transform group-hover:scale-105">
          <Play aria-hidden className="ml-0.5 size-6 fill-current" strokeWidth={0} />
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-navy" id={titleId}>
          {video.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-navy/60">
          {video.description}
        </p>
      </div>
    </button>
  );
}

function VideoModal({
  video,
  onClose,
}: {
  video: LibraryVideo;
  onClose: () => void;
}) {
  const playbackSrc = videoPlaybackSrc(video);
  const isMp4 = video.type === 'mp4';

  return (
    <div
      aria-modal
      className="fixed inset-0 z-[70] flex items-center justify-center bg-navy/90 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <button
        aria-label="Close video"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <div className="relative z-10 aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-navy shadow-luxe">
        <button
          aria-label="Close"
          className="absolute top-3 right-3 z-20 rounded-full border border-white/20 bg-navy/80 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-navy"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
        {isMp4 ? (
          <ProductVideoPlayer
            autoPlay
            className="size-full object-contain"
            poster={video.thumbnail}
            src={playbackSrc}
            title={video.title}
          />
        ) : (
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="size-full border-0"
            src={playbackSrc}
            title={video.title}
          />
        )}
      </div>
    </div>
  );
}
