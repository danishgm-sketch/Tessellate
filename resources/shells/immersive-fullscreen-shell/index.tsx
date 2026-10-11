import React from 'react';

export type ImmersiveFullscreenShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ImmersiveFullscreenShellProps {
  variant?: ImmersiveFullscreenShellVariant;
  children?: React.ReactNode;
}

export function ImmersiveFullscreenShell({
  variant = 'quiet',
  children = <div className="text-center space-y-2"><h1 className="text-2xl font-bold">Immersive Viewport</h1><p className="text-xs opacity-60">Edge-to-edge presentation mode active.</p></div>,
}: ImmersiveFullscreenShellProps) {
  let theme = 'bg-neutral-900 text-white';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-neutral-100';

  return (
    <div className={`w-full h-screen relative flex items-center justify-center p-8 ${theme}`}>
      <button className="absolute top-4 right-4 text-xs opacity-50 hover:opacity-100 p-2 border border-white/20 rounded-lg">
        ✕ Exit Focus Mode
      </button>
      <div>{children}</div>
    </div>
  );
}
