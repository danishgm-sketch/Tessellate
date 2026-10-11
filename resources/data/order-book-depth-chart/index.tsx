import React, { useState } from 'react';

export type OrderBookDepthChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface OrderBookDepthChartProps {
  variant?: OrderBookDepthChartVariant;
}

export function OrderBookDepthChart({ variant = 'quiet' }: OrderBookDepthChartProps) {
  const [hoveredSide, setHoveredSide] = useState<'bids' | 'asks' | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const bidColor = '#10B981';
  const askColor = '#EF4444';

  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Order Book Market Depth</h4>
          <p className="text-xs text-neutral-500">Cumulative Liquidity: Bids vs Asks</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-emerald-500">Bids: $4.2M</span>
          <span className="text-neutral-400">|</span>
          <span className="text-rose-500">Asks: $3.8M</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {/* Mid price spread line */}
          <line
            x1={width / 2}
            y1={padding.top}
            x2={width / 2}
            y2={height - padding.bottom}
            stroke={variant === 'nocturne' ? '#2E3440' : '#E5E7EB'}
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />

          {/* Bid stepped area (left side) */}
          <path
            d="M 40 180 L 100 180 L 100 140 L 180 140 L 180 100 L 250 100 L 250 50 L 300 50 L 300 180 Z"
            fill={bidColor}
            fillOpacity={hoveredSide === 'bids' ? 0.4 : 0.25}
            stroke={bidColor}
            strokeWidth="2"
            onMouseEnter={() => setHoveredSide('bids')}
            onMouseLeave={() => setHoveredSide(null)}
            className="cursor-pointer transition-all duration-200"
          />

          {/* Ask stepped area (right side) */}
          <path
            d="M 300 50 L 350 50 L 350 90 L 420 90 L 420 130 L 500 130 L 500 180 L 560 180 L 300 180 Z"
            fill={askColor}
            fillOpacity={hoveredSide === 'asks' ? 0.4 : 0.25}
            stroke={askColor}
            strokeWidth="2"
            onMouseEnter={() => setHoveredSide('asks')}
            onMouseLeave={() => setHoveredSide(null)}
            className="cursor-pointer transition-all duration-200"
          />

          {/* X axis labels */}
          <text x="170" y={height - 10} textAnchor="middle" className="text-[10px] fill-emerald-500 font-mono font-semibold">
            ← Bids (Buy Orders)
          </text>
          <text x={width / 2} y={height - 10} textAnchor="middle" className="text-[10px] fill-neutral-400 font-mono">
            $150.00 Mid
          </text>
          <text x="430" y={height - 10} textAnchor="middle" className="text-[10px] fill-rose-500 font-mono font-semibold">
            Asks (Sell Orders) →
          </text>
        </svg>
      </div>
    </div>
  );
}
