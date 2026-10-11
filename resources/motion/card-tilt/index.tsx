import React, { useState } from 'react';

export type CardTiltVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CardTiltProps {
  variant?: CardTiltVariant;
}

export function CardTilt({ variant = 'quiet' }: CardTiltProps) {
  const [rot, setRot] = useState({ x: 0, y: 0 });

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white shadow-xl'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-xl'
      : 'bg-white border-neutral-200 text-neutral-900 shadow-lg';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRot({ x: -y * 12, y: x * 12 });
  };

  const handleMouseLeave = () => {
    setRot({ x: 0, y: 0 });
  };

  return (
    <div style={{ perspective: '800px' }} className="w-full flex items-center justify-center p-8">
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
        className={`w-80 p-6 rounded-2xl border transition-transform duration-150 ease-out cursor-pointer select-none motion-reduce:transform-none ${cardBg}`}
      >
        <div className="text-[10px] font-mono text-neutral-400 mb-2">3D Perspective Matrix</div>
        <h4 className="text-base font-bold mb-1">Perspective Tilt Card</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Hover across corners to test pitch and roll rotational transforms with smooth spring return.
        </p>
      </div>
    </div>
  );
}
