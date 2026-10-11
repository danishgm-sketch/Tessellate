import React, { useState } from 'react';

export type NumberCountUpVariant = 'quiet' | 'expressive' | 'nocturne';

export interface NumberCountUpProps {
  variant?: NumberCountUpVariant;
}

export function NumberCountUp({ variant = 'quiet' }: NumberCountUpProps) {
  const [count, setCount] = useState(324);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const restart = () => {
    setCount(0);
    const target = 324;
    let current = 0;
    const interval = setInterval(() => {
      current += 12;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(current);
      }
    }, 25);
  };

  return (
    <div className={`w-full p-8 rounded-xl border flex flex-col items-center gap-4 transition-colors ${cardBg}`}>
      <div className="w-full flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-mono text-neutral-400">Logarithmic Counter</span>
        <button
          onClick={restart}
          className="text-xs px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-current"
        >
          Replay Count
        </button>
      </div>

      <div className="py-4 text-center">
        <span className="text-5xl font-mono font-extrabold tracking-tight">{count}</span>
        <div className="text-xs text-neutral-500 mt-1">Canonical Resources Verified</div>
      </div>
    </div>
  );
}
