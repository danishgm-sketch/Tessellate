import React, { useState, useEffect } from 'react';

export type TransparentSolidNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TransparentSolidNavProps {
  variant?: TransparentSolidNavVariant;
}

export function TransparentSolidNav({ variant = 'quiet' }: TransparentSolidNavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const solidClass = scrolled
    ? (variant === 'nocturne' ? 'bg-[#0B0D10] border-b border-[#2E3440] shadow-md' : 'bg-white border-b border-neutral-200 shadow-xs')
    : 'bg-transparent border-transparent';

  return (
    <header className={`w-full fixed top-0 left-0 z-40 transition-all duration-200 px-6 h-16 flex items-center justify-between ${solidClass}`}>
      <span className="font-semibold text-sm">Tessellate</span>
      <div className="flex items-center gap-6 text-xs">
        <a href="#" className="opacity-80 hover:opacity-100">Engine</a>
        <a href="#" className="opacity-80 hover:opacity-100">Gallery</a>
        <button className="px-3 py-1.5 border rounded-lg">Docs</button>
      </div>
    </header>
  );
}
