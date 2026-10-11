import React from 'react';

export type CanvasWorkspaceShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CanvasWorkspaceShellProps {
  variant?: CanvasWorkspaceShellVariant;
  children?: React.ReactNode;
}

export function CanvasWorkspaceShell({
  variant = 'quiet',
  children = <div className="p-12 border border-dashed rounded-xl inline-block bg-white dark:bg-neutral-900">Composed Interface Screen</div>,
}: CanvasWorkspaceShellProps) {
  let gridBg = 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px]';
  if (variant === 'nocturne') {
    gridBg = 'bg-[radial-gradient(#27272a_1px,transparent_1px)] bg-[size:16px_16px] bg-[#0B0D10] text-white';
  }

  return (
    <div className={`w-full h-screen relative overflow-hidden flex items-center justify-center ${gridBg}`}>
      <div className="absolute top-4 left-4 z-10 p-2 bg-white/80 dark:bg-neutral-900/80 border rounded-lg text-xs shadow-xs">
        100% Zoom
      </div>
      <div>{children}</div>
    </div>
  );
}
