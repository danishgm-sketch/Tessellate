import React, { useState } from 'react';

export type FunnelChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FunnelChartProps {
  variant?: FunnelChartVariant;
}

export function FunnelChart({ variant = 'quiet' }: FunnelChartProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const stepFill =
    variant === 'nocturne'
      ? 'bg-cyan-500/80 border-cyan-400'
      : variant === 'expressive'
      ? 'bg-[#2547E8] border-blue-400'
      : 'bg-neutral-800 border-neutral-700';

  const stages = [
    { name: 'Visitors', count: 12500, pct: 100 },
    { name: 'Product Views', count: 6800, pct: 54 },
    { name: 'Signups', count: 2400, pct: 19 },
    { name: 'Workspace Created', count: 1850, pct: 15 },
    { name: 'Upgraded to Paid', count: 520, pct: 4.2 },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Onboarding Conversion Funnel</h4>
          <p className="text-xs text-neutral-500">Visitor-to-paid lifecycle conversion</p>
        </div>
        <span className="text-xs font-mono font-medium text-emerald-500">Overall: 4.2%</span>
      </div>

      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const isHovered = activeStep === idx;
          return (
            <div
              key={stage.name}
              onMouseEnter={() => setActiveStep(idx)}
              onMouseLeave={() => setActiveStep(null)}
              className="flex items-center gap-4 cursor-pointer group"
            >
              <div className="w-36 text-xs font-medium truncate text-neutral-600 dark:text-neutral-400 group-hover:text-current">
                {stage.name}
              </div>
              <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 h-8 rounded-lg overflow-hidden flex items-center p-1">
                <div
                  className={`h-full rounded transition-all duration-300 flex items-center px-3 text-white text-xs font-mono font-semibold ${stepFill} ${
                    isHovered ? 'opacity-100' : 'opacity-85'
                  }`}
                  style={{ width: `${Math.max(stage.pct, 8)}%` }}
                >
                  {stage.count.toLocaleString()}
                </div>
              </div>
              <div className="w-16 text-right text-xs font-mono font-medium text-neutral-400">
                {stage.pct}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
