import {useState} from 'react';
import {Play} from 'lucide-react';
import type {ProductVideo} from '~/lib/product-content';
import {extractYoutubeVideoId} from '~/lib/product-gallery';
import {ProductVideoPlayer} from '~/components/product/ProductVideoPlayer';

type ProductVideoHeroProps = {
  video: ProductVideo;
  productName: string;
};

export function ProductVideoHero({video, productName}: ProductVideoHeroProps) {
  const [playing, setPlaying] = useState(false);
  const youtubeId = extractYoutubeVideoId(video.embedUrl);

  return (
    <section className="mt-10 md:mt-12">
      <h2 className="mb-4 text-center font-display text-xl font-semibold tracking-[-0.02em] text-navy md:text-2xl">
        {video.title}
      </h2>

      <div className="overflow-hidden rounded-xl border border-border bg-navy shadow-medium">
        {playing ? (
          <div className="aspect-video">
            <ProductVideoPlayer
              autoPlay
              className="size-full border-0 object-contain"
              src={video.embedUrl}
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
                alt={`${productName} — ${video.title}`}
                className="size-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.02]"
                decoding="async"
                src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
              />
            ) : (
              /* Direct/local MP4s: never attach src until play — posters would fetch hundreds of MB. */
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
