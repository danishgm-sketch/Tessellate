import React, { useState, useMemo } from 'react';
import {
  interpretProductBrief,
  type ProductBriefInput,
} from '@tessellate/composer';
import {
  getVisualAmbitionStop,
  getStructuralCreativityStop,
  VISUAL_AMBITION_STOPS,
  STRUCTURAL_CREATIVITY_STOPS,
} from '@tessellate/dna';
import { ArrowRight, SlidersHorizontal, Sparkles } from 'lucide-react';

interface HeroComposerProps {
  onComposed?: (input: ProductBriefInput) => void;
}

const PRESET_BRIEFS = [
  {
    label: 'AI research terminal',
    desc: 'An AI research and intelligence terminal for quant teams. Dense telemetry, model execution pipelines, SEC filings research, and real-time streaming graph visualisations.',
    feel: 'technical, dense and fast',
    ambition: 75,
    structure: 65,
  },
  {
    label: 'luxury travel marketplace',
    desc: 'An ultra-luxury bespoke travel booking sanctuary. Editorial typography, high-resolution imagery pacing, serene whitespace, and private concierge bookings.',
    feel: 'luxury without being flashy',
    ambition: 85,
    structure: 45,
  },
  {
    label: 'playful HR platform',
    desc: 'A modern people and culture hub for remote product organizations. Warm onboarding journeys, team celebration pulses, peer recognition, and automated pulse surveys.',
    feel: 'playful and warm',
    ambition: 60,
    structure: 50,
  },
  {
    label: 'developer observability tool',
    desc: 'High-throughput microservices APM cockpit for infrastructure engineers. Real-time distributed traces, flamegraphs, incident post-mortems, and eBPF network metrics.',
    feel: 'technical, dense and fast',
    ambition: 65,
    structure: 70,
  },
  {
    label: 'minimalist finance app',
    desc: 'Disciplined wealth preservation and institutional treasury management app. Focused high-contrast typography, zero distraction, and audited wire execution.',
    feel: 'quiet, professional and minimal',
    ambition: 50,
    structure: 35,
  },
];

export function HeroComposer({ onComposed }: HeroComposerProps) {
  const [description, setDescription] = useState(
    'An AI market-intelligence platform for procurement teams. Serious and technical in the app, premium and cinematic on marketing pages…'
  );
  const [feel, setFeel] = useState('Professional + Playful');
  const [visualAmbition, setVisualAmbition] = useState(76);
  const [structuralCreativity, setStructuralCreativity] = useState(64);
  const [stack, setStack] = useState('React + Tailwind 4');
  const [isComposing, setIsComposing] = useState(false);

  // Real-time deterministic interpretation of current input
  const liveInterpreted = useMemo(() => {
    try {
      const briefInput: ProductBriefInput = {
        description,
        feel,
        visualAmbition,
        structuralCreativity,
        accessibilityFloor: 'AA',
        performanceCeiling: 'balanced',
        targetDevices: ['desktop', 'tablet', 'mobile'],
      };
      return interpretProductBrief(briefInput);
    } catch {
      return null;
    }
  }, [description, feel, visualAmbition, structuralCreativity]);

  const dna = liveInterpreted?.productModel;
  const profScore = dna ? Math.round(dna.trustRequirement) : 88;
  const techScore = dna ? Math.round(dna.informationComplexity) : 82;

  const handleApplyPreset = (p: typeof PRESET_BRIEFS[number]) => {
    setDescription(p.desc);
    setFeel(p.feel);
    setVisualAmbition(p.ambition);
    setStructuralCreativity(p.structure);
  };

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsComposing(true);

    const input: ProductBriefInput = {
      description,
      feel,
      visualAmbition,
      structuralCreativity,
      accessibilityFloor: 'AA',
      performanceCeiling: 'balanced',
      targetDevices: ['desktop', 'tablet', 'mobile'],
    };

    if (onComposed) {
      onComposed(input);
    }

    setTimeout(() => {
      setIsComposing(false);
      // Scroll to directions section
      const directionsEl = document.getElementById('three-directions-demo');
      if (directionsEl) {
        directionsEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 350);
  };

  return (
    <section className="relative pt-12 pb-20 px-6 max-w-[1440px] mx-auto select-none">
      {/* Kicker badge */}
      <div className="flex items-center gap-2.5 mb-6">
        <span className="h-2 w-2 rounded-full bg-[#C9FF57] ring-4 ring-[#C9FF57]/20" />
        <span className="font-mono text-xs font-semibold tracking-wider text-[#62666F] uppercase">
          Open Interface Intelligence
        </span>
      </div>

      {/* Hero Headline and Subhead */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
        <div className="lg:col-span-8 space-y-4">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-[#111217] leading-[1.04]">
            Describe the product.<br />
            Get the interface.
          </h1>
          <p className="text-lg sm:text-xl text-[#62666F] max-w-2xl font-normal leading-relaxed">
            Tessellate turns product intent into cohesive interface systems using an open library of components, patterns, motion and design intelligence.
          </p>
        </div>

        {/* Preset Quick Chips */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Preset Exemplars:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_BRIEFS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-xs px-2.5 py-1 rounded-md bg-[#FAF9F6] border border-[#D9D6CF] text-[#62666F] hover:text-[#111217] hover:border-[#111217] transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Composer Surface & Side Telemetry */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Main Composer Instrument Card */}
        <form
          onSubmit={handleComposeSubmit}
          className="xl:col-span-9 bg-white border border-[#D9D6CF] rounded-[20px] p-6 sm:p-7 shadow-[0_18px_30px_rgba(17,18,23,0.08)] transition-all hover:border-[#C7C3BA]"
        >
          {/* Header row */}
          <div className="flex items-center justify-between pb-3">
            <span className="font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              Product Brief
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#62666F]">
              <Sparkles className="h-3.5 w-3.5 text-[#2547E8]" />
              <span>Deterministic Core Active</span>
            </div>
          </div>

          {/* Prompt input area */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            aria-label="Product description and requirements"
            placeholder="Describe what this product does, its users, complexity, and visual atmosphere…"
            className="w-full text-base sm:text-lg text-[#111217] placeholder-[#62666F] bg-transparent resize-none border-none focus:outline-none focus:ring-0 leading-relaxed font-sans"
          />

          {/* Separator */}
          <div className="h-px bg-[#E5E2DC] my-4" />

          {/* Bottom Tool Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-6 text-xs">
              {/* Feel Parameter */}
              <div className="space-y-1">
                <span className="block font-mono text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                  Feel
                </span>
                <input
                  type="text"
                  value={feel}
                  aria-label="Interface feel"
                  onChange={(e) => setFeel(e.target.value)}
                  className="font-semibold text-[#111217] bg-transparent border-none p-0 focus:outline-none text-xs w-36 hover:underline cursor-pointer"
                  title="Click to edit feel prompt"
                />
              </div>

              {/* Ambition Parameter */}
              <div className="space-y-1">
                <span className="block font-mono text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                  Ambition ({visualAmbition})
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="10"
                    max="95"
                    value={visualAmbition}
                    aria-label="Visual ambition level"
                    onChange={(e) => setVisualAmbition(Number(e.target.value))}
                    className="w-20 accent-[#2547E8] cursor-pointer"
                  />
                  <span className="font-semibold text-[#111217]">
                    {VISUAL_AMBITION_STOPS[getVisualAmbitionStop(visualAmbition)].label}
                  </span>
                </div>
              </div>

              {/* Structure Parameter */}
              <div className="space-y-1">
                <span className="block font-mono text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                  Structure ({structuralCreativity})
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={structuralCreativity}
                    aria-label="Structural creativity level"
                    onChange={(e) => setStructuralCreativity(Number(e.target.value))}
                    className="w-20 accent-[#111217] cursor-pointer"
                  />
                  <span className="font-semibold text-[#111217]">
                    {STRUCTURAL_CREATIVITY_STOPS[getStructuralCreativityStop(structuralCreativity)].label}
                  </span>
                </div>
              </div>

              {/* Stack Parameter */}
              <div className="hidden md:block space-y-1">
                <span className="block font-mono text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                  Stack
                </span>
                <select
                  value={stack}
                  aria-label="Target technical stack"
                  onChange={(e) => setStack(e.target.value)}
                  className="font-semibold text-[#111217] bg-transparent border-none p-0 focus:outline-none text-xs cursor-pointer"
                >
                  <option value="React + Tailwind 4">React + Tailwind 4</option>
                  <option value="Vite + React 19">Vite + React 19</option>
                </select>
              </div>
            </div>

            {/* Compose CTA Button */}
            <button
              type="submit"
              disabled={isComposing}
              className="flex items-center gap-2 rounded-lg bg-[#2547E8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E3CCD] transition-colors shadow-sm disabled:opacity-75 cursor-pointer ml-auto"
            >
              <span>{isComposing ? 'Synthesizing…' : 'Compose'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Side Design DNA Telemetry Widget */}
        <div className="xl:col-span-3 bg-[#FAF9F6] border border-[#D9D6CF] rounded-[20px] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-3">
            <span className="font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              Design DNA Priors
            </span>
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#62666F]" />
          </div>

          <div className="space-y-4 text-xs font-medium">
            {/* Professional Meter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#62666F]">
                <span>Professional</span>
                <span className="font-mono text-[#111217] font-semibold">{profScore}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#D9D6CF] overflow-hidden">
                <div
                  className="h-full bg-[#2547E8] transition-all duration-300"
                  style={{ width: `${profScore}%` }}
                />
              </div>
            </div>

            {/* Technical Meter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#62666F]">
                <span>Technical</span>
                <span className="font-mono text-[#111217] font-semibold">{techScore}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#D9D6CF] overflow-hidden">
                <div
                  className="h-full bg-[#2547E8] transition-all duration-300"
                  style={{ width: `${techScore}%` }}
                />
              </div>
            </div>

            {/* Visual Ambition Meter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#62666F]">
                <span>Visual ambition</span>
                <span className="font-mono text-[#111217] font-semibold">{visualAmbition}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#D9D6CF] overflow-hidden">
                <div
                  className="h-full bg-[#2547E8] transition-all duration-300"
                  style={{ width: `${visualAmbition}%` }}
                />
              </div>
            </div>

            {/* Structure Creativity Meter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#62666F]">
                <span>Structure creativity</span>
                <span className="font-mono text-[#111217] font-semibold">{structuralCreativity}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#D9D6CF] overflow-hidden">
                <div
                  className="h-full bg-[#111217] transition-all duration-300"
                  style={{ width: `${structuralCreativity}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[var(--text-muted)] pt-2 border-t border-[#D9D6CF] font-sans">
            Calibrated deterministically from input semantics without requiring external cloud inference.
          </p>
        </div>
      </div>
    </section>
  );
}
