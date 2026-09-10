import {useState} from 'react';
import {Pause, Play} from 'lucide-react';
import {
  HOMEPAGE_HERO_YOUTUBE_ID,
  HOMEPAGE_HERO_POSTER_URL,
  HOMEPAGE_HERO_POSTER_SRC_SET,
  buildHeroYoutubeEmbedUrl,
} from '~/lib/homepage-data';

export function HeroVideoBackground() {
  // Load the third-party player on request so it cannot delay shopping.
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  return (
    <div className="mr-film-media">
      <img
        className="mr-film-poster"
        src={HOMEPAGE_HERO_POSTER_URL}
        srcSet={HOMEPAGE_HERO_POSTER_SRC_SET}
        sizes="100vw"
        alt="XSTO X12 wheelchair demonstration"
        width={1280}
        height={720}
        fetchPriority="high"
        decoding="async"
      />
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
          setPlaying(!playing);
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
