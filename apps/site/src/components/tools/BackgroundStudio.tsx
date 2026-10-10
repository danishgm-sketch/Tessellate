import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Code,
} from 'lucide-react';

export type BackgroundPatternType =
  | 'mesh'
  | 'grid'
  | 'dots'
  | 'gradient'
  | 'noise'
  | 'hatch'
  | 'scanline';

interface PatternPreset {
  id: string;
  name: string;
  type: BackgroundPatternType;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  size: number;
  opacity: number;
  blur: number;
  blendMode: string;
  description: string;
}

const PRESETS: PatternPreset[] = [
  {
    id: 'aurora-mesh',
    name: 'Radial Aurora Mesh',
    type: 'mesh',
    primaryColor: '#2547E8',
    secondaryColor: '#C9FF57',
    accentColor: '#111217',
    size: 60,
    opacity: 35,
    blur: 40,
    blendMode: 'screen',
    description: 'Soft ethereal cobalt and lime luminous mesh with organic blur.',
  },
  {
    id: 'subtle-grid',
    name: 'Subtle Hairline Grid',
    type: 'grid',
    primaryColor: '#D9D6CF',
    secondaryColor: '#FAF9F6',
    accentColor: '#2547E8',
    size: 24,
    opacity: 70,
    blur: 0,
    blendMode: 'normal',
    description: 'Precision engineering 24px Cartesian coordinate grid.',
  },
  {
    id: 'dot-matrix',
    name: 'Dense Dot Matrix',
    type: 'dots',
    primaryColor: '#62666F',
    secondaryColor: '#F4F2ED',
    accentColor: '#111217',
    size: 16,
    opacity: 45,
    blur: 0,
    blendMode: 'normal',
    description: 'Architectural stippled grid field for technical data views.',
  },
  {
    id: 'duotone-gradient',
    name: 'Editorial Duotone Gradient',
    type: 'gradient',
    primaryColor: '#F4F2ED',
    secondaryColor: '#E7EBFF',
    accentColor: '#2547E8',
    size: 50,
    opacity: 90,
    blur: 0,
    blendMode: 'normal',
    description: 'Warm canvas melting into faint cobalt wash for hero sections.',
  },
  {
    id: 'terminal-scanline',
    name: 'Command Scanlines',
    type: 'scanline',
    primaryColor: '#0B0D10',
    secondaryColor: '#171B21',
    accentColor: '#6782FF',
    size: 4,
    opacity: 60,
    blur: 0,
    blendMode: 'multiply',
    description: 'Discrete horizontal CRT scanline texture for dark terminals.',
  },
  {
    id: 'isometric-hatch',
    name: 'Architectural Hatch',
    type: 'hatch',
    primaryColor: '#D9D6CF',
    secondaryColor: '#FAF9F6',
    accentColor: '#111217',
    size: 20,
    opacity: 50,
    blur: 0,
    blendMode: 'normal',
    description: '45-degree diagonal drafting hatch with delicate hairline spacing.',
  },
];

export function BackgroundStudio() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('aurora-mesh');
  const [patternType, setPatternType] = useState<BackgroundPatternType>('mesh');
  const [primaryColor, setPrimaryColor] = useState<string>('#2547E8');
  const [secondaryColor, setSecondaryColor] = useState<string>('#C9FF57');
  const [accentColor, setAccentColor] = useState<string>('#111217');
  const [size, setSize] = useState<number>(60);
  const [opacity, setOpacity] = useState<number>(35);
  const [blur, setBlur] = useState<number>(40);
  const [blendMode, setBlendMode] = useState<string>('screen');
  const [copiedFormat, setCopiedFormat] = useState<'css' | 'tailwind' | 'svg' | null>(null);

  const applyPreset = (preset: PatternPreset) => {
    setSelectedPresetId(preset.id);
    setPatternType(preset.type);
    setPrimaryColor(preset.primaryColor);
    setSecondaryColor(preset.secondaryColor);
    setAccentColor(preset.accentColor);
    setSize(preset.size);
    setOpacity(preset.opacity);
    setBlur(preset.blur);
    setBlendMode(preset.blendMode);
  };

  // Generate CSS style rule based on pattern type and parameters
  const cssStyle = useMemo<React.CSSProperties>(() => {
    const op = opacity / 100;

    switch (patternType) {
      case 'mesh':
        return {
          backgroundColor: accentColor,
          backgroundImage: `
            radial-gradient(at 0% 0%, ${primaryColor} 0px, transparent 50%),
            radial-gradient(at 100% 0%, ${secondaryColor} 0px, transparent 50%),
            radial-gradient(at 50% 100%, ${primaryColor} 0px, transparent 50%)
          `,
          filter: blur > 0 ? `blur(${blur / 4}px)` : undefined,
          opacity: op,
        };

      case 'grid':
        return {
          backgroundColor: secondaryColor,
          backgroundImage: `
            linear-gradient(to right, ${primaryColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${primaryColor} 1px, transparent 1px)
          `,
          backgroundSize: `${size}px ${size}px`,
          opacity: op,
        };

      case 'dots':
        return {
          backgroundColor: secondaryColor,
          backgroundImage: `radial-gradient(${primaryColor} 1.5px, transparent 1.5px)`,
          backgroundSize: `${size}px ${size}px`,
          opacity: op,
        };

      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          opacity: op,
        };

      case 'scanline':
        return {
          backgroundColor: secondaryColor,
          backgroundImage: `linear-gradient(to bottom, ${primaryColor} 50%, transparent 50%)`,
          backgroundSize: `100% ${size}px`,
          opacity: op,
        };

      case 'hatch':
        return {
          backgroundColor: secondaryColor,
          backgroundImage: `repeating-linear-gradient(45deg, ${primaryColor}, ${primaryColor} 1px, transparent 1px, transparent ${size}px)`,
          opacity: op,
        };

      case 'noise':
      default:
        return {
          backgroundColor: secondaryColor,
          backgroundImage: `radial-gradient(circle at 50% 50%, ${primaryColor} 10%, transparent 20%), radial-gradient(circle at 20% 80%, ${primaryColor} 15%, transparent 25%)`,
          backgroundSize: `${size * 2}px ${size * 2}px`,
          mixBlendMode: blendMode as React.CSSProperties['mixBlendMode'],
        };
    }
  }, [patternType, primaryColor, secondaryColor, accentColor, size, opacity, blur, blendMode]);

  // CSS code snippet
  const generatedCss = useMemo(() => {
    switch (patternType) {
      case 'mesh':
        return `background-color: ${accentColor};\nbackground-image:\n  radial-gradient(at 0% 0%, ${primaryColor} 0px, transparent 50%),\n  radial-gradient(at 100% 0%, ${secondaryColor} 0px, transparent 50%),\n  radial-gradient(at 50% 100%, ${primaryColor} 0px, transparent 50%);\nopacity: ${opacity / 100};`;
      case 'grid':
        return `background-color: ${secondaryColor};\nbackground-image:\n  linear-gradient(to right, ${primaryColor} 1px, transparent 1px),\n  linear-gradient(to bottom, ${primaryColor} 1px, transparent 1px);\nbackground-size: ${size}px ${size}px;\nopacity: ${opacity / 100};`;
      case 'dots':
        return `background-color: ${secondaryColor};\nbackground-image: radial-gradient(${primaryColor} 1.5px, transparent 1.5px);\nbackground-size: ${size}px ${size}px;\nopacity: ${opacity / 100};`;
      case 'gradient':
        return `background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);\nopacity: ${opacity / 100};`;
      case 'scanline':
        return `background-color: ${secondaryColor};\nbackground-image: linear-gradient(to bottom, ${primaryColor} 50%, transparent 50%);\nbackground-size: 100% ${size}px;\nopacity: ${opacity / 100};`;
      case 'hatch':
        return `background-color: ${secondaryColor};\nbackground-image: repeating-linear-gradient(45deg, ${primaryColor}, ${primaryColor} 1px, transparent 1px, transparent ${size}px);\nopacity: ${opacity / 100};`;
      default:
        return `background: ${secondaryColor};`;
    }
  }, [patternType, primaryColor, secondaryColor, accentColor, size, opacity]);

  // Tailwind CSS class snippet
  const generatedTailwind = useMemo(() => {
    switch (patternType) {
      case 'mesh':
        return `bg-[radial-gradient(ellipse_at_top_left,${primaryColor}_0%,transparent_50%),radial-gradient(ellipse_at_bottom_right,${secondaryColor}_0%,transparent_50%)] bg-[${accentColor}]`;
      case 'grid':
        return `bg-[linear-gradient(to_right,${primaryColor}_1px,transparent_1px),linear-gradient(to_bottom,${primaryColor}_1px,transparent_1px)] bg-[size:${size}px_${size}px] bg-[${secondaryColor}]`;
      case 'dots':
        return `bg-[radial-gradient(${primaryColor}_1.5px,transparent_1.5px)] bg-[size:${size}px_${size}px] bg-[${secondaryColor}]`;
      case 'gradient':
        return `bg-gradient-to-br from-[${primaryColor}] to-[${secondaryColor}]`;
      case 'scanline':
        return `bg-[linear-gradient(to_bottom,${primaryColor}_50%,transparent_50%)] bg-[size:100%_${size}px] bg-[${secondaryColor}]`;
      case 'hatch':
        return `bg-[repeating-linear-gradient(45deg,${primaryColor},${primaryColor}_1px,transparent_1px,transparent_${size}px)] bg-[${secondaryColor}]`;
      default:
        return `bg-[${secondaryColor}]`;
    }
  }, [patternType, primaryColor, secondaryColor, accentColor, size]);

  const copyToClipboard = (text: string, format: 'css' | 'tailwind' | 'svg') => {
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
              Tool 02 · Surface Intelligence
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#E7EBFF] text-[#2547E8]">
              Client-Side · Zero Login
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111217] mt-1">
            Background Studio
          </h1>
          <p className="text-sm text-[#62666F] mt-1">
            Generate mathematical gradients, meshes, Cartesian grids, noise, and CSS visual fields.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => copyToClipboard(generatedCss, 'css')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9D6CF] bg-white text-xs font-semibold text-[#111217] hover:border-[#111217] transition-all"
          >
            {copiedFormat === 'css' ? <Check className="h-3.5 w-3.5 text-[#177B55]" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy CSS</span>
          </button>
          <button
            type="button"
            onClick={() => copyToClipboard(generatedTailwind, 'tailwind')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2547E8] text-white text-xs font-semibold hover:bg-[#1E3CCD] transition-all"
          >
            {copiedFormat === 'tailwind' ? <Check className="h-3.5 w-3.5" /> : <Code className="h-3.5 w-3.5" />}
            <span>Copy Tailwind</span>
          </button>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="space-y-2">
        <span className="block font-mono text-xs font-semibold uppercase text-[#8B8F97]">
          Curated Studio Presets
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
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

      {/* Main Studio Grid: Controls (Left 5 cols) & Live Stage (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6 rounded-2xl border border-[#D9D6CF] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#2547E8]" />
              <h2 className="text-sm font-semibold text-[#111217]">Field Parameters</h2>
            </div>
            <button
              type="button"
              onClick={() => applyPreset(PRESETS[0]!)}
              className="text-xs font-mono text-[#8B8F97] hover:text-[#111217] flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Pattern Type Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#111217]">
              Pattern Geometry
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['mesh', 'grid', 'dots', 'gradient', 'scanline', 'hatch'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPatternType(t)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-medium capitalize transition-all ${
                    patternType === t
                      ? 'border-[#2547E8] bg-[#E7EBFF] text-[#2547E8] font-semibold'
                      : 'border-[#D9D6CF] text-[#62666F] hover:text-[#111217]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Color Matrix */}
          <div className="space-y-3 pt-2 border-t border-[#D9D6CF]">
            <label className="block text-xs font-semibold text-[#111217]">
              Chroma Tokens
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <span className="block font-mono text-[10px] text-[#8B8F97]">Primary</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-7 w-7 rounded cursor-pointer border border-[#D9D6CF]"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full font-mono text-xs uppercase px-1.5 py-1 rounded border border-[#D9D6CF] bg-[#FAF9F6]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="block font-mono text-[10px] text-[#8B8F97]">Secondary</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-7 w-7 rounded cursor-pointer border border-[#D9D6CF]"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full font-mono text-xs uppercase px-1.5 py-1 rounded border border-[#D9D6CF] bg-[#FAF9F6]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="block font-mono text-[10px] text-[#8B8F97]">Base Canvas</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-7 w-7 rounded cursor-pointer border border-[#D9D6CF]"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full font-mono text-xs uppercase px-1.5 py-1 rounded border border-[#D9D6CF] bg-[#FAF9F6]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sliders: Size, Opacity, Blur */}
          <div className="space-y-4 pt-2 border-t border-[#D9D6CF]">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[#111217]">Grid / Cell Pitch</span>
                <span className="font-mono text-[#62666F]">{size}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="100"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-[#2547E8] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[#111217]">Field Opacity</span>
                <span className="font-mono text-[#62666F]">{opacity}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full accent-[#2547E8] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[#111217]">Diffusion Blur</span>
                <span className="font-mono text-[#62666F]">{blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={blur}
                onChange={(e) => setBlur(Number(e.target.value))}
                className="w-full accent-[#2547E8] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Live Stage Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Visual Stage Container */}
          <div className="rounded-2xl border border-[#D9D6CF] bg-[#FAF9F6] p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 text-xs font-mono text-[#8B8F97] border-b border-[#D9D6CF] mb-4">
              <span>LIVE COMPOSITION STAGE</span>
              <span className="text-[#111217] font-semibold">{patternType.toUpperCase()} FIELD</span>
            </div>

            {/* Canvas Stage */}
            <div className="relative aspect-[16/10] w-full rounded-xl border border-[#D9D6CF] overflow-hidden flex items-center justify-center p-6 shadow-inner">
              {/* Generated background layer */}
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-300"
                style={cssStyle}
              />

              {/* Sample Foreground UI to test legibility */}
              <div className="relative z-10 max-w-sm w-full rounded-xl bg-white/95 backdrop-blur-md border border-[#D9D6CF] p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#2547E8]" />
                    <span className="text-xs font-semibold text-[#111217]">
                      Telemetry Node
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#D9D6CF] text-[#177B55] font-semibold">
                    HEALTH 99.8%
                  </span>
                </div>
                <p className="text-xs text-[#62666F] leading-relaxed">
                  Legibility verification card. Test how high-density background patterns behave beneath surface typography.
                </p>
                <div className="flex justify-end gap-2 pt-1 border-t border-[#D9D6CF]">
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg text-xs font-medium border border-[#D9D6CF] text-[#62666F]"
                  >
                    Dismiss
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#111217] text-white"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Code Inspection Block */}
          <div className="rounded-2xl border border-[#D9D6CF] bg-[#0B0D10] text-[#F5F7FA] p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#272B33] pb-2 text-[#8B8F97]">
              <span>GENERATED STYLESHEET</span>
              <button
                type="button"
                onClick={() => copyToClipboard(generatedCss, 'css')}
                className="text-[#6782FF] hover:text-white flex items-center gap-1"
              >
                {copiedFormat === 'css' ? <Check className="h-3 w-3 text-[#177B55]" /> : <Copy className="h-3 w-3" />}
                <span>{copiedFormat === 'css' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="overflow-x-auto text-[11px] leading-relaxed text-[#D9D6CF]">
              {generatedCss}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
