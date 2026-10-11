import React, { useState } from 'react';

export type InteractiveGlobeVariant = 'quiet' | 'expressive' | 'nocturne';

export interface InteractiveGlobeProps {
  variant?: InteractiveGlobeVariant;
}

export function InteractiveGlobe({ variant = 'quiet' }: InteractiveGlobeProps) {
  const [activeNode, setActiveNode] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const wireColor =
    variant === 'nocturne' ? '#1E232E' : '#E5E7EB';

  const pulseColor =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717';

  const nodes = [
    { cx: 120, cy: 90, label: 'North America' },
    { cx: 160, cy: 110, label: 'Europe Hub' },
    { cx: 190, cy: 130, label: 'Asia-Pacific' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col items-center transition-colors ${cardBg}`}>
      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Worldwide Telemetry Mesh</h4>
          <p className="text-xs text-neutral-500">Orthographic orbital projection</p>
        </div>
        <span className="text-xs font-mono font-medium text-cyan-500 animate-pulse">● Live Orbit</span>
      </div>

      <div className="relative w-[240px] h-[240px] flex items-center justify-center select-none">
        <svg width="240" height="240" viewBox="0 0 240 240">
          {/* Globe boundary */}
          <circle cx="120" cy="120" r="90" fill="transparent" stroke={wireColor} strokeWidth="2" />

          {/* Latitude lines */}
          <ellipse cx="120" cy="120" rx="90" ry="30" fill="none" stroke={wireColor} strokeWidth="1" />
          <ellipse cx="120" cy="120" rx="90" ry="60" fill="none" stroke={wireColor} strokeWidth="1" />
          <line x1="30" y1="120" x2="210" y2="120" stroke={wireColor} strokeWidth="1" strokeDasharray="3 3" />

          {/* Longitude lines */}
          <ellipse cx="120" cy="120" rx="30" ry="90" fill="none" stroke={wireColor} strokeWidth="1" />
          <ellipse cx="120" cy="120" rx="60" ry="90" fill="none" stroke={wireColor} strokeWidth="1" />
          <line x1="120" y1="30" x2="120" y2="210" stroke={wireColor} strokeWidth="1" strokeDasharray="3 3" />

          {/* Orbital nodes */}
          {nodes.map((n, idx) => {
            const isHovered = activeNode === idx;
            return (
              <g
                key={n.label}
                onMouseEnter={() => setActiveNode(idx)}
                onMouseLeave={() => setActiveNode(null)}
                className="cursor-pointer"
              >
                <circle cx={n.cx} cy={n.cy} r={isHovered ? 6 : 4} fill={pulseColor} />
                <circle cx={n.cx} cy={n.cy} r={isHovered ? 12 : 8} fill={pulseColor} fillOpacity="0.25" className="animate-ping" />
              </g>
            );
          })}
        </svg>

        {activeNode !== null && (
          <div className="absolute bottom-2 text-xs font-mono font-semibold">
            {nodes[activeNode]?.label}
          </div>
        )}
      </div>
    </div>
  );
}
