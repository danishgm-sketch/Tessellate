import React from 'react';

export type FloatingNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FloatingNavProps {
  variant?: FloatingNavVariant;
}

export function FloatingNav({ variant = 'quiet' }: FloatingNavProps) {
  let pill = 'bg-white/80 border-neutral-200 text-neutral-900 shadow-lg';
  if (variant === 'expressive') pill = 'bg-white/90 border-[#D9D6CF] text-neutral-900 shadow-xl';
  if (variant === 'nocturne') pill = 'bg-[#11141B]/90 border-[#2E3440] text-white shadow-xl';

  return (
    <div className="w-full pt-4 flex justify-center px-4">
      <div className={`inline-flex items-center gap-6 rounded-full border px-6 py-2.5 backdrop-blur-md text-xs ${pill}`}>
        <span className="font-semibold">Tessellate</span>
        <div className="flex items-center gap-4">
          <a href="#" className="opacity-70 hover:opacity-100">Overview</a>
          <a href="#" className="opacity-70 hover:opacity-100">Specs</a>
          <a href="#" className="opacity-70 hover:opacity-100">Changelog</a>
        </div>
        <button className="px-3 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-full font-medium">
          Open
        </button>
      </div>
    </div>
  );
}
