import {useEffect, useRef} from 'react';
import type {HomepageFlagshipHandle} from '~/lib/homepage-data';

export type HeroMotionClip = {
  id: string;
  label: string;
  description: string;
  studio?: boolean;
  portrait?: boolean;
  caption?: string;
};

/** Only movements visible in the cited source footage. See docs/hero-motion-sources.md. */
export const HERO_MOTION_CLIPS: Partial<
  Record<HomepageFlagshipHandle, readonly HeroMotionClip[]>
> = {
  'xsto-m4': [
    {
      id: 'm4-lift-tilt',
      label: 'Seat lift & tilt',
      description: 'Rise to the moment. Find your comfortable angle.',
      studio: true,
    },
    {
      id: 'm4-fold',
      label: 'Folding & transport',
      description: 'See how the M4 folds and separates for transport.',
      studio: true,
    },
  ],
  'xsto-m4b': [
    {
      id: 'm4b-seat-lift',
      label: 'Seat elevation',
      caption: 'Rise to the moment',
      portrait: true,
      description: 'Watch the seat rise, with the leg rest moving with it.',
    },
    {
      id: 'm4b-seat-tilt',
      label: 'Seat tilt',
      caption: 'Find your comfortable angle',
      portrait: true,
      description: 'See the seat and leg rest adjust together.',
    },
  ],
  'xsto-m4-pro': [
    {
      id: 'm4-pro-recline',
      label: 'Backrest recline',
      description: 'See the adjustable backrest move into a resting position.',
    },
    {
      id: 'm4-pro-seat-width',
      label: 'Seat adjustment',
      description: 'A closer look at the adjustable seating.',
      studio: true,
    },
  ],
  'xsto-x12': [
    {
      id: 'x12-tracks',
      label: 'Tracks & stairs',
      description:
        'Watch the X12-series tracks deploy. Stair use requires assessment and training.',
    },
    {
      id: 'x12-levelling',
      label: 'Self-levelling',
      description: 'See the X12 series adapt to changing terrain.',
    },
  ],
  'xsto-x12-pro': [
    {
      id: 'x12-pro-boarding',
      label: 'Boarding position',
      description: 'See the X12-series seat change position for access.',
    },
    {
      id: 'x12-pro-rocking',
      label: 'Rocking mode',
      description: 'A gentle change of position, demonstrated by XSTO.',
    },
  ],
};

export function HeroMotionDemo({
  clip,
  playing,
  onReady,
}: {
  clip: HeroMotionClip;
  playing: boolean;
  onReady: (ready: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!playing) {
      video.pause();
      return;
    }
    void video.play().catch(() => onReady(false));
  }, [playing, onReady]);

  return (
    <div className={`mr-motion-film${clip.studio ? ' is-studio' : ''}${clip.portrait ? ' is-portrait' : ''}`}>
      <video
        ref={videoRef}
        src={`/videos/hero/${clip.id}.mp4`}
        poster={`/videos/hero/${clip.id}.jpg`}
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        onPlaying={() => onReady(true)}
        onError={() => onReady(false)}
      />
      <span className="mr-motion-film-label">
        <span />
        {clip.caption ?? clip.label}
      </span>
      {clip.portrait ? <span className="mr-motion-credit">XSTO demonstration</span> : null}
    </div>
  );
}
