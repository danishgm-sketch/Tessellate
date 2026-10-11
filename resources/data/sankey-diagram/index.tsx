import React, { useState } from 'react';

export type SankeyDiagramVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SankeyDiagramProps {
  variant?: SankeyDiagramVariant;
}

export function SankeyDiagram({ variant = 'quiet' }: SankeyDiagramProps) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const ribbonColor =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.4)'
      : variant === 'expressive'
      ? 'rgba(37, 71, 232, 0.35)'
      : 'rgba(23, 23, 23, 0.25)';

  const activeRibbonColor =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.8)'
      : variant === 'expressive'
      ? 'rgba(37, 71, 232, 0.7)'
      : 'rgba(23, 23, 23, 0.6)';

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">API Request Distribution Flow</h4>
          <p className="text-xs text-neutral-500">Edge Gateway → Ingestion Workers → Storage Backends</p>
        </div>
        <span className="text-xs font-mono font-medium text-neutral-400">100% Routed</span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox="0 0 600 220" className="w-full h-auto overflow-visible select-none">
          {/* Source node column */}
          <rect x="20" y="30" width="16" height="160" rx="4" fill={variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717'} />
          <text x="44" y="115" className="text-xs font-semibold fill-current">Gateway (100k)</text>

          {/* Mid node column */}
          <rect x="280" y="30" width="16" height="90" rx="4" fill={variant === 'nocturne' ? '#6366F1' : variant === 'expressive' ? '#10B981' : '#525252'} />
          <text x="304" y="80" className="text-xs font-medium fill-current">Worker A (60k)</text>

          <rect x="280" y="130" width="16" height="60" rx="4" fill={variant === 'nocturne' ? '#A855F7' : variant === 'expressive' ? '#F59E0B' : '#737373'} />
          <text x="304" y="165" className="text-xs font-medium fill-current">Worker B (40k)</text>

          {/* Dest node column */}
          <rect x="540" y="40" width="16" height="50" rx="4" fill={variant === 'nocturne' ? '#10B981' : variant === 'expressive' ? '#3B82F6' : '#262626'} />
          <text x="530" y="30" textAnchor="end" className="text-xs font-medium fill-current">D1 Primary</text>

          <rect x="540" y="110" width="16" height="70" rx="4" fill={variant === 'nocturne' ? '#F43F5E' : variant === 'expressive' ? '#EC4899' : '#404040'} />
          <text x="530" y="100" textAnchor="end" className="text-xs font-medium fill-current">R2 Bucket</text>

          {/* Flow ribbons (bezier curves) */}
          {/* Gateway -> Worker A */}
          <path
            d="M 36 30 C 150 30, 160 30, 280 30 L 280 120 C 160 120, 150 125, 36 125 Z"
            fill={hoveredLink === 'l1' ? activeRibbonColor : ribbonColor}
            onMouseEnter={() => setHoveredLink('l1')}
            onMouseLeave={() => setHoveredLink(null)}
            className="cursor-pointer transition-colors duration-150"
          />

          {/* Gateway -> Worker B */}
          <path
            d="M 36 125 C 150 125, 160 130, 280 130 L 280 190 C 160 190, 150 190, 36 190 Z"
            fill={hoveredLink === 'l2' ? activeRibbonColor : ribbonColor}
            onMouseEnter={() => setHoveredLink('l2')}
            onMouseLeave={() => setHoveredLink(null)}
            className="cursor-pointer transition-colors duration-150"
          />

          {/* Worker A -> D1 */}
          <path
            d="M 296 30 C 410 30, 420 40, 540 40 L 540 90 C 420 90, 410 75, 296 75 Z"
            fill={hoveredLink === 'l3' ? activeRibbonColor : ribbonColor}
            onMouseEnter={() => setHoveredLink('l3')}
            onMouseLeave={() => setHoveredLink(null)}
            className="cursor-pointer transition-colors duration-150"
          />
        </svg>
      </div>
    </div>
  );
}
