import {useState} from 'react';
import {Play} from 'lucide-react';
import type {ProductVideo} from '~/lib/product-content';

type ProductVideoHeroProps = {
  video: ProductVideo;
  productName: string;
};

export function ProductVideoHero({video, productName}: ProductVideoHeroProps) {
  const [playing, setPlaying] = useState(false);
  const youtubeId = extractYoutubeId(video.embedUrl);

  return (
    <section className="mt-16 md:mt-20">
      <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        {video.title}
      </h2>

      <div className="overflow-hidden rounded-2xl border border-border bg-navy shadow-luxe">
        {playing ? (
          <div className="aspect-video">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="size-full border-0"
              src={`${video.embedUrl}${video.embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
              title={video.title}
            />
          </div>
        ) : (
          <button
            className="group relative block aspect-video w-full"
            onClick={() => setPlaying(true)}
            type="button"
          >
            {youtubeId ? (
              <img
                alt=""
                className="size-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.02]"
                decoding="async"
                src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
              />
            ) : (
              <div className="size-full bg-gradient-navy" />
            )}
            <div className="absolute inset-0 bg-navy/30 transition-colors group-hover:bg-navy/20" />
            <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary-foreground/95 text-navy shadow-luxe transition-transform group-hover:scale-105">
              <Play aria-hidden className="ml-1 size-7 fill-current" strokeWidth={0} />
            </span>
            <span className="sr-only">Play {productName} video</span>
          </button>
        )}
      </div>
    </section>
  );
}

function extractYoutubeId(embedUrl: string): string | null {
  const match = embedUrl.match(/\/embed\/([^?&/]+)/);
  return match?.[1] ?? null;
}
