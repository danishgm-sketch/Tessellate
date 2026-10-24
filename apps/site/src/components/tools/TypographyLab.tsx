import React, { useState, useMemo } from 'react';
import { Copy, Check, RotateCcw, Sliders } from 'lucide-react';
import { CopyFailureNotice, useToolClipboard } from './useToolClipboard';

interface TypeScaleOption {
  id: string;
  name: string;
  ratio: number;
  description: string;
}

const TYPE_SCALES: TypeScaleOption[] = [
  {
    id: 'major-second',
    name: 'Major Second',
    ratio: 1.125,
    description: 'Compact hierarchy for information-dense interfaces.',
  },
  {
    id: 'minor-third',
    name: 'Minor Third',
    ratio: 1.2,
    description: 'Balanced and clean standard for modern SaaS product interfaces.',
  },
  {
    id: 'major-third',
    name: 'Major Third',
    ratio: 1.25,
    description: 'Expressive and clear, distinct hierarchy between headings and body.',
  },
  {
    id: 'perfect-fourth',
    name: 'Perfect Fourth',
    ratio: 1.333,
    description: 'Editorial and authorial, generous contrast between levels.',
  },
  {
    id: 'golden-ratio',
    name: 'Golden Ratio',
    ratio: 1.618,
    description: 'High dramatic contrast for hero landing narratives and marketing.',
  },
];

interface TypePairingPreset {
  id: string;
  name: string;
  headingFamily: string;
  bodyFamily: string;
  monoFamily: string;
  description: string;
}

const PAIRING_PRESETS: TypePairingPreset[] = [
  {
    id: 'geist-modern',
    name: 'Geist & System Mono',
    headingFamily: 'Geist, Inter, system-ui, sans-serif',
    bodyFamily: 'Geist, Inter, system-ui, sans-serif',
    monoFamily: 'Geist Mono, JetBrains Mono, monospace',
    description: 'Precision engineering grotesque with geometric optical balance.',
  },
  {
    id: 'editorial-serif',
    name: 'Newsreader Editorial & Inter',
    headingFamily: 'Newsreader, Georgia, serif',
    bodyFamily: 'Inter, system-ui, sans-serif',
    monoFamily: 'JetBrains Mono, monospace',
    description: 'Bespoke authorial voice with warm literary serif display titles.',
  },
  {
    id: 'command-mono',
    name: 'JetBrains Mono & Sans',
    headingFamily: 'JetBrains Mono, monospace',
    bodyFamily: 'Inter, system-ui, sans-serif',
    monoFamily: 'JetBrains Mono, monospace',
    description: 'Terminal-first technical platform typography for CLI & developer tools.',
  },
];

const NUMBER_SAMPLE_ROWS = [
  { id: 'A-1024', value: '1,420.89', change: '+12.4%', elapsed: '00:14.02' },
  { id: 'B-0318', value: '84.50', change: '-0.8%', elapsed: '00:08.90' },
  { id: 'C-7750', value: '12,000.00', change: '+104.2%', elapsed: '01:42.15' },
  { id: 'D-4402', value: '905.10', change: '+0.0%', elapsed: '00:00.45' },
];

const DESKTOP_TYPE_SCALE_WIDTH = 1440;

function fluidTypeSize(maximumSizePx: number, minimumSizePx: number): string {
  if (maximumSizePx <= minimumSizePx) return `${maximumSizePx}px`;
  const fluidWidth = `${((maximumSizePx / DESKTOP_TYPE_SCALE_WIDTH) * 100).toFixed(2)}vw`;
  return `clamp(${minimumSizePx}px, ${fluidWidth}, ${maximumSizePx}px)`;
}

export function TypographyLab() {
  const [selectedScaleId, setSelectedScaleId] = useState<string>('minor-third');
  const [selectedPairingId, setSelectedPairingId] = useState<string>('geist-modern');
  const [baseSizePx, setBaseSizePx] = useState<number>(16);
  const [useTabularNums, setUseTabularNums] = useState<boolean>(true);
  const [useSlashedZero, setUseSlashedZero] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'numerical'>('hierarchy');
  const [copiedFormat, setCopiedFormat] = useState<'css' | 'tailwind' | null>(null);
  const { copyText, copyFailed } = useToolClipboard();

  const activeScale = useMemo(() => {
    return TYPE_SCALES.find((s) => s.id === selectedScaleId) ?? TYPE_SCALES[1]!;
  }, [selectedScaleId]);

  const activePairing = useMemo(() => {
    return PAIRING_PRESETS.find((p) => p.id === selectedPairingId) ?? PAIRING_PRESETS[0]!;
  }, [selectedPairingId]);

  // Compute scale steps (H1 down to Caption)
  const steps = useMemo(() => {
    const r = activeScale.ratio;
    const b = baseSizePx;
    return {
      h1: Math.round(b * Math.pow(r, 4)),
      h2: Math.round(b * Math.pow(r, 3)),
      h3: Math.round(b * Math.pow(r, 2)),
      h4: Math.round(b * r),
      body: b,
      small: Math.round(b / r),
      micro: Math.round(b / Math.pow(r, 2)),
    };
  }, [activeScale, baseSizePx]);

  const fontVariantNumeric = useMemo(() => {
    const parts = [];
    if (useTabularNums) parts.push('tabular-nums');
    if (useSlashedZero) parts.push('slashed-zero');
    return parts.length > 0 ? parts.join(' ') : 'normal';
  }, [useTabularNums, useSlashedZero]);

  const generatedCss = useMemo(() => {
    return `/* Tessellate Type Scale: ${activeScale.name} (${activeScale.ratio}) */\n:root {\n  --font-heading: ${activePairing.headingFamily};\n  --font-body: ${activePairing.bodyFamily};\n  --font-mono: ${activePairing.monoFamily};\n  --font-numeric: ${fontVariantNumeric};\n\n  --font-size-h1: ${fluidTypeSize(steps.h1, 36)};\n  --font-size-h2: ${fluidTypeSize(steps.h2, 30)};\n  --font-size-h3: ${fluidTypeSize(steps.h3, 24)};\n  --font-size-h4: ${fluidTypeSize(steps.h4, 20)};\n  --font-size-body: ${steps.body}px;\n  --font-size-small: ${steps.small}px;\n}`;
  }, [activeScale, activePairing, fontVariantNumeric, steps]);

  const copyToClipboard = async (text: string, format: 'css' | 'tailwind') => {
    const copied = await copyText(text);
    setCopiedFormat(copied ? format : null);
    if (copied) setTimeout(() => setCopiedFormat(null), 2000);
  };

  const resetTypography = () => {
    setSelectedScaleId('minor-third');
    setSelectedPairingId('geist-modern');
    setBaseSizePx(16);
    setUseTabularNums(true);
    setUseSlashedZero(true);
    setActiveTab('hierarchy');
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D6CF] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
              Tool 05 · Typographic Hierarchy
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#E7EBFF] text-[#2547E8]">
              Client-Side · Zero Login
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111217] mt-1">
            Typography Lab
          </h1>
          <p className="text-sm text-[#62666F] mt-1">
            Compare type scales and font pairings, then test how tabular figures affect number
            alignment.
          </p>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => copyToClipboard(generatedCss, 'css')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2547E8] text-white text-xs font-semibold hover:bg-[#1E3CCD] transition-all shadow-sm"
          >
            {copiedFormat === 'css' ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>Copy Scale CSS</span>
          </button>
        </div>
      </div>

      <CopyFailureNotice failed={copyFailed} />

      {/* Main Grid: Parameters (Left 5) & Stage (Right 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6 rounded-2xl border border-[#D9D6CF] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#2547E8]" />
              <h2 className="text-sm font-semibold text-[#111217]">Scale & Pairing Controls</h2>
            </div>
            <button
              type="button"
              onClick={resetTypography}
              className="text-xs font-mono text-[var(--text-muted)] hover:text-[#111217] flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Type Scale Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#111217]">
              Musical Scale Ratio
            </label>
            <div className="space-y-1.5">
              {TYPE_SCALES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedScaleId(s.id)}
                  aria-pressed={selectedScaleId === s.id}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                    selectedScaleId === s.id
                      ? 'border-[#2547E8] bg-[#E7EBFF] text-[#2547E8] font-semibold'
                      : 'border-[#D9D6CF] text-[#62666F] hover:text-[#111217] bg-[#FAF9F6]'
                  }`}
                >
                  <span>{s.name}</span>
                  <span className="font-mono text-[11px] font-bold">{s.ratio}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Base Font Size Slider */}
          <div className="space-y-2 pt-2 border-t border-[#D9D6CF]">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-[#111217]">Base Body Size</span>
              <span className="font-mono text-[#62666F]">{baseSizePx}px</span>
            </div>
            <input
              aria-label="Base body size"
              type="range"
              min="14"
              max="20"
              step="1"
              value={baseSizePx}
              onChange={(e) => setBaseSizePx(Number(e.target.value))}
              className="w-full accent-[#2547E8] cursor-pointer"
            />
          </div>

          {/* Typeface Pairing Presets */}
          <div className="space-y-2 pt-2 border-t border-[#D9D6CF]">
            <label className="block text-xs font-semibold text-[#111217]">
              Typeface Pairing Archetype
            </label>
            <div className="space-y-1.5">
              {PAIRING_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPairingId(p.id)}
                  aria-pressed={selectedPairingId === p.id}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                    selectedPairingId === p.id
                      ? 'border-[#111217] bg-[#111217] text-white shadow-sm'
                      : 'border-[#D9D6CF] text-[#62666F] hover:text-[#111217] bg-[#FAF9F6]'
                  }`}
                >
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-[10px] mt-0.5 line-clamp-1">{p.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Numerical & OpenType Features */}
          <div className="space-y-3 pt-2 border-t border-[#D9D6CF]">
            <label className="block text-xs font-semibold text-[#111217]">
              OpenType Numerical Features
            </label>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[#111217]">
                <input
                  aria-label="Use tabular nums"
                  type="checkbox"
                  checked={useTabularNums}
                  onChange={(e) => setUseTabularNums(e.target.checked)}
                  className="accent-[#2547E8] rounded"
                />
                <span>Tabular Figures (Mono-width align)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[#111217]">
                <input
                  aria-label="Use slashed zero"
                  type="checkbox"
                  checked={useSlashedZero}
                  onChange={(e) => setUseSlashedZero(e.target.checked)}
                  className="accent-[#2547E8] rounded"
                />
                <span>Slashed Zero (0 vs O distinction)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Live Stage Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* View Tab Switcher */}
          <div className="flex p-1 rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('hierarchy')}
              aria-pressed={activeTab === 'hierarchy'}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'hierarchy' ? 'bg-[#111217] text-white shadow-sm' : 'text-[#62666F]'
              }`}
            >
              Hierarchical Scale Ladder
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('numerical')}
              aria-pressed={activeTab === 'numerical'}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'numerical' ? 'bg-[#111217] text-white shadow-sm' : 'text-[#62666F]'
              }`}
            >
              Tabular Figure Sample
            </button>
          </div>

          {/* Stage View Content */}
          <div
            className="rounded-2xl border border-[#D9D6CF] bg-[#FAF9F6] p-6 shadow-sm min-h-[420px]"
            style={{ fontVariantNumeric }}
          >
            {activeTab === 'hierarchy' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#D9D6CF] text-xs font-mono text-[var(--text-muted)]">
                  <span>SCALE STEP</span>
                  <span>MAXIMUM SIZE</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <h1
                      className="font-bold tracking-tight text-[#111217] leading-tight"
                      style={{
                        fontFamily: activePairing.headingFamily,
                        fontSize: fluidTypeSize(steps.h1, 36),
                      }}
                    >
                      A product, shaped by people.
                    </h1>
                    <span className="font-mono text-xs text-[var(--text-muted)] shrink-0">
                      {steps.h1}px max
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between gap-4">
                    <h2
                      className="font-semibold tracking-tight text-[#111217]"
                      style={{
                        fontFamily: activePairing.headingFamily,
                        fontSize: fluidTypeSize(steps.h2, 30),
                      }}
                    >
                      Workspace activity
                    </h2>
                    <span className="font-mono text-xs text-[var(--text-muted)] shrink-0">
                      {steps.h2}px max
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between gap-4">
                    <h3
                      className="font-semibold text-[#111217]"
                      style={{
                        fontFamily: activePairing.headingFamily,
                        fontSize: fluidTypeSize(steps.h3, 24),
                      }}
                    >
                      Recent updates
                    </h3>
                    <span className="font-mono text-xs text-[var(--text-muted)] shrink-0">
                      {steps.h3}px max
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between gap-4">
                    <p
                      className="text-[#62666F] leading-relaxed max-w-lg"
                      style={{
                        fontFamily: activePairing.bodyFamily,
                        fontSize: `${steps.body}px`,
                      }}
                    >
                      Clear type sizes help people scan information and understand how each part of
                      a page fits together.
                    </p>
                    <span className="font-mono text-xs text-[var(--text-muted)] shrink-0">
                      {steps.body}px
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between gap-4">
                    <span
                      className="font-mono uppercase text-[var(--text-muted)] font-semibold"
                      style={{ fontSize: `${steps.small}px` }}
                    >
                      Compact metadata · Example status
                    </span>
                    <span className="font-mono text-xs text-[var(--text-muted)] shrink-0">
                      {steps.small}px
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#D9D6CF] text-xs font-mono text-[var(--text-muted)]">
                  <span>ILLUSTRATIVE NUMBER SAMPLE</span>
                  <span>{fontVariantNumeric.toUpperCase()}</span>
                </div>

                <p className="text-xs text-[#62666F]">
                  Illustrative sample data for comparing numeral alignment; these values are not
                  live metrics.
                </p>

                <div className="rounded-xl border border-[#D9D6CF] bg-white overflow-hidden shadow-sm">
                  <table
                    aria-label="Illustrative numeric sample records"
                    className="hidden w-full text-xs text-left sm:table"
                  >
                    <caption className="sr-only">
                      Illustrative numeric sample records for checking number alignment.
                    </caption>
                    <thead className="bg-[#FAF9F6] border-b border-[#D9D6CF] text-[#62666F] font-mono text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">RECORD ID</th>
                        <th className="py-2.5 px-4 font-semibold text-right">VALUE</th>
                        <th className="py-2.5 px-4 font-semibold text-right">CHANGE</th>
                        <th className="py-2.5 px-4 font-semibold text-right">ELAPSED</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D9D6CF] font-medium text-[#111217]">
                      {NUMBER_SAMPLE_ROWS.map((row) => (
                        <tr key={row.id} className="hover:bg-[#FAF9F6]">
                          <td className="py-2.5 px-4 font-mono text-[var(--text-muted)]">
                            {row.id}
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold">{row.value}</td>
                          <td
                            className={`py-2.5 px-4 text-right ${row.change.startsWith('-') ? 'text-[#9B2C2C]' : 'text-[#12603F]'}`}
                          >
                            {row.change}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-[#62666F]">
                            {row.elapsed}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div
                    role="list"
                    aria-label="Illustrative numeric sample records"
                    className="space-y-2 p-3 sm:hidden"
                  >
                    {NUMBER_SAMPLE_ROWS.map((row) => (
                      <div
                        key={row.id}
                        role="listitem"
                        className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg border border-[#D9D6CF] p-3"
                      >
                        <div>
                          <div className="font-mono text-[10px] uppercase text-[#62666F]">
                            Record ID
                          </div>
                          <div className="font-mono text-xs text-[#111217]">{row.id}</div>
                        </div>
                        <div>
                          <div className="font-mono text-[10px] uppercase text-[#62666F]">
                            Value
                          </div>
                          <div className="font-mono text-xs font-bold text-[#111217]">
                            {row.value}
                          </div>
                        </div>
                        <div>
                          <div className="font-mono text-[10px] uppercase text-[#62666F]">
                            Change
                          </div>
                          <div
                            className={`font-mono text-xs ${row.change.startsWith('-') ? 'text-[#9B2C2C]' : 'text-[#12603F]'}`}
                          >
                            {row.change}
                          </div>
                        </div>
                        <div>
                          <div className="font-mono text-[10px] uppercase text-[#62666F]">
                            Elapsed
                          </div>
                          <div className="font-mono text-xs text-[#62666F]">{row.elapsed}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[#62666F]">
                  Tabular figures give digits a consistent width when the selected font supports
                  them.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
