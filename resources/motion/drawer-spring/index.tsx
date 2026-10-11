import React, { useState } from 'react';

export type DrawerSpringVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DrawerSpringProps {
  variant?: DrawerSpringVariant;
}

export function DrawerSpring({ variant = 'quiet' }: DrawerSpringProps) {
  const [isOpen, setIsOpen] = useState(false);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  return (
    <div className={`w-full p-8 rounded-xl border flex flex-col items-center justify-center transition-colors ${cardBg}`}>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-xs font-medium rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
      >
        Open Spring Drawer →
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
          <div className={`w-80 h-full p-6 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${cardBg}`}>
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                <span className="text-sm font-semibold">Inspector Drawer</span>
                <button onClick={() => setIsOpen(false)} className="text-xs text-neutral-400 hover:text-current">
                  ✕
                </button>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Sliding off-canvas sheet with spring damping entrance and backdrop blur layer.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
