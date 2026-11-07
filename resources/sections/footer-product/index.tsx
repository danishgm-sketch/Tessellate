import React from 'react';

export type FooterProductVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FooterProductProps {
  variant?: FooterProductVariant;
  brand?: string;
  description?: string;
  links?: Array<{label:string;href:string}>;
}

export function FooterProduct({ variant = 'quiet',brand='Example product',description='Replace sample content with your organisation.',links=[{label:'Explore',href:'/explore'},{label:'Compose',href:'/compose'}] }: FooterProductProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <footer className={`w-full py-16 px-6 @sm:px-12 border-t transition-colors ${bg}`}>
      <div className="max-w-6xl mx-auto flex flex-col @md:flex-row justify-between items-start gap-12">
        <div className="max-w-sm">
          <div className="font-bold text-sm tracking-tight mb-2">{brand}</div>
          <p className="text-xs opacity-75 mb-4">{description}</p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Example interface</span>
          </div>
        </div>

        <div className="flex gap-12 text-xs">
          <div>
            <div className="font-bold mb-3">Explore</div>
            <ul className="space-y-2 opacity-75">
              {links.map(link=><li key={link.label}><a href={link.href} className="hover:underline">{link.label}</a></li>)}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
