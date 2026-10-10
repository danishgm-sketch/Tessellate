import React, { useState } from 'react';

export type ContextMenuVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ContextMenuProps {
  variant?: ContextMenuVariant;
  children: React.ReactNode;
}

export function ContextMenu({ variant = 'quiet', children }: ContextMenuProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
  };

  let theme = 'bg-white border-neutral-200 text-neutral-900 shadow-xl';
  if (variant === 'expressive') theme = 'bg-white border-[#D9D6CF] text-neutral-900 shadow-2xl';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-[#2E3440] text-white shadow-2xl';

  return (
    <div onContextMenu={handleContextMenu} className="relative">
      {children}
      {pos && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPos(null)} />
          <div
            style={{ top: pos.y, left: pos.x }}
            className={`fixed z-50 min-w-44 rounded-lg border p-1 text-xs ${theme}`}
          >
            <button type="button" onClick={() => setPos(null)} className="w-full text-left px-2.5 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Cut
            </button>
            <button type="button" onClick={() => setPos(null)} className="w-full text-left px-2.5 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Copy
            </button>
            <button type="button" onClick={() => setPos(null)} className="w-full text-left px-2.5 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Lock Layer
            </button>
          </div>
        </>
      )}
    </div>
  );
}
