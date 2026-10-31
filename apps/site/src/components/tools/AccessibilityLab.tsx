import React, { useState, useMemo } from 'react';
import { ShieldCheck, Sparkles, MousePointer } from 'lucide-react';

// Relative Luminance per WCAG 2.2 specification
function getLuminance(hex: string): number {
  const clean = hex.replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return Number.NaN;
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return (a[0] ?? 0) * 0.2126 + (a[1] ?? 0) * 0.7152 + (a[2] ?? 0) * 0.0722;
}

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

// Contrast Ratio between two hex colors
function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function AccessibilityLab() {
  const [activeTab, setActiveTab] = useState<'contrast' | 'focus' | 'target'>('contrast');

  // Contrast state
  const [fgColor, setFgColor] = useState<string>('#111217');
  const [bgColor, setBgColor] = useState<string>('#F4F2ED');

  // Focus ring state
  const [ringColor, setRingColor] = useState<string>('#2547E8');
  const [ringWidth, setRingWidth] = useState<number>(2);
  const [ringOffset, setRingOffset] = useState<number>(2);

  // Target size state
  const [targetSize, setTargetSize] = useState<number>(44);

  const foregroundValid = isHexColor(fgColor);
  const backgroundValid = isHexColor(bgColor);
  const colorsValid = foregroundValid && backgroundValid;
  const ratio = useMemo(
    () => (colorsValid ? getContrastRatio(fgColor, bgColor) : null),
    [fgColor, bgColor, colorsValid]
  );

  const normalTextPass = ratio !== null && ratio >= 4.5;
  const normalTextAaa = ratio !== null && ratio >= 7.0;
  const largeTextPass = ratio !== null && ratio >= 3.0;
  const uiComponentPass = ratio !== null && ratio >= 3.0;

  // Auto fix contrast if failing
  const autoFixContrast = () => {
    if (!backgroundValid) return;
    const darkCandidate = '#111217';
    const lightCandidate = '#FFFFFF';
    setFgColor(
      getContrastRatio(darkCandidate, bgColor) >= getContrastRatio(lightCandidate, bgColor)
        ? darkCandidate
        : lightCandidate
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D6CF] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
              Tool 09 · Inclusive Compliance
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#E7EBFF] text-[#2547E8]">
              Client-Side · Zero Login
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111217] mt-1">
            Accessibility Lab
          </h1>
          <p className="text-sm text-[#62666F] mt-1">
            Check colour contrast, focus-ring dimensions, and minimum touch-target size. These
            checks do not certify a complete interface.
          </p>
        </div>

        {/* Global Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D9D6CF] bg-white text-xs font-semibold text-[#12603F]">
            <ShieldCheck className="h-4 w-4" />
            <span>Three checks · Not a full audit</span>
          </div>
        </div>
      </div>

      {/* Lab Module Switcher */}
      <div className="flex p-1 rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] gap-1 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('contrast')}
          aria-pressed={activeTab === 'contrast'}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'contrast' ? 'bg-[#111217] text-white shadow-sm' : 'text-[#62666F]'
          }`}
        >
          Contrast Matrix
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('focus')}
          aria-pressed={activeTab === 'focus'}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'focus' ? 'bg-[#111217] text-white shadow-sm' : 'text-[#62666F]'
          }`}
        >
          Focus Ring Studio
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('target')}
          aria-pressed={activeTab === 'target'}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'target' ? 'bg-[#111217] text-white shadow-sm' : 'text-[#62666F]'
          }`}
        >
          Touch Target Size
        </button>
      </div>

      {/* Main Grid: Parameters (Left 5) & Stage (Right 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6 rounded-2xl border border-[#D9D6CF] bg-white p-6 shadow-sm">
          {activeTab === 'contrast' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-3">
                <h2 className="text-sm font-semibold text-[#111217]">Color Pair Calibration</h2>
                <button
                  type="button"
                  onClick={autoFixContrast}
                  disabled={!backgroundValid}
                  className="text-xs font-mono text-[#2547E8] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Auto-Fix Contrast</span>
                </button>
              </div>

              {/* Foreground Input */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111217]">
                  Foreground (Text / Icon)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    aria-label="Foreground colour picker"
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer border border-[#D9D6CF]"
                  />
                  <input
                    aria-label="Foreground colour hex value"
                    type="text"
                    value={fgColor}
                    aria-invalid={!foregroundValid}
                    aria-describedby="contrast-colour-guidance"
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 font-mono text-xs uppercase px-2 py-1.5 rounded border border-[#D9D6CF] bg-[#FAF9F6]"
                  />
                </div>
              </div>

              {/* Background Input */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111217]">
                  Background (Surface / Canvas)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    aria-label="Background colour picker"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer border border-[#D9D6CF]"
                  />
                  <input
                    aria-label="Background colour hex value"
                    type="text"
                    value={bgColor}
                    aria-invalid={!backgroundValid}
                    aria-describedby="contrast-colour-guidance"
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 font-mono text-xs uppercase px-2 py-1.5 rounded border border-[#D9D6CF] bg-[#FAF9F6]"
                  />
                </div>
              </div>

              <p
                id="contrast-colour-guidance"
                role={!colorsValid ? 'alert' : undefined}
                className={`text-xs ${colorsValid ? 'text-[#62666F]' : 'text-[#C83D48]'}`}
              >
                {colorsValid
                  ? 'Enter six-digit hex colours in the form #2547E8.'
                  : 'Enter valid six-digit hex colours, for example #2547E8.'}
              </p>
            </div>
          )}

          {activeTab === 'focus' && (
            <div className="space-y-5">
              <div className="border-b border-[#D9D6CF] pb-3">
                <h2 className="text-sm font-semibold text-[#111217]">Focus Indicator Dimensions</h2>
              </div>

              {/* Ring Color */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111217]">Outline Chroma</label>
                <div className="flex items-center gap-2">
                  <input
                    aria-label="Focus outline colour picker"
                    type="color"
                    value={ringColor}
                    onChange={(e) => setRingColor(e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer border border-[#D9D6CF]"
                  />
                  <input
                    aria-label="Focus outline colour hex value"
                    type="text"
                    value={ringColor}
                    onChange={(e) => setRingColor(e.target.value)}
                    className="flex-1 font-mono text-xs uppercase px-2 py-1.5 rounded border border-[#D9D6CF] bg-[#FAF9F6]"
                  />
                </div>
              </div>

              {/* Ring Width Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#111217]">Outline Width</span>
                  <span className="font-mono text-[#62666F]">{ringWidth}px</span>
                </div>
                <input
                  aria-label="Focus outline width"
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={ringWidth}
                  onChange={(e) => setRingWidth(Number(e.target.value))}
                  className="w-full accent-[#2547E8] cursor-pointer"
                />
              </div>

              {/* Ring Offset Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#111217]">Outline Offset</span>
                  <span className="font-mono text-[#62666F]">{ringOffset}px</span>
                </div>
                <input
                  aria-label="Focus outline offset"
                  type="range"
                  min="0"
                  max="6"
                  step="1"
                  value={ringOffset}
                  onChange={(e) => setRingOffset(Number(e.target.value))}
                  className="w-full accent-[#2547E8] cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'target' && (
            <div className="space-y-5">
              <div className="border-b border-[#D9D6CF] pb-3">
                <h2 className="text-sm font-semibold text-[#111217]">Touch Target Ergonomics</h2>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#111217]">Physical Dimension (Width × Height)</span>
                  <span className="font-mono text-[#62666F]">{targetSize}px</span>
                </div>
                <input
                  aria-label="Touch target size"
                  type="range"
                  min="20"
                  max="64"
                  step="2"
                  value={targetSize}
                  onChange={(e) => setTargetSize(Number(e.target.value))}
                  className="w-full accent-[#2547E8] cursor-pointer"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-[#D9D6CF] text-xs">
                <div className="flex justify-between">
                  <span className="text-[#62666F]">WCAG 2.2 Minimum Floor:</span>
                  <span className="font-bold text-[#111217]">24 × 24px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#62666F]">Apple HIG / Android Recommendation:</span>
                  <span className="font-bold text-[#2547E8]">44 × 44px</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Simulation Stage Column */}
        <div className="lg:col-span-7 space-y-6">
          {activeTab === 'contrast' && (
            <div className="space-y-6">
              {/* Scorecard Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-[#D9D6CF] bg-white p-3 space-y-1">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block">
                    CONTRAST RATIO
                  </span>
                  <span className="text-2xl font-bold text-[#111217]">
                    {ratio === null ? '—' : `${ratio.toFixed(2)}:1`}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold block ${normalTextPass ? 'text-[#12603F]' : 'text-[#C83D48]'}`}
                  >
                    {normalTextAaa ? 'AAA HIGHEST' : normalTextPass ? 'AA PASS' : 'FAIL'}
                  </span>
                </div>

                <div className="rounded-xl border border-[#D9D6CF] bg-white p-3 space-y-1">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block">
                    NORMAL TEXT (16px)
                  </span>
                  <span className="text-base font-bold text-[#111217]">
                    {normalTextPass ? 'PASS' : 'FAIL'}
                  </span>
                  <span className="text-[10px] font-mono text-[#62666F] block">Req: 4.5:1</span>
                </div>

                <div className="rounded-xl border border-[#D9D6CF] bg-white p-3 space-y-1">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block">
                    LARGE TEXT (18pt+)
                  </span>
                  <span className="text-base font-bold text-[#111217]">
                    {largeTextPass ? 'PASS' : 'FAIL'}
                  </span>
                  <span className="text-[10px] font-mono text-[#62666F] block">Req: 3.0:1</span>
                </div>

                <div className="rounded-xl border border-[#D9D6CF] bg-white p-3 space-y-1">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block">
                    UI COMPONENTS
                  </span>
                  <span className="text-base font-bold text-[#111217]">
                    {uiComponentPass ? 'PASS' : 'FAIL'}
                  </span>
                  <span className="text-[10px] font-mono text-[#62666F] block">Req: 3.0:1</span>
                </div>
              </div>

              {/* Visual Pair Preview */}
              <div
                className="rounded-2xl border p-8 shadow-sm flex flex-col justify-between min-h-[220px]"
                style={{ backgroundColor: bgColor, color: fgColor }}
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold tracking-tight">
                    Accessible Typographic Contrast
                  </h3>
                  <p className="text-sm leading-relaxed max-w-lg opacity-90">
                    Verify readability and optical legibility in real conditions. Even when users
                    browse with low screen brightness or high ambient glare, text must remain
                    distinct.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-current/20 text-xs font-mono">
                  <span>FG: {fgColor}</span>
                  <span>·</span>
                  <span>BG: {bgColor}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'focus' && (
            <div className="rounded-2xl border border-[#D9D6CF] bg-[#FAF9F6] p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#D9D6CF] text-xs font-mono text-[var(--text-muted)]">
                <span>KEYBOARD FOCUS VISIBILITY STAGE</span>
                <span>TAB TO FOCUS</span>
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  tabIndex={0}
                  className="px-5 py-2.5 rounded-xl bg-white border border-[#D9D6CF] text-xs font-semibold text-[#111217] shadow-sm cursor-pointer"
                  style={{
                    outline: `${ringWidth}px solid ${ringColor}`,
                    outlineOffset: `${ringOffset}px`,
                  }}
                >
                  Interactive Focus State Button
                </button>

                <div className="p-4 rounded-xl bg-white border border-[#D9D6CF] space-y-2">
                  <span className="text-xs font-semibold text-[#111217] block">
                    Form Input Field Indicator
                  </span>
                  <input
                    aria-label="Example input field"
                    type="text"
                    defaultValue="Tab-accessible user input field"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#D9D6CF] bg-[#FAF9F6]"
                    style={{
                      outline: `${ringWidth}px solid ${ringColor}`,
                      outlineOffset: `${ringOffset}px`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'target' && (
            <div className="rounded-2xl border border-[#D9D6CF] bg-[#FAF9F6] p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#D9D6CF] text-xs font-mono text-[var(--text-muted)]">
                <span>PHYSICAL TARGET COMPARISON</span>
                <span className={targetSize >= 44 ? 'text-[#12603F] font-bold' : 'text-[#A66A15]'}>
                  {targetSize >= 44
                    ? 'OPTIMAL (44px+)'
                    : targetSize >= 24
                      ? 'COMPLIANT (24px+)'
                      : 'FAIL'}
                </span>
              </div>

              <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-[#D9D6CF]">
                <button
                  type="button"
                  className="rounded-xl bg-[#2547E8] text-white font-semibold text-xs flex items-center justify-center shadow-md active:scale-95 transition-transform"
                  style={{ width: `${targetSize}px`, height: `${targetSize}px` }}
                >
                  <MousePointer className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
