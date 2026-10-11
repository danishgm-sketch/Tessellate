import React, { useState } from 'react';

export type HeatmapVariant = 'quiet' | 'expressive' | 'nocturne';

export interface HeatmapProps {
  variant?: HeatmapVariant;
}

export function Heatmap({ variant = 'quiet' }: HeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ day: number; week: number; val: number } | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const getCellColor = (level: number) => {
    if (level === 0) {
      return variant === 'nocturne' ? 'bg-[#151921]' : 'bg-neutral-100 dark:bg-neutral-800';
    }
    if (variant === 'nocturne') {
      const shades = ['bg-cyan-950', 'bg-cyan-800', 'bg-cyan-600', 'bg-cyan-400'];
      return shades[level - 1] ?? 'bg-cyan-400';
    }
    if (variant === 'expressive') {
      const shades = ['bg-blue-200', 'bg-blue-400', 'bg-blue-600', 'bg-blue-800'];
      return shades[level - 1] ?? 'bg-blue-800';
    }
    const shades = ['bg-neutral-300 dark:bg-neutral-700', 'bg-neutral-500', 'bg-neutral-700', 'bg-neutral-900 dark:bg-white'];
    return shades[level - 1] ?? 'bg-neutral-900';
  };

  const days = ['Mon', 'Wed', 'Fri'];
  const weeks = 20;

  // Generate deterministic pattern
  const grid = Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: weeks }, (_, w) => {
      const seed = (d * 13 + w * 7) % 5;
      return seed;
    })
  );

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Deploy Activity Frequency</h4>
          <p className="text-xs text-neutral-500">20-week build and release cadence</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <span key={lvl} className={`w-2.5 h-2.5 rounded-sm ${getCellColor(lvl)}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto py-2">
        <div className="flex flex-col justify-between py-1 text-[10px] text-neutral-400 font-mono">
          {days.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="flex gap-1.5">
          {Array.from({ length: weeks }).map((_, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {Array.from({ length: 7 }).map((_, dIdx) => {
                const val = grid[dIdx]?.[wIdx] ?? 0;
                return (
                  <div
                    key={dIdx}
                    onMouseEnter={() => setHoveredCell({ day: dIdx, week: wIdx, val })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`w-3.5 h-3.5 rounded-sm transition-transform cursor-pointer ${getCellColor(val)} hover:scale-125`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {hoveredCell && (
        <div className="mt-3 text-xs font-mono text-neutral-500">
          Week {hoveredCell.week + 1}, Day {hoveredCell.day + 1}: <span className="font-semibold">{hoveredCell.val * 3} deploys</span>
        </div>
      )}
    </div>
  );
}
