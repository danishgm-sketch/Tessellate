import React from 'react';

export type FooterSitemapVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FooterSitemapProps {
  variant?: FooterSitemapVariant;
}

export function FooterSitemap({ variant = 'quiet' }: FooterSitemapProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/50 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const cols = [
    { title: 'Resources', links: ['Primitives', 'Shells', 'Sections', 'Blocks', 'Data Vis'] },
    { title: 'Platform', links: ['Workbench', 'Design DNA Lab', 'MCP Server', 'CLI Tools'] },
    { title: 'Community', links: ['GitHub', 'Discord', 'Docs', 'Contributing'] },
    { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Security', 'License'] },
  ];

  return (
    <footer className={`w-full py-16 px-6 sm:px-12 border-t transition-colors ${bg}`}>
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
        {cols.map((col) => (
          <div key={col.title}>
            <div className="font-bold text-xs uppercase tracking-wider mb-4 font-mono opacity-80">{col.title}</div>
            <ul className="space-y-2 text-xs opacity-70">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:underline">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
