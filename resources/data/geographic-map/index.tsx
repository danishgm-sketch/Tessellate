import React, { useState } from 'react';

export type GeographicMapVariant = 'quiet' | 'expressive' | 'nocturne';

export interface GeographicMapProps {
  variant?: GeographicMapVariant;
}

export function GeographicMap({ variant = 'quiet' }: GeographicMapProps) {
  const [activePin, setActivePin] = useState<string | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const pinColor =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717';

  const regions = [
    { id: 'us-east', name: 'US East (N. Virginia)', x: 170, y: 95, pings: '8ms', active: true },
    { id: 'us-west', name: 'US West (Oregon)', x: 120, y: 85, pings: '14ms', active: true },
    { id: 'eu-west', name: 'EU West (London)', x: 290, y: 75, pings: '4ms', active: true },
    { id: 'eu-central', name: 'EU Central (Frankfurt)', x: 315, y: 82, pings: '6ms', active: true },
    { id: 'ap-east', name: 'AP East (Tokyo)', x: 470, y: 100, pings: '22ms', active: true },
    { id: 'ap-south', name: 'AP South (Singapore)', x: 440, y: 140, pings: '18ms', active: true },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Global Edge Network</h4>
          <p className="text-xs text-neutral-500">Active points of presence and edge latency</p>
        </div>
        <span className="text-xs font-mono font-medium text-emerald-500">6 Regions Healthy</span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox="0 0 600 240" className="w-full h-auto overflow-visible select-none">
          {/* Stylized continent vector outlines */}
          <path
            d="M 80 60 Q 140 40 180 80 Q 150 140 100 120 Z"
            fill={variant === 'nocturne' ? '#151921' : '#F3F4F6'}
            stroke={variant === 'nocturne' ? '#2E3440' : '#E5E7EB'}
            strokeWidth="1"
          />
          <path
            d="M 120 130 Q 160 140 140 210 Q 110 180 120 130 Z"
            fill={variant === 'nocturne' ? '#151921' : '#F3F4F6'}
            stroke={variant === 'nocturne' ? '#2E3440' : '#E5E7EB'}
            strokeWidth="1"
          />
          <path
            d="M 270 50 Q 340 40 330 110 Q 280 120 270 50 Z"
            fill={variant === 'nocturne' ? '#151921' : '#F3F4F6'}
            stroke={variant === 'nocturne' ? '#2E3440' : '#E5E7EB'}
            strokeWidth="1"
          />
          <path
            d="M 280 120 Q 330 120 320 200 Q 270 170 280 120 Z"
            fill={variant === 'nocturne' ? '#151921' : '#F3F4F6'}
            stroke={variant === 'nocturne' ? '#2E3440' : '#E5E7EB'}
            strokeWidth="1"
          />
          <path
            d="M 370 60 Q 510 50 490 140 Q 380 150 370 60 Z"
            fill={variant === 'nocturne' ? '#151921' : '#F3F4F6'}
            stroke={variant === 'nocturne' ? '#2E3440' : '#E5E7EB'}
            strokeWidth="1"
          />

          {/* Region pins */}
          {regions.map((r) => {
            const isHovered = activePin === r.id;
            return (
              <g
                key={r.id}
                onMouseEnter={() => setActivePin(r.id)}
                onMouseLeave={() => setActivePin(null)}
                className="cursor-pointer"
              >
                <circle cx={r.x} cy={r.y} r={isHovered ? 8 : 5} fill={pinColor} />
                <circle cx={r.x} cy={r.y} r={isHovered ? 14 : 10} fill={pinColor} fillOpacity="0.25" className="animate-pulse" />
                {isHovered && (
                  <g>
                    <rect x={r.x - 50} y={r.y - 30} width="100" height="22" rx="4" fill="#000" />
                    <text x={r.x} y={r.y - 15} textAnchor="middle" fill="#fff" className="text-[10px] font-mono">
                      {r.name.split(' ')[0]}: {r.pings}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
