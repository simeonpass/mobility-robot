import {useState} from 'react';
import {useReducedMotion} from 'framer-motion';
import {
  HOMEPAGE_HERO_YOUTUBE_ID,
  buildHeroYoutubeEmbedUrl,
  heroYoutubePosterUrl,
} from '~/lib/homepage-data';

type HeroVideoBackgroundProps = {
  youtubeId?: string;
};

export function HeroVideoBackground({
  youtubeId = HOMEPAGE_HERO_YOUTUBE_ID,
}: HeroVideoBackgroundProps) {
  const reducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const posterUrl = heroYoutubePosterUrl(youtubeId);

  if (reducedMotion) {
    return (
      <img
        alt=""
        aria-hidden
        className="size-full object-cover object-center"
        decoding="async"
        fetchPriority="high"
        src={posterUrl}
      />
    );
  }

  return (
    <div
      className={[
        'hero-video-layer relative size-full',
        ready ? 'hero-video-layer--playing' : '',
      ].join(' ')}
    >
      <img
        alt=""
        aria-hidden
        className="hero-video-poster size-full object-cover object-center"
        decoding="async"
        fetchPriority="high"
        src={posterUrl}
      />
      <div className="hero-youtube-embed">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          className="hero-youtube-iframe"
          onLoad={() => setReady(true)}
          src={buildHeroYoutubeEmbedUrl(youtubeId)}
          title="XSTO X12 product video"
        />
      </div>
    </div>
  );
}
