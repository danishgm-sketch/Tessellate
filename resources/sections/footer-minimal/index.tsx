import React from 'react';

export type FooterMinimalVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FooterMinimalProps {
  variant?: FooterMinimalVariant;
}

export function FooterMinimal({ variant = 'quiet' }: FooterMinimalProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-600 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-700 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-neutral-400 border-[#2E3440]';
  }

  return (
    <footer className={`w-full py-8 px-6 sm:px-12 border-t text-xs transition-colors ${bg}`}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-tight text-neutral-900 dark:text-white">Tessellate</span>
          <span>© {new Date().getFullYear()} Tessellate Core. MIT License.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Status: Operational</a>
        </div>
      </div>
    </footer>
  );
}
