import React, { useState } from 'react';

export type CursorReactiveFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CursorReactiveFieldProps {
  variant?: CursorReactiveFieldVariant;
  children?: React.ReactNode;
}

export function CursorReactiveField({ variant = 'quiet', children }: CursorReactiveFieldProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const glowColor =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.18)'
      : variant === 'expressive'
      ? 'rgba(79, 70, 229, 0.14)'
      : 'rgba(0, 0, 0, 0.08)';

  const gridColor =
    variant === 'nocturne'
      ? 'rgba(255, 255, 255, 0.04)'
      : variant === 'expressive'
      ? 'rgba(37, 71, 232, 0.06)'
      : 'rgba(0, 0, 0, 0.04)';

  return (
    <div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setPos(null)}
      className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}
    >
      {/* Background grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <pattern id={`cr-grid-${variant}`} width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke={gridColor} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#cr-grid-${variant})`} />
      </svg>

      {/* Reactive cursor spotlight */}
      {pos && (
        <div
          className="absolute pointer-events-none rounded-full blur-2xl transition-opacity duration-300"
          style={{
            left: pos.x - 120,
            top: pos.y - 120,
            width: 240,
            height: 240,
            background: glowColor,
          }}
        />
      )}

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Reactive Atmosphere</span>
        <h4 className="text-base font-bold tracking-tight">Cursor Reactive Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Hover cursor across the container to illuminate localized coordinate vectors with zero performance penalty.
        </p>
        {children}
      </div>
    </div>
  );
}
