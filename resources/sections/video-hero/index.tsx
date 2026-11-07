import React, { useState } from 'react';

export type VideoHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface VideoHeroProps {
  variant?: VideoHeroVariant;
  headline?: string;
  subheadline?: string;
  videoSrc?: string;
}

export function VideoHero({
  variant = 'quiet',
  headline = 'Show your product in motion.',
  subheadline = 'Use a host-supplied video to show how your product works.',
  videoSrc,
}: VideoHeroProps) {
  const [playbackError, setPlaybackError] = useState(false);

  let bg = 'bg-neutral-900 text-white';
  let badgeColor = 'bg-white/10 text-white border-white/20';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-b from-[#1B35B4] via-[#0B1536] to-black text-white';
    badgeColor = 'bg-blue-500/20 text-blue-200 border-blue-400/30';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#08090C] text-white';
    badgeColor = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
  }

  return (
    <section className={`relative w-full py-24 sm:py-32 px-6 sm:px-12 overflow-hidden transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center relative z-10">
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border mb-6 ${badgeColor}`}>
          <span>{videoSrc ? 'SHOWREEL' : 'VIDEO SOURCE REQUIRED'}</span>
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl mb-6">{headline}</h1>
        <p className="text-lg text-neutral-300 max-w-2xl mb-10 leading-relaxed">{subheadline}</p>

        <div className="relative w-full max-w-3xl aspect-video rounded-2xl border border-white/10 overflow-hidden bg-black/60 flex items-center justify-center shadow-2xl">
          {videoSrc ? (
            <video
              src={videoSrc}
              controls
              playsInline
              preload="metadata"
              aria-label={headline}
              onError={() => setPlaybackError(true)}
              onLoadedData={() => setPlaybackError(false)}
              className="absolute inset-0 z-0 h-full w-full object-cover"
            />
          ) : (
            <p role="note" className="relative z-20 max-w-md px-6 text-center text-sm text-white/80">
              This preview contains no video media. Add a video source in your host application to enable playback.
            </p>
          )}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-radial from-transparent via-black/20 to-black/70" />
          {playbackError && (
            <p role="alert" className="absolute bottom-4 left-4 right-4 z-20 rounded-md bg-black/80 px-3 py-2 text-sm text-white">
              The video could not be loaded. Check the source in your host application.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
