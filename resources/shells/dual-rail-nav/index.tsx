import React from 'react';

export type DualRailNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DualRailNavProps {
  variant?: DualRailNavVariant;
}

export function DualRailNav({ variant = 'quiet' }: DualRailNavProps) {
  let rail1 = 'bg-neutral-100 border-r border-neutral-200';
  let rail2 = 'bg-white border-r border-neutral-200';
  if (variant === 'nocturne') {
    rail1 = 'bg-[#0B0D10] border-r border-[#2E3440]';
    rail2 = 'bg-[#11141B] border-r border-[#2E3440] text-white';
  }

  return (
    <div className="flex h-screen text-xs">
      {/* Tier 1: Organization/App Icons */}
      <div className={`w-14 flex flex-col items-center py-4 gap-3 ${rail1}`}>
        <div className="h-8 w-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">T</div>
        <div className="h-8 w-8 rounded-full bg-neutral-300 dark:bg-neutral-800 flex items-center justify-center text-xs">D</div>
      </div>
      {/* Tier 2: Channels/Context Views */}
      <div className={`w-48 p-4 space-y-3 ${rail2}`}>
        <span className="font-semibold text-xs block">Engineering</span>
        <div className="space-y-1 opacity-80">
          <p className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer font-medium"># general</p>
          <p className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"># telemetry</p>
          <p className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"># releases</p>
        </div>
      </div>
    </div>
  );
}
