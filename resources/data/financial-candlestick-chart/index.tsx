import React, { useState } from 'react';

export type FinancialCandlestickChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FinancialCandlestickChartProps {
  variant?: FinancialCandlestickChartVariant;
}

export function FinancialCandlestickChart({ variant = 'quiet' }: FinancialCandlestickChartProps) {
  const [activeCandle, setActiveCandle] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const candles = [
    { t: '10:00', o: 142, h: 148, l: 140, c: 146 },
    { t: '10:15', o: 146, h: 151, l: 144, c: 149 },
    { t: '10:30', o: 149, h: 152, l: 143, c: 144 },
    { t: '10:45', o: 144, h: 147, l: 139, c: 141 },
    { t: '11:00', o: 141, h: 150, l: 140, c: 148 },
    { t: '11:15', o: 148, h: 155, l: 147, c: 154 },
    { t: '11:30', o: 154, h: 156, l: 150, c: 151 },
  ];

  const minP = 135;
  const maxP = 160;
  const range = maxP - minP;

  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const candleW = 24;
  const step = chartW / candles.length;

  const getY = (val: number) => padding.top + chartH - ((val - minP) / range) * chartH;

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">BTC/USD Price Action</h4>
          <p className="text-xs text-neutral-500">15-minute candlestick interval</p>
        </div>
        <div className="text-right">
          <span className="text-base font-bold font-mono text-emerald-500">
            {activeCandle !== null && candles[activeCandle] ? `$${candles[activeCandle]?.c}.00` : '$151.20'}
          </span>
          <span className="text-xs text-neutral-400 ml-1">
            {activeCandle !== null && candles[activeCandle] ? candles[activeCandle]?.t : '+6.3%'}
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {/* Horizontal grid */}
          {[140, 145, 150, 155].map((p) => {
            const y = getY(p);
            return (
              <g key={p}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke={variant === 'nocturne' ? '#1E232E' : '#F3F4F6'} strokeWidth="1" />
                <text x={padding.left - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-neutral-400 font-mono">
                  {p}
                </text>
              </g>
            );
          })}

          {/* Candlesticks */}
          {candles.map((c, idx) => {
            const x = padding.left + idx * step + (step - candleW) / 2;
            const isBullish = c.c >= c.o;
            const topY = getY(Math.max(c.o, c.c));
            const botY = getY(Math.min(c.o, c.c));
            const bodyH = Math.max(botY - topY, 2);
            const highY = getY(c.h);
            const lowY = getY(c.l);
            const color = isBullish ? '#10B981' : '#EF4444';

            return (
              <g key={c.t} onMouseEnter={() => setActiveCandle(idx)} onMouseLeave={() => setActiveCandle(null)} className="cursor-pointer">
                {/* Wick */}
                <line x1={x + candleW / 2} y1={highY} x2={x + candleW / 2} y2={lowY} stroke={color} strokeWidth="1.5" />
                {/* Body */}
                <rect x={x} y={topY} width={candleW} height={bodyH} rx="2" fill={color} />
                <text x={x + candleW / 2} y={height - 10} textAnchor="middle" className="text-[10px] fill-neutral-400 font-mono">
                  {c.t}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
