import React from 'react';

export type FooterProductVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FooterProductProps {
  variant?: FooterProductVariant;
}

export function FooterProduct({ variant = 'quiet' }: FooterProductProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <footer className={`w-full py-16 px-6 sm:px-12 border-t transition-colors ${bg}`}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-sm">
          <div className="font-bold text-sm tracking-tight mb-2">Tessellate Engine</div>
          <p className="text-xs opacity-75 mb-4">Autonomous composition and Design DNA runtime.</p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Latest: v1.0.0 Stable</span>
          </div>
        </div>

        <div className="flex gap-12 text-xs">
          <div>
            <div className="font-bold mb-3">Workbench</div>
            <ul className="space-y-2 opacity-75">
              <li><a href="#" className="hover:underline">DNA Lab</a></li>
              <li><a href="#" className="hover:underline">Catalog</a></li>
              <li><a href="#" className="hover:underline">Inspector</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold mb-3">Developers</div>
            <ul className="space-y-2 opacity-75">
              <li><a href="#" className="hover:underline">CLI</a></li>
              <li><a href="#" className="hover:underline">MCP Server</a></li>
              <li><a href="#" className="hover:underline">Schemas</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
