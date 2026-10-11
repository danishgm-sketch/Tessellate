import React from 'react';

export type ThreePaneAppShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ThreePaneAppShellProps {
  variant?: ThreePaneAppShellVariant;
  leftPane?: React.ReactNode;
  centerPane?: React.ReactNode;
  rightPane?: React.ReactNode;
}

export function ThreePaneAppShell({
  variant = 'quiet',
  leftPane = <div className="p-4">Nav Tree</div>,
  centerPane = <div className="p-8">Visual Canvas</div>,
  rightPane = <div className="p-4">Inspector</div>,
}: ThreePaneAppShellProps) {
  let theme = 'bg-white border-neutral-200 text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-[#2E3440] text-white';

  return (
    <div className={`h-screen flex divide-x overflow-hidden text-xs ${theme}`}>
      <div className="w-56 shrink-0">{leftPane}</div>
      <div className="flex-1 overflow-auto bg-neutral-50 dark:bg-[#0B0D10]">{centerPane}</div>
      <div className="w-64 shrink-0">{rightPane}</div>
    </div>
  );
}
