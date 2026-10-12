import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Sliders,
} from 'lucide-react';

export type ChartRecipeType = 'line' | 'area' | 'bar' | 'donut';

interface ChartRecipePreset {
  id: ChartRecipeType;
  name: string;
  category: string;
  description: string;
}

const RECIPE_PRESETS: ChartRecipePreset[] = [
  { id: 'line', name: 'Time Series Line Spline', category: 'Continuous', description: 'Smooth cubic Bezier spline for high-frequency telemetry.' },
  { id: 'area', name: 'Gradient Area Stream', category: 'Volume', description: 'Dual-pass area gradient highlighting throughput density.' },
  { id: 'bar', name: 'Categorical Column Ledger', category: 'Comparative', description: 'Uniform columnar records with optical rounded tops.' },
  { id: 'donut', name: 'Radial Allocation Ring', category: 'Proportional', description: 'Multi-segment proportional ring with central summary metric.' },
];

const RAW_DATA = [
  { label: '00:00', value: 34, cat: 'A' },
  { label: '04:00', value: 48, cat: 'B' },
  { label: '08:00', value: 82, cat: 'C' },
  { label: '12:00', value: 65, cat: 'D' },
  { label: '16:00', value: 94, cat: 'E' },
  { label: '20:00', value: 78, cat: 'F' },
  { label: '24:00', value: 88, cat: 'G' },
];

export function DatavizStyler() {
  const [recipe, setRecipe] = useState<ChartRecipeType>('line');
  const [densityScore, setDensityScore] = useState<number>(75);
  const [strokeWidth, setStrokeWidth] = useState<number>(2.5);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [curveType, setCurveType] = useState<'smooth' | 'linear' | 'stepped'>('smooth');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [copiedFormat, setCopiedFormat] = useState<'svg' | 'react' | null>(null);

  // SVG coordinates calculation
  const width = 500;
  const height = 220;
  const padding = 30;

  const points = useMemo(() => {
    const minVal = 0;
    const maxVal = 100;
    const xStep = (width - padding * 2) / (RAW_DATA.length - 1);

    return RAW_DATA.map((d, i) => {
      const x = padding + i * xStep;
      const y = height - padding - ((d.value - minVal) / (maxVal - minVal)) * (height - padding * 2);
      return { x, y, value: d.value, label: d.label };
    });
  }, [width, height, padding]);

  // Construct SVG Path String based on curveType
  const pathD = useMemo(() => {
    if (points.length < 2) return '';
    if (curveType === 'linear') {
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }
    if (curveType === 'stepped') {
      let d = `M ${points[0]!.x} ${points[0]!.y}`;
      for (let i = 1; i < points.length; i++) {
        d += ` H ${points[i]!.x} V ${points[i]!.y}`;
      }
      return d;
    }
    // Smooth Catmull-Rom or cubic Bezier
    let d = `M ${points[0]!.x} ${points[0]!.y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]!;
      const p1 = points[i + 1]!;
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points, curveType]);

  const areaD = useMemo(() => {
    if (!pathD || points.length === 0) return '';
    const last = points[points.length - 1]!;
    const first = points[0]!;
    return `${pathD} L ${last.x} ${height - padding} L ${first.x} ${height - padding} Z`;
  }, [pathD, points, height, padding]);

  const generatedSvgSnippet = useMemo(() => {
    return `<svg viewBox="0 0 ${width} ${height}" className="w-full h-auto">\n  <path d="${pathD}" fill="none" stroke="#2547E8" stroke-width="${strokeWidth}" />\n</svg>`;
  }, [width, height, pathD, strokeWidth]);

  const copyToClipboard = (text: string, format: 'svg' | 'react') => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D6CF] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
              Tool 08 · Information Visualization
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#E7EBFF] text-[#2547E8]">
              Client-Side · Zero Login
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111217] mt-1">
            Data Visualisation Styler
          </h1>
          <p className="text-sm text-[#62666F] mt-1">
            Imbue charts, telemetry graphs, and ledgers with project Design DNA, responsive curves, and WCAG contrast.
          </p>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => copyToClipboard(generatedSvgSnippet, 'svg')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2547E8] text-white text-xs font-semibold hover:bg-[#1E3CCD] transition-all shadow-sm"
          >
            {copiedFormat === 'svg' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy SVG Chart Code</span>
          </button>
        </div>
      </div>

      {/* Recipe Presets */}
      <div className="space-y-2">
        <span className="block font-mono text-xs font-semibold uppercase text-[var(--text-muted)]">
          Chart Recipes
        </span>
        <div className="flex flex-wrap gap-2">
          {RECIPE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setRecipe(p.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                recipe === p.id
                  ? 'border-[#111217] bg-[#111217] text-white shadow-sm'
                  : 'border-[#D9D6CF] bg-white text-[#62666F] hover:text-[#111217] hover:border-[#8B8F97]'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Parameters (Left 5) & Stage (Right 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6 rounded-2xl border border-[#D9D6CF] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#2547E8]" />
              <h2 className="text-sm font-semibold text-[#111217]">DNA Chart Parameters</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setDensityScore(75);
                setStrokeWidth(2.5);
                setShowGrid(true);
                setCurveType('smooth');
              }}
              className="text-xs font-mono text-[var(--text-muted)] hover:text-[#111217] flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Interpolation Type */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#111217]">
              Interpolation Curve
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['smooth', 'linear', 'stepped'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurveType(c)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-medium capitalize transition-all ${
                    curveType === c
                      ? 'border-[#2547E8] bg-[#E7EBFF] text-[#2547E8] font-semibold'
                      : 'border-[#D9D6CF] text-[#62666F] hover:text-[#111217]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Density Slider */}
          <div className="space-y-2 pt-2 border-t border-[#D9D6CF]">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-[#111217]">Data Density Bias</span>
              <span className="font-mono text-[#62666F]">{densityScore}/100</span>
            </div>
            <input aria-label="Data density"
              type="range"
              min="20"
              max="95"
              step="5"
              value={densityScore}
              onChange={(e) => setDensityScore(Number(e.target.value))}
              className="w-full accent-[#2547E8] cursor-pointer"
            />
          </div>

          {/* Stroke Width Slider */}
          <div className="space-y-2 pt-2 border-t border-[#D9D6CF]">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-[#111217]">Telemetry Stroke Width</span>
              <span className="font-mono text-[#62666F]">{strokeWidth}px</span>
            </div>
            <input aria-label="Chart stroke width"
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full accent-[#2547E8] cursor-pointer"
            />
          </div>

          {/* Grid lines toggle */}
          <div className="pt-2 border-t border-[#D9D6CF] flex items-center justify-between">
            <span className="text-xs font-medium text-[#111217]">Cartesian Hairline Grid</span>
            <input aria-label="Show grid"
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="accent-[#2547E8] rounded"
            />
          </div>

          {/* Dark / Light Canvas Mode */}
          <div className="pt-2 border-t border-[#D9D6CF] flex items-center justify-between">
            <span className="text-xs font-medium text-[#111217]">Canvas Theme</span>
            <div className="flex gap-1 p-0.5 rounded-lg bg-[#FAF9F6] border border-[#D9D6CF]">
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`px-2 py-1 text-xs rounded font-medium ${
                  themeMode === 'light' ? 'bg-white shadow text-[#111217]' : 'text-[var(--text-muted)]'
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`px-2 py-1 text-xs rounded font-medium ${
                  themeMode === 'dark' ? 'bg-[#0B0D10] shadow text-white' : 'text-[var(--text-muted)]'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>

        {/* Live SVG Stage Column */}
        <div className="lg:col-span-7 space-y-6">
          <div
            className={`rounded-2xl border p-6 shadow-sm transition-colors duration-300 ${
              themeMode === 'dark'
                ? 'bg-[#0B0D10] border-[#272B33] text-[#F5F7FA]'
                : 'bg-white border-[#D9D6CF] text-[#111217]'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-3 text-xs font-mono border-b mb-4 ${
                themeMode === 'dark' ? 'border-[#272B33] text-[var(--text-muted)]' : 'border-[#D9D6CF] text-[var(--text-muted)]'
              }`}
            >
              <span>SVG VECTOR RENDER ENGINE</span>
              <span className="text-[#2547E8] font-bold">INTERVAL: 100ms</span>
            </div>

            {/* SVG Visual Stage */}
            <div className="w-full aspect-[2/1] relative">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                {/* Defs: Gradients */}
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2547E8" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2547E8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {showGrid && (
                  <>
                    {[0.25, 0.5, 0.75, 1].map((frac, idx) => {
                      const y = height - padding - frac * (height - padding * 2);
                      return (
                        <line
                          key={idx}
                          x1={padding}
                          y1={y}
                          x2={width - padding}
                          y2={y}
                          stroke={themeMode === 'dark' ? '#272B33' : '#D9D6CF'}
                          strokeWidth="1"
                          strokeDasharray="3 3"
                        />
                      );
                    })}
                  </>
                )}

                {/* Recipe rendering */}
                {recipe === 'line' && (
                  <>
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#2547E8"
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                    />
                    {points.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r={strokeWidth + 1.5}
                        fill={themeMode === 'dark' ? '#0B0D10' : '#FFFFFF'}
                        stroke="#2547E8"
                        strokeWidth={strokeWidth}
                      />
                    ))}
                  </>
                )}

                {recipe === 'area' && (
                  <>
                    <path d={areaD} fill="url(#areaGradient)" />
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#2547E8"
                      strokeWidth={strokeWidth}
                    />
                  </>
                )}

                {recipe === 'bar' && (
                  <>
                    {points.map((p, idx) => {
                      const barWidth = 28;
                      const barHeight = height - padding - p.y;
                      return (
                        <rect
                          key={idx}
                          x={p.x - barWidth / 2}
                          y={p.y}
                          width={barWidth}
                          height={barHeight}
                          rx="4"
                          fill="#2547E8"
                          opacity={0.85}
                        />
                      );
                    })}
                  </>
                )}

                {recipe === 'donut' && (
                  <g transform={`translate(${width / 2}, ${height / 2})`}>
                    <circle r="70" fill="none" stroke={themeMode === 'dark' ? '#272B33' : '#D9D6CF'} strokeWidth="20" />
                    <circle
                      r="70"
                      fill="none"
                      stroke="#2547E8"
                      strokeWidth="20"
                      strokeDasharray="280 440"
                      strokeLinecap="round"
                    />
                    <circle
                      r="70"
                      fill="none"
                      stroke="#C9FF57"
                      strokeWidth="20"
                      strokeDasharray="90 440"
                      strokeDashoffset="-290"
                      strokeLinecap="round"
                    />
                    <text
                      textAnchor="middle"
                      dy="6"
                      className="text-base font-bold font-mono"
                      fill={themeMode === 'dark' ? '#F5F7FA' : '#111217'}
                    >
                      £4.2M
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
