import React, { useState, useMemo } from 'react';
import { Copy, Check, RotateCcw, Smartphone, Tablet, Monitor, Sliders } from 'lucide-react';
import { CopyFailureNotice, useToolClipboard } from './useToolClipboard';

export type LayoutGrammarId =
  | 'standard-sidebar'
  | 'three-pane-cockpit'
  | 'bento-modular'
  | 'editorial-split'
  | 'spatial-canvas';

interface LayoutGrammarPreset {
  id: LayoutGrammarId;
  name: string;
  category: string;
  defaultCols: number;
  defaultGap: number;
  description: string;
}

const LAYOUT_PRESETS: LayoutGrammarPreset[] = [
  {
    id: 'standard-sidebar',
    name: 'Standard Application Sidebar',
    category: 'SaaS / Admin',
    defaultCols: 12,
    defaultGap: 24,
    description: 'Fixed 260px navigation rail with sticky utility header and fluid container.',
  },
  {
    id: 'three-pane-cockpit',
    name: 'Three-Pane Modular Cockpit',
    category: 'Technical / IDE',
    defaultCols: 12,
    defaultGap: 16,
    description:
      'Dense developer cockpit: left file tree, center work canvas, right telemetry inspector.',
  },
  {
    id: 'bento-modular',
    name: 'Asymmetric Bento Grid',
    category: 'Product / Showcase',
    defaultCols: 4,
    defaultGap: 20,
    description: 'Dynamic modular card mosaic balancing visual hero features with metric tiles.',
  },
  {
    id: 'editorial-split',
    name: 'Asymmetric Editorial Split',
    category: 'Narrative / E-comm',
    defaultCols: 12,
    defaultGap: 32,
    description:
      '50/50 sticky authorial thesis on the left with scrolling visual artifacts on the right.',
  },
  {
    id: 'spatial-canvas',
    name: 'Spatial Infinite Canvas',
    category: 'Creative / AI',
    defaultCols: 12,
    defaultGap: 16,
    description: 'Full-bleed viewport canvas with floating corner HUD tools and island docks.',
  },
];

type ViewportSize = 'mobile' | 'tablet' | 'desktop';

export function LayoutComposer() {
  const [grammarId, setGrammarId] = useState<LayoutGrammarId>('standard-sidebar');
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [cols, setCols] = useState<number>(12);
  const [gapPx, setGapPx] = useState<number>(24);
  const [containerWidth, setContainerWidth] = useState<'1024px' | '1280px' | '1440px' | '100%'>(
    '1440px'
  );
  const [copiedFormat, setCopiedFormat] = useState<'tailwind' | 'css' | null>(null);
  const { copyText, copyFailed } = useToolClipboard();

  const activePreset = useMemo(() => {
    return LAYOUT_PRESETS.find((p) => p.id === grammarId) ?? LAYOUT_PRESETS[0]!;
  }, [grammarId]);

  const selectGrammar = (g: LayoutGrammarPreset) => {
    setGrammarId(g.id);
    setCols(g.defaultCols);
    setGapPx(g.defaultGap);
  };

  const resetLayout = () => {
    selectGrammar(LAYOUT_PRESETS[0]!);
    setViewport('desktop');
    setContainerWidth('1440px');
  };

  // Generated Tailwind snippet
  const generatedTailwind = useMemo(() => {
    switch (grammarId) {
      case 'standard-sidebar':
        return `<div className="flex h-screen bg-[#F4F2ED]">\n  {/* Sidebar */}\n  <aside className="w-64 border-r border-[#D9D6CF] bg-white p-4 hidden md:block">\n    {/* Nav */}\n  </aside>\n  {/* Main content */}\n  <main className="flex-1 overflow-y-auto p-6 max-w-[${containerWidth}] mx-auto">\n    <div className="grid grid-cols-1 md:grid-cols-${cols} gap-${gapPx / 4}">\n      {/* Content nodes */}\n    </div>\n  </main>\n</div>`;
      case 'three-pane-cockpit':
        return `<div className="grid grid-cols-12 h-screen bg-[#0B0D10] text-white">\n  <nav className="col-span-3 border-r border-[#272B33] p-4 hidden lg:block">Layers</nav>\n  <main className="col-span-12 lg:col-span-6 p-6 overflow-y-auto">Canvas</main>\n  <aside className="col-span-3 border-l border-[#272B33] p-4 hidden lg:block">Inspector</aside>\n</div>`;
      case 'bento-modular':
        return `<div className="grid grid-cols-1 md:grid-cols-4 gap-${gapPx / 4} max-w-[${containerWidth}] mx-auto p-6">\n  <div className="col-span-1 md:col-span-2 row-span-2 rounded-2xl bg-white p-6">Hero Feature (2x2)</div>\n  <div className="col-span-1 md:col-span-2 rounded-2xl bg-white p-6">Metric Telemetry (2x1)</div>\n  <div className="col-span-1 rounded-2xl bg-white p-6">Status 01 (1x1)</div>\n  <div className="col-span-1 rounded-2xl bg-white p-6">Status 02 (1x1)</div>\n</div>`;
      case 'editorial-split':
        return `<div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen max-w-[${containerWidth}] mx-auto p-6 gap-${gapPx / 4}">\n  <div className="lg:col-span-5 sticky top-24 h-fit space-y-6">Editorial Narrative</div>\n  <div className="lg:col-span-7 space-y-12">Scrolling Visual Gallery</div>\n</div>`;
      case 'spatial-canvas':
        return `<div className="relative w-full h-screen overflow-hidden bg-[#FAF9F6]">\n  {/* Infinite Node Canvas */}\n  <div className="absolute inset-0">Canvas Nodes</div>\n  {/* Floating Dock */}\n  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur border border-[#D9D6CF] shadow-lg">Floating Actions</div>\n</div>`;
    }
  }, [grammarId, containerWidth, cols, gapPx]);

  const copyToClipboard = async (text: string, format: 'tailwind' | 'css') => {
    const copied = await copyText(text);
    setCopiedFormat(copied ? format : null);
    if (copied) setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D6CF] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
              Tool 06 · Structural Grammar
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#E7EBFF] text-[#2547E8]">
              Client-Side · Zero Login
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111217] mt-1">
            Layout Composer
          </h1>
          <p className="text-sm text-[#62666F] mt-1">
            Adjust container and grid settings, inspect a responsive wireframe preview, and copy a
            CSS or Tailwind layout snippet.
          </p>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => copyToClipboard(generatedTailwind, 'tailwind')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2547E8] text-white text-xs font-semibold hover:bg-[#1E3CCD] transition-all shadow-sm"
          >
            {copiedFormat === 'tailwind' ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>Copy Layout Snippet</span>
          </button>
        </div>
      </div>

      <CopyFailureNotice failed={copyFailed} />

      {/* Grammar Presets */}
      <div className="space-y-2">
        <span className="block font-mono text-xs font-semibold uppercase text-[var(--text-muted)]">
          Architectural Grammars
        </span>
        <div className="flex flex-wrap gap-2">
          {LAYOUT_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectGrammar(p)}
              aria-pressed={grammarId === p.id}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                grammarId === p.id
                  ? 'border-[#111217] bg-[#111217] text-white shadow-sm'
                  : 'border-[#D9D6CF] bg-white text-[#62666F] hover:text-[#111217] hover:border-[#62666F]'
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
              <h2 className="text-sm font-semibold text-[#111217]">Container & Grid Settings</h2>
            </div>
            <button
              type="button"
              onClick={resetLayout}
              className="text-xs font-mono text-[var(--text-muted)] hover:text-[#111217] flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Container Max Width */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#111217]">
              Max Container Bounds
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['1024px', '1280px', '1440px', '100%'] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setContainerWidth(w)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-mono font-medium transition-all ${
                    containerWidth === w
                      ? 'border-[#2547E8] bg-[#E7EBFF] text-[#2547E8] font-bold'
                      : 'border-[#D9D6CF] text-[#62666F] hover:text-[#111217]'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Columns */}
          <div className="space-y-2 pt-2 border-t border-[#D9D6CF]">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-[#111217]">Grid Columns (Desktop)</span>
              <span className="font-mono text-[#62666F]">{cols} cols</span>
            </div>
            <input
              aria-label="Grid columns"
              type="range"
              min="2"
              max="16"
              step="1"
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="w-full accent-[#2547E8] cursor-pointer"
            />
          </div>

          {/* Gutter / Gap */}
          <div className="space-y-2 pt-2 border-t border-[#D9D6CF]">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-[#111217]">Gutter Pitch (Gap)</span>
              <span className="font-mono text-[#62666F]">{gapPx}px</span>
            </div>
            <input
              aria-label="Grid gap"
              type="range"
              min="8"
              max="48"
              step="4"
              value={gapPx}
              onChange={(e) => setGapPx(Number(e.target.value))}
              className="w-full accent-[#2547E8] cursor-pointer"
            />
          </div>
        </div>

        {/* Live Simulation Stage Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Viewport Width Simulator Switcher */}
          <div className="flex items-center justify-between pb-2 border-b border-[#D9D6CF]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--text-muted)]">WIREFRAME PREVIEW</span>
              <span className="text-xs font-bold text-[#111217]">{activePreset.name}</span>
            </div>

            <div className="flex items-center gap-1 bg-white border border-[#D9D6CF] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                aria-label="Mobile preview (375px)"
                aria-pressed={viewport === 'mobile'}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                  viewport === 'mobile'
                    ? 'bg-[#111217] text-white'
                    : 'text-[#62666F] hover:text-[#111217]'
                }`}
                title="Mobile (375px)"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-[11px]">375px</span>
              </button>
              <button
                type="button"
                onClick={() => setViewport('tablet')}
                aria-label="Tablet preview (768px)"
                aria-pressed={viewport === 'tablet'}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                  viewport === 'tablet'
                    ? 'bg-[#111217] text-white'
                    : 'text-[#62666F] hover:text-[#111217]'
                }`}
                title="Tablet (768px)"
              >
                <Tablet className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-[11px]">768px</span>
              </button>
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                aria-label="Desktop preview (1440px)"
                aria-pressed={viewport === 'desktop'}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                  viewport === 'desktop'
                    ? 'bg-[#111217] text-white'
                    : 'text-[#62666F] hover:text-[#111217]'
                }`}
                title="Desktop (1440px)"
              >
                <Monitor className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-[11px]">1440px</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            Schematic preview for comparing layout options; it does not run or test a generated
            page.
          </p>

          {/* Wireframe Stage Container */}
          <div className="rounded-2xl border border-[#D9D6CF] bg-[#FAF9F6] p-4 flex justify-center shadow-sm overflow-hidden min-h-[380px]">
            <div
              className="bg-white border border-[#D9D6CF] rounded-xl shadow-inner p-4 transition-all duration-300 w-full flex flex-col justify-between"
              style={{
                maxWidth:
                  viewport === 'mobile'
                    ? '375px'
                    : viewport === 'tablet'
                      ? '640px'
                      : containerWidth,
              }}
            >
              {grammarId === 'standard-sidebar' && (
                <div className="flex gap-3 h-64">
                  {viewport !== 'mobile' && (
                    <div className="w-36 rounded-lg bg-[#FAF9F6] border border-[#D9D6CF] p-2 space-y-2 text-[10px] font-mono text-[var(--text-muted)]">
                      <div className="h-4 w-16 bg-[#2547E8] rounded" />
                      <div className="h-2 w-20 bg-[#D9D6CF] rounded" />
                      <div className="h-2 w-24 bg-[#D9D6CF] rounded" />
                      <div className="h-2 w-16 bg-[#D9D6CF] rounded" />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="h-8 rounded-lg bg-[#FAF9F6] border border-[#D9D6CF] px-3 flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                      <span>Top Bar Navigation</span>
                      <div className="h-4 w-12 bg-[#2547E8] rounded" />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-[#FAF9F6] border border-[#D9D6CF] p-3 space-y-2">
                        <div className="h-3 w-16 bg-[#111217] rounded" />
                        <div className="h-10 bg-white border border-[#D9D6CF] rounded" />
                      </div>
                      <div className="rounded-lg bg-[#FAF9F6] border border-[#D9D6CF] p-3 space-y-2">
                        <div className="h-3 w-16 bg-[#111217] rounded" />
                        <div className="h-10 bg-white border border-[#D9D6CF] rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {grammarId === 'three-pane-cockpit' && (
                <div className="flex gap-3 h-64 text-[10px] font-mono text-[var(--text-muted)]">
                  {viewport === 'desktop' && (
                    <div className="w-28 rounded-lg bg-[#0E1015] border border-[#272B33] p-2 space-y-1.5 text-white">
                      <span>TREE</span>
                      <div className="h-2 w-full bg-[#272B33] rounded" />
                      <div className="h-2 w-3/4 bg-[#272B33] rounded" />
                    </div>
                  )}
                  <div className="flex-1 rounded-lg bg-[#11141A] border border-[#272B33] p-3 flex flex-col justify-between text-white">
                    <span>CANVAS (CENTER)</span>
                    <div className="h-20 bg-[#171B22] rounded border border-[#272B33] flex items-center justify-center text-xs text-[#6782FF]">
                      Live Work Surface
                    </div>
                  </div>
                  {viewport !== 'mobile' && (
                    <div className="w-36 rounded-lg bg-[#0E1015] border border-[#272B33] p-2 space-y-1.5 text-white">
                      <span>INSPECTOR</span>
                      <div className="h-2 w-full bg-[#272B33] rounded" />
                      <div className="h-2 w-2/3 bg-[#272B33] rounded" />
                    </div>
                  )}
                </div>
              )}

              {grammarId === 'bento-modular' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 h-64 text-[10px] font-mono">
                  <div className="col-span-2 row-span-2 rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] p-3 flex flex-col justify-between">
                    <span className="font-bold text-[#111217]">HERO FEATURE (2x2)</span>
                    <div className="h-16 rounded bg-white border border-[#D9D6CF]" />
                  </div>
                  <div className="col-span-2 rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] p-3 flex flex-col justify-between">
                    <span className="font-bold text-[#111217]">METRIC TELEMETRY (2x1)</span>
                    <div className="h-8 rounded bg-white border border-[#D9D6CF]" />
                  </div>
                  <div className="col-span-1 rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] p-2 flex items-center justify-center font-bold text-[#2547E8]">
                    1x1
                  </div>
                  <div className="col-span-1 rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] p-2 flex items-center justify-center font-bold text-[#12603F]">
                    1x1
                  </div>
                </div>
              )}

              {grammarId === 'editorial-split' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-64 text-[10px]">
                  <div className="rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] p-4 space-y-2">
                    <span className="font-mono text-[var(--text-muted)]">STICKY THESIS</span>
                    <div className="h-5 w-3/4 rounded bg-[#111217]" />
                    <div className="h-2 w-full rounded bg-[#D9D6CF]" />
                    <div className="h-2 w-4/5 rounded bg-[#D9D6CF]" />
                  </div>
                  <div className="rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] p-4 space-y-3 overflow-y-auto">
                    <span className="font-mono text-[var(--text-muted)]">SCROLLING ARTIFACTS</span>
                    <div className="h-16 rounded bg-white border border-[#D9D6CF]" />
                    <div className="h-16 rounded bg-white border border-[#D9D6CF]" />
                  </div>
                </div>
              )}

              {grammarId === 'spatial-canvas' && (
                <div className="relative h-64 rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] overflow-hidden p-4 flex items-center justify-center">
                  <div className="absolute top-2 left-2 px-2 py-1 rounded bg-white border border-[#D9D6CF] text-[9px] font-mono">
                    HUD TOP-LEFT
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-[#2547E8] shadow-md font-mono text-xs text-[#2547E8] font-semibold">
                    Node Focus #104
                  </div>
                  <div className="absolute bottom-2 px-4 py-1.5 rounded-full bg-[#111217] text-white text-[10px] font-mono shadow-lg">
                    Floating Tool Dock
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
