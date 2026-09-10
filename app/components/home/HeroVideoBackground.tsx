import {useEffect, useState} from 'react';
import {Pause, Play} from 'lucide-react';
import {
  HOMEPAGE_HERO_YOUTUBE_ID,
  buildHeroYoutubeEmbedUrl,
  heroYoutubePosterUrl,
} from '~/lib/homepage-data';

export function HeroVideoBackground() {
  const [autoPlay, setAutoPlay] = useState(false);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setAutoPlay(desktop.matches && !reducedMotion.matches);
    sync();
    desktop.addEventListener('change', sync);
    reducedMotion.addEventListener('change', sync);
    return () => {
      desktop.removeEventListener('change', sync);
      reducedMotion.removeEventListener('change', sync);
    };
  }, []);

  const playing = choice ?? autoPlay;
  return (
    <div className="mr-film-media">
      <picture>
        <source
          srcSet={`https://img.youtube.com/vi_webp/${HOMEPAGE_HERO_YOUTUBE_ID}/maxresdefault.webp`}
          type="image/webp"
        />
        <img
        className="mr-film-poster"
        src={heroYoutubePosterUrl()}
        alt="XSTO X12 wheelchair demonstration"
        width={1280}
        height={720}
        fetchPriority="high"
        decoding="async"
        />
      </picture>
      {playing ? (
        <div
          className={`mr-film-embed${ready ? ' mr-film-embed-ready' : ''}`}
          aria-hidden
        >
          <iframe
            className="mr-film-iframe"
            src={buildHeroYoutubeEmbedUrl(HOMEPAGE_HERO_YOUTUBE_ID)}
            title="XSTO X12 demonstration background video"
            allow="autoplay; encrypted-media"
            tabIndex={-1}
            onLoad={() => setReady(true)}
          />
        </div>
      ) : null}
      <button
        type="button"
        className="mr-film-toggle"
        aria-label={
          playing ? 'Pause background video' : 'Play background video'
        }
        onClick={() => {
          setReady(false);
          setChoice(!playing);
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
  );
}
