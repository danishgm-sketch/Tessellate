import React, { useState } from 'react';

export type InteractiveGlobeVariant = 'quiet' | 'expressive' | 'nocturne';

export interface InteractiveGlobeProps {
  variant?: InteractiveGlobeVariant;
}

export function InteractiveGlobe({ variant = 'quiet' }: InteractiveGlobeProps) {
  const [activeNode, setActiveNode] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const wireColor =
    variant === 'nocturne' ? '#1E232E' : '#E5E7EB';

  const pulseColor =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717';

  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  const baseNodes = [
    { baseAngle: 0, lat: 90, label: 'North America (US-East)' },
    { baseAngle: 75, lat: 110, label: 'Europe Hub (FRA-01)' },
    { baseAngle: 150, lat: 130, label: 'Asia-Pacific (TYO-02)' },
    { baseAngle: 240, lat: 100, label: 'South America (SAO-01)' },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartX;
    setRotation((prev) => (prev + delta * 0.5) % 360);
    setDragStartX(e.clientX);
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col items-center transition-colors select-none ${cardBg}`}>
      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Worldwide Telemetry Mesh</h4>
          <p className="text-xs text-neutral-500">Orthographic orbital projection (Drag to rotate)</p>
        </div>
        <span className="text-xs font-mono font-medium text-cyan-500 animate-pulse">● Live Orbit</span>
      </div>

      <div
        className="relative w-[240px] h-[240px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg width="240" height="240" viewBox="0 0 240 240">
          {/* Globe boundary */}
          <circle cx="120" cy="120" r="90" fill="transparent" stroke={wireColor} strokeWidth="2" />

          {/* Latitude lines */}
          <ellipse cx="120" cy="120" rx="90" ry="30" fill="none" stroke={wireColor} strokeWidth="1" />
          <ellipse cx="120" cy="120" rx="90" ry="60" fill="none" stroke={wireColor} strokeWidth="1" />
          <line x1="30" y1="120" x2="210" y2="120" stroke={wireColor} strokeWidth="1" strokeDasharray="3 3" />

          {/* Rotated longitude lines */}
          {[0, 45, 90, 135].map((ang) => {
            const effectiveAng = ((ang + rotation) % 180) * (Math.PI / 180);
            const rx = Math.abs(Math.sin(effectiveAng) * 90);
            return (
              <ellipse key={ang} cx="120" cy="120" rx={Math.max(1, rx)} ry="90" fill="none" stroke={wireColor} strokeWidth="1" />
            );
          })}

          {/* Orbital telemetry nodes */}
          {baseNodes.map((n, idx) => {
            const rad = ((n.baseAngle + rotation) * Math.PI) / 180;
            // Only visible on front hemisphere (cos(rad) > -0.2)
            const visible = Math.cos(rad) >= -0.2;
            if (!visible) return null;

            const cx = 120 + Math.sin(rad) * 75;
            const cy = n.lat;
            const isHovered = activeNode === idx;

            return (
              <g
                key={n.label}
                onMouseEnter={() => setActiveNode(idx)}
                onMouseLeave={() => setActiveNode(null)}
                className="cursor-pointer"
              >
                <circle cx={cx} cy={cy} r={isHovered ? 6 : 4} fill={pulseColor} />
                <circle cx={cx} cy={cy} r={isHovered ? 12 : 8} fill={pulseColor} fillOpacity="0.25" className="animate-ping" />
              </g>
            );
          })}
        </svg>

        {activeNode !== null && (
          <div className="absolute bottom-2 text-xs font-mono font-semibold px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
            {baseNodes[activeNode]?.label}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-neutral-400">
        <span>Azimuth: {Math.round((rotation % 360 + 360) % 360)}°</span>
        <span>•</span>
        <span>Mesh: Orthographic-4X</span>
      </div>
    </div>
  );
}
