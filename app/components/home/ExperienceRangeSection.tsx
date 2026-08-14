import {useState} from 'react';
import {Play} from 'lucide-react';
import {ProductVideoPlayer} from '~/components/product/ProductVideoPlayer';
import {SectionIntro} from '~/components/home/SectionIntro';
import heroPosterDesktop from '~/assets/m4-hero-new.webp';
import {
  HOMEPAGE_VIDEO_ITEMS,
  youtubeEmbedUrl,
} from '~/lib/homepage-data';

export function ExperienceRangeSection() {
  const [activeVideoKey, setActiveVideoKey] = useState<string | null>(null);
  const activeVideo = HOMEPAGE_VIDEO_ITEMS.find(
    (item) => item.id === activeVideoKey,
  );

  return (
    <>
      <section className="xsto-section bg-[#f8f9fb]" id="experience-range">
        <div className="xsto-container">
          <SectionIntro
            accent="range."
            description="Watch real demonstrations of our revolutionary wheelchairs — from self-balancing technology to AI-powered stair climbing."
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
                  className="group overflow-hidden rounded-2xl border border-border/70 bg-card text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-medium animate-fade-in-up"
                  key={item.id}
                  onClick={() => setActiveVideoKey(item.id)}
                  style={{animationDelay: `${index * 80}ms`}}
                  type="button"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-200">
                    <img
                      alt={item.title}
                      className="size-full object-cover opacity-95 transition-transform duration-500 group-hover:scale-105"
                      decoding="async"
                      loading="lazy"
                      src={thumbSrc}
                    />
                    <div className="absolute inset-0 bg-navy/10 transition-colors group-hover:bg-navy/5" />
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
        <div
          aria-modal
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4 backdrop-blur-sm"
          role="dialog"
        >
          <button
            aria-label="Close video"
            className="absolute inset-0"
            onClick={() => setActiveVideoKey(null)}
            type="button"
          />
          <div className="relative z-10 aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-primary-foreground/10 bg-navy shadow-luxe">
            <button
              aria-label="Close"
              className="absolute top-3 right-3 z-20 rounded-full border border-primary-foreground/20 bg-navy/80 px-3 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur-sm hover:bg-navy"
              onClick={() => setActiveVideoKey(null)}
              type="button"
            >
              Close
            </button>
            {activeVideo.videoUrl ? (
              <ProductVideoPlayer
                autoPlay
                className="size-full object-contain"
                poster={heroPosterDesktop}
                src={activeVideo.videoUrl}
                title={activeVideo.title}
              />
            ) : activeVideo.youtubeId ? (
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="size-full border-0"
                src={youtubeEmbedUrl(activeVideo.youtubeId, {
                  autoplay: true,
                  controls: true,
                })}
                title={activeVideo.title}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
