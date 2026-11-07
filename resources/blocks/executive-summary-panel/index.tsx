import React from 'react';

export type ExecutiveSummaryPanelVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ExecutiveSummaryPanelProps {
  variant?: ExecutiveSummaryPanelVariant;
}

export function ExecutiveSummaryPanel({ variant = 'quiet' }: ExecutiveSummaryPanelProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'border-neutral-200 bg-neutral-50/50';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    card = 'border-blue-100 bg-white shadow-xs';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'border-[#2E3440] bg-[#151921]';
  }

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <span className="font-bold text-sm">Example operations briefing</span>
        <span className="text-[11px] font-mono opacity-60">Illustrative data</span>
      </div>
      <p className="text-xs sm:text-sm opacity-80 leading-relaxed mb-6">
        Example copy only. This panel is not connected to telemetry; replace each value with verified data before use.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`p-3 rounded-lg border text-xs ${card}`}>
          <div className="font-semibold mb-1">Example metric</div>
          <div className="opacity-75">100% uptime (sample value only).</div>
        </div>
        <div className={`p-3 rounded-lg border text-xs ${card}`}>
          <div className="font-semibold mb-1">Example alert</div>
          <div className="opacity-75">Storage at 82% (sample value only).</div>
        </div>
        <div className={`p-3 rounded-lg border text-xs ${card}`}>
          <div className="font-semibold mb-1">Example action</div>
          <div className="opacity-75">Review capacity planning (sample copy only).</div>
        </div>
      </div>
    </div>
  );
}
