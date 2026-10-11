import type { DataDef } from './data-builder';

export const DATA_BATCH_2: DataDef[] = [
  // 13. Radar Chart
  {
    slug: 'radar-chart',
    name: 'Radar Chart',
    description: 'Polygonal spider/radar chart with concentric polygon web rings, 6 radial metric axes, and shaded polygon metric footprint.',
    categories: ['data', 'visualization', 'charts'],
    roles: ['chart', 'analytics'],
    purposes: ['multivariate-profile', 'capability-assessment', 'security-posture'],
    componentName: 'RadarChart',
    tags: ['chart', 'radar', 'spider', 'polygon', 'multivariate'],
    idealFor: ['Security posture scoring across dimensions', 'Product maturity assessment', 'Skill and competency profiles'],
    avoidFor: ['Sequential time-series progressions', 'High volume raw data records'],
    jobs: ['Evaluate multidimensional profile scores on concentric radial axes'],
    indexCode: `import React, { useState } from 'react';

export type RadarChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface RadarChartProps {
  variant?: RadarChartVariant;
}

export function RadarChart({ variant = 'quiet' }: RadarChartProps) {
  const [activeAxis, setActiveAxis] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const strokeColor =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717';

  const gridColor =
    variant === 'nocturne' ? '#1E232E' : '#E5E7EB';

  const metrics = [
    { label: 'Security', val: 92 },
    { label: 'Speed', val: 85 },
    { label: 'Reliability', val: 98 },
    { label: 'Usability', val: 78 },
    { label: 'Scalability', val: 90 },
    { label: 'Compliance', val: 88 },
  ];

  const size = 260;
  const center = size / 2;
  const radius = 95;
  const numAxes = metrics.length;

  const getCoordinates = (axisIndex: number, valuePct: number) => {
    const angle = (Math.PI * 2 / numAxes) * axisIndex - Math.PI / 2;
    const r = radius * valuePct;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polyPoints = metrics.map((m, i) => {
    const coords = getCoordinates(i, m.val / 100);
    return \`\${coords.x},\${coords.y}\`;
  }).join(' ');

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col items-center transition-colors \${cardBg}\`}>
      <div className="w-full flex items-center justify-between mb-2">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">System Maturity Profile</h4>
          <p className="text-xs text-neutral-500">6-axis architectural readiness</p>
        </div>
        <span className="text-xs font-mono font-medium text-neutral-400">Score: 88.5/100</span>
      </div>

      <div className="relative w-[280px] h-[280px] flex items-center justify-center select-none">
        <svg width={size} height={size} className="overflow-visible">
          {/* Concentric polygon rings */}
          {[0.25, 0.5, 0.75, 1.0].map((ring) => {
            const ringPts = Array.from({ length: numAxes })
              .map((_, i) => {
                const c = getCoordinates(i, ring);
                return \`\${c.x},\${c.y}\`;
              })
              .join(' ');
            return (
              <polygon
                key={ring}
                points={ringPts}
                fill="none"
                stroke={gridColor}
                strokeWidth="1"
              />
            );
          })}

          {/* Radial axis lines and labels */}
          {metrics.map((m, i) => {
            const endCoords = getCoordinates(i, 1.0);
            const labelCoords = getCoordinates(i, 1.25);
            const isHovered = activeAxis === i;

            return (
              <g key={m.label} onMouseEnter={() => setActiveAxis(i)} onMouseLeave={() => setActiveAxis(null)} className="cursor-pointer">
                <line x1={center} y1={center} x2={endCoords.x} y2={endCoords.y} stroke={gridColor} strokeWidth="1" />
                <text
                  x={labelCoords.x}
                  y={labelCoords.y + 4}
                  textAnchor="middle"
                  className={\`text-[10px] font-mono transition-colors \${isHovered ? 'font-bold fill-current' : 'fill-neutral-400'}\`}
                >
                  {m.label}
                </text>
              </g>
            );
          })}

          {/* Value polygon */}
          <polygon
            points={polyPoints}
            fill={strokeColor}
            fillOpacity={variant === 'nocturne' ? 0.35 : 0.2}
            stroke={strokeColor}
            strokeWidth="2.5"
          />

          {/* Point dots */}
          {metrics.map((m, i) => {
            const c = getCoordinates(i, m.val / 100);
            return (
              <circle
                key={m.label}
                cx={c.x}
                cy={c.y}
                r="4"
                fill={strokeColor}
                stroke={variant === 'nocturne' ? '#000' : '#fff'}
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { RadarChart, RadarChartVariant } from './index';

export function RadarChartPreview() {
  const [variant, setVariant] = useState<RadarChartVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <RadarChart variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const radarChartFixtures = {};`,
    readmeCode: `# Radar Chart

Polygonal spider chart with concentric polygon web rings and 6 radial metric axes.`,
  },

  // 14. Funnel Chart
  {
    slug: 'funnel-chart',
    name: 'Funnel Chart',
    description: 'Multi-stage conversion funnel showing drop-off percentages, stage step trapezoids/bars, and stage conversion rates.',
    categories: ['data', 'visualization', 'charts'],
    roles: ['chart', 'analytics'],
    purposes: ['conversion-tracking', 'funnel-analysis', 'lead-generation'],
    componentName: 'FunnelChart',
    tags: ['chart', 'funnel', 'conversion', 'stages', 'analytics'],
    idealFor: ['Checkout funnel conversion', 'Lead-to-customer stages', 'Signup drop-off analysis'],
    avoidFor: ['Oscillating time waveforms', 'Geographical distribution'],
    jobs: ['Visualize step-by-step conversion throughput and stage drop-offs'],
    indexCode: `import React, { useState } from 'react';

export type FunnelChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FunnelChartProps {
  variant?: FunnelChartVariant;
}

export function FunnelChart({ variant = 'quiet' }: FunnelChartProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const stepFill =
    variant === 'nocturne'
      ? 'bg-cyan-500/80 border-cyan-400'
      : variant === 'expressive'
      ? 'bg-[#2547E8] border-blue-400'
      : 'bg-neutral-800 border-neutral-700';

  const stages = [
    { name: 'Visitors', count: 12500, pct: 100 },
    { name: 'Product Views', count: 6800, pct: 54 },
    { name: 'Signups', count: 2400, pct: 19 },
    { name: 'Workspace Created', count: 1850, pct: 15 },
    { name: 'Upgraded to Paid', count: 520, pct: 4.2 },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Onboarding Conversion Funnel</h4>
          <p className="text-xs text-neutral-500">Visitor-to-paid lifecycle conversion</p>
        </div>
        <span className="text-xs font-mono font-medium text-emerald-500">Overall: 4.2%</span>
      </div>

      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const isHovered = activeStep === idx;
          return (
            <div
              key={stage.name}
              onMouseEnter={() => setActiveStep(idx)}
              onMouseLeave={() => setActiveStep(null)}
              className="flex items-center gap-4 cursor-pointer group"
            >
              <div className="w-36 text-xs font-medium truncate text-neutral-600 dark:text-neutral-400 group-hover:text-current">
                {stage.name}
              </div>
              <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 h-8 rounded-lg overflow-hidden flex items-center p-1">
                <div
                  className={\`h-full rounded transition-all duration-300 flex items-center px-3 text-white text-xs font-mono font-semibold \${stepFill} \${
                    isHovered ? 'opacity-100' : 'opacity-85'
                  }\`}
                  style={{ width: \`\${Math.max(stage.pct, 8)}%\` }}
                >
                  {stage.count.toLocaleString()}
                </div>
              </div>
              <div className="w-16 text-right text-xs font-mono font-medium text-neutral-400">
                {stage.pct}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FunnelChart, FunnelChartVariant } from './index';

export function FunnelChartPreview() {
  const [variant, setVariant] = useState<FunnelChartVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <FunnelChart variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const funnelChartFixtures = {};`,
    readmeCode: `# Funnel Chart

Multi-stage conversion funnel showing drop-off percentages and step conversion rates.`,
  },

  // 15. Sankey Diagram
  {
    slug: 'sankey-diagram',
    name: 'Sankey Diagram',
    description: 'Flow distribution chart showing source-to-target stream links with curved SVG ribbon bands and node column blocks.',
    categories: ['data', 'visualization', 'charts'],
    roles: ['chart', 'analytics'],
    purposes: ['flow-distribution', 'resource-routing', 'traffic-redirection'],
    componentName: 'SankeyDiagram',
    tags: ['chart', 'sankey', 'flow', 'ribbons', 'svg'],
    idealFor: ['Energy/resource flow distribution', 'User navigation paths between pages', 'Budget revenue allocation'],
    avoidFor: ['Simple 2-value toggles', 'Narrow single-number KPI cards'],
    jobs: ['Map flows between multiple source and target nodes with curved vector ribbons'],
    indexCode: `import React, { useState } from 'react';

export type SankeyDiagramVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SankeyDiagramProps {
  variant?: SankeyDiagramVariant;
}

export function SankeyDiagram({ variant = 'quiet' }: SankeyDiagramProps) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const ribbonColor =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.4)'
      : variant === 'expressive'
      ? 'rgba(37, 71, 232, 0.35)'
      : 'rgba(23, 23, 23, 0.25)';

  const activeRibbonColor =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.8)'
      : variant === 'expressive'
      ? 'rgba(37, 71, 232, 0.7)'
      : 'rgba(23, 23, 23, 0.6)';

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">API Request Distribution Flow</h4>
          <p className="text-xs text-neutral-500">Edge Gateway → Ingestion Workers → Storage Backends</p>
        </div>
        <span className="text-xs font-mono font-medium text-neutral-400">100% Routed</span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox="0 0 600 220" className="w-full h-auto overflow-visible select-none">
          {/* Source node column */}
          <rect x="20" y="30" width="16" height="160" rx="4" fill={variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717'} />
          <text x="44" y="115" className="text-xs font-semibold fill-current">Gateway (100k)</text>

          {/* Mid node column */}
          <rect x="280" y="30" width="16" height="90" rx="4" fill={variant === 'nocturne' ? '#6366F1' : variant === 'expressive' ? '#10B981' : '#525252'} />
          <text x="304" y="80" className="text-xs font-medium fill-current">Worker A (60k)</text>

          <rect x="280" y="130" width="16" height="60" rx="4" fill={variant === 'nocturne' ? '#A855F7' : variant === 'expressive' ? '#F59E0B' : '#737373'} />
          <text x="304" y="165" className="text-xs font-medium fill-current">Worker B (40k)</text>

          {/* Dest node column */}
          <rect x="540" y="40" width="16" height="50" rx="4" fill={variant === 'nocturne' ? '#10B981' : variant === 'expressive' ? '#3B82F6' : '#262626'} />
          <text x="530" y="30" textAnchor="end" className="text-xs font-medium fill-current">D1 Primary</text>

          <rect x="540" y="110" width="16" height="70" rx="4" fill={variant === 'nocturne' ? '#F43F5E' : variant === 'expressive' ? '#EC4899' : '#404040'} />
          <text x="530" y="100" textAnchor="end" className="text-xs font-medium fill-current">R2 Bucket</text>

          {/* Flow ribbons (bezier curves) */}
          {/* Gateway -> Worker A */}
          <path
            d="M 36 30 C 150 30, 160 30, 280 30 L 280 120 C 160 120, 150 125, 36 125 Z"
            fill={hoveredLink === 'l1' ? activeRibbonColor : ribbonColor}
            onMouseEnter={() => setHoveredLink('l1')}
            onMouseLeave={() => setHoveredLink(null)}
            className="cursor-pointer transition-colors duration-150"
          />

          {/* Gateway -> Worker B */}
          <path
            d="M 36 125 C 150 125, 160 130, 280 130 L 280 190 C 160 190, 150 190, 36 190 Z"
            fill={hoveredLink === 'l2' ? activeRibbonColor : ribbonColor}
            onMouseEnter={() => setHoveredLink('l2')}
            onMouseLeave={() => setHoveredLink(null)}
            className="cursor-pointer transition-colors duration-150"
          />

          {/* Worker A -> D1 */}
          <path
            d="M 296 30 C 410 30, 420 40, 540 40 L 540 90 C 420 90, 410 75, 296 75 Z"
            fill={hoveredLink === 'l3' ? activeRibbonColor : ribbonColor}
            onMouseEnter={() => setHoveredLink('l3')}
            onMouseLeave={() => setHoveredLink(null)}
            className="cursor-pointer transition-colors duration-150"
          />
        </svg>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { SankeyDiagram, SankeyDiagramVariant } from './index';

export function SankeyDiagramPreview() {
  const [variant, setVariant] = useState<SankeyDiagramVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <SankeyDiagram variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const sankeyDiagramFixtures = {};`,
    readmeCode: `# Sankey Diagram

Flow distribution chart showing source-to-target stream links with curved SVG ribbons.`,
  },

  // 16. Network Graph
  {
    slug: 'network-graph',
    name: 'Network Graph',
    description: 'Node-link topology diagram with circular nodes, interconnecting SVG edge lines, hub highlights, and cluster grouping.',
    categories: ['data', 'visualization', 'charts'],
    roles: ['chart', 'analytics'],
    purposes: ['topology-visualization', 'dependency-graph', 'service-mesh'],
    componentName: 'NetworkGraph',
    tags: ['chart', 'network', 'graph', 'nodes', 'topology'],
    idealFor: ['Microservice dependencies', 'Entity relationship meshes', 'Social/account network connections'],
    avoidFor: ['Tabular ordered spreadsheets', '1D timeline chronological feeds'],
    jobs: ['Map node-to-node relational connections in a 2D network mesh topology'],
    indexCode: `import React, { useState } from 'react';

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
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
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
                  className={\`text-[11px] font-mono transition-colors \${
                    isHovered ? 'font-bold fill-current' : 'fill-neutral-500'
                  }\`}
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
}`,
    previewCode: `import React, { useState } from 'react';
import { NetworkGraph, NetworkGraphVariant } from './index';

export function NetworkGraphPreview() {
  const [variant, setVariant] = useState<NetworkGraphVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <NetworkGraph variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const networkGraphFixtures = {};`,
    readmeCode: `# Network Graph

Node-link topology diagram with circular nodes, interconnecting edge lines, and interactive service highlights.`,
  },

  // 17. Mini Sparkline
  {
    slug: 'mini-sparkline',
    name: 'Mini Sparkline',
    description: 'Ultra-compact inline sparkline widget with trend arrow, delta percentage badge, min/max range dots, and current value.',
    categories: ['data', 'visualization', 'charts'],
    roles: ['chart', 'analytics'],
    purposes: ['inline-trend', 'micro-visualization', 'delta-tracking'],
    componentName: 'MiniSparkline',
    tags: ['chart', 'sparkline', 'inline', 'micro', 'svg'],
    idealFor: ['Table cell mini trends', 'Inline metric rows', 'Header navigation KPI status'],
    avoidFor: ['Detailed multi-dimensional exploration', 'Full screen analytics dashboards'],
    jobs: ['Show rapid visual trend direction in compact table and list contexts'],
    indexCode: `import React from 'react';

export type MiniSparklineVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MiniSparklineProps {
  variant?: MiniSparklineVariant;
  values?: number[];
  positive?: boolean;
}

export function MiniSparkline({
  variant = 'quiet',
  values = [28, 32, 29, 36, 42, 39, 48, 54],
  positive = true,
}: MiniSparklineProps) {
  const strokeColor =
    variant === 'nocturne'
      ? positive ? '#10B981' : '#F43F5E'
      : variant === 'expressive'
      ? positive ? '#10B981' : '#EF4444'
      : '#171717';

  const w = 90;
  const h = 28;
  const pad = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return \`\${x},\${y}\`;
  }).join(' ');

  const lastVal = values[values.length - 1] ?? 0;

  return (
    <div className="inline-flex items-center gap-3">
      <svg width={w} height={h} className="overflow-visible select-none">
        <polyline points={pts} fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle
          cx={w - pad}
          cy={h - pad - ((lastVal - min) / range) * (h - pad * 2)}
          r="2.5"
          fill={strokeColor}
        />
      </svg>
      <span className={\`text-xs font-mono font-semibold \${positive ? 'text-emerald-500' : 'text-rose-500'}\`}>
        {positive ? '+14.2%' : '-4.8%'}
      </span>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { MiniSparkline, MiniSparklineVariant } from './index';

export function MiniSparklinePreview() {
  const [variant, setVariant] = useState<MiniSparklineVariant>('quiet');

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="p-6 border rounded-xl flex items-center justify-between">
        <div>
          <div className="text-xs text-neutral-400">Cache Hit Ratio</div>
          <div className="text-lg font-bold font-mono">98.4%</div>
        </div>
        <MiniSparkline variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const miniSparklineFixtures = {};`,
    readmeCode: `# Mini Sparkline

Ultra-compact inline sparkline widget with trend polyline, end marker, and delta percentage.`,
  },

  // 18. KPI Delta Card
  {
    slug: 'kpi-delta-card',
    name: 'KPI Delta Card',
    description: 'Executive metric card with hero number, benchmark comparison badge, and micro trend sparkline.',
    categories: ['data', 'visualization', 'kpi'],
    roles: ['kpi', 'card'],
    purposes: ['metric-highlight', 'delta-tracking', 'executive-summary'],
    componentName: 'KpiDeltaCard',
    tags: ['kpi', 'card', 'delta', 'metric', 'sparkline'],
    idealFor: ['Executive dashboard header counters', 'Monthly revenue summary', 'Active churn rates'],
    avoidFor: ['Complex multi-dimensional scatterings', 'Raw log event stream'],
    jobs: ['Deliver immediate high-impact metric awareness with trend context'],
    indexCode: `import React from 'react';

export type KpiDeltaCardVariant = 'quiet' | 'expressive' | 'nocturne';

export interface KpiDeltaCardProps {
  variant?: KpiDeltaCardVariant;
  title?: string;
  value?: string;
  delta?: string;
  isPositive?: boolean;
}

export function KpiDeltaCard({
  variant = 'quiet',
  title = 'Monthly Recurring Revenue',
  value = '$128,450',
  delta = '+18.4% vs last month',
  isPositive = true,
}: KpiDeltaCardProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const badgeBg =
    isPositive
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800';

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col justify-between transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{title}</span>
        <span className={\`text-[11px] font-medium font-mono px-2 py-0.5 rounded-full border \${badgeBg}\`}>
          {delta}
        </span>
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <span className="text-3xl font-bold font-mono tracking-tight">{value}</span>
        <svg width="60" height="24" className="overflow-visible select-none">
          <polyline
            points="0,20 12,16 24,18 36,10 48,14 60,4"
            fill="none"
            stroke={isPositive ? '#10B981' : '#F43F5E'}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { KpiDeltaCard, KpiDeltaCardVariant } from './index';

export function KpiDeltaCardPreview() {
  const [variant, setVariant] = useState<KpiDeltaCardVariant>('quiet');

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <KpiDeltaCard variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const kpiDeltaCardFixtures = {};`,
    readmeCode: `# KPI Delta Card

Executive metric card with hero number, benchmark delta badge, and trend polyline.`,
  },

  // 19. Gauge
  {
    slug: 'gauge',
    name: 'Gauge',
    description: 'Semicircular dial/speedometer gauge with target marker, colored threshold zones (safe/warning/critical), and center value needle/text.',
    categories: ['data', 'visualization', 'charts'],
    roles: ['gauge', 'analytics'],
    purposes: ['capacity-monitoring', 'threshold-indication', 'health-meter'],
    componentName: 'Gauge',
    tags: ['chart', 'gauge', 'meter', 'radial', 'svg'],
    idealFor: ['Server CPU load threshold', 'Disk capacity warnings', 'SLA uptime compliance dial'],
    avoidFor: ['Multivariate categorical distributions', 'Temporal time series histories'],
    jobs: ['Show current value against defined capacity threshold zones on a semicircular meter'],
    indexCode: `import React from 'react';

export type GaugeVariant = 'quiet' | 'expressive' | 'nocturne';

export interface GaugeProps {
  variant?: GaugeVariant;
  value?: number;
  max?: number;
}

export function Gauge({ variant = 'quiet', value = 76, max = 100 }: GaugeProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const fillStroke =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717';

  const radius = 70;
  const strokeWidth = 14;
  const circumference = Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col items-center transition-colors \${cardBg}\`}>
      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">CPU Cluster Load</h4>
          <p className="text-xs text-neutral-500">Real-time utilization meter</p>
        </div>
        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
          Optimal Zone
        </span>
      </div>

      <div className="relative w-[180px] h-[100px] flex justify-center overflow-hidden select-none">
        <svg width="180" height="90" viewBox="0 0 180 90">
          {/* Background track */}
          <path
            d="M 20 90 A 70 70 0 0 1 160 90"
            fill="none"
            stroke={variant === 'nocturne' ? '#1E232E' : '#E5E7EB'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active fill */}
          <path
            d="M 20 90 A 70 70 0 0 1 160 90"
            fill="none"
            stroke={fillStroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>

        <div className="absolute bottom-0 inset-x-0 flex flex-col items-center">
          <span className="text-3xl font-mono font-bold">{value}%</span>
          <span className="text-[10px] text-neutral-400 font-mono">Limit: {max}%</span>
        </div>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { Gauge, GaugeVariant } from './index';

export function GaugePreview() {
  const [variant, setVariant] = useState<GaugeVariant>('quiet');

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <Gauge variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const gaugeFixtures = {};`,
    readmeCode: `# Gauge

Semicircular dial meter with threshold tracks and center numeric indicator.`,
  },

  // 20. Cohort Matrix
  {
    slug: 'cohort-matrix',
    name: 'Cohort Matrix',
    description: 'Retention table displaying user cohorts over weekly/monthly periods with color-coded retention percentage cells.',
    categories: ['data', 'visualization', 'retention'],
    roles: ['table', 'analytics'],
    purposes: ['retention-tracking', 'cohort-analysis', 'churn-investigation'],
    componentName: 'CohortMatrix',
    tags: ['retention', 'cohort', 'matrix', 'table', 'analytics'],
    idealFor: ['SaaS weekly retention matrices', 'E-commerce repeat purchase cohorts', 'User activation decay'],
    avoidFor: ['Real-time 1-second stock tickers', 'Geometric geospatial maps'],
    jobs: ['Track user engagement and retention drop-offs grouped by sign-up cohort'],
    indexCode: `import React from 'react';

export type CohortMatrixVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CohortMatrixProps {
  variant?: CohortMatrixVariant;
}

export function CohortMatrix({ variant = 'quiet' }: CohortMatrixProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const getCellBg = (pct: number) => {
    if (variant === 'nocturne') {
      if (pct >= 80) return 'bg-cyan-500 text-black font-semibold';
      if (pct >= 50) return 'bg-cyan-700/80 text-white';
      if (pct >= 30) return 'bg-cyan-900/60 text-cyan-200';
      return 'bg-[#151921] text-neutral-400';
    }
    if (variant === 'expressive') {
      if (pct >= 80) return 'bg-[#2547E8] text-white font-semibold';
      if (pct >= 50) return 'bg-blue-600/80 text-white';
      if (pct >= 30) return 'bg-blue-200 text-blue-900';
      return 'bg-neutral-100 text-neutral-500';
    }
    if (pct >= 80) return 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold';
    if (pct >= 50) return 'bg-neutral-700 text-white dark:bg-neutral-300 dark:text-neutral-900';
    if (pct >= 30) return 'bg-neutral-300 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200';
    return 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400';
  };

  const cohorts = [
    { cohort: 'Jan 2026', size: '1,240', ret: [100, 78, 64, 52, 45, 41] },
    { cohort: 'Feb 2026', size: '1,480', ret: [100, 81, 68, 59, 49] },
    { cohort: 'Mar 2026', size: '1,620', ret: [100, 84, 72, 63] },
    { cohort: 'Apr 2026', size: '1,890', ret: [100, 86, 75] },
    { cohort: 'May 2026', size: '2,100', ret: [100, 88] },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">User Retention Cohort Matrix</h4>
          <p className="text-xs text-neutral-500">Monthly active user persistence</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 text-left">
              <th className="py-2 pr-4 font-normal">Cohort</th>
              <th className="py-2 pr-4 font-normal">Size</th>
              {['M0', 'M1', 'M2', 'M3', 'M4', 'M5'].map((m) => (
                <th key={m} className="py-2 px-2 text-center font-normal">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((c) => (
              <tr key={c.cohort} className="border-b border-neutral-100 dark:border-neutral-800/50">
                <td className="py-2.5 pr-4 font-medium text-neutral-700 dark:text-neutral-300">{c.cohort}</td>
                <td className="py-2.5 pr-4 text-neutral-500">{c.size}</td>
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const val = c.ret[idx];
                  if (val === undefined) {
                    return <td key={idx} className="py-2.5 px-2 text-center text-neutral-300 dark:text-neutral-700">-</td>;
                  }
                  return (
                    <td key={idx} className="py-1 px-1">
                      <div className={\`w-10 h-7 rounded flex items-center justify-center mx-auto text-[11px] \${getCellBg(val)}\`}>
                        {val}%
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CohortMatrix, CohortMatrixVariant } from './index';

export function CohortMatrixPreview() {
  const [variant, setVariant] = useState<CohortMatrixVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <CohortMatrix variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const cohortMatrixFixtures = {};`,
    readmeCode: `# Cohort Matrix

User retention matrix table with color-coded retention percentage cells across time horizons.`,
  },

  // 21. Geographic Map
  {
    slug: 'geographic-map',
    name: 'Geographic Map',
    description: 'Stylized SVG regional map preview with density shading, marker pins, and territory summary metrics.',
    categories: ['data', 'visualization', 'maps'],
    roles: ['map', 'analytics'],
    purposes: ['regional-distribution', 'datacenter-locations', 'latency-by-region'],
    componentName: 'GeographicMap',
    tags: ['map', 'geographic', 'regional', 'svg', 'locations'],
    idealFor: ['Global edge node distribution', 'Customer revenue by region', 'Delivery zone heatmaps'],
    avoidFor: ['Micro second time delta series', 'Hierarchical tree menus'],
    jobs: ['Display geographic dispersion of traffic and data center clusters'],
    indexCode: `import React, { useState } from 'react';

export type GeographicMapVariant = 'quiet' | 'expressive' | 'nocturne';

export interface GeographicMapProps {
  variant?: GeographicMapVariant;
}

export function GeographicMap({ variant = 'quiet' }: GeographicMapProps) {
  const [activePin, setActivePin] = useState<string | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const pinColor =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717';

  const regions = [
    { id: 'us-east', name: 'US East (N. Virginia)', x: 170, y: 95, pings: '8ms', active: true },
    { id: 'us-west', name: 'US West (Oregon)', x: 120, y: 85, pings: '14ms', active: true },
    { id: 'eu-west', name: 'EU West (London)', x: 290, y: 75, pings: '4ms', active: true },
    { id: 'eu-central', name: 'EU Central (Frankfurt)', x: 315, y: 82, pings: '6ms', active: true },
    { id: 'ap-east', name: 'AP East (Tokyo)', x: 470, y: 100, pings: '22ms', active: true },
    { id: 'ap-south', name: 'AP South (Singapore)', x: 440, y: 140, pings: '18ms', active: true },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Global Edge Network</h4>
          <p className="text-xs text-neutral-500">Active points of presence and edge latency</p>
        </div>
        <span className="text-xs font-mono font-medium text-emerald-500">6 Regions Healthy</span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox="0 0 600 240" className="w-full h-auto overflow-visible select-none">
          {/* Stylized continent vector outlines */}
          <path
            d="M 80 60 Q 140 40 180 80 Q 150 140 100 120 Z"
            fill={variant === 'nocturne' ? '#151921' : '#F3F4F6'}
            stroke={variant === 'nocturne' ? '#2E3440' : '#E5E7EB'}
            strokeWidth="1"
          />
          <path
            d="M 120 130 Q 160 140 140 210 Q 110 180 120 130 Z"
            fill={variant === 'nocturne' ? '#151921' : '#F3F4F6'}
            stroke={variant === 'nocturne' ? '#2E3440' : '#E5E7EB'}
            strokeWidth="1"
          />
          <path
            d="M 270 50 Q 340 40 330 110 Q 280 120 270 50 Z"
            fill={variant === 'nocturne' ? '#151921' : '#F3F4F6'}
            stroke={variant === 'nocturne' ? '#2E3440' : '#E5E7EB'}
            strokeWidth="1"
          />
          <path
            d="M 280 120 Q 330 120 320 200 Q 270 170 280 120 Z"
            fill={variant === 'nocturne' ? '#151921' : '#F3F4F6'}
            stroke={variant === 'nocturne' ? '#2E3440' : '#E5E7EB'}
            strokeWidth="1"
          />
          <path
            d="M 370 60 Q 510 50 490 140 Q 380 150 370 60 Z"
            fill={variant === 'nocturne' ? '#151921' : '#F3F4F6'}
            stroke={variant === 'nocturne' ? '#2E3440' : '#E5E7EB'}
            strokeWidth="1"
          />

          {/* Region pins */}
          {regions.map((r) => {
            const isHovered = activePin === r.id;
            return (
              <g
                key={r.id}
                onMouseEnter={() => setActivePin(r.id)}
                onMouseLeave={() => setActivePin(null)}
                className="cursor-pointer"
              >
                <circle cx={r.x} cy={r.y} r={isHovered ? 8 : 5} fill={pinColor} />
                <circle cx={r.x} cy={r.y} r={isHovered ? 14 : 10} fill={pinColor} fillOpacity="0.25" className="animate-pulse" />
                {isHovered && (
                  <g>
                    <rect x={r.x - 50} y={r.y - 30} width="100" height="22" rx="4" fill="#000" />
                    <text x={r.x} y={r.y - 15} textAnchor="middle" fill="#fff" className="text-[10px] font-mono">
                      {r.name.split(' ')[0]}: {r.pings}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { GeographicMap, GeographicMapVariant } from './index';

export function GeographicMapPreview() {
  const [variant, setVariant] = useState<GeographicMapVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <GeographicMap variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const geographicMapFixtures = {};`,
    readmeCode: `# Geographic Map

Stylized SVG regional map preview with density shading and edge location pins.`,
  },

  // 22. Interactive Globe
  {
    slug: 'interactive-globe',
    name: 'Interactive Globe',
    description: 'Orthographic projection vector wireframe globe with latitude/longitude meridians, active data nodes, and orbit pulse.',
    categories: ['data', 'visualization', 'maps'],
    roles: ['globe', 'analytics'],
    purposes: ['global-presence', 'worldwide-telemetry', 'orbital-visualization'],
    componentName: 'InteractiveGlobe',
    tags: ['globe', 'wireframe', 'orthographic', 'svg', 'orbital'],
    idealFor: ['Global cybersecurity telemetry', 'International traffic landing pages', 'Real-time threat monitoring'],
    avoidFor: ['Standard 2D tabular accounting', 'Single variable KPIs'],
    jobs: ['Provide high-ambition vector globe presence for worldwide telemetry data'],
    indexCode: `import React, { useState } from 'react';

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

  const nodes = [
    { cx: 120, cy: 90, label: 'North America' },
    { cx: 160, cy: 110, label: 'Europe Hub' },
    { cx: 190, cy: 130, label: 'Asia-Pacific' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col items-center transition-colors \${cardBg}\`}>
      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Worldwide Telemetry Mesh</h4>
          <p className="text-xs text-neutral-500">Orthographic orbital projection</p>
        </div>
        <span className="text-xs font-mono font-medium text-cyan-500 animate-pulse">● Live Orbit</span>
      </div>

      <div className="relative w-[240px] h-[240px] flex items-center justify-center select-none">
        <svg width="240" height="240" viewBox="0 0 240 240">
          {/* Globe boundary */}
          <circle cx="120" cy="120" r="90" fill="transparent" stroke={wireColor} strokeWidth="2" />

          {/* Latitude lines */}
          <ellipse cx="120" cy="120" rx="90" ry="30" fill="none" stroke={wireColor} strokeWidth="1" />
          <ellipse cx="120" cy="120" rx="90" ry="60" fill="none" stroke={wireColor} strokeWidth="1" />
          <line x1="30" y1="120" x2="210" y2="120" stroke={wireColor} strokeWidth="1" strokeDasharray="3 3" />

          {/* Longitude lines */}
          <ellipse cx="120" cy="120" rx="30" ry="90" fill="none" stroke={wireColor} strokeWidth="1" />
          <ellipse cx="120" cy="120" rx="60" ry="90" fill="none" stroke={wireColor} strokeWidth="1" />
          <line x1="120" y1="30" x2="120" y2="210" stroke={wireColor} strokeWidth="1" strokeDasharray="3 3" />

          {/* Orbital nodes */}
          {nodes.map((n, idx) => {
            const isHovered = activeNode === idx;
            return (
              <g
                key={n.label}
                onMouseEnter={() => setActiveNode(idx)}
                onMouseLeave={() => setActiveNode(null)}
                className="cursor-pointer"
              >
                <circle cx={n.cx} cy={n.cy} r={isHovered ? 6 : 4} fill={pulseColor} />
                <circle cx={n.cx} cy={n.cy} r={isHovered ? 12 : 8} fill={pulseColor} fillOpacity="0.25" className="animate-ping" />
              </g>
            );
          })}
        </svg>

        {activeNode !== null && (
          <div className="absolute bottom-2 text-xs font-mono font-semibold">
            {nodes[activeNode]?.label}
          </div>
        )}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { InteractiveGlobe, InteractiveGlobeVariant } from './index';

export function InteractiveGlobePreview() {
  const [variant, setVariant] = useState<InteractiveGlobeVariant>('quiet');

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <InteractiveGlobe variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const interactiveGlobeFixtures = {};`,
    readmeCode: `# Interactive Globe

Orthographic vector wireframe globe with latitude/longitude meridians and orbital nodes.`,
  },

  // 23. Financial Candlestick Chart
  {
    slug: 'financial-candlestick-chart',
    name: 'Financial Candlestick Chart',
    description: 'OHLC financial price chart with bullish/bearish candle bodies, high/low wicks, and volume sub-bars.',
    categories: ['data', 'visualization', 'finance'],
    roles: ['chart', 'analytics'],
    purposes: ['financial-analysis', 'candlestick-display', 'ohlc-monitoring'],
    componentName: 'FinancialCandlestickChart',
    tags: ['finance', 'candlestick', 'ohlc', 'chart', 'svg'],
    idealFor: ['Cryptocurrency and equities price terminals', 'Treasury bond monitoring', 'High-density trading views'],
    avoidFor: ['Standard marketing funnel stages', 'Hierarchical folder trees'],
    jobs: ['Display Open-High-Low-Close price action across granular intervals'],
    indexCode: `import React, { useState } from 'react';

export type FinancialCandlestickChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FinancialCandlestickChartProps {
  variant?: FinancialCandlestickChartVariant;
}

export function FinancialCandlestickChart({ variant = 'quiet' }: FinancialCandlestickChartProps) {
  const [activeCandle, setActiveCandle] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const candles = [
    { t: '10:00', o: 142, h: 148, l: 140, c: 146 },
    { t: '10:15', o: 146, h: 151, l: 144, c: 149 },
    { t: '10:30', o: 149, h: 152, l: 143, c: 144 },
    { t: '10:45', o: 144, h: 147, l: 139, c: 141 },
    { t: '11:00', o: 141, h: 150, l: 140, c: 148 },
    { t: '11:15', o: 148, h: 155, l: 147, c: 154 },
    { t: '11:30', o: 154, h: 156, l: 150, c: 151 },
  ];

  const minP = 135;
  const maxP = 160;
  const range = maxP - minP;

  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const candleW = 24;
  const step = chartW / candles.length;

  const getY = (val: number) => padding.top + chartH - ((val - minP) / range) * chartH;

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">BTC/USD Price Action</h4>
          <p className="text-xs text-neutral-500">15-minute candlestick interval</p>
        </div>
        <div className="text-right">
          <span className="text-base font-bold font-mono text-emerald-500">
            {activeCandle !== null && candles[activeCandle] ? \`$\${candles[activeCandle]?.c}.00\` : '$151.20'}
          </span>
          <span className="text-xs text-neutral-400 ml-1">
            {activeCandle !== null && candles[activeCandle] ? candles[activeCandle]?.t : '+6.3%'}
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={\`0 0 \${width} \${height}\`} className="w-full h-auto overflow-visible select-none">
          {/* Horizontal grid */}
          {[140, 145, 150, 155].map((p) => {
            const y = getY(p);
            return (
              <g key={p}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke={variant === 'nocturne' ? '#1E232E' : '#F3F4F6'} strokeWidth="1" />
                <text x={padding.left - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-neutral-400 font-mono">
                  {p}
                </text>
              </g>
            );
          })}

          {/* Candlesticks */}
          {candles.map((c, idx) => {
            const x = padding.left + idx * step + (step - candleW) / 2;
            const isBullish = c.c >= c.o;
            const topY = getY(Math.max(c.o, c.c));
            const botY = getY(Math.min(c.o, c.c));
            const bodyH = Math.max(botY - topY, 2);
            const highY = getY(c.h);
            const lowY = getY(c.l);
            const color = isBullish ? '#10B981' : '#EF4444';

            return (
              <g key={c.t} onMouseEnter={() => setActiveCandle(idx)} onMouseLeave={() => setActiveCandle(null)} className="cursor-pointer">
                {/* Wick */}
                <line x1={x + candleW / 2} y1={highY} x2={x + candleW / 2} y2={lowY} stroke={color} strokeWidth="1.5" />
                {/* Body */}
                <rect x={x} y={topY} width={candleW} height={bodyH} rx="2" fill={color} />
                <text x={x + candleW / 2} y={height - 10} textAnchor="middle" className="text-[10px] fill-neutral-400 font-mono">
                  {c.t}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FinancialCandlestickChart, FinancialCandlestickChartVariant } from './index';

export function FinancialCandlestickChartPreview() {
  const [variant, setVariant] = useState<FinancialCandlestickChartVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <FinancialCandlestickChart variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const financialCandlestickChartFixtures = {};`,
    readmeCode: `# Financial Candlestick Chart

OHLC financial candlestick chart with high/low wicks, bullish/bearish bodies, and price benchmark grid.`,
  },

  // 24. Order Book Depth Chart
  {
    slug: 'order-book-depth-chart',
    name: 'Order Book Depth Chart',
    description: 'Market depth cumulative bid/ask stepped area chart with green bid wall, red ask wall, and mid-market spread indicator.',
    categories: ['data', 'visualization', 'finance'],
    roles: ['chart', 'analytics'],
    purposes: ['order-book-depth', 'market-liquidity', 'spread-analysis'],
    componentName: 'OrderBookDepthChart',
    tags: ['finance', 'order-book', 'depth', 'liquidity', 'svg'],
    idealFor: ['Exchange liquidity depth visualizations', 'Trading desks and matching engines', 'Slippage simulation'],
    avoidFor: ['Single user onboarding checklists', 'Blog editorial sidebars'],
    jobs: ['Map cumulative buy and sell volume against price to visualize liquidity walls'],
    indexCode: `import React, { useState } from 'react';

export type OrderBookDepthChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface OrderBookDepthChartProps {
  variant?: OrderBookDepthChartVariant;
}

export function OrderBookDepthChart({ variant = 'quiet' }: OrderBookDepthChartProps) {
  const [hoveredSide, setHoveredSide] = useState<'bids' | 'asks' | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const bidColor = '#10B981';
  const askColor = '#EF4444';

  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Order Book Market Depth</h4>
          <p className="text-xs text-neutral-500">Cumulative Liquidity: Bids vs Asks</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-emerald-500">Bids: $4.2M</span>
          <span className="text-neutral-400">|</span>
          <span className="text-rose-500">Asks: $3.8M</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={\`0 0 \${width} \${height}\`} className="w-full h-auto overflow-visible select-none">
          {/* Mid price spread line */}
          <line
            x1={width / 2}
            y1={padding.top}
            x2={width / 2}
            y2={height - padding.bottom}
            stroke={variant === 'nocturne' ? '#2E3440' : '#E5E7EB'}
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />

          {/* Bid stepped area (left side) */}
          <path
            d="M 40 180 L 100 180 L 100 140 L 180 140 L 180 100 L 250 100 L 250 50 L 300 50 L 300 180 Z"
            fill={bidColor}
            fillOpacity={hoveredSide === 'bids' ? 0.4 : 0.25}
            stroke={bidColor}
            strokeWidth="2"
            onMouseEnter={() => setHoveredSide('bids')}
            onMouseLeave={() => setHoveredSide(null)}
            className="cursor-pointer transition-all duration-200"
          />

          {/* Ask stepped area (right side) */}
          <path
            d="M 300 50 L 350 50 L 350 90 L 420 90 L 420 130 L 500 130 L 500 180 L 560 180 L 300 180 Z"
            fill={askColor}
            fillOpacity={hoveredSide === 'asks' ? 0.4 : 0.25}
            stroke={askColor}
            strokeWidth="2"
            onMouseEnter={() => setHoveredSide('asks')}
            onMouseLeave={() => setHoveredSide(null)}
            className="cursor-pointer transition-all duration-200"
          />

          {/* X axis labels */}
          <text x="170" y={height - 10} textAnchor="middle" className="text-[10px] fill-emerald-500 font-mono font-semibold">
            ← Bids (Buy Orders)
          </text>
          <text x={width / 2} y={height - 10} textAnchor="middle" className="text-[10px] fill-neutral-400 font-mono">
            $150.00 Mid
          </text>
          <text x="430" y={height - 10} textAnchor="middle" className="text-[10px] fill-rose-500 font-mono font-semibold">
            Asks (Sell Orders) →
          </text>
        </svg>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { OrderBookDepthChart, OrderBookDepthChartVariant } from './index';

export function OrderBookDepthChartPreview() {
  const [variant, setVariant] = useState<OrderBookDepthChartVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <OrderBookDepthChart variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const orderBookDepthChartFixtures = {};`,
    readmeCode: `# Order Book Depth Chart

Market depth stepped area chart showing cumulative bids and asks with mid-spread indicator.`,
  },
];
