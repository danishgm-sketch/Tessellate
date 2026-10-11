import type { DataDef } from './data-builder';

export const DATA_BATCH_1: DataDef[] = [
  // 1. Time Series Chart
  {
    slug: 'time-series-chart',
    name: 'Time Series Chart',
    description: 'Interactive line chart with date/time x-axis, area fill gradient, hover cursor crosshair, and value tooltip.',
    categories: ['data', 'visualization', 'charts'],
    roles: ['chart', 'analytics'],
    purposes: ['telemetry-tracking', 'time-series-analysis', 'performance-monitoring'],
    componentName: 'TimeSeriesChart',
    tags: ['chart', 'time-series', 'line', 'svg', 'analytics'],
    idealFor: ['Server CPU/memory telemetry', 'Daily active users timeline', 'Stock price monitoring'],
    avoidFor: ['Categorical non-temporal rankings', 'Hierarchical part-to-whole distributions'],
    jobs: ['Track metric progression over date intervals with micro tooltips'],
    indexCode: `import React, { useState } from 'react';

export type TimeSeriesChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DataPoint {
  time: string;
  value: number;
}

export interface TimeSeriesChartProps {
  variant?: TimeSeriesChartVariant;
  data?: DataPoint[];
  title?: string;
}

const DEFAULT_DATA: DataPoint[] = [
  { time: '00:00', value: 42 },
  { time: '04:00', value: 38 },
  { time: '08:00', value: 65 },
  { time: '12:00', value: 89 },
  { time: '16:00', value: 74 },
  { time: '20:00', value: 92 },
  { time: '24:00', value: 81 },
];

export function TimeSeriesChart({
  variant = 'quiet',
  data = DEFAULT_DATA,
  title = 'API Throughput (req/s)',
}: TimeSeriesChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const lineColor =
    variant === 'nocturne'
      ? '#06B6D4'
      : variant === 'expressive'
      ? '#2547E8'
      : '#171717';

  const gridColor =
    variant === 'nocturne' ? '#1E232E' : variant === 'expressive' ? '#F1EFEA' : '#F3F4F6';

  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };

  const maxValue = Math.max(...data.map((d) => d.value), 100);
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padding.top + chartH - (d.value / maxValue) * chartH;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? \`M \${p.x} \${p.y}\` : \`\${acc} L \${p.x} \${p.y}\`), '');
  const areaD = points.length > 0 ? \`\${pathD} L \${points[points.length - 1]?.x ?? 0} \${padding.top + chartH} L \${points[0]?.x ?? 0} \${padding.top + chartH} Z\` : '';

  const activePoint = hoveredIdx !== null && hoveredIdx >= 0 && hoveredIdx < points.length ? points[hoveredIdx] : null;

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">{title}</h4>
          <p className="text-xs text-neutral-500">Real-time sampling window</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-mono font-semibold">
            {activePoint ? activePoint.value : points[points.length - 1]?.value ?? 0}
          </span>
          <span className="text-xs text-neutral-400 ml-1">req/s</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={\`0 0 \${width} \${height}\`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id={\`ts-grad-\${variant}\`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={variant === 'nocturne' ? 0.35 : 0.2} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padding.top + chartH * (1 - pct);
            return (
              <g key={idx}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke={gridColor} strokeWidth="1" />
                <text x={padding.left - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-neutral-400 font-mono">
                  {Math.round(maxValue * pct)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {areaD && <path d={areaD} fill={\`url(#ts-grad-\${variant})\`} />}

          {/* Line path */}
          {pathD && <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Data points & hover zones */}
          {points.map((p, idx) => (
            <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
              <rect x={p.x - 15} y={padding.top} width="30" height={chartH} fill="transparent" />
              {hoveredIdx === idx && (
                <>
                  <line x1={p.x} y1={padding.top} x2={p.x} y2={padding.top + chartH} stroke={lineColor} strokeDasharray="3 3" strokeWidth="1" />
                  <circle cx={p.x} cy={p.y} r="5" fill={lineColor} stroke={variant === 'nocturne' ? '#000' : '#fff'} strokeWidth="2" />
                </>
              )}
              <text x={p.x} y={height - 10} textAnchor="middle" className="text-[10px] fill-neutral-400 font-mono">
                {p.time}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { TimeSeriesChart, TimeSeriesChartVariant } from './index';

export function TimeSeriesChartPreview() {
  const [variant, setVariant] = useState<TimeSeriesChartVariant>('quiet');

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
      <TimeSeriesChart variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const timeSeriesChartFixtures = {
  sampleData: [
    { time: '00:00', value: 42 },
    { time: '04:00', value: 38 },
    { time: '08:00', value: 65 },
    { time: '12:00', value: 89 },
    { time: '16:00', value: 74 },
    { time: '20:00', value: 92 },
    { time: '24:00', value: 81 },
  ],
};`,
    readmeCode: `# Time Series Chart

Clean SVG time series line chart with gradient fill, hover crosshair, and value indicator across Quiet, Expressive, and Nocturne palettes.`,
  },

  // 2. Multi-Series Line Chart
  {
    slug: 'multi-series-line-chart',
    name: 'Multi-Series Line Chart',
    description: 'Comparative line chart with multiple colored trendlines, toggleable series legends, and point markers.',
    categories: ['data', 'visualization', 'charts'],
    roles: ['chart', 'analytics'],
    purposes: ['metric-comparison', 'benchmark-tracking', 'multi-series-analysis'],
    componentName: 'MultiSeriesLineChart',
    tags: ['chart', 'multi-series', 'line', 'svg', 'comparison'],
    idealFor: ['Comparing region latency', 'Environment traffic (prod vs staging)', 'Multi-tenant metric overlays'],
    avoidFor: ['Single value meters', 'Binary state transitions'],
    jobs: ['Compare 2 or 3 metrics across the same temporal axis with toggleable series'],
    indexCode: `import React, { useState } from 'react';

export type MultiSeriesLineChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MultiSeriesLineChartProps {
  variant?: MultiSeriesLineChartVariant;
}

export function MultiSeriesLineChart({ variant = 'quiet' }: MultiSeriesLineChartProps) {
  const [activeSeries, setActiveSeries] = useState<Record<string, boolean>>({
    Production: true,
    Staging: true,
    Canary: true,
  });

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const seriesColors =
    variant === 'nocturne'
      ? { Production: '#06B6D4', Staging: '#F43F5E', Canary: '#10B981' }
      : variant === 'expressive'
      ? { Production: '#2547E8', Staging: '#10B981', Canary: '#F59E0B' }
      : { Production: '#171717', Staging: '#737373', Canary: '#A3A3A3' };

  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const seriesData = [
    { name: 'Production', values: [32, 45, 54, 65, 59, 80, 88] },
    { name: 'Staging', values: [20, 25, 38, 42, 48, 55, 62] },
    { name: 'Canary', values: [10, 15, 18, 22, 29, 31, 35] },
  ];

  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxValue = 100;

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Traffic Comparison</h4>
          <p className="text-xs text-neutral-500">Monthly throughput across deploy tiers</p>
        </div>
        <div className="flex items-center gap-3">
          {seriesData.map((s) => {
            const isVisible = activeSeries[s.name] ?? true;
            const color = seriesColors[s.name as keyof typeof seriesColors] ?? '#171717';
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => setActiveSeries((prev) => ({ ...prev, [s.name]: !isVisible }))}
                className={\`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-opacity \${
                  isVisible ? 'opacity-100' : 'opacity-40 line-through'
                }\`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={\`0 0 \${width} \${height}\`} className="w-full h-auto overflow-visible select-none">
          {/* Horizontal gridlines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = padding.top + chartH * (1 - val / maxValue);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={variant === 'nocturne' ? '#1E232E' : '#F3F4F6'}
                  strokeWidth="1"
                />
                <text x={padding.left - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-neutral-400 font-mono">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Render series lines */}
          {seriesData.map((s) => {
            if (!(activeSeries[s.name] ?? true)) return null;
            const color = seriesColors[s.name as keyof typeof seriesColors] ?? '#171717';

            const pts = s.values.map((v, i) => {
              const x = padding.left + (i / (s.values.length - 1)) * chartW;
              const y = padding.top + chartH - (v / maxValue) * chartH;
              return { x, y, v };
            });

            const pathD = pts.reduce((acc, p, i) => (i === 0 ? \`M \${p.x} \${p.y}\` : \`\${acc} L \${p.x} \${p.y}\`), '');

            return (
              <g key={s.name}>
                <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {pts.map((p, idx) => (
                  <circle key={idx} cx={p.x} cy={p.y} r="3.5" fill={color} stroke={variant === 'nocturne' ? '#000' : '#fff'} strokeWidth="1.5" />
                ))}
              </g>
            );
          })}

          {/* X axis labels */}
          {labels.map((lbl, idx) => {
            const x = padding.left + (idx / (labels.length - 1)) * chartW;
            return (
              <text key={lbl} x={x} y={height - 10} textAnchor="middle" className="text-[10px] fill-neutral-400 font-mono">
                {lbl}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { MultiSeriesLineChart, MultiSeriesLineChartVariant } from './index';

export function MultiSeriesLineChartPreview() {
  const [variant, setVariant] = useState<MultiSeriesLineChartVariant>('quiet');

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
      <MultiSeriesLineChart variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const multiSeriesLineChartFixtures = {};`,
    readmeCode: `# Multi-Series Line Chart

Comparative line chart with toggleable series legends, point markers, and coordinate gridlines.`,
  },

  // 3. Area Chart
  {
    slug: 'area-chart',
    name: 'Area Chart',
    description: 'Smooth bezier-curved single or dual area plot with subtle vertical gradient fill, baseline threshold, and interactive peek point.',
    categories: ['data', 'visualization', 'charts'],
    roles: ['chart', 'analytics'],
    purposes: ['volume-visualization', 'capacity-tracking', 'cumulative-growth'],
    componentName: 'AreaChart',
    tags: ['chart', 'area', 'gradient', 'svg', 'volume'],
    idealFor: ['Cumulative revenue volume', 'Bandwidth utilization', 'Storage allocation curves'],
    avoidFor: ['Discrete categorical tallies', 'Tree hierarchic structures'],
    jobs: ['Show volume magnitude over time with aesthetic soft gradient depth'],
    indexCode: `import React, { useState } from 'react';

export type AreaChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AreaChartProps {
  variant?: AreaChartVariant;
}

export function AreaChart({ variant = 'quiet' }: AreaChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const strokeColor =
    variant === 'nocturne' ? '#38BDF8' : variant === 'expressive' ? '#2547E8' : '#262626';

  const data = [
    { label: 'Week 1', value: 120 },
    { label: 'Week 2', value: 180 },
    { label: 'Week 3', value: 150 },
    { label: 'Week 4', value: 240 },
    { label: 'Week 5', value: 290 },
    { label: 'Week 6', value: 310 },
    { label: 'Week 7', value: 420 },
  ];

  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxVal = 500;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + chartH - (d.value / maxVal) * chartH;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? \`M \${p.x} \${p.y}\` : \`\${acc} L \${p.x} \${p.y}\`), '');
  const areaD = points.length > 0 ? \`\${pathD} L \${points[points.length - 1]?.x ?? 0} \${padding.top + chartH} L \${points[0]?.x ?? 0} \${padding.top + chartH} Z\` : '';

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Active Ingestion Volume</h4>
          <p className="text-xs text-neutral-500">Cumulative GB ingested across cluster</p>
        </div>
        <span className="text-xs font-mono font-medium px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800">
          Peak: 420 GB
        </span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={\`0 0 \${width} \${height}\`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id={\`area-grad-\${variant}\`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={variant === 'nocturne' ? 0.4 : 0.25} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {[0, 100, 250, 500].map((v) => {
            const y = padding.top + chartH * (1 - v / maxVal);
            return (
              <g key={v}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke={variant === 'nocturne' ? '#1E232E' : '#F3F4F6'} strokeWidth="1" />
                <text x={padding.left - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-neutral-400 font-mono">
                  {v}
                </text>
              </g>
            );
          })}

          {areaD && <path d={areaD} fill={\`url(#area-grad-\${variant})\`} />}
          {pathD && <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

          {points.map((p, idx) => (
            <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
              <rect x={p.x - 15} y={padding.top} width="30" height={chartH} fill="transparent" />
              {hoveredIdx === idx && (
                <>
                  <line x1={p.x} y1={padding.top} x2={p.x} y2={padding.top + chartH} stroke={strokeColor} strokeDasharray="3 3" strokeWidth="1" />
                  <circle cx={p.x} cy={p.y} r="5" fill={strokeColor} stroke={variant === 'nocturne' ? '#000' : '#fff'} strokeWidth="2" />
                </>
              )}
              <text x={p.x} y={height - 10} textAnchor="middle" className="text-[10px] fill-neutral-400 font-mono">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AreaChart, AreaChartVariant } from './index';

export function AreaChartPreview() {
  const [variant, setVariant] = useState<AreaChartVariant>('quiet');

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
      <AreaChart variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const areaChartFixtures = {};`,
    readmeCode: `# Area Chart

Volume area chart with soft vertical gradient fill, baseline threshold, and interactive peek point.`,
  },

  // 4. Stacked Area Chart
  {
    slug: 'stacked-area-chart',
    name: 'Stacked Area Chart',
    description: 'Multi-layer cumulative volume area chart with layered SVG path fills, proportional stacking, and hover slice indicator.',
    categories: ['data', 'visualization', 'charts'],
    roles: ['chart', 'analytics'],
    purposes: ['cumulative-breakdown', 'capacity-composition', 'resource-sharing'],
    componentName: 'StackedAreaChart',
    tags: ['chart', 'stacked-area', 'svg', 'breakdown'],
    idealFor: ['Cloud spend breakdown by service', 'Traffic split by channel', 'Storage tiers breakdown'],
    avoidFor: ['Negative-value delta balances', 'Unrelated discrete categories'],
    jobs: ['Show proportional composition and cumulative total over time simultaneously'],
    indexCode: `import React, { useState } from 'react';

export type StackedAreaChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface StackedAreaChartProps {
  variant?: StackedAreaChartVariant;
}

export function StackedAreaChart({ variant = 'quiet' }: StackedAreaChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const layerColors =
    variant === 'nocturne'
      ? ['#06B6D4', '#6366F1', '#A855F7']
      : variant === 'expressive'
      ? ['#2547E8', '#10B981', '#F59E0B']
      : ['#171717', '#737373', '#D4D4D4'];

  const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
  const series = [
    { name: 'Compute', data: [40, 55, 70, 90] },
    { name: 'Storage', data: [30, 45, 50, 65] },
    { name: 'Bandwidth', data: [20, 25, 35, 45] },
  ];

  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxVal = 220;

  // Compute stacked cumulative points
  const stackedTotals = labels.map((_, i) => {
    let sum = 0;
    return series.map((s) => {
      sum += s.data[i] ?? 0;
      return sum;
    });
  });

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Cumulative Resource Allocation</h4>
          <p className="text-xs text-neutral-500">Tier volume stacked by quarter</p>
        </div>
        <div className="flex items-center gap-3">
          {series.map((s, idx) => (
            <div key={s.name} className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: layerColors[idx] ?? '#000' }} />
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={\`0 0 \${width} \${height}\`} className="w-full h-auto overflow-visible select-none">
          {/* Horizontal gridlines */}
          {[0, 50, 100, 150, 200].map((v) => {
            const y = padding.top + chartH * (1 - v / maxVal);
            return (
              <g key={v}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke={variant === 'nocturne' ? '#1E232E' : '#F3F4F6'} strokeWidth="1" />
                <text x={padding.left - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-neutral-400 font-mono">
                  {v}
                </text>
              </g>
            );
          })}

          {/* Draw stacked areas from top to bottom */}
          {[2, 1, 0].map((layerIdx) => {
            const color = layerColors[layerIdx] ?? '#000';
            const pts = labels.map((_, i) => {
              const x = padding.left + (i / (labels.length - 1)) * chartW;
              const stackVal = stackedTotals[i]?.[layerIdx] ?? 0;
              const y = padding.top + chartH - (stackVal / maxVal) * chartH;
              return { x, y };
            });

            const topPath = pts.reduce((acc, p, i) => (i === 0 ? \`M \${p.x} \${p.y}\` : \`\${acc} L \${p.x} \${p.y}\`), '');
            const areaD = pts.length > 0 ? \`\${topPath} L \${pts[pts.length - 1]?.x ?? 0} \${padding.top + chartH} L \${pts[0]?.x ?? 0} \${padding.top + chartH} Z\` : '';

            return <path key={layerIdx} d={areaD} fill={color} fillOpacity={variant === 'nocturne' ? 0.75 : 0.65} />;
          })}

          {/* X axis labels and hover interactions */}
          {labels.map((lbl, idx) => {
            const x = padding.left + (idx / (labels.length - 1)) * chartW;
            return (
              <g key={lbl} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
                <rect x={x - 20} y={padding.top} width="40" height={chartH} fill="transparent" />
                {hoveredIdx === idx && (
                  <line x1={x} y1={padding.top} x2={x} y2={padding.top + chartH} stroke="#fff" strokeDasharray="3 3" strokeWidth="1" />
                )}
                <text x={x} y={height - 10} textAnchor="middle" className="text-[10px] fill-neutral-400 font-mono">
                  {lbl}
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
import { StackedAreaChart, StackedAreaChartVariant } from './index';

export function StackedAreaChartPreview() {
  const [variant, setVariant] = useState<StackedAreaChartVariant>('quiet');

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
      <StackedAreaChart variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const stackedAreaChartFixtures = {};`,
    readmeCode: `# Stacked Area Chart

Cumulative volume area chart with layered SVG path fills and proportional stacking.`,
  },

  // 5. Bar Chart
  {
    slug: 'bar-chart',
    name: 'Bar Chart',
    description: 'Vertical categorical column chart with rounded top caps, subtle hover darkening, value labels, and horizontal gridlines.',
    categories: ['data', 'visualization', 'charts'],
    roles: ['chart', 'analytics'],
    purposes: ['discrete-comparison', 'categorical-metrics', 'monthly-reporting'],
    componentName: 'BarChart',
    tags: ['chart', 'bar', 'columns', 'svg', 'metrics'],
    idealFor: ['Monthly signups tally', 'Revenue per sales rep', 'Quarterly goal achievement'],
    avoidFor: ['Continuous 24-hour high frequency telemetry', 'Geographical distributions'],
    jobs: ['Compare distinct categorical values with vertical column bars and hover details'],
    indexCode: `import React, { useState } from 'react';

export type BarChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BarChartProps {
  variant?: BarChartVariant;
}

export function BarChart({ variant = 'quiet' }: BarChartProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const barColor =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717';

  const data = [
    { label: 'Mon', value: 48 },
    { label: 'Tue', value: 64 },
    { label: 'Wed', value: 85 },
    { label: 'Thu', value: 92 },
    { label: 'Fri', value: 78 },
    { label: 'Sat', value: 34 },
    { label: 'Sun', value: 29 },
  ];

  const maxVal = 100;
  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barWidth = 32;
  const step = chartW / data.length;

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Daily User Conversions</h4>
          <p className="text-xs text-neutral-500">Signups completed over the past week</p>
        </div>
        <div className="text-xs font-mono font-medium">
          Total: <span className="text-base font-semibold">{data.reduce((a, b) => a + b.value, 0)}</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={\`0 0 \${width} \${height}\`} className="w-full h-auto overflow-visible select-none">
          {[0, 25, 50, 75, 100].map((v) => {
            const y = padding.top + chartH * (1 - v / maxVal);
            return (
              <g key={v}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke={variant === 'nocturne' ? '#1E232E' : '#F3F4F6'} strokeWidth="1" />
                <text x={padding.left - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-neutral-400 font-mono">
                  {v}
                </text>
              </g>
            );
          })}

          {data.map((d, idx) => {
            const x = padding.left + idx * step + (step - barWidth) / 2;
            const bHeight = (d.value / maxVal) * chartH;
            const y = padding.top + chartH - bHeight;
            const isHovered = activeIdx === idx;

            return (
              <g key={d.label} onMouseEnter={() => setActiveIdx(idx)} onMouseLeave={() => setActiveIdx(null)} className="cursor-pointer">
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={bHeight}
                  rx="4"
                  fill={barColor}
                  className={\`transition-opacity duration-150 \${isHovered ? 'opacity-100' : 'opacity-85'}\`}
                />
                {isHovered && (
                  <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="text-[10px] font-mono font-semibold fill-current">
                    {d.value}
                  </text>
                )}
                <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" className="text-[10px] fill-neutral-400 font-mono">
                  {d.label}
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
import { BarChart, BarChartVariant } from './index';

export function BarChartPreview() {
  const [variant, setVariant] = useState<BarChartVariant>('quiet');

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
      <BarChart variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const barChartFixtures = {};`,
    readmeCode: `# Bar Chart

Vertical column chart with rounded top caps, hover states, and gridline reference benchmarks.`,
  },

  // 6. Stacked Bar Chart
  {
    slug: 'stacked-bar-chart',
    name: 'Stacked Bar Chart',
    description: 'Segmented vertical bar chart showing category composition with segmented color blocks and segment breakdown on hover.',
    categories: ['data', 'visualization', 'charts'],
    roles: ['chart', 'analytics'],
    purposes: ['composition-tracking', 'category-breakdown', 'segmented-comparison'],
    componentName: 'StackedBarChart',
    tags: ['chart', 'stacked-bar', 'composition', 'svg', 'breakdown'],
    idealFor: ['Device breakdown by month', 'Severity count per release', 'Support ticket channels'],
    avoidFor: ['Continuous streaming sensor curves', 'Geospatial plotting'],
    jobs: ['Show multi-category proportions inside vertical grouped column containers'],
    indexCode: `import React, { useState } from 'react';

export type StackedBarChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface StackedBarChartProps {
  variant?: StackedBarChartVariant;
}

export function StackedBarChart({ variant = 'quiet' }: StackedBarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const segmentColors =
    variant === 'nocturne'
      ? ['#06B6D4', '#6366F1', '#A855F7']
      : variant === 'expressive'
      ? ['#2547E8', '#10B981', '#F59E0B']
      : ['#171717', '#737373', '#D4D4D4'];

  const categories = ['Desktop', 'Mobile', 'Tablet'];
  const months = [
    { month: 'Jan', segments: [45, 30, 15] },
    { month: 'Feb', segments: [50, 35, 18] },
    { month: 'Mar', segments: [60, 40, 20] },
    { month: 'Apr', segments: [55, 45, 22] },
    { month: 'May', segments: [70, 50, 25] },
  ];

  const maxVal = 160;
  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barWidth = 36;
  const step = chartW / months.length;

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Traffic by Platform</h4>
          <p className="text-xs text-neutral-500">Segmented breakdown by device type</p>
        </div>
        <div className="flex items-center gap-3">
          {categories.map((c, idx) => (
            <div key={c} className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: segmentColors[idx] ?? '#000' }} />
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={\`0 0 \${width} \${height}\`} className="w-full h-auto overflow-visible select-none">
          {[0, 40, 80, 120, 160].map((v) => {
            const y = padding.top + chartH * (1 - v / maxVal);
            return (
              <g key={v}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke={variant === 'nocturne' ? '#1E232E' : '#F3F4F6'} strokeWidth="1" />
                <text x={padding.left - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-neutral-400 font-mono">
                  {v}
                </text>
              </g>
            );
          })}

          {months.map((m, mIdx) => {
            const x = padding.left + mIdx * step + (step - barWidth) / 2;
            let currentY = padding.top + chartH;

            return (
              <g key={m.month} onMouseEnter={() => setHoveredIdx(mIdx)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
                {m.segments.map((val, sIdx) => {
                  const sHeight = (val / maxVal) * chartH;
                  currentY -= sHeight;
                  const color = segmentColors[sIdx] ?? '#000';
                  return (
                    <rect
                      key={sIdx}
                      x={x}
                      y={currentY}
                      width={barWidth}
                      height={sHeight}
                      fill={color}
                      className={\`transition-opacity duration-150 \${
                        hoveredIdx === null || hoveredIdx === mIdx ? 'opacity-100' : 'opacity-50'
                      }\`}
                    />
                  );
                })}
                <text
                  x={x + barWidth / 2}
                  y={height - 10}
                  textAnchor="middle"
                  className={\`text-[10px] font-mono transition-colors \${
                    hoveredIdx === mIdx ? 'font-bold fill-current' : 'fill-neutral-400'
                  }\`}
                >
                  {m.month}
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
import { StackedBarChart, StackedBarChartVariant } from './index';

export function StackedBarChartPreview() {
  const [variant, setVariant] = useState<StackedBarChartVariant>('quiet');

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
      <StackedBarChart variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const stackedBarChartFixtures = {};`,
    readmeCode: `# Stacked Bar Chart

Segmented vertical bar chart showing category composition across monthly reporting cycles.`,
  },

  // 7. Horizontal Bar Chart
  {
    slug: 'horizontal-bar-chart',
    name: 'Horizontal Bar Chart',
    description: 'Ranking/leaderboard horizontal bar chart with left labels, percentage/count right labels, and animated width bars.',
    categories: ['data', 'visualization', 'charts'],
    roles: ['chart', 'analytics'],
    purposes: ['ranking-display', 'leaderboard-comparison', 'endpoint-latency'],
    componentName: 'HorizontalBarChart',
    tags: ['chart', 'horizontal-bar', 'ranking', 'leaderboard', 'metrics'],
    idealFor: ['Top API endpoints by latency', 'Regional customer distributions', 'Feature adoption rankings'],
    avoidFor: ['Continuous time series tracking', 'Cyclical schedule planning'],
    jobs: ['Rank categorical entities by value with horizontal proportional bars'],
    indexCode: `import React, { useState } from 'react';

export type HorizontalBarChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface HorizontalBarChartProps {
  variant?: HorizontalBarChartVariant;
}

export function HorizontalBarChart({ variant = 'quiet' }: HorizontalBarChartProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const barBg =
    variant === 'nocturne' ? 'bg-[#1E232E]' : 'bg-neutral-100 dark:bg-neutral-800';

  const barFill =
    variant === 'nocturne'
      ? 'bg-cyan-500'
      : variant === 'expressive'
      ? 'bg-[#2547E8]'
      : 'bg-neutral-900 dark:bg-white';

  const items = [
    { label: '/api/v1/projects', value: 840, pct: 95 },
    { label: '/api/v1/auth/session', value: 620, pct: 70 },
    { label: '/api/v1/search', value: 510, pct: 58 },
    { label: '/api/v1/catalog/items', value: 390, pct: 44 },
    { label: '/api/v1/webhooks', value: 180, pct: 20 },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Top Requested Endpoints</h4>
          <p className="text-xs text-neutral-500">Request volume over past 24 hours</p>
        </div>
        <span className="text-xs font-mono font-medium text-neutral-400">Total: 2,540 req</span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.label}
            onMouseEnter={() => setActiveItem(item.label)}
            onMouseLeave={() => setActiveItem(null)}
            className="group cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-current">
                {item.label}
              </span>
              <span className="font-mono text-neutral-500">{item.value} req</span>
            </div>
            <div className={\`w-full h-3 rounded-full overflow-hidden \${barBg}\`}>
              <div
                className={\`h-full rounded-full transition-all duration-300 \${barFill} \${
                  activeItem === item.label ? 'opacity-100' : 'opacity-85'
                }\`}
                style={{ width: \`\${item.pct}%\` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { HorizontalBarChart, HorizontalBarChartVariant } from './index';

export function HorizontalBarChartPreview() {
  const [variant, setVariant] = useState<HorizontalBarChartVariant>('quiet');

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
      <HorizontalBarChart variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const horizontalBarChartFixtures = {};`,
    readmeCode: `# Horizontal Bar Chart

Horizontal ranking and leaderboard bar chart with endpoint identifiers and percentage widths.`,
  },

  // 8. Donut Chart
  {
    slug: 'donut-chart',
    name: 'Donut Chart',
    description: 'SVG circle stroke-dasharray radial breakdown with center KPI summary metric, category legend pills, and segment highlight.',
    categories: ['data', 'visualization', 'charts'],
    roles: ['chart', 'analytics'],
    purposes: ['proportional-breakdown', 'capacity-allocation', 'status-shares'],
    componentName: 'DonutChart',
    tags: ['chart', 'donut', 'radial', 'svg', 'proportions'],
    idealFor: ['Storage capacity utilization', 'Revenue breakdown by tier', 'Test status passes vs fails'],
    avoidFor: ['Complex datasets with >7 categories', 'Chronological line tracking'],
    jobs: ['Display part-to-whole proportions with radial donut geometry and center summary count'],
    indexCode: `import React, { useState } from 'react';

export type DonutChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DonutChartProps {
  variant?: DonutChartVariant;
}

export function DonutChart({ variant = 'quiet' }: DonutChartProps) {
  const [activeSegment, setActiveSegment] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const colors =
    variant === 'nocturne'
      ? ['#06B6D4', '#6366F1', '#A855F7', '#F43F5E']
      : variant === 'expressive'
      ? ['#2547E8', '#10B981', '#F59E0B', '#EF4444']
      : ['#171717', '#525252', '#8C8C8C', '#D4D4D4'];

  const segments = [
    { label: 'Enterprise', value: 45 },
    { label: 'Pro', value: 30 },
    { label: 'Starter', value: 15 },
    { label: 'Free', value: 10 },
  ];

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Subscription Shares</h4>
          <p className="text-xs text-neutral-500">Tier revenue contribution</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
        <div className="relative w-[180px] h-[180px] flex items-center justify-center select-none">
          <svg width={size} height={size} className="transform -rotate-90">
            {segments.map((seg, idx) => {
              const strokeDasharray = \`\${(seg.value / total) * circumference} \${circumference}\`;
              const strokeDashoffset = -currentOffset;
              currentOffset += (seg.value / total) * circumference;
              const color = colors[idx] ?? '#000';
              const isHovered = activeSegment === idx;

              return (
                <circle
                  key={seg.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setActiveSegment(idx)}
                  onMouseLeave={() => setActiveSegment(null)}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold font-mono">
              {activeSegment !== null ? segments[activeSegment]?.value ?? total : \`\${total}%\`}
            </span>
            <span className="text-[10px] text-neutral-400 font-medium">
              {activeSegment !== null ? segments[activeSegment]?.label : 'Total'}
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {segments.map((seg, idx) => {
            const color = colors[idx] ?? '#000';
            const isHovered = activeSegment === idx;
            return (
              <div
                key={seg.label}
                onMouseEnter={() => setActiveSegment(idx)}
                onMouseLeave={() => setActiveSegment(null)}
                className={\`flex items-center gap-3 text-xs p-1.5 rounded cursor-pointer transition-opacity \${
                  isHovered ? 'opacity-100 font-semibold' : 'opacity-80'
                }\`}
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="w-24">{seg.label}</span>
                <span className="font-mono font-medium">{seg.value}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { DonutChart, DonutChartVariant } from './index';

export function DonutChartPreview() {
  const [variant, setVariant] = useState<DonutChartVariant>('quiet');

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
      <DonutChart variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const donutChartFixtures = {};`,
    readmeCode: `# Donut Chart

Radial donut chart with SVG stroke-dasharray segments, center KPI summary metric, and hover segment states.`,
  },

  // 9. Treemap
  {
    slug: 'treemap',
    name: 'Treemap',
    description: 'Rectangular squarified hierarchical partition chart with proportional area tiles, category headers, and size/value labels.',
    categories: ['data', 'visualization', 'charts'],
    roles: ['chart', 'analytics'],
    purposes: ['hierarchical-partitioning', 'disk-allocation', 'portfolio-breakdown'],
    componentName: 'Treemap',
    tags: ['chart', 'treemap', 'hierarchical', 'partitions', 'storage'],
    idealFor: ['Disk space consumption by directory', 'Financial portfolio allocations', 'Component bundle size breakdown'],
    avoidFor: ['Sequential time trends', 'High-speed streaming ticks'],
    jobs: ['Display nested hierarchical proportions via 2D tiled rectangular areas'],
    indexCode: `import React, { useState } from 'react';

export type TreemapVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TreemapProps {
  variant?: TreemapVariant;
}

export function Treemap({ variant = 'quiet' }: TreemapProps) {
  const [activeTile, setActiveTile] = useState<string | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const tiles = [
    { id: '1', name: 'Database Cluster', size: '1.2 TB', span: 'col-span-8 row-span-4', bg: variant === 'nocturne' ? 'bg-cyan-950/80 border-cyan-800' : variant === 'expressive' ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-white' },
    { id: '2', name: 'Log Archives', size: '640 GB', span: 'col-span-4 row-span-4', bg: variant === 'nocturne' ? 'bg-indigo-950/80 border-indigo-800' : variant === 'expressive' ? 'bg-emerald-600 text-white' : 'bg-neutral-700 text-white' },
    { id: '3', name: 'Media Assets', size: '420 GB', span: 'col-span-5 row-span-3', bg: variant === 'nocturne' ? 'bg-purple-950/80 border-purple-800' : variant === 'expressive' ? 'bg-amber-600 text-white' : 'bg-neutral-500 text-white' },
    { id: '4', name: 'Search Indexes', size: '280 GB', span: 'col-span-4 row-span-3', bg: variant === 'nocturne' ? 'bg-rose-950/80 border-rose-800' : variant === 'expressive' ? 'bg-purple-600 text-white' : 'bg-neutral-400 text-neutral-900' },
    { id: '5', name: 'Snapshots', size: '150 GB', span: 'col-span-3 row-span-3', bg: variant === 'nocturne' ? 'bg-zinc-800 border-zinc-700' : variant === 'expressive' ? 'bg-indigo-600 text-white' : 'bg-neutral-300 text-neutral-900' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Storage Utilization Treemap</h4>
          <p className="text-xs text-neutral-500">Proportional partition by storage volume</p>
        </div>
        <span className="text-xs font-mono font-medium text-neutral-400">Total: 2.69 TB</span>
      </div>

      <div className="grid grid-cols-12 grid-rows-7 gap-2 h-72 w-full">
        {tiles.map((t) => {
          const isHovered = activeTile === t.id;
          return (
            <div
              key={t.id}
              onMouseEnter={() => setActiveTile(t.id)}
              onMouseLeave={() => setActiveTile(null)}
              className={\`\${t.span} \${t.bg} p-3 rounded-lg flex flex-col justify-between border cursor-pointer transition-all duration-200 \${
                isHovered ? 'scale-[1.01] shadow-lg ring-2 ring-white/50' : 'opacity-90'
              }\`}
            >
              <div className="text-xs font-semibold tracking-tight truncate">{t.name}</div>
              <div className="text-sm font-mono font-bold mt-1">{t.size}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { Treemap, TreemapVariant } from './index';

export function TreemapPreview() {
  const [variant, setVariant] = useState<TreemapVariant>('quiet');

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
      <Treemap variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const treemapFixtures = {};`,
    readmeCode: `# Treemap

Rectangular squarified hierarchical partition chart for storage allocations and portfolio breakdowns.`,
  },

  // 10. Heatmap
  {
    slug: 'heatmap',
    name: 'Heatmap',
    description: '7x24 or day-by-week commit/activity grid with 5-level intensity gradient, month labels, and cell inspection tooltip.',
    categories: ['data', 'visualization', 'charts'],
    roles: ['chart', 'analytics'],
    purposes: ['activity-tracking', 'density-matrix', 'temporal-heat'],
    componentName: 'Heatmap',
    tags: ['chart', 'heatmap', 'matrix', 'commits', 'activity'],
    idealFor: ['GitHub-style annual commit calendars', 'Hourly API error distributions', 'Weekly user engagement density'],
    avoidFor: ['Small 2-variable point scatterings', 'Continuous audio waveform plots'],
    jobs: ['Map high-frequency event density into discrete intensity matrix cells'],
    indexCode: `import React, { useState } from 'react';

export type HeatmapVariant = 'quiet' | 'expressive' | 'nocturne';

export interface HeatmapProps {
  variant?: HeatmapVariant;
}

export function Heatmap({ variant = 'quiet' }: HeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ day: number; week: number; val: number } | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const getCellColor = (level: number) => {
    if (level === 0) {
      return variant === 'nocturne' ? 'bg-[#151921]' : 'bg-neutral-100 dark:bg-neutral-800';
    }
    if (variant === 'nocturne') {
      const shades = ['bg-cyan-950', 'bg-cyan-800', 'bg-cyan-600', 'bg-cyan-400'];
      return shades[level - 1] ?? 'bg-cyan-400';
    }
    if (variant === 'expressive') {
      const shades = ['bg-blue-200', 'bg-blue-400', 'bg-blue-600', 'bg-blue-800'];
      return shades[level - 1] ?? 'bg-blue-800';
    }
    const shades = ['bg-neutral-300 dark:bg-neutral-700', 'bg-neutral-500', 'bg-neutral-700', 'bg-neutral-900 dark:bg-white'];
    return shades[level - 1] ?? 'bg-neutral-900';
  };

  const days = ['Mon', 'Wed', 'Fri'];
  const weeks = 20;

  // Generate deterministic pattern
  const grid = Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: weeks }, (_, w) => {
      const seed = (d * 13 + w * 7) % 5;
      return seed;
    })
  );

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Deploy Activity Frequency</h4>
          <p className="text-xs text-neutral-500">20-week build and release cadence</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <span key={lvl} className={\`w-2.5 h-2.5 rounded-sm \${getCellColor(lvl)}\`} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto py-2">
        <div className="flex flex-col justify-between py-1 text-[10px] text-neutral-400 font-mono">
          {days.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="flex gap-1.5">
          {Array.from({ length: weeks }).map((_, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {Array.from({ length: 7 }).map((_, dIdx) => {
                const val = grid[dIdx]?.[wIdx] ?? 0;
                return (
                  <div
                    key={dIdx}
                    onMouseEnter={() => setHoveredCell({ day: dIdx, week: wIdx, val })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={\`w-3.5 h-3.5 rounded-sm transition-transform cursor-pointer \${getCellColor(val)} hover:scale-125\`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {hoveredCell && (
        <div className="mt-3 text-xs font-mono text-neutral-500">
          Week {hoveredCell.week + 1}, Day {hoveredCell.day + 1}: <span className="font-semibold">{hoveredCell.val * 3} deploys</span>
        </div>
      )}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { Heatmap, HeatmapVariant } from './index';

export function HeatmapPreview() {
  const [variant, setVariant] = useState<HeatmapVariant>('quiet');

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
      <Heatmap variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const heatmapFixtures = {};`,
    readmeCode: `# Heatmap

Temporal activity density matrix grid with 5-level intensity gradients and cell inspection details.`,
  },

  // 11. Scatter Plot
  {
    slug: 'scatter-plot',
    name: 'Scatter Plot',
    description: '2D Cartesian coordinate scatter chart with SVG circular points, quadrant benchmark lines, and outlier point highlights.',
    categories: ['data', 'visualization', 'charts'],
    roles: ['chart', 'analytics'],
    purposes: ['correlation-analysis', 'outlier-detection', 'cluster-discovery'],
    componentName: 'ScatterPlot',
    tags: ['chart', 'scatter', 'coordinates', 'svg', 'clusters'],
    idealFor: ['Latency vs Payload size correlation', 'Customer NPS vs Lifetime Value', 'Engine temperature vs RPM'],
    avoidFor: ['Strict ordered 1D timelines', 'Parts-of-a-whole distributions'],
    jobs: ['Plot bivariate point distributions to identify correlations and cluster boundaries'],
    indexCode: `import React, { useState } from 'react';

export type ScatterPlotVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ScatterPlotProps {
  variant?: ScatterPlotVariant;
}

export function ScatterPlot({ variant = 'quiet' }: ScatterPlotProps) {
  const [activePoint, setActivePoint] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const pointColor =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717';

  const data = [
    { x: 12, y: 35, label: 'Job A' },
    { x: 28, y: 55, label: 'Job B' },
    { x: 45, y: 48, label: 'Job C' },
    { x: 62, y: 78, label: 'Job D' },
    { x: 75, y: 82, label: 'Job E' },
    { x: 88, y: 92, label: 'Job F' },
    { x: 34, y: 22, label: 'Job G' },
    { x: 50, y: 65, label: 'Job H' },
    { x: 80, y: 40, label: 'Job I' },
    { x: 95, y: 88, label: 'Job J' },
  ];

  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Latency vs Payload Size</h4>
          <p className="text-xs text-neutral-500">Bivariate correlation analysis</p>
        </div>
        {activePoint !== null && (
          <span className="text-xs font-mono font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
            {data[activePoint]?.label}: ({data[activePoint]?.x}KB, {data[activePoint]?.y}ms)
          </span>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={\`0 0 \${width} \${height}\`} className="w-full h-auto overflow-visible select-none">
          {/* Quadrant crosshairs */}
          <line
            x1={padding.left + chartW / 2}
            y1={padding.top}
            x2={padding.left + chartW / 2}
            y2={padding.top + chartH}
            stroke={variant === 'nocturne' ? '#1E232E' : '#E5E7EB'}
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={padding.left}
            y1={padding.top + chartH / 2}
            x2={width - padding.right}
            y2={padding.top + chartH / 2}
            stroke={variant === 'nocturne' ? '#1E232E' : '#E5E7EB'}
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Scatter points */}
          {data.map((d, idx) => {
            const cx = padding.left + (d.x / 100) * chartW;
            const cy = padding.top + chartH - (d.y / 100) * chartH;
            const isHovered = activePoint === idx;

            return (
              <g key={d.label} onMouseEnter={() => setActivePoint(idx)} onMouseLeave={() => setActivePoint(null)} className="cursor-pointer">
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 7 : 4.5}
                  fill={pointColor}
                  fillOpacity={isHovered ? 1 : 0.75}
                  stroke={variant === 'nocturne' ? '#000' : '#fff'}
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {/* Axis labels */}
          <text x={padding.left + chartW / 2} y={height - 10} textAnchor="middle" className="text-[10px] fill-neutral-400 font-mono">
            Payload Size (KB) →
          </text>
        </svg>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ScatterPlot, ScatterPlotVariant } from './index';

export function ScatterPlotPreview() {
  const [variant, setVariant] = useState<ScatterPlotVariant>('quiet');

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
      <ScatterPlot variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const scatterPlotFixtures = {};`,
    readmeCode: `# Scatter Plot

2D Cartesian scatter chart with quadrant crosshairs and point hover highlights.`,
  },

  // 12. Bubble Plot
  {
    slug: 'bubble-plot',
    name: 'Bubble Plot',
    description: '3-variable scatter plot where point radius encodes the 3rd metric (e.g. volume/revenue), with semi-transparent bubble overlaps.',
    categories: ['data', 'visualization', 'charts'],
    roles: ['chart', 'analytics'],
    purposes: ['trivariate-analysis', 'market-positioning', 'risk-matrix'],
    componentName: 'BubblePlot',
    tags: ['chart', 'bubble', 'multivariate', 'svg', 'radius'],
    idealFor: ['Risk vs Impact vs Frequency assessment', 'Feature adoption vs Effort vs Value', 'Customer segment revenue analysis'],
    avoidFor: ['High-precision single axis telemetry', 'Narrow 1D lists'],
    jobs: ['Map 3 quantitative metrics simultaneously onto 2D position and bubble radius'],
    indexCode: `import React, { useState } from 'react';

export type BubblePlotVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BubblePlotProps {
  variant?: BubblePlotVariant;
}

export function BubblePlot({ variant = 'quiet' }: BubblePlotProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const bubbleColor =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717';

  const bubbles = [
    { name: 'Core Engine', x: 25, y: 70, r: 18, val: '$120K' },
    { name: 'Auth Gateway', x: 45, y: 40, r: 12, val: '$65K' },
    { name: 'Search Service', x: 65, y: 85, r: 24, val: '$240K' },
    { name: 'Export Worker', x: 80, y: 30, r: 14, val: '$80K' },
    { name: 'Notification Hub', x: 85, y: 60, r: 10, val: '$45K' },
  ];

  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col transition-colors \${cardBg}\`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Service Value Matrix</h4>
          <p className="text-xs text-neutral-500">X: Complexity | Y: Impact | Radius: Cost</p>
        </div>
        {activeIdx !== null && (
          <span className="text-xs font-mono font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
            {bubbles[activeIdx]?.name}: {bubbles[activeIdx]?.val}
          </span>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={\`0 0 \${width} \${height}\`} className="w-full h-auto overflow-visible select-none">
          <line
            x1={padding.left}
            y1={padding.top + chartH}
            x2={width - padding.right}
            y2={padding.top + chartH}
            stroke={variant === 'nocturne' ? '#2E3440' : '#E5E7EB'}
            strokeWidth="1"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartH}
            stroke={variant === 'nocturne' ? '#2E3440' : '#E5E7EB'}
            strokeWidth="1"
          />

          {bubbles.map((b, idx) => {
            const cx = padding.left + (b.x / 100) * chartW;
            const cy = padding.top + chartH - (b.y / 100) * chartH;
            const isHovered = activeIdx === idx;

            return (
              <g key={b.name} onMouseEnter={() => setActiveIdx(idx)} onMouseLeave={() => setActiveIdx(null)} className="cursor-pointer">
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? b.r * 1.2 : b.r}
                  fill={bubbleColor}
                  fillOpacity={isHovered ? 0.75 : 0.4}
                  stroke={bubbleColor}
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
                <text x={cx} y={cy + 3} textAnchor="middle" className="text-[9px] font-mono font-semibold fill-current select-none pointer-events-none">
                  {b.name.split(' ')[0]}
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
import { BubblePlot, BubblePlotVariant } from './index';

export function BubblePlotPreview() {
  const [variant, setVariant] = useState<BubblePlotVariant>('quiet');

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
      <BubblePlot variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const bubblePlotFixtures = {};`,
    readmeCode: `# Bubble Plot

Trivariate scatter plot encoding complexity, impact, and revenue magnitude through position and bubble radius.`,
  },
];
