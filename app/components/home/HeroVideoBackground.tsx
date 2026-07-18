import {useEffect, useRef, useState} from 'react';
import {useReducedMotion} from 'framer-motion';
import heroPosterDesktop from '~/assets/m4-hero-new.webp';
import heroPosterMobile from '~/assets/m4-hero-lifestyle-road.webp';
import {HERO_VIDEO_URL} from '~/lib/homepage-data';

type HeroVideoBackgroundProps = {
  src?: string;
};

export function HeroVideoBackground({
  src = HERO_VIDEO_URL,
}: HeroVideoBackgroundProps) {
  const reducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;

    const video = videoRef.current;
    if (!video) return;

    const markPlaying = () => setPlaying(true);
    video.addEventListener('playing', markPlaying);

    const tryPlay = () => {
      void video.play().catch(() => {
        /* Autoplay may be blocked; poster stays visible. */
      });
    };

    tryPlay();

    return () => {
      video.removeEventListener('playing', markPlaying);
    };
  }, [reducedMotion, src]);

  if (reducedMotion) {
    return (
      <>
        <img
          alt=""
          className="hidden size-full object-cover object-center md:block"
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
        playing ? 'hero-video-layer--playing' : '',
      ].join(' ')}
    >
      <img
        alt=""
        aria-hidden
        className="hero-video-poster hidden size-full object-cover object-center md:block"
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
      <video
        aria-hidden
        autoPlay
        className="hero-video-element"
        loop
        muted
        playsInline
        preload="metadata"
        ref={videoRef}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
