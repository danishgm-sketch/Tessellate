import React from 'react';

export type FooterDeveloperVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FooterDeveloperProps {
  variant?: FooterDeveloperVariant;
}

export function FooterDeveloper({ variant = 'quiet' }: FooterDeveloperProps) {
  let bg = 'bg-[#18181B] text-neutral-300 border-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-[#0E1528] text-blue-100 border-blue-900/50';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-cyan-50 border-[#2E3440]';
  }

  return (
    <footer className={`w-full py-12 px-6 sm:px-12 border-t font-mono text-xs transition-colors ${bg}`}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400">$</span>
          <span>npx @tessellate/cli --version</span>
          <span className="opacity-50">// 1.0.0</span>
        </div>
        <div className="flex items-center gap-6 text-[11px] opacity-70">
          <span>SHA: c4b2a9f</span>
          <span>Edge: 100% OK</span>
          <span>Latency: 0.8ms</span>
        </div>
      </div>
    </footer>
  );
}
