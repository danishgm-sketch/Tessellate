import React, { useState } from 'react';

export type CtaSplitVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CtaSplitProps {
  variant?: CtaSplitVariant;
}

export function CtaSplit({ variant = 'quiet' }: CtaSplitProps) {
  const [email, setEmail] = useState('');

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let inputBorder = 'border-neutral-300';
  let btn = 'bg-neutral-900 text-white hover:bg-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/50 text-neutral-950 border-[#D9D6CF]';
    inputBorder = 'border-blue-200';
    btn = 'bg-[#2547E8] text-white hover:bg-[#1B35B4] shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    inputBorder = 'border-[#2E3440] bg-[#151921]';
    btn = 'bg-cyan-500 text-black hover:bg-cyan-400 font-medium';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Stay ahead of the interface revolution.</h2>
          <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
            Get weekly updates on newly verified blueprints, Design DNA algorithms, and autonomous agent patterns.
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setEmail(''); }} className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@domain.com"
            required
            className={`w-full p-3 rounded-lg border text-xs sm:text-sm outline-none ${inputBorder}`}
          />
          <button type="submit" className={`px-6 py-3 rounded-lg text-xs font-semibold whitespace-nowrap uppercase tracking-wider transition-all ${btn}`}>
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
