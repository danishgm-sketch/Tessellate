import React, { useState } from 'react';

export type MagneticButtonVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MagneticButtonProps {
  variant?: MagneticButtonVariant;
  children?: React.ReactNode;
}

export function MagneticButton({ variant = 'quiet', children = 'Explore Interface System →' }: MagneticButtonProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const btnClass =
    variant === 'nocturne'
      ? 'bg-cyan-500 text-black font-semibold hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]'
      : variant === 'expressive'
      ? 'bg-[#2547E8] text-white font-medium hover:bg-blue-700 shadow-md'
      : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900';

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.35;
    const deltaY = (e.clientY - centerY) * 0.35;
    setOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="p-8 flex items-center justify-center">
      <button
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
        className={`px-6 py-3 rounded-xl text-xs transition-transform duration-150 ease-out select-none motion-reduce:transform-none ${btnClass}`}
      >
        {children}
      </button>
    </div>
  );
}
