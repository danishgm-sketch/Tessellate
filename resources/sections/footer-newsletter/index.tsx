import React, { useState } from 'react';

export type FooterNewsletterVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FooterNewsletterProps {
  variant?: FooterNewsletterVariant;
}

export function FooterNewsletter({ variant = 'quiet' }: FooterNewsletterProps) {
  const [email, setEmail] = useState('');

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let inputBorder = 'border-neutral-300';
  let btn = 'bg-neutral-900 text-white hover:bg-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    inputBorder = 'border-blue-200';
    btn = 'bg-[#2547E8] text-white hover:bg-[#1B35B4] shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    inputBorder = 'border-[#2E3440] bg-[#151921]';
    btn = 'bg-cyan-500 text-black hover:bg-cyan-400 font-medium';
  }

  return (
    <footer className={`w-full py-20 px-6 sm:px-12 border-t transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Tessellate Dispatch</h2>
        <p className="text-xs sm:text-sm opacity-75 max-w-md mb-8">
          Weekly dispatches on computational aesthetics, autonomous composition, and Design DNA.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); setEmail(''); }} className="w-full max-w-md flex gap-2 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@domain.com"
            required
            className={`w-full p-2.5 rounded-lg border text-xs sm:text-sm outline-none ${inputBorder}`}
          />
          <button type="submit" className={`px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${btn}`}>
            Join
          </button>
        </form>

        <p className="text-[11px] opacity-60">Zero spam. Pure front-end engineering signal. Unsubscribe at any time.</p>
      </div>
    </footer>
  );
}
