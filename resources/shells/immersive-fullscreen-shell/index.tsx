import React, { useState } from 'react';

export type ImmersiveFullscreenShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ImmersiveFullscreenShellProps {
  variant?: ImmersiveFullscreenShellVariant;
  children?: React.ReactNode;
  onExitFocusMode?: () => void;
}

export function ImmersiveFullscreenShell({
  variant = 'quiet',
  children = <div className="text-center space-y-2"><h1 className="text-2xl font-bold">Immersive Viewport</h1><p className="text-xs opacity-80">Edge-to-edge presentation mode (preview only).</p></div>,
  onExitFocusMode,
}: ImmersiveFullscreenShellProps) {
  const [isFocused, setIsFocused] = useState(true);

  let theme = 'bg-neutral-900 text-white';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-neutral-100';

  return (
    <div className={`w-full h-screen relative flex flex-col items-center justify-center p-8 ${theme}`}>
      <button
        type="button"
        onClick={() => {
          setIsFocused((previous) => !previous);
          onExitFocusMode?.();
        }}
        className="absolute top-4 right-4 text-xs text-neutral-200 hover:text-white p-2 border border-white/30 rounded-lg"
      >
        {isFocused ? '✕ Exit Focus Mode' : 'Enter Focus Mode'}
      </button>
      <div>{children}</div>
      <p role="status" className="mt-4 text-xs text-neutral-300">
        {isFocused ? 'Preview focus mode active.' : 'Preview focus mode paused locally.'}
      </p>
    </div>
  );
}
