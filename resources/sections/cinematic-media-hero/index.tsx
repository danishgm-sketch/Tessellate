import React, { useState } from 'react';

export type CinematicMediaHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CinematicMediaHeroProps {
  variant?: CinematicMediaHeroVariant;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  mediaUrl?: string;
}

export function CinematicMediaHero({
  variant = 'quiet',
  eyebrow = 'CHAPTER ONE // GENESIS',
  title = 'The Architecture of Absolute Coherence',
  subtitle = 'A unified resource universe where components, layouts, and Design DNA behave as mathematical invariants.',
  mediaUrl,
}: CinematicMediaHeroProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  let glow = 'from-neutral-700/20 via-transparent to-transparent';
  let accent = 'text-neutral-400';
  let frameBorder = 'border-neutral-800';

  if (variant === 'expressive') {
    glow = 'from-blue-600/30 via-indigo-900/20 to-transparent';
    accent = 'text-blue-400 font-semibold';
    frameBorder = 'border-blue-500/30 shadow-[0_0_40px_rgba(37,71,232,0.15)]';
  } else if (variant === 'nocturne') {
    glow = 'from-cyan-500/20 via-blue-950/20 to-transparent';
    accent = 'text-cyan-400 font-mono';
    frameBorder = 'border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.12)]';
  }

  return (
    <section className="relative w-full py-24 sm:py-36 px-6 sm:px-12 bg-[#0B0D10] text-white overflow-hidden border-b border-neutral-800">
      <div className={`absolute inset-0 bg-radial ${glow} pointer-events-none`} />

      {/* Atmospheric Star / Particle Field */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
        <span className={`text-xs tracking-[0.25em] mb-6 uppercase inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 ${accent}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {eyebrow}
        </span>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05] mb-6 text-balance">
          {title}
        </h1>

        <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mb-10 leading-relaxed">
          {subtitle}
        </p>

        {/* Cinematic Media Viewport Container */}
        <div className={`relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-neutral-950 border ${frameBorder} mb-10 group`}>
          {mediaUrl ? (
            <video
              className="w-full h-full object-cover"
              src={mediaUrl}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-br from-neutral-900 via-black to-neutral-950">
              {/* Cinematic Simulated Shimmer / Ambient Motion */}
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_8s_infinite_linear]" />

              {/* Central Theatrical Indicator */}
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="relative z-10 w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md flex items-center justify-center transition-all group-hover:scale-105 cursor-pointer"
                aria-label={isPlaying ? 'Pause film' : 'Play film'}
              >
                {isPlaying ? (
                  <span className="w-4 h-4 flex gap-1 justify-center items-center">
                    <span className="w-1 h-4 bg-white rounded-xs" />
                    <span className="w-1 h-4 bg-white rounded-xs" />
                  </span>
                ) : (
                  <span className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[14px] border-l-white ml-1" />
                )}
              </button>
              <span className="relative z-10 mt-3 text-xs font-mono text-neutral-400 uppercase tracking-widest">
                {isPlaying ? 'Playback Active' : 'Cinematic Trailer // 4K 60FPS'}
              </span>
            </div>
          )}

          {/* Lower HUD Overlay */}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>TC 00:01:24:12</span>
            <span>PRORES 4444 XQ // RECSPEC 2.2</span>
          </div>
        </div>

        {/* Primary Action Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button type="button" className="px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors shadow-lg">
            Enter Platform
          </button>
          <button type="button" className="px-8 py-3.5 rounded-full border border-neutral-700 bg-white/5 text-white font-medium text-sm hover:bg-white/10 transition-colors">
            Read Whitepaper
          </button>
        </div>
      </div>
    </section>
  );
}

