import React, { useState } from 'react';

export type TooltipVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TooltipProps {
  variant?: TooltipVariant;
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ variant = 'quiet', content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  let bubble = 'bg-neutral-900 text-white shadow-md';
  if (variant === 'expressive') bubble = 'bg-[#1E232E] text-white border border-[#2547E8] shadow-lg';
  if (variant === 'nocturne') bubble = 'bg-white text-neutral-950 font-semibold shadow-lg';

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 whitespace-nowrap rounded px-2 py-1 text-[11px] pointer-events-none ${bubble}`}>
          {content}
        </div>
      )}
    </div>
  );
}
