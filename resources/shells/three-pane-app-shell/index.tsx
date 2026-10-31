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
    <div className={`min-h-screen flex flex-col divide-y overflow-x-hidden text-xs md:h-screen md:flex-row md:divide-x md:divide-y-0 md:overflow-hidden ${theme}`}>
      <div className="w-full shrink-0 md:w-56">{leftPane}</div>
      <div
        role="region"
        aria-label="Workspace canvas"
        tabIndex={0}
        className="min-h-[50vh] w-full min-w-0 flex-1 overflow-auto bg-neutral-50 text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600 dark:bg-[#0B0D10] dark:text-neutral-100 md:min-h-0"
      >
        {centerPane}
      </div>
      <div className="w-full shrink-0 md:w-64">{rightPane}</div>
    </div>
  );
}
