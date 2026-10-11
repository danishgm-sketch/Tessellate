import React from 'react';

export type ContextRailVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ContextRailProps {
  variant?: ContextRailVariant;
  title?: string;
  children?: React.ReactNode;
}

export function ContextRail({
  variant = 'quiet',
  title = 'Inspector',
  children = <p className="opacity-60 text-xs">Select node to inspect properties.</p>,
}: ContextRailProps) {
  let theme = 'bg-white border-l border-neutral-200 text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-l border-[#2E3440] text-white';

  return (
    <aside className={`w-64 h-screen p-4 flex flex-col gap-4 text-xs ${theme}`}>
      <div className="flex items-center justify-between pb-2 border-b border-inherit">
        <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-400">{title}</span>
      </div>
      <div className="flex-1">{children}</div>
    </aside>
  );
}
