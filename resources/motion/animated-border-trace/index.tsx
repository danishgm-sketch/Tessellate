import React from 'react';

export type AnimatedBorderTraceVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AnimatedBorderTraceProps {
  variant?: AnimatedBorderTraceVariant;
}

export function AnimatedBorderTrace({ variant = 'quiet' }: AnimatedBorderTraceProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white'
      : variant === 'expressive'
      ? 'bg-white text-neutral-900'
      : 'bg-white text-neutral-900';

  const strokeColor =
    variant === 'nocturne'
      ? '#06B6D4'
      : variant === 'expressive'
      ? '#2547E8'
      : '#171717';

  return (
    <div className="p-8 flex items-center justify-center">
      <div className={`relative w-80 p-6 rounded-xl overflow-hidden ${cardBg}`}>
        {/* SVG trace overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <rect
            x="1"
            y="1"
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            rx="12"
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeDasharray="80 300"
            className="animate-[spin_4s_linear_infinite]"
          />
        </svg>

        <div className="relative z-10 space-y-1.5">
          <span className="text-[10px] font-mono text-neutral-400">Hairline Tracer</span>
          <h4 className="text-sm font-semibold">Active Perimeter Trace</h4>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Continuous stroke-dasharray orbital animation tracing rectangular perimeter coordinates.
          </p>
        </div>
      </div>
    </div>
  );
}
