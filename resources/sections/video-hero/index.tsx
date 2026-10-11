import React, { useState } from 'react';

export type VideoHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface VideoHeroProps {
  variant?: VideoHeroVariant;
  headline?: string;
  subheadline?: string;
  videoDuration?: string;
}

export function VideoHero({
  variant = 'quiet',
  headline = 'See the composition engine in continuous motion.',
  subheadline = 'Watch how arbitrary manifests transform into production-ready React applications with zero manual wiring.',
  videoDuration = '1:45',
}: VideoHeroProps) {
  const [isPlaying, setIsPlaying] = useState(false);

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
          <span>SHOWREEL</span>
          <span>•</span>
          <span>{videoDuration}</span>
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl mb-6">{headline}</h1>
        <p className="text-lg text-neutral-300 max-w-2xl mb-10 leading-relaxed">{subheadline}</p>

        <div className="relative w-full max-w-3xl aspect-video rounded-2xl border border-white/10 overflow-hidden bg-black/60 flex items-center justify-center group shadow-2xl">
          <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/80" />
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause video showreel' : 'Play video showreel'}
            className="relative z-20 w-16 h-16 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <span className="absolute bottom-4 left-6 z-20 text-xs font-mono text-white/70">
            {isPlaying ? 'Playing High-Fidelity Showreel (4K)' : 'Click to launch preview playback'}
          </span>
        </div>
      </div>
    </section>
  );
}
