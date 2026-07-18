import {useEffect, useState} from 'react';
import {useReducedMotion} from 'framer-motion';
import heroPosterDesktop from '~/assets/m4-hero-new.webp';
import heroPosterMobile from '~/assets/m4-hero-lifestyle-road.webp';
import {
  buildHeroYoutubeEmbedUrl,
  HOMEPAGE_HERO_YOUTUBE_ID,
} from '~/lib/homepage-data';

type HeroYoutubeBackgroundProps = {
  videoId?: string;
};

export function HeroYoutubeBackground({
  videoId = HOMEPAGE_HERO_YOUTUBE_ID,
}: HeroYoutubeBackgroundProps) {
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (reducedMotion) {
    return (
      <>
        <img
          alt=""
          className="hidden size-full object-cover object-top md:block"
          decoding="async"
          fetchPriority="high"
          src={heroPosterDesktop}
        />
        <img
          alt=""
          className="size-full object-cover object-center md:hidden"
          decoding="async"
          fetchPriority="high"
          src={heroPosterMobile}
        />
      </>
    );
  }

  return (
    <div
      className={[
        'hero-video-layer relative size-full',
        mounted ? 'hero-video-layer--playing' : '',
      ].join(' ')}
    >
      <img
        alt=""
        aria-hidden
        className="hero-video-poster hidden size-full object-cover object-top md:block"
        decoding="async"
        fetchPriority="high"
        src={heroPosterDesktop}
      />
      <img
        alt=""
        aria-hidden
        className="hero-video-poster size-full object-cover object-center md:hidden"
        decoding="async"
        fetchPriority="high"
        src={heroPosterMobile}
      />
      {mounted ? (
        <div aria-hidden className="hero-youtube-embed">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="hero-youtube-iframe"
            src={buildHeroYoutubeEmbedUrl(videoId)}
            title="XSTO mobility robot hero video"
          />
        </div>
      ) : null}
    </div>
  );
}
