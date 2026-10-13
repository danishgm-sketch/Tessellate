import React, { useState, useMemo } from 'react';
import {
  Play,
  Copy,
  Check,
  Sliders,
} from 'lucide-react';

export type MotionMode = 'cubic-bezier' | 'spring';

interface MotionPreset {
  id: string;
  name: string;
  mode: MotionMode;
  durationMs: number;
  bezier: [number, number, number, number];
  stiffness: number;
  damping: number;
  mass: number;
  staggerMs: number;
  description: string;
}

const MOTION_PRESETS: MotionPreset[] = [
  {
    id: 'calm-precision',
    name: 'Calm Precision',
    mode: 'cubic-bezier',
    durationMs: 220,
    bezier: [0.16, 1, 0.3, 1],
    stiffness: 300,
    damping: 30,
    mass: 1,
    staggerMs: 40,
    description: 'Decisive editorial curve with fast attack and whisper deceleration.',
  },
  {
    id: 'editorial-glide',
    name: 'Editorial Glide',
    mode: 'cubic-bezier',
    durationMs: 360,
    bezier: [0.25, 0.1, 0.25, 1],
    stiffness: 220,
    damping: 28,
    mass: 1.2,
    staggerMs: 60,
    description: 'Smooth, cinematic pacing ideal for editorial narratives.',
  },
  {
    id: 'energetic-tactile',
    name: 'Energetic Tactile',
    mode: 'spring',
    durationMs: 180,
    bezier: [0.34, 1.56, 0.64, 1],
    stiffness: 450,
    damping: 18,
    mass: 0.8,
    staggerMs: 30,
    description: 'Brisk physical spring response with subtle overshoot settling.',
  },
  {
    id: 'deliberate-command',
    name: 'Deliberate Command',
    mode: 'cubic-bezier',
    durationMs: 140,
    bezier: [0, 0, 0.2, 1],
    stiffness: 550,
    damping: 36,
    mass: 0.9,
    staggerMs: 25,
    description: 'Near-instantaneous UI feedback tailored for dense trading terminals.',
  },
  {
    id: 'reduced-motion',
    name: 'Reduced Motion Safe',
    mode: 'cubic-bezier',
    durationMs: 0,
    bezier: [0, 0, 1, 1],
    stiffness: 1000,
    damping: 100,
    mass: 1,
    staggerMs: 0,
    description: 'Zero translation motion; pure alpha crossfade obeying WCAG 2.2 AA.',
  },
];

export function MotionStudio() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('calm-precision');
  const [mode, setMode] = useState<MotionMode>('cubic-bezier');
  const [durationMs, setDurationMs] = useState<number>(220);
  const [bezier, setBezier] = useState<[number, number, number, number]>([0.16, 1, 0.3, 1]);
  const [stiffness, setStiffness] = useState<number>(300);
  const [damping, setDamping] = useState<number>(30);
  const [mass, setMass] = useState<number>(1);
  const [staggerMs, setStaggerMs] = useState<number>(40);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  // Play animation trigger count
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [copiedFormat, setCopiedFormat] = useState<'css' | 'framer' | null>(null);

  const applyPreset = (p: MotionPreset) => {
    setSelectedPresetId(p.id);
    setMode(p.mode);
    setDurationMs(p.durationMs);
    setBezier([...p.bezier]);
    setStiffness(p.stiffness);
    setDamping(p.damping);
    setMass(p.mass);
    setStaggerMs(p.staggerMs);
    setIsReducedMotion(p.id === 'reduced-motion');
  };

  const triggerAnimation = () => {
    setAnimationKey((k) => k + 1);
  };

  // Bezier CSS timing function string
  const cubicBezierString = useMemo(() => {
    if (isReducedMotion) return 'linear';
    return `cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]})`;
  }, [bezier, isReducedMotion]);

  const activeDurationMs = isReducedMotion ? 0 : durationMs;

  // Generated CSS snippet
  const generatedCss = useMemo(() => {
    if (isReducedMotion) {
      return `/* Reduced Motion Mode (WCAG 2.2 compliant) */\ntransition: opacity 0ms linear;`;
    }
    return `/* Tessellate Motion Preset: ${selectedPresetId} */\ntransition-property: transform, opacity, box-shadow;\ntransition-duration: ${durationMs}ms;\ntransition-timing-function: ${cubicBezierString};`;
  }, [selectedPresetId, durationMs, cubicBezierString, isReducedMotion]);

  // Framer Motion / Motion config snippet
  const generatedFramer = useMemo(() => {
    if (mode === 'spring') {
      return `{\n  type: "spring",\n  stiffness: ${stiffness},\n  damping: ${damping},\n  mass: ${mass}\n}`;
    }
    return `{\n  duration: ${activeDurationMs / 1000},\n  ease: [${bezier.join(', ')}]\n}`;
  }, [mode, stiffness, damping, mass, activeDurationMs, bezier]);

  const copyToClipboard = (text: string, format: 'css' | 'framer') => {
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
              Tool 03 · Kinetic Physics
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#E7EBFF] text-[#2547E8]">
              Client-Side · Zero Login
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111217] mt-1">
            Motion Studio
          </h1>
          <p className="text-sm text-[#62666F] mt-1">
            Author and inspect easing curves, spring dynamics, stagger pacing, and WCAG reduced motion floors.
          </p>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerAnimation}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2547E8] text-white text-xs font-semibold hover:bg-[#1E3CCD] transition-all shadow-sm"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Play Animation</span>
          </button>
          <button
            type="button"
            onClick={() => copyToClipboard(generatedCss, 'css')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D9D6CF] bg-white text-xs font-semibold text-[#111217] hover:border-[#111217] transition-all"
          >
            {copiedFormat === 'css' ? <Check className="h-3.5 w-3.5 text-[#12603F]" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy CSS</span>
          </button>
        </div>
      </div>

      {/* Preset Selector Chips */}
      <div className="space-y-2">
        <span className="block font-mono text-xs font-semibold uppercase text-[var(--text-muted)]">
          Personality Presets
        </span>
        <div className="flex flex-wrap gap-2">
          {MOTION_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                selectedPresetId === p.id
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
              <h2 className="text-sm font-semibold text-[#111217]">Kinetic Physics Model</h2>
            </div>
            {/* Reduced motion toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[#62666F]">
              <input aria-label="Is reduced motion"
                type="checkbox"
                checked={isReducedMotion}
                onChange={(e) => setIsReducedMotion(e.target.checked)}
                className="accent-[#2547E8] rounded"
              />
              <span>Reduced Motion</span>
            </label>
          </div>

          {/* Model Mode Toggle: Bezier vs Spring */}
          <div className="flex p-1 rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] gap-1">
            <button
              type="button"
              onClick={() => setMode('cubic-bezier')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'cubic-bezier' ? 'bg-[#111217] text-white shadow-sm' : 'text-[#62666F]'
              }`}
            >
              Cubic-Bezier
            </button>
            <button
              type="button"
              onClick={() => setMode('spring')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'spring' ? 'bg-[#111217] text-white shadow-sm' : 'text-[#62666F]'
              }`}
            >
              Spring Physics
            </button>
          </div>

          {/* Duration & Stagger Sliders */}
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[#111217]">Pacing Duration</span>
                <span className="font-mono text-[#62666F]">{durationMs}ms</span>
              </div>
              <input aria-label="Duration ms"
                type="range"
                min="0"
                max="800"
                step="20"
                value={durationMs}
                onChange={(e) => setDurationMs(Number(e.target.value))}
                className="w-full accent-[#2547E8] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[#111217]">Stagger Delay (per item)</span>
                <span className="font-mono text-[#62666F]">{staggerMs}ms</span>
              </div>
              <input aria-label="Stagger ms"
                type="range"
                min="0"
                max="150"
                step="5"
                value={staggerMs}
                onChange={(e) => setStaggerMs(Number(e.target.value))}
                className="w-full accent-[#2547E8] cursor-pointer"
              />
            </div>
          </div>

          {/* Conditional Controls: Bezier vs Spring */}
          {mode === 'cubic-bezier' ? (
            <div className="space-y-4 pt-4 border-t border-[#D9D6CF]">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#111217]">
                  Bezier Curve Coordinates
                </label>
                <span className="font-mono text-[11px] text-[#2547E8]">
                  [{bezier.join(', ')}]
                </span>
              </div>

              {/* Curve Graph Visualizer */}
              <div className="aspect-[2/1] rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] p-4 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="100" x2="100" y2="100" stroke="#D9D6CF" strokeWidth="1" />
                  <line x1="0" y1="0" x2="100" y2="0" stroke="#D9D6CF" strokeWidth="1" strokeDasharray="2" />
                  <line x1="0" y1="0" x2="0" y2="100" stroke="#D9D6CF" strokeWidth="1" />
                  <line x1="100" y1="0" x2="100" y2="100" stroke="#D9D6CF" strokeWidth="1" />

                  {/* Linear reference */}
                  <line x1="0" y1="100" x2="100" y2="0" stroke="#D9D6CF" strokeWidth="1" strokeDasharray="4" />

                  {/* Bezier Curve */}
                  <path
                    d={`M 0 100 C ${bezier[0] * 100} ${100 - bezier[1] * 100}, ${bezier[2] * 100} ${100 - bezier[3] * 100}, 100 0`}
                    fill="none"
                    stroke="#2547E8"
                    strokeWidth="3"
                  />
                  {/* Control Points */}
                  <circle cx={bezier[0] * 100} cy={100 - bezier[1] * 100} r="4" fill="#C9FF57" stroke="#111217" strokeWidth="1.5" />
                  <circle cx={bezier[2] * 100} cy={100 - bezier[3] * 100} r="4" fill="#2547E8" stroke="#FFFFFF" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Bezier Individual Inputs */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div>
                  <span className="text-[var(--text-muted)]">X1 / Y1 (In)</span>
                  <div className="flex gap-1 mt-1">
                    <input aria-label="Bezier[0]"
                      type="number"
                      step="0.05"
                      value={bezier[0]}
                      onChange={(e) => setBezier([Number(e.target.value), bezier[1], bezier[2], bezier[3]])}
                      className="w-full p-1.5 rounded border border-[#D9D6CF] bg-[#FAF9F6]"
                    />
                    <input aria-label="Bezier[1]"
                      type="number"
                      step="0.05"
                      value={bezier[1]}
                      onChange={(e) => setBezier([bezier[0], Number(e.target.value), bezier[2], bezier[3]])}
                      className="w-full p-1.5 rounded border border-[#D9D6CF] bg-[#FAF9F6]"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">X2 / Y2 (Out)</span>
                  <div className="flex gap-1 mt-1">
                    <input aria-label="Bezier[2]"
                      type="number"
                      step="0.05"
                      value={bezier[2]}
                      onChange={(e) => setBezier([bezier[0], bezier[1], Number(e.target.value), bezier[3]])}
                      className="w-full p-1.5 rounded border border-[#D9D6CF] bg-[#FAF9F6]"
                    />
                    <input aria-label="Bezier[3]"
                      type="number"
                      step="0.05"
                      value={bezier[3]}
                      onChange={(e) => setBezier([bezier[0], bezier[1], bezier[2], Number(e.target.value)])}
                      className="w-full p-1.5 rounded border border-[#D9D6CF] bg-[#FAF9F6]"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-4 border-t border-[#D9D6CF]">
              <label className="text-xs font-semibold text-[#111217]">
                Spring Physics Constants
              </label>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#111217]">Stiffness (k)</span>
                    <span className="font-mono text-[#62666F]">{stiffness}</span>
                  </div>
                  <input aria-label="Spring stiffness"
                    type="range"
                    min="100"
                    max="800"
                    step="20"
                    value={stiffness}
                    onChange={(e) => setStiffness(Number(e.target.value))}
                    className="w-full accent-[#2547E8] cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#111217]">Damping (c)</span>
                    <span className="font-mono text-[#62666F]">{damping}</span>
                  </div>
                  <input aria-label="Spring damping"
                    type="range"
                    min="10"
                    max="60"
                    step="2"
                    value={damping}
                    onChange={(e) => setDamping(Number(e.target.value))}
                    className="w-full accent-[#2547E8] cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#111217]">Mass (m)</span>
                    <span className="font-mono text-[#62666F]">{mass}</span>
                  </div>
                  <input aria-label="Spring mass"
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={mass}
                    onChange={(e) => setMass(Number(e.target.value))}
                    className="w-full accent-[#2547E8] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Simulation Stage Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-[#D9D6CF] bg-[#FAF9F6] p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 text-xs font-mono text-[var(--text-muted)] border-b border-[#D9D6CF]">
              <span>KINETIC SIMULATION BENCH</span>
              <span className="text-[#111217] font-semibold">
                {isReducedMotion ? 'REDUCED MOTION' : `${activeDurationMs}ms · ${mode.toUpperCase()}`}
              </span>
            </div>

            {/* Test 1: Stagger List Reveal */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-[#111217]">
                Staggered Component Sequence
              </span>
              <div key={animationKey} className="space-y-2">
                {[
                  { label: '01 · System Architecture Audit', tag: '20/20 PASS' },
                  { label: '02 · Cryptographic Token Verification', tag: 'VALIDATED' },
                  { label: '03 · Latency SLA Telemetry Sync', tag: '38ms OPTIMAL' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#D9D6CF] shadow-sm"
                    style={{
                      transitionProperty: 'transform, opacity',
                      transitionDuration: `${activeDurationMs}ms`,
                      transitionTimingFunction: cubicBezierString,
                      transitionDelay: isReducedMotion ? '0ms' : `${idx * staggerMs}ms`,
                      animation: isReducedMotion
                        ? 'none'
                        : `tessSlideUp ${activeDurationMs}ms ${cubicBezierString} ${idx * staggerMs}ms backwards`,
                    }}
                  >
                    <span className="text-xs font-semibold text-[#111217]">{item.label}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#D9D6CF] text-[#12603F] font-semibold">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Test 2: Tactile Button Press Physics */}
            <div className="space-y-2 pt-2 border-t border-[#D9D6CF]">
              <span className="block text-xs font-semibold text-[#111217]">
                Interactive Tactile Press Target
              </span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  style={{
                    transition: `transform ${activeDurationMs}ms ${cubicBezierString}, box-shadow ${activeDurationMs}ms ${cubicBezierString}`,
                  }}
                  className="px-6 py-3 rounded-xl bg-[#2547E8] text-white text-xs font-semibold shadow-md active:scale-95 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                  Press Me for Spring Response
                </button>
                <span className="text-xs text-[#62666F]">
                  Click to test physical depression & rebound feedback.
                </span>
              </div>
            </div>
          </div>

          {/* Generated Code Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#D9D6CF] bg-[#0B0D10] text-[#F5F7FA] p-4 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#272B33] pb-1.5 text-[#A8AFBA]">
                <span>CSS TRANSITION</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedCss, 'css')}
                  className="text-[#6782FF] hover:text-white"
                >
                  {copiedFormat === 'css' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre tabIndex={0} className="overflow-x-auto text-[10px] text-[#D9D6CF] leading-relaxed">
                {generatedCss}
              </pre>
            </div>

            <div className="rounded-xl border border-[#D9D6CF] bg-[#0B0D10] text-[#F5F7FA] p-4 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#272B33] pb-1.5 text-[#A8AFBA]">
                <span>MOTION PROPS</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedFramer, 'framer')}
                  className="text-[#6782FF] hover:text-white"
                >
                  {copiedFormat === 'framer' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre tabIndex={0} className="overflow-x-auto text-[10px] text-[#D9D6CF] leading-relaxed">
                {generatedFramer}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
