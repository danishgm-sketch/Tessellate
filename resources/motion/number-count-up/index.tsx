import React, { useEffect, useRef, useState } from 'react';

export type NumberCountUpVariant = 'quiet' | 'expressive' | 'nocturne';

export interface NumberCountUpProps {
  variant?: NumberCountUpVariant;
}

export function NumberCountUp({ variant = 'quiet' }: NumberCountUpProps) {
  const [count, setCount] = useState(1284);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const restart = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const target = 1284;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(target);
      return;
    }
    setCount(0);
    let current = 0;
    intervalRef.current = setInterval(() => {
      current += 12;
      if (current >= target) {
        setCount(target);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
      } else {
        setCount(current);
      }
    }, 25);
  };

  return (
    <div className={`w-full p-8 rounded-xl border flex flex-col items-center gap-4 transition-colors ${cardBg}`}>
      <div className="w-full flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-mono text-neutral-400">Count-up preview</span>
        <button
          type="button"
          onClick={restart}
          className="text-xs px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-current"
        >
          Replay Count
        </button>
      </div>

      <div className="py-4 text-center">
        <span className="text-5xl font-mono font-extrabold tracking-tight">{count}</span>
        <div className="text-xs text-neutral-500 mt-1">Example count</div>
      </div>
    </div>
  );
}
