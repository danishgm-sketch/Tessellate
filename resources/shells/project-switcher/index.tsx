import React from 'react';

export type ProjectSwitcherVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProjectSwitcherProps {
  variant?: ProjectSwitcherVariant;
  currentProject?: string;
}

export function ProjectSwitcher({
  variant = 'quiet',
  currentProject = 'Telemetry Hub',
}: ProjectSwitcherProps) {
  let theme = 'hover:bg-neutral-100 text-neutral-800';
  if (variant === 'expressive') theme = 'hover:bg-[#E7EBFF] text-[#2547E8] font-semibold';
  if (variant === 'nocturne') theme = 'hover:bg-neutral-800 text-white';

  return (
    <div className="inline-flex items-center gap-1.5 text-xs">
      <span className="opacity-50">project /</span>
      <button type="button" className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${theme}`}>
        <span>{currentProject}</span>
        <span className="opacity-40 text-[10px]">▾</span>
      </button>
    </div>
  );
}
