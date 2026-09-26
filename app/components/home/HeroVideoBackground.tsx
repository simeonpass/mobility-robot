import {useEffect, useRef, useState} from 'react';
import {Pause, Play} from 'lucide-react';
import {HOMEPAGE_HERO_POSTER_URL, M8_FULL_VIDEO_URL} from '~/lib/homepage-data';
import heroVideo from '~/assets/m8-hero.mp4';

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (
      navigator as Navigator & {connection?: {saveData?: boolean}}
    ).connection;
    if (!motion.matches && !connection?.saveData) setLoaded(true);
    const stop = () => {
      if (motion.matches) videoRef.current?.pause();
    };
    motion.addEventListener('change', stop);
    return () => motion.removeEventListener('change', stop);
  }, []);
  return (
    <div className="mr-film-showcase">
      <div className="mr-film-media">
        <img
          className="mr-film-poster"
          src={HOMEPAGE_HERO_POSTER_URL}
          sizes="100vw"
          alt="XSTO M8 film opening in a woodland setting"
          width={1600}
          height={900}
          fetchPriority="high"
          decoding="async"
        />
        {loaded && (
          <video
            ref={videoRef}
            className="mr-film-native"
            src={heroVideo}
            poster={HOMEPAGE_HERO_POSTER_URL}
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            aria-hidden="true"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => {
              setLoaded(false);
              setPlaying(false);
            }}
          />
        )}
      </div>
      <div className="mr-film-caption">
        <a
          href={M8_FULL_VIDEO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mr-film-watch"
        >
          <Play size={16} aria-hidden /> Watch the full film{' '}
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <button
          type="button"
          className="mr-film-toggle"
          aria-label={
            playing ? 'Pause background video' : 'Play background video'
          }
          onClick={() => {
            if (!loaded) {
              setLoaded(true);
              return;
            }
            if (playing) videoRef.current?.pause();
            else void videoRef.current?.play().catch(() => setPlaying(false));
          }}
        >
          {playing ? (
            <Pause size={16} aria-hidden />
          ) : (
            <Play size={16} aria-hidden />
          )}
          {playing ? 'Pause video' : 'Play video'}
        </button>
      </div>
    </div>
  );
}
