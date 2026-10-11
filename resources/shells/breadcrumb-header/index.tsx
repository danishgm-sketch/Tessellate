import React from 'react';

export type BreadcrumbHeaderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BreadcrumbHeaderProps {
  variant?: BreadcrumbHeaderVariant;
}

export function BreadcrumbHeader({ variant = 'quiet' }: BreadcrumbHeaderProps) {
  let header = 'bg-white border-b border-neutral-200 text-neutral-900';
  if (variant === 'nocturne') header = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';

  return (
    <div className={`w-full px-6 h-14 flex items-center justify-between text-xs ${header}`}>
      <div className="flex items-center gap-2">
        <a href="#" className="opacity-50 hover:opacity-100">Projects</a>
        <span className="opacity-30">/</span>
        <a href="#" className="opacity-50 hover:opacity-100">Telemetry</a>
        <span className="opacity-30">/</span>
        <span className="font-semibold">Analytics Node</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 border rounded-lg">Export</button>
        <button className="px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-medium rounded-lg">Save</button>
      </div>
    </div>
  );
}
