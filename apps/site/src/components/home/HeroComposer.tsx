import React, { useState } from 'react';
import {
  type ProductBriefInput,
} from '@tessellate/composer';
import { ArrowRight, SlidersHorizontal, Sparkles } from 'lucide-react';

interface HeroComposerProps {
  onComposed?: (input: ProductBriefInput) => void;
}

const DEFAULT_BRIEF = {
  label: 'playful HR platform',
  desc: 'A professional but playful employee experience platform for a 500-person technology company. Warm onboarding journeys, team discovery, peer recognition, and trusted workplace policies.',
  feel: 'professional but playful',
  ambition: 60,
  structure: 50,
};

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
  DEFAULT_BRIEF,
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
    DEFAULT_BRIEF.desc
  );
  const [feel, setFeel] = useState(DEFAULT_BRIEF.feel);
  const [visualAmbition, setVisualAmbition] = useState(DEFAULT_BRIEF.ambition);
  const [structuralCreativity, setStructuralCreativity] = useState(DEFAULT_BRIEF.structure);
  const [isComposing, setIsComposing] = useState(false);
  const [handoffError, setHandoffError] = useState('');

  const handleApplyPreset = (p: typeof PRESET_BRIEFS[number]) => {
    setDescription(p.desc);
    setFeel(p.feel);
    setVisualAmbition(p.ambition);
    setStructuralCreativity(p.structure);
  };

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHandoffError('');
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
      setIsComposing(false);
      return;
    }

    try {
      window.sessionStorage.setItem('tessellate:pending-compose-brief', JSON.stringify(input));
      window.location.assign('/compose');
    } catch {
      setIsComposing(false);
      setHandoffError('Your browser could not pass this brief to Compose. Copy it before continuing.');
    }
  };

  return (
    <section className="relative pt-8 pb-10 px-6 max-w-[1440px] mx-auto select-none md:pt-12 md:pb-12">
      {/* Kicker badge */}
      <div className="flex items-center gap-2.5 mb-3 sm:mb-6">
        <span className="h-2 w-2 rounded-full bg-[#C9FF57] ring-4 ring-[#C9FF57]/20" />
        <span className="font-mono text-xs font-semibold tracking-wider text-[#62666F] uppercase">
          Open Interface Intelligence
        </span>
      </div>

      {/* Hero Headline and Subhead */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-end mb-7 sm:mb-12">
        <div className="lg:col-span-8 space-y-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-[#111217] leading-[1.04]">
            Describe the product.<br />
            Get the interface.
          </h1>
          <p className="text-base sm:text-xl text-[#62666F] max-w-2xl font-normal leading-relaxed">
            Tessellate turns product intent into cohesive interface systems using an open library of components, patterns, motion and design intelligence.
          </p>
        </div>

        {/* Preset Quick Chips */}
        <div className="lg:col-span-4 flex min-w-0 flex-col gap-2">
          <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Preset Exemplars:
          </span>
          <div aria-label="Preset briefs" className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            {PRESET_BRIEFS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="shrink-0 text-[11px] sm:text-xs px-2.5 py-1 rounded-md bg-[#FAF9F6] border border-[#D9D6CF] text-[#62666F] hover:text-[#111217] hover:border-[#111217] transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Composer Surface & Side Telemetry */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-8 items-start">
        {/* Main Composer Instrument Card */}
        <form
          onSubmit={handleComposeSubmit}
          className="xl:col-span-9 bg-white border border-[#D9D6CF] rounded-[20px] p-4 sm:p-7 shadow-[0_18px_30px_rgba(17,18,23,0.08)] transition-all hover:border-[#C7C3BA]"
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
            id="hero-product-brief"
            name="productBrief"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            rows={2}
            aria-label="Product description and requirements"
            placeholder="Describe what this product does, its users, complexity, and visual atmosphere…"
            className="w-full min-h-14 sm:min-h-[4.5rem] text-base sm:text-lg text-[#111217] placeholder-[#62666F] bg-transparent resize-none border-none focus:outline-none focus:ring-0 leading-relaxed font-sans"
          />

          {/* Separator */}
          <div className="h-px bg-[#E5E2DC] my-3 sm:my-4" />

          {/* Bottom Tool Row */}
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="hidden flex-wrap items-center gap-6 text-xs sm:flex">
              {/* Feel Parameter */}
              <div className="space-y-1">
                <span className="block font-mono text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                  Feel
                </span>
                <input
                  id="hero-interface-feel"
                  name="interfaceFeel"
                  type="text"
                  value={feel}
                  aria-label="Interface feel"
                  onChange={(e) => {
                    setFeel(e.target.value);
                  }}
                  className="font-semibold text-[#111217] bg-transparent border-none p-0 focus:outline-none text-xs w-36 hover:underline cursor-pointer"
                  title="Click to edit feel prompt"
                />
              </div>

              {/* Ambition Parameter */}
              <div className="space-y-1">
                <span className="block font-mono text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                  Ambition
                </span>
                <div className="flex items-center gap-2">
                  <input
                    id="hero-visual-ambition"
                    name="visualAmbition"
                    type="range"
                    min="10"
                    max="95"
                    value={visualAmbition}
                    aria-label="Visual ambition level"
                    onChange={(e) => {
                      setVisualAmbition(Number(e.target.value));
                    }}
                    className="w-20 accent-[#2547E8] cursor-pointer"
                  />
                  <span className="font-semibold text-[#111217]">
                    {visualAmbition} / 100
                  </span>
                </div>
              </div>

              {/* Structure Parameter */}
              <div className="space-y-1">
                <span className="block font-mono text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                  Structure
                </span>
                <div className="flex items-center gap-2">
                  <input
                    id="hero-structural-creativity"
                    name="structuralCreativity"
                    type="range"
                    min="10"
                    max="90"
                    value={structuralCreativity}
                    aria-label="Structural creativity level"
                    onChange={(e) => {
                      setStructuralCreativity(Number(e.target.value));
                    }}
                    className="w-20 accent-[#111217] cursor-pointer"
                  />
                  <span className="font-semibold text-[#111217]">
                    {structuralCreativity} / 100
                  </span>
                </div>
              </div>

              {/* Stack Parameter */}
              <div className="hidden md:block space-y-1">
                <span className="block font-mono text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                  Stack
                </span>
                <span className="block font-semibold text-[#111217] text-xs">React 19 + Tailwind CSS 4</span>
              </div>
            </div>

            <details className="group rounded-lg border border-[#D9D6CF] bg-[#FAF9F6] text-xs sm:hidden">
              <summary className="flex cursor-pointer list-none flex-col gap-1 px-3 py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2547E8]">
                <span className="font-semibold text-[#111217]">Feel, ambition and structure</span>
                <span className="text-[11px] text-[#62666F]">{feel} · {visualAmbition} ambition · {structuralCreativity} structure</span>
              </summary>
              <div className="grid grid-cols-2 gap-3 border-t border-[#D9D6CF] p-3">
                <label className="col-span-2 space-y-1">
                  <span className="block font-mono text-[10px] uppercase font-semibold text-[var(--text-muted)]">Feel</span>
                  <input
                    id="hero-mobile-interface-feel"
                    name="mobileInterfaceFeel"
                    type="text"
                    value={feel}
                    aria-label="Interface feel"
                    onChange={(e) => setFeel(e.target.value)}
                    className="w-full border-b border-[#C7C3BA] bg-transparent py-1 font-semibold text-[#111217] focus:border-[#2547E8] focus:outline-none"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block font-mono text-[10px] uppercase font-semibold text-[var(--text-muted)]">Ambition</span>
                  <input
                    id="hero-mobile-visual-ambition"
                    name="mobileVisualAmbition"
                    type="range"
                    min="10"
                    max="95"
                    value={visualAmbition}
                    aria-label="Visual ambition level"
                    onChange={(e) => setVisualAmbition(Number(e.target.value))}
                    className="w-full accent-[#2547E8]"
                  />
                  <output className="block font-mono text-[11px]">{visualAmbition} / 100</output>
                </label>
                <label className="space-y-1">
                  <span className="block font-mono text-[10px] uppercase font-semibold text-[var(--text-muted)]">Structure</span>
                  <input
                    id="hero-mobile-structural-creativity"
                    name="mobileStructuralCreativity"
                    type="range"
                    min="10"
                    max="90"
                    value={structuralCreativity}
                    aria-label="Structural creativity level"
                    onChange={(e) => setStructuralCreativity(Number(e.target.value))}
                    className="w-full accent-[#111217]"
                  />
                  <output className="block font-mono text-[11px]">{structuralCreativity} / 100</output>
                </label>
              </div>
            </details>

            {/* Compose CTA Button */}
            <button
              type="submit"
              disabled={isComposing}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2547E8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E3CCD] transition-colors shadow-sm disabled:opacity-75 cursor-pointer sm:ml-auto sm:w-auto"
            >
              <span>{isComposing ? 'Opening Compose…' : 'Compose'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {handoffError && <p role="alert" className="mt-4 text-sm text-[#C83D48]">{handoffError}</p>}
        </form>

        {/* Side panel echoes the user's selected controls without running the full engine. */}
        <div className="hidden xl:col-span-3 bg-[#FAF9F6] border border-[#D9D6CF] rounded-[20px] p-6 space-y-5 xl:block">
          <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-3">
            <span className="font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              Current settings
            </span>
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#62666F]" />
          </div>

          <div className="space-y-4 text-xs font-medium">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#62666F]">
                <span>Visual ambition</span>
                <output aria-label="Selected visual ambition" className="font-mono text-[#111217] font-semibold">
                  {visualAmbition} / 100
                </output>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#D9D6CF] overflow-hidden">
                <div
                  className="h-full bg-[#2547E8] transition-all duration-300"
                  style={{ width: `${visualAmbition}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[#62666F]">
                <span>Structural creativity</span>
                <output aria-label="Selected structural creativity" className="font-mono text-[#111217] font-semibold">
                  {structuralCreativity} / 100
                </output>
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
            These are your selected values. Compose carries them with the brief into the deterministic product pipeline.
          </p>
        </div>
      </div>
    </section>
  );
}
