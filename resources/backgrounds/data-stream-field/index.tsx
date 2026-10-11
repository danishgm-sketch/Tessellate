import React from 'react';

export type DataStreamFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DataStreamFieldProps {
  variant?: DataStreamFieldVariant;
  children?: React.ReactNode;
}

export function DataStreamField({ variant = 'quiet', children }: DataStreamFieldProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const streamOpacity =
    variant === 'nocturne'
      ? 'text-cyan-400/20'
      : variant === 'expressive'
      ? 'text-indigo-500/20'
      : 'text-neutral-400/25';

  return (
    <div className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}>
      {/* Cascading data streams */}
      <div className={`absolute inset-0 pointer-events-none font-mono text-[9px] leading-tight select-none flex justify-around ${streamOpacity}`}>
        <div className="flex flex-col space-y-1">
          <span>0x7F</span><span>0x4A</span><span>0x9B</span><span>0x1C</span><span>0x8E</span><span>0x3D</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span>0xA1</span><span>0x52</span><span>0x0F</span><span>0xEE</span><span>0x74</span><span>0x90</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span>0x33</span><span>0xC8</span><span>0xD1</span><span>0x45</span><span>0x2B</span><span>0x88</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span>0xF0</span><span>0x12</span><span>0x99</span><span>0xAA</span><span>0x67</span><span>0xBC</span>
        </div>
      </div>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Continuous Throughput</span>
        <h4 className="text-base font-bold tracking-tight">Data Stream Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Low-overhead vertical hexadecimal telemetry columns indicating active real-time ingest pipeline status.
        </p>
        {children}
      </div>
    </div>
  );
}
