import React, { useState } from 'react';

export type CursorSpotlightVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CursorSpotlightProps {
  variant?: CursorSpotlightVariant;
}

export function CursorSpotlight({ variant = 'quiet' }: CursorSpotlightProps) {
  const [pos, setPos] = useState({ x: 200, y: 100 });

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const glowColor =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.15)'
      : variant === 'expressive'
      ? 'rgba(37, 71, 232, 0.12)'
      : 'rgba(0, 0, 0, 0.05)';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`relative w-full p-8 rounded-xl border overflow-hidden transition-colors select-none ${cardBg}`}
    >
      {/* Radial spotlight overlay */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          background: `radial-gradient(350px circle at ${pos.x}px ${pos.y}px, ${glowColor}, transparent 80%)`,
        }}
      />

      <div className="relative z-10 space-y-2">
        <span className="text-xs font-mono text-neutral-400">Ambient Surface Luster</span>
        <h4 className="text-sm font-semibold tracking-tight">Interactive Cursor Spotlight</h4>
        <p className="text-xs text-neutral-500 leading-relaxed max-w-md">
          Move your pointer over this surface to reveal radial illumination gradients tracking mouse coordinates in real-time.
        </p>
      </div>
    </div>
  );
}
