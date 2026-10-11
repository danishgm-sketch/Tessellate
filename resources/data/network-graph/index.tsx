import React, { useState } from 'react';

export type NetworkGraphVariant = 'quiet' | 'expressive' | 'nocturne';

export interface NetworkGraphProps {
  variant?: NetworkGraphVariant;
}

export function NetworkGraph({ variant = 'quiet' }: NetworkGraphProps) {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const nodeFill =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717';

  const edgeStroke =
    variant === 'nocturne' ? '#2E3440' : '#E5E7EB';

  const nodes = [
    { id: 'auth', label: 'Auth Service', x: 120, y: 70, size: 16 },
    { id: 'api', label: 'API Gateway', x: 280, y: 110, size: 24 },
    { id: 'db', label: 'D1 Database', x: 440, y: 70, size: 20 },
    { id: 'cache', label: 'KV Cache', x: 280, y: 210, size: 14 },
    { id: 'worker', label: 'Queue Worker', x: 440, y: 190, size: 18 },
  ];

  const edges = [
    { from: 'auth', to: 'api' },
    { from: 'api', to: 'db' },
    { from: 'api', to: 'cache' },
    { from: 'api', to: 'worker' },
    { from: 'worker', to: 'db' },
  ];

  const getNode = (id: string) => nodes.find((n) => n.id === id);

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Microservice Topology Graph</h4>
          <p className="text-xs text-neutral-500">Inter-service RPC communication mesh</p>
        </div>
        <span className="text-xs font-mono font-medium text-neutral-400">5 Services | 5 Edges</span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox="0 0 560 260" className="w-full h-auto overflow-visible select-none">
          {/* Edges */}
          {edges.map((e, idx) => {
            const n1 = getNode(e.from);
            const n2 = getNode(e.to);
            if (!n1 || !n2) return null;
            const isHighlight = activeNode === e.from || activeNode === e.to;

            return (
              <line
                key={idx}
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke={isHighlight ? (variant === 'nocturne' ? '#38BDF8' : '#2547E8') : edgeStroke}
                strokeWidth={isHighlight ? '2.5' : '1.5'}
                className="transition-colors duration-200"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const isHovered = activeNode === n.id;
            return (
              <g
                key={n.id}
                onMouseEnter={() => setActiveNode(n.id)}
                onMouseLeave={() => setActiveNode(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isHovered ? n.size + 4 : n.size}
                  fill={nodeFill}
                  stroke={variant === 'nocturne' ? '#000' : '#fff'}
                  strokeWidth="2.5"
                  className="transition-all duration-200"
                />
                <text
                  x={n.x}
                  y={n.y + n.size + 16}
                  textAnchor="middle"
                  className={`text-[11px] font-mono transition-colors ${
                    isHovered ? 'font-bold fill-current' : 'fill-neutral-500'
                  }`}
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
