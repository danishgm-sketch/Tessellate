import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  ShieldCheck,
  RotateCcw,
  Sliders,
} from 'lucide-react';

export interface SemanticPaletteTokens {
  canvas: string;
  surface: string;
  surfaceRaised: string;
  hairline: string;
  hairlineStrong: string;
  ink: string;
  inkSecondary: string;
  inkMuted: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  success: string;
  warning: string;
  danger: string;
}

interface PaletteThemePreset {
  id: string;
  name: string;
  category: string;
  tokens: SemanticPaletteTokens;
  description: string;
}

const THEME_PRESETS: PaletteThemePreset[] = [
  {
    id: 'zinc-editorial',
    name: 'Zinc Editorial (Tessellate Default)',
    category: 'Editorial',
    description: 'Calm architectural warm paper canvas with crisp ink and electric cobalt accent.',
    tokens: {
      canvas: '#F4F2ED',
      surface: '#FAF9F6',
      surfaceRaised: '#FFFFFF',
      hairline: '#D9D6CF',
      hairlineStrong: '#C7C3BA',
      ink: '#111217',
      inkSecondary: '#62666F',
      inkMuted: '#62666F',
      accent: '#2547E8',
      accentHover: '#1E3CCD',
      accentSoft: '#E7EBFF',
      success: '#177B55',
      warning: '#A66A15',
      danger: '#C83D48',
    },
  },
  {
    id: 'deep-command',
    name: 'Deep Future Command (Dark Studio)',
    category: 'Technical',
    description: 'High-contrast midnight studio canvas with luminous cobalt and phosphor neon highlights.',
    tokens: {
      canvas: '#0B0D10',
      surface: '#11141A',
      surfaceRaised: '#171B22',
      hairline: '#272C34',
      hairlineStrong: '#3B424E',
      ink: '#F5F7FA',
      inkSecondary: '#A8AFBA',
      inkMuted: '#68707C',
      accent: '#6782FF',
      accentHover: '#879DFF',
      accentSoft: '#182038',
      success: '#2BD98F',
      warning: '#F5A623',
      danger: '#FF5C67',
    },
  },
  {
    id: 'parchment-humanist',
    name: 'Warm Parchment & Espresso',
    category: 'Warm / Luxury',
    description: 'Bespoke literary warmth for luxury commerce, hospitality, and editorial publishing.',
    tokens: {
      canvas: '#F7F4EE',
      surface: '#FFFDF9',
      surfaceRaised: '#FFFFFF',
      hairline: '#E5DFD3',
      hairlineStrong: '#D1C8B6',
      ink: '#2B231D',
      inkSecondary: '#70645A',
      inkMuted: '#9E9185',
      accent: '#B86236',
      accentHover: '#9E5028',
      accentSoft: '#FBECE3',
      success: '#2E7D5B',
      warning: '#B37D22',
      danger: '#BD3A3A',
    },
  },
  {
    id: 'fintech-slate',
    name: 'Slate Institutional',
    category: 'Fintech / Security',
    description: 'Objective, regulatory-grade cool slate and emerald security indicators.',
    tokens: {
      canvas: '#F1F5F9',
      surface: '#F8FAFC',
      surfaceRaised: '#FFFFFF',
      hairline: '#CBD5E1',
      hairlineStrong: '#94A3B8',
      ink: '#0F172A',
      inkSecondary: '#475569',
      inkMuted: '#64748B',
      accent: '#0284C7',
      accentHover: '#0369A1',
      accentSoft: '#E0F2FE',
      success: '#059669',
      warning: '#D97706',
      danger: '#DC2626',
    },
  },
  {
    id: 'pure-contrast',
    name: 'Pure Monochrome High Contrast',
    category: 'Accessible / Minimal',
    description: 'Uncompromising 18:1+ contrast floor adhering strictly to WCAG 2.2 AAA guidelines.',
    tokens: {
      canvas: '#FFFFFF',
      surface: '#FFFFFF',
      surfaceRaised: '#F5F5F5',
      hairline: '#737373',
      hairlineStrong: '#171717',
      ink: '#000000',
      inkSecondary: '#404040',
      inkMuted: '#525252',
      accent: '#0000EE',
      accentHover: '#0000AA',
      accentSoft: '#EEEEFF',
      success: '#006600',
      warning: '#885500',
      danger: '#CC0000',
    },
  },
];

// Calculate Relative Luminance per WCAG 2.2 formula
function getLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return 0.5;
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return (a[0] ?? 0) * 0.2126 + (a[1] ?? 0) * 0.7152 + (a[2] ?? 0) * 0.0722;
}

// Calculate WCAG Contrast Ratio between two hex colors
function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function PaletteStudio() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('zinc-editorial');
  const [tokens, setTokens] = useState<SemanticPaletteTokens>({ ...THEME_PRESETS[0]!.tokens });
  const [copiedFormat, setCopiedFormat] = useState<'css' | 'tailwind' | 'json' | null>(null);

  const applyPreset = (p: PaletteThemePreset) => {
    setSelectedPresetId(p.id);
    setTokens({ ...p.tokens });
  };

  const updateToken = (key: keyof SemanticPaletteTokens, value: string) => {
    setTokens((prev) => ({ ...prev, [key]: value }));
  };

  // Contrast calculations
  const contrastInkOnCanvas = useMemo(() => getContrastRatio(tokens.ink, tokens.canvas), [tokens]);
  const contrastSecondaryOnSurface = useMemo(() => getContrastRatio(tokens.inkSecondary, tokens.surface), [tokens]);
  const contrastAccentOnCanvas = useMemo(() => getContrastRatio(tokens.accent, tokens.canvas), [tokens]);
  const contrastWhiteOnAccent = useMemo(() => getContrastRatio('#FFFFFF', tokens.accent), [tokens]);

  // CSS variables output
  const generatedCss = useMemo(() => {
    return `:root {\n  --tess-canvas: ${tokens.canvas};\n  --tess-surface: ${tokens.surface};\n  --tess-surface-raised: ${tokens.surfaceRaised};\n  --tess-hairline: ${tokens.hairline};\n  --tess-hairline-strong: ${tokens.hairlineStrong};\n  --tess-ink: ${tokens.ink};\n  --tess-ink-secondary: ${tokens.inkSecondary};\n  --tess-ink-muted: ${tokens.inkMuted};\n  --tess-accent: ${tokens.accent};\n  --tess-accent-hover: ${tokens.accentHover};\n  --tess-accent-soft: ${tokens.accentSoft};\n  --tess-success: ${tokens.success};\n  --tess-warning: ${tokens.warning};\n  --tess-danger: ${tokens.danger};\n}`;
  }, [tokens]);

  // Tailwind configuration snippet
  const generatedTailwind = useMemo(() => {
    return `@theme {\n  --color-canvas: ${tokens.canvas};\n  --color-surface: ${tokens.surface};\n  --color-surface-raised: ${tokens.surfaceRaised};\n  --color-hairline: ${tokens.hairline};\n  --color-ink: ${tokens.ink};\n  --color-ink-secondary: ${tokens.inkSecondary};\n  --color-accent: ${tokens.accent};\n}`;
  }, [tokens]);

  const copyToClipboard = (text: string, format: 'css' | 'tailwind' | 'json') => {
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
              Tool 04 · Chroma Architecture
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#E7EBFF] text-[#2547E8]">
              Client-Side · Zero Login
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111217] mt-1">
            Palette Studio
          </h1>
          <p className="text-sm text-[#62666F] mt-1">
            Synthesize semantic, accessible palette tokens with live WCAG 2.2 contrast validation.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => copyToClipboard(generatedCss, 'css')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D9D6CF] bg-white text-xs font-semibold text-[#111217] hover:border-[#111217] transition-all"
          >
            {copiedFormat === 'css' ? <Check className="h-3.5 w-3.5 text-[#12603F]" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy CSS Variables</span>
          </button>
          <button
            type="button"
            onClick={() => copyToClipboard(generatedTailwind, 'tailwind')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2547E8] text-white text-xs font-semibold hover:bg-[#1E3CCD] transition-all shadow-sm"
          >
            {copiedFormat === 'tailwind' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy Tailwind @theme</span>
          </button>
        </div>
      </div>

      {/* Theme Presets */}
      <div className="space-y-2">
        <span className="block font-mono text-xs font-semibold uppercase text-[var(--text-muted)]">
          Calibrated Theme Archetypes
        </span>
        <div className="flex flex-wrap gap-2">
          {THEME_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                selectedPresetId === p.id
                  ? 'border-[#111217] bg-[#111217] text-white shadow-sm'
                  : 'border-[#D9D6CF] bg-white text-[#62666F] hover:text-[#111217] hover:border-[#8B8F97]'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Token Inputs (Left 5) & Contrast + Live Mockup (Right 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Token Config Column */}
        <div className="lg:col-span-5 space-y-5 rounded-2xl border border-[#D9D6CF] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#2547E8]" />
              <h2 className="text-sm font-semibold text-[#111217]">Semantic Token Roles</h2>
            </div>
            <button
              type="button"
              onClick={() => applyPreset(THEME_PRESETS[0]!)}
              className="text-xs font-mono text-[var(--text-muted)] hover:text-[#111217] flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Group 1: Surfaces & Canvases */}
          <div className="space-y-2">
            <span className="block font-mono text-[11px] font-semibold uppercase text-[var(--text-muted)]">
              Surfaces & Canvases
            </span>
            <div className="space-y-2">
              {(['canvas', 'surface', 'surfaceRaised'] as const).map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#111217] capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <div className="flex items-center gap-2">
                    <input aria-label={`${key} colour picker`}
                      type="color"
                      value={tokens[key]}
                      onChange={(e) => updateToken(key, e.target.value)}
                      className="h-6 w-6 rounded cursor-pointer border border-[#D9D6CF]"
                    />
                    <input aria-label={`${key} hex value`}
                      type="text"
                      value={tokens[key]}
                      onChange={(e) => updateToken(key, e.target.value)}
                      className="w-24 font-mono text-xs uppercase px-2 py-1 rounded border border-[#D9D6CF] bg-[#FAF9F6]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group 2: Typography & Inks */}
          <div className="space-y-2 pt-2 border-t border-[#D9D6CF]">
            <span className="block font-mono text-[11px] font-semibold uppercase text-[var(--text-muted)]">
              Typography & Inks
            </span>
            <div className="space-y-2">
              {(['ink', 'inkSecondary', 'inkMuted'] as const).map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#111217] capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <div className="flex items-center gap-2">
                    <input aria-label={`${key} colour picker`}
                      type="color"
                      value={tokens[key]}
                      onChange={(e) => updateToken(key, e.target.value)}
                      className="h-6 w-6 rounded cursor-pointer border border-[#D9D6CF]"
                    />
                    <input aria-label={`${key} hex value`}
                      type="text"
                      value={tokens[key]}
                      onChange={(e) => updateToken(key, e.target.value)}
                      className="w-24 font-mono text-xs uppercase px-2 py-1 rounded border border-[#D9D6CF] bg-[#FAF9F6]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group 3: Accents & Borders */}
          <div className="space-y-2 pt-2 border-t border-[#D9D6CF]">
            <span className="block font-mono text-[11px] font-semibold uppercase text-[var(--text-muted)]">
              Accents & Structural Borders
            </span>
            <div className="space-y-2">
              {(['accent', 'hairline', 'hairlineStrong'] as const).map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#111217] capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <div className="flex items-center gap-2">
                    <input aria-label={`${key} colour picker`}
                      type="color"
                      value={tokens[key]}
                      onChange={(e) => updateToken(key, e.target.value)}
                      className="h-6 w-6 rounded cursor-pointer border border-[#D9D6CF]"
                    />
                    <input aria-label={`${key} hex value`}
                      type="text"
                      value={tokens[key]}
                      onChange={(e) => updateToken(key, e.target.value)}
                      className="w-24 font-mono text-xs uppercase px-2 py-1 rounded border border-[#D9D6CF] bg-[#FAF9F6]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Stage & Contrast Audit Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Contrast Health Matrix */}
          <div className="rounded-2xl border border-[#D9D6CF] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9D6CF]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#12603F]" />
                <h3 className="text-sm font-semibold text-[#111217]">
                  WCAG 2.2 Contrast Floor Audit
                </h3>
              </div>
              <span className="font-mono text-[11px] text-[#62666F]">
                Target: 4.5:1 (AA) / 7.0:1 (AAA)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] space-y-1">
                <span className="block text-[10px] font-mono text-[var(--text-muted)]">Ink / Canvas</span>
                <span className="text-base font-bold text-[#111217]">
                  {contrastInkOnCanvas.toFixed(1)}:1
                </span>
                <span className={`block text-[10px] font-mono font-semibold ${contrastInkOnCanvas >= 4.5 ? 'text-[#12603F]' : 'text-[#C83D48]'}`}>
                  {contrastInkOnCanvas >= 7 ? 'AAA PASS' : contrastInkOnCanvas >= 4.5 ? 'AA PASS' : 'FAIL'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] space-y-1">
                <span className="block text-[10px] font-mono text-[var(--text-muted)]">Ink-Sec / Surface</span>
                <span className="text-base font-bold text-[#111217]">
                  {contrastSecondaryOnSurface.toFixed(1)}:1
                </span>
                <span className={`block text-[10px] font-mono font-semibold ${contrastSecondaryOnSurface >= 4.5 ? 'text-[#12603F]' : 'text-[#C83D48]'}`}>
                  {contrastSecondaryOnSurface >= 7 ? 'AAA PASS' : contrastSecondaryOnSurface >= 4.5 ? 'AA PASS' : 'FAIL'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] space-y-1">
                <span className="block text-[10px] font-mono text-[var(--text-muted)]">Accent / Canvas</span>
                <span className="text-base font-bold text-[#111217]">
                  {contrastAccentOnCanvas.toFixed(1)}:1
                </span>
                <span className={`block text-[10px] font-mono font-semibold ${contrastAccentOnCanvas >= 3.0 ? 'text-[#12603F]' : 'text-[#C83D48]'}`}>
                  {contrastAccentOnCanvas >= 3.0 ? 'AA (UI) PASS' : 'LOW CONTRAST'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] space-y-1">
                <span className="block text-[10px] font-mono text-[var(--text-muted)]">White on Accent</span>
                <span className="text-base font-bold text-[#111217]">
                  {contrastWhiteOnAccent.toFixed(1)}:1
                </span>
                <span className={`block text-[10px] font-mono font-semibold ${contrastWhiteOnAccent >= 4.5 ? 'text-[#12603F]' : 'text-[#A66A15]'}`}>
                  {contrastWhiteOnAccent >= 4.5 ? 'AA PASS' : 'USE DARK INK'}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Component Mockup Preview Stage */}
          <div
            className="rounded-2xl border p-6 shadow-sm transition-colors duration-300 space-y-5"
            style={{
              backgroundColor: tokens.canvas,
              borderColor: tokens.hairline,
              color: tokens.ink,
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: tokens.hairline }}>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: tokens.accent }} />
                <span className="text-xs font-bold tracking-tight">Active Surface Preview</span>
              </div>
              <span className="text-[10px] font-mono" style={{ color: tokens.inkMuted }}>
                PREVIEW PORT
              </span>
            </div>

            {/* Surface Card Container */}
            <div
              className="p-5 rounded-xl border shadow-sm space-y-4"
              style={{
                backgroundColor: tokens.surface,
                borderColor: tokens.hairline,
              }}
            >
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold">Institutional Ledger Card</h4>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold"
                  style={{
                    backgroundColor: tokens.accentSoft,
                    color: tokens.accent,
                  }}
                >
                  VERIFIED
                </span>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: tokens.inkSecondary }}>
                Real-time token rendering proof. Notice how primary ink, secondary explanation text, and accent boundaries remain harmonized across both light and dark foundations.
              </p>

              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: tokens.hairline }}>
                <span className="text-xs font-mono font-bold">£2,450,000.00</span>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-all"
                  style={{ backgroundColor: tokens.accent }}
                >
                  Execute Action
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
