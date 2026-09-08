import {useEffect, useId, useRef, useState} from 'react';
import {Play} from 'lucide-react';
import {ProductVideoPlayer} from '~/components/product/ProductVideoPlayer';
import {SectionIntro} from '~/components/home/SectionIntro';
import heroPosterDesktop from '~/assets/m4-hero-new.webp';
import {
  HOMEPAGE_VIDEO_ITEMS,
  type HomepageVideoItem,
  youtubeEmbedUrl,
} from '~/lib/homepage-data';

export function ExperienceRangeSection() {
  const [activeVideoKey, setActiveVideoKey] = useState<string | null>(null);
  const activeVideo = HOMEPAGE_VIDEO_ITEMS.find(
    (item) => item.id === activeVideoKey,
  );

  return (
    <>
      <section className="xsto-section bg-gradient-cream" id="experience-range">
        <div className="xsto-container">
          <SectionIntro
            accent="range."
            description="Watch the range in action, from everyday self-levelling to the X12’s stair-climbing capability."
            label="See it in action"
            title="Experience the"
          />

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {HOMEPAGE_VIDEO_ITEMS.map((item, index) => {
              const thumbSrc = item.videoUrl
                ? heroPosterDesktop
                : `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;

              return (
                <button
                  aria-label={`Play ${item.title}`}
                  className="group overflow-hidden rounded-2xl border border-border/70 bg-card text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary animate-fade-in-up"
                  key={item.id}
                  onClick={() => setActiveVideoKey(item.id)}
                  style={{animationDelay: `${index * 80}ms`}}
                  type="button"
                >
                  <div className="relative aspect-video overflow-hidden bg-navy">
                    <img
                      alt=""
                      className="size-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                      decoding="async"
                      loading="lazy"
                      src={thumbSrc}
                      width={480}
                      height={270}
                    />
                    <div className="absolute inset-0 bg-navy/25 transition-colors group-hover:bg-navy/15" />
                    <span className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary-foreground/95 text-navy shadow-luxe transition-transform group-hover:scale-105">
                      <Play
                        aria-hidden
                        className="ml-0.5 size-6 fill-current"
                        strokeWidth={0}
                      />
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {activeVideo ? (
        <HomeVideoDialog
          onClose={() => setActiveVideoKey(null)}
          video={activeVideo}
        />
      ) : null}
    </>
  );
}

function HomeVideoDialog({
  video,
  onClose,
}: {
  video: HomepageVideoItem;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const trigger = document.activeElement;
    const previousOverflow = document.documentElement.style.overflow;
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';

    return () => {
      dialog.close();
      document.documentElement.style.overflow = previousOverflow;
      if (trigger instanceof HTMLElement && trigger.isConnected) {
        trigger.focus({preventScroll: true});
      }
    };
  }, []);

  return (
    <dialog
      aria-labelledby={titleId}
      className="fixed inset-0 m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-5xl overflow-y-auto rounded-2xl border border-white/10 bg-navy p-0 text-white shadow-luxe backdrop:bg-navy/90 backdrop:backdrop-blur-sm"
      onClose={() => {
        if (dialogRef.current && !dialogRef.current.open) onClose();
      }}
      ref={dialogRef}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <p className="text-base font-semibold" id={titleId}>
          {video.title}
        </p>
        <button
          aria-label="Close video"
          className="min-h-11 shrink-0 rounded-full border border-white/30 px-4 text-sm font-semibold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          onClick={() => dialogRef.current?.close()}
          type="button"
        >
          Close
        </button>
      </div>
      <div className="aspect-video w-full">
        {video.videoUrl ? (
          <ProductVideoPlayer
            autoPlay
            className="size-full object-contain"
            poster={heroPosterDesktop}
            src={video.videoUrl}
            title={video.title}
          />
        ) : video.youtubeId ? (
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="size-full border-0"
            src={youtubeEmbedUrl(video.youtubeId, {
              autoplay: true,
              controls: true,
            })}
            title={video.title}
          />
        ) : null}
      </div>
    </dialog>
  );
}
