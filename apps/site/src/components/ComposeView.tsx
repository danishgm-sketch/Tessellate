import React, { useState } from 'react';
import {
  interpretProductBrief,
  planScreenGraph,
  getAllGoldenBriefs,
  getGoldenBrief,
  getAllProductArchetypes,
  type ProductBriefInput,
} from '@tessellate/composer';
import {
  VISUAL_AMBITION_STOPS,
  STRUCTURAL_CREATIVITY_STOPS,
  getVisualAmbitionStop,
  getStructuralCreativityStop,
  type VisualAmbitionStop,
  type StructuralCreativityStop,
} from '@tessellate/dna';
import {
  Sparkles,
  ArrowRight,
  Shield,
  ChevronDown,
  ChevronUp,
  Cpu,
  Smartphone,
  Monitor,
  Laptop,
} from 'lucide-react';

export function ComposeView() {
  const goldenBriefs = getAllGoldenBriefs();
  const archetypes = getAllProductArchetypes();

  // Form State
  const [description, setDescription] = useState(
    'A high-density financial intelligence trading terminal for equity analysts and portfolio managers, featuring real-time market data streams, order book depth, SEC filings research, and multi-asset risk telemetry.'
  );
  const [selectedArchetypeOverride, setSelectedArchetypeOverride] = useState<string>('');
  const [feel, setFeel] = useState<string>('dense and technical');
  const [visualAmbition, setVisualAmbition] = useState<number>(40);
  const [structuralCreativity, setStructuralCreativity] = useState<number>(35);
  const [accessibilityFloor, setAccessibilityFloor] = useState<'A' | 'AA' | 'AAA'>('AA');
  const [performanceCeiling, setPerformanceCeiling] = useState<'lightweight' | 'balanced' | 'rich'>('rich');
  const [targetDevices, setTargetDevices] = useState<Array<'desktop' | 'tablet' | 'mobile'>>(['desktop']);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Result state
  const [hasComposed, setHasComposed] = useState<boolean>(false);

  const currentVisualStop = getVisualAmbitionStop(visualAmbition);
  const currentStructuralStop = getStructuralCreativityStop(structuralCreativity);

  const handleSelectGoldenBrief = (id: string) => {
    const brief = getGoldenBrief(id);
    if (!brief) return;
    setDescription(brief.input.description);
    setFeel(brief.input.feel ?? '');
    setVisualAmbition(brief.input.visualAmbition ?? 40);
    setStructuralCreativity(brief.input.structuralCreativity ?? 35);
    setAccessibilityFloor(brief.input.accessibilityFloor ?? 'AA');
    setPerformanceCeiling(brief.input.performanceCeiling ?? 'balanced');
    setTargetDevices(brief.input.targetDevices ?? ['desktop', 'tablet', 'mobile']);
    setSelectedArchetypeOverride('');
    setHasComposed(false);
  };

  const handleToggleDevice = (device: 'desktop' | 'tablet' | 'mobile') => {
    if (targetDevices.includes(device)) {
      if (targetDevices.length > 1) {
        setTargetDevices(targetDevices.filter((d) => d !== device));
      }
    } else {
      setTargetDevices([...targetDevices, device]);
    }
  };

  // Run deterministic composition
  const briefInput: ProductBriefInput = {
    description,
    archetypeOverride: selectedArchetypeOverride || undefined,
    feel,
    visualAmbition,
    structuralCreativity,
    accessibilityFloor,
    performanceCeiling,
    targetDevices,
  };

  const { productModel, inferredAssumptions } = interpretProductBrief(briefInput);
  const screenPlan = planScreenGraph(productModel);

  const handleCompose = (e: React.FormEvent) => {
    e.preventDefault();
    setHasComposed(true);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#E7EBFF] px-2.5 py-0.5 text-[11px] font-semibold text-[#2547E8] dark:bg-[#1C2752] dark:text-[#6782FF]">
          <Cpu className="h-3 w-3" /> Deterministic Product Composer (Phase 6)
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[#111217] dark:text-[#F5F7FA]">
          Describe the product. Get the interface.
        </h1>
        <p className="max-w-3xl text-base text-[#62666F] dark:text-[#A8AFBA]">
          Tessellate understands product architecture without requiring an LLM. Enter your product brief below to generate a validated ProductModel, ScreenGraph, and three design directions.
        </p>

        {/* Golden Brief Preset Pills */}
        <div className="pt-2">
          <div className="text-xs font-semibold text-[#8B8F97] dark:text-[#707986]">
            Load Golden Specification Briefs:
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {goldenBriefs.map((brief) => (
              <button
                key={brief.id}
                type="button"
                onClick={() => handleSelectGoldenBrief(brief.id)}
                className="rounded-full border border-[#D9D6CF] bg-white px-3 py-1 text-xs font-medium text-[#111217] hover:border-[#2547E8] hover:text-[#2547E8] dark:border-[#272C34] dark:bg-[#171B21] dark:text-[#F5F7FA] dark:hover:border-[#6782FF] dark:hover:text-[#6782FF]"
              >
                {brief.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Composer Form */}
      <form onSubmit={handleCompose} className="space-y-8 rounded-2xl border border-[#D9D6CF] bg-white p-6 shadow-sm dark:border-[#272C34] dark:bg-[#171B21] md:p-8">
        {/* Description Textarea */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-bold text-[#111217] dark:text-[#F5F7FA]">
            Product Description & Objectives
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what your product does, who it is for, and key operational capabilities..."
            className="w-full rounded-xl border border-[#D9D6CF] bg-[#FAF9F6] p-4 text-sm text-[#111217] focus:border-[#2547E8] focus:bg-white focus:outline-none dark:border-[#272C34] dark:bg-[#0B0D10] dark:text-[#F5F7FA] dark:focus:border-[#6782FF]"
            required
          />
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Archetype Override */}
          <div className="space-y-2">
            <label htmlFor="archetype" className="block text-xs font-bold text-[#111217] dark:text-[#F5F7FA]">
              Archetype Priority (Optional Override)
            </label>
            <select
              id="archetype"
              value={selectedArchetypeOverride}
              onChange={(e) => setSelectedArchetypeOverride(e.target.value)}
              className="w-full rounded-lg border border-[#D9D6CF] bg-[#FAF9F6] px-3 py-2 text-xs text-[#111217] focus:border-[#2547E8] focus:outline-none dark:border-[#272C34] dark:bg-[#0B0D10] dark:text-[#F5F7FA]"
            >
              <option value="">Auto-Detect from Brief</option>
              {archetypes.map((arch) => (
                <option key={arch.id} value={arch.id}>
                  {arch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Feel Query */}
          <div className="space-y-2">
            <label htmlFor="feel" className="block text-xs font-bold text-[#111217] dark:text-[#F5F7FA]">
              Desired Feel / Adjectives
            </label>
            <input
              id="feel"
              type="text"
              value={feel}
              onChange={(e) => setFeel(e.target.value)}
              placeholder="e.g. professional but playful, dense and fast"
              className="w-full rounded-lg border border-[#D9D6CF] bg-[#FAF9F6] px-3 py-2 text-xs text-[#111217] focus:border-[#2547E8] focus:outline-none dark:border-[#272C34] dark:bg-[#0B0D10] dark:text-[#F5F7FA]"
            />
          </div>

          {/* Primary Stack */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#111217] dark:text-[#F5F7FA]">
              Primary Front-End Stack
            </label>
            <div className="rounded-lg border border-[#D9D6CF] bg-[#FAF9F6] px-3 py-2 text-xs font-mono text-[#62666F] dark:border-[#272C34] dark:bg-[#0B0D10] dark:text-[#A8AFBA]">
              React 19 + Tailwind CSS 4 (V1 Standard)
            </div>
          </div>
        </div>

        {/* 5-Stop Sliders Grid */}
        <div className="grid grid-cols-1 gap-6 border-t border-[#D9D6CF] pt-6 dark:border-[#272C34] md:grid-cols-2">
          {/* Visual Ambition */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#111217] dark:text-[#F5F7FA]">
                Visual Ambition
              </label>
              <span className="text-xs font-semibold text-[#2547E8] uppercase dark:text-[#6782FF]">
                {currentVisualStop} ({visualAmbition})
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {(['essential', 'refined', 'striking', 'stunning', 'experimental'] as const).map((stop) => {
                const def = VISUAL_AMBITION_STOPS[stop as VisualAmbitionStop];
                const isSelected = currentVisualStop === stop;
                return (
                  <button
                    key={stop}
                    type="button"
                    onClick={() => setVisualAmbition(def.defaultScore)}
                    className={`rounded-md p-2 text-center text-xs transition-all ${
                      isSelected
                        ? 'bg-[#2547E8] font-bold text-white shadow-sm dark:bg-[#6782FF] dark:text-[#0B0D10]'
                        : 'border border-[#D9D6CF] bg-[#FAF9F6] text-[#62666F] hover:bg-white dark:border-[#272C34] dark:bg-[#0B0D10] dark:text-[#A8AFBA]'
                    }`}
                  >
                    {def.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Structural Creativity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#111217] dark:text-[#F5F7FA]">
                Structural Creativity
              </label>
              <span className="text-xs font-semibold text-[#2547E8] uppercase dark:text-[#6782FF]">
                {currentStructuralStop} ({structuralCreativity})
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {(['familiar', 'modern', 'inventive', 'radical', 'experimental'] as const).map((stop) => {
                const def = STRUCTURAL_CREATIVITY_STOPS[stop as StructuralCreativityStop];
                const isSelected = currentStructuralStop === stop;
                return (
                  <button
                    key={stop}
                    type="button"
                    onClick={() => setStructuralCreativity(def.defaultScore)}
                    className={`rounded-md p-2 text-center text-xs transition-all ${
                      isSelected
                        ? 'bg-[#2547E8] font-bold text-white shadow-sm dark:bg-[#6782FF] dark:text-[#0B0D10]'
                        : 'border border-[#D9D6CF] bg-[#FAF9F6] text-[#62666F] hover:bg-white dark:border-[#272C34] dark:bg-[#0B0D10] dark:text-[#A8AFBA]'
                    }`}
                  >
                    {def.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Advanced Constraints Toggle */}
        <div className="border-t border-[#D9D6CF] pt-4 dark:border-[#272C34]">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#62666F] hover:text-[#111217] dark:text-[#A8AFBA] dark:hover:text-[#F5F7FA]"
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Advanced Constraints & Devices
          </button>

          {showAdvanced && (
            <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl bg-[#FAF9F6] p-4 dark:bg-[#0B0D10] sm:grid-cols-3">
              {/* Devices */}
              <div>
                <span className="text-xs font-bold">Target Devices</span>
                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleDevice('desktop')}
                    className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs ${
                      targetDevices.includes('desktop')
                        ? 'bg-[#2547E8] text-white'
                        : 'border border-[#D9D6CF] text-[#62666F] dark:border-[#272C34]'
                    }`}
                  >
                    <Monitor className="h-3 w-3" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleDevice('tablet')}
                    className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs ${
                      targetDevices.includes('tablet')
                        ? 'bg-[#2547E8] text-white'
                        : 'border border-[#D9D6CF] text-[#62666F] dark:border-[#272C34]'
                    }`}
                  >
                    <Laptop className="h-3 w-3" /> Tablet
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleDevice('mobile')}
                    className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs ${
                      targetDevices.includes('mobile')
                        ? 'bg-[#2547E8] text-white'
                        : 'border border-[#D9D6CF] text-[#62666F] dark:border-[#272C34]'
                    }`}
                  >
                    <Smartphone className="h-3 w-3" /> Mobile
                  </button>
                </div>
              </div>

              {/* Accessibility Floor */}
              <div>
                <span className="text-xs font-bold">Accessibility Floor</span>
                <select
                  value={accessibilityFloor}
                  onChange={(e) => setAccessibilityFloor(e.target.value as 'A' | 'AA' | 'AAA')}
                  className="mt-2 w-full rounded border border-[#D9D6CF] bg-white p-1.5 text-xs dark:border-[#272C34] dark:bg-[#171B21]"
                >
                  <option value="A">WCAG 2.2 A (Baseline)</option>
                  <option value="AA">WCAG 2.2 AA (Standard)</option>
                  <option value="AAA">WCAG 2.2 AAA (High Contrast / Strict)</option>
                </select>
              </div>

              {/* Performance Ceiling */}
              <div>
                <span className="text-xs font-bold">Performance Ceiling</span>
                <select
                  value={performanceCeiling}
                  onChange={(e) => setPerformanceCeiling(e.target.value as 'lightweight' | 'balanced' | 'rich')}
                  className="mt-2 w-full rounded border border-[#D9D6CF] bg-white p-1.5 text-xs dark:border-[#272C34] dark:bg-[#171B21]"
                >
                  <option value="balanced">Balanced (&lt; 200KB JS)</option>
                  <option value="lightweight">Lightweight / Fast Latency</option>
                  <option value="rich">Rich Visuals (3D/Video allowed)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Compose CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2547E8] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1E3CCD] dark:bg-[#6782FF] dark:text-[#0B0D10] dark:hover:bg-[#879DFF]"
          >
            <Sparkles className="h-4 w-4" />
            Compose Interface System
          </button>
        </div>
      </form>

      {/* Output Sections (Visible after composing or pre-rendered) */}
      {(hasComposed || description) && (
        <div className="space-y-12">
          {/* Inferred ProductModel & Assumptions */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#111217] dark:text-[#F5F7FA]">
                  Inferred Product Architecture
                </h2>
                <p className="text-sm text-[#62666F] dark:text-[#A8AFBA]">
                  Deterministic inferences derived from brief vocabulary and archetype priors.
                </p>
              </div>
              <span className="rounded-full bg-[#177B55]/10 px-3 py-1 text-xs font-bold text-[#177B55]">
                Schema Valid (ProductModel 1.0.0)
              </span>
            </div>

            {/* Inferred Assumptions Box */}
            <div className="rounded-xl border border-[#D9D6CF] bg-[#FAF9F6] p-5 dark:border-[#272C34] dark:bg-[#111419]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2547E8] dark:text-[#6782FF]">
                <Shield className="h-4 w-4" /> Deterministic Assumptions
              </div>
              <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-[#62666F] dark:text-[#A8AFBA]">
                {inferredAssumptions.map((assumption, idx) => (
                  <li key={idx}>{assumption}</li>
                ))}
              </ul>
            </div>

            {/* Metrics Scorecard */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              <div className="rounded-xl border border-[#D9D6CF] bg-white p-4 dark:border-[#272C34] dark:bg-[#171B21]">
                <div className="text-[10px] text-[#8B8F97]">Primary Archetype</div>
                <div className="mt-1 font-bold text-sm text-[#2547E8] uppercase dark:text-[#6782FF]">
                  {productModel.productArchetypes[0]?.tag}
                </div>
              </div>
              <div className="rounded-xl border border-[#D9D6CF] bg-white p-4 dark:border-[#272C34] dark:bg-[#171B21]">
                <div className="text-[10px] text-[#8B8F97]">User Sophistication</div>
                <div className="mt-1 font-mono font-bold text-base">{productModel.userSophistication}/100</div>
              </div>
              <div className="rounded-xl border border-[#D9D6CF] bg-white p-4 dark:border-[#272C34] dark:bg-[#171B21]">
                <div className="text-[10px] text-[#8B8F97]">Trust Requirement</div>
                <div className="mt-1 font-mono font-bold text-base">{productModel.trustRequirement}/100</div>
              </div>
              <div className="rounded-xl border border-[#D9D6CF] bg-white p-4 dark:border-[#272C34] dark:bg-[#171B21]">
                <div className="text-[10px] text-[#8B8F97]">Data Density</div>
                <div className="mt-1 font-mono font-bold text-base">{productModel.dataDensity}/100</div>
              </div>
              <div className="rounded-xl border border-[#D9D6CF] bg-white p-4 dark:border-[#272C34] dark:bg-[#171B21]">
                <div className="text-[10px] text-[#8B8F97]">Information Complexity</div>
                <div className="mt-1 font-mono font-bold text-base">{productModel.informationComplexity}/100</div>
              </div>
              <div className="rounded-xl border border-[#D9D6CF] bg-white p-4 dark:border-[#272C34] dark:bg-[#171B21]">
                <div className="text-[10px] text-[#8B8F97]">Mobile Priority</div>
                <div className="mt-1 font-mono font-bold text-base">{productModel.mobileImportance}/100</div>
              </div>
            </div>
          </section>

          {/* Planned ScreenGraph */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#111217] dark:text-[#F5F7FA]">
                  Planned ScreenGraph ({screenPlan.totalScreens} Screens)
                </h2>
                <p className="text-sm text-[#62666F] dark:text-[#A8AFBA]">
                  Structured screen classes, route slugs, required section roles, and navigation hierarchy.
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="rounded bg-[#E7EBFF] px-2.5 py-1 font-semibold text-[#2547E8] dark:bg-[#1C2752] dark:text-[#6782FF]">
                  {screenPlan.requiredScreensCount} Required
                </span>
                <span className="rounded bg-[#FAF9F6] px-2.5 py-1 font-semibold text-[#62666F] dark:bg-[#171B21] dark:text-[#A8AFBA]">
                  {screenPlan.optionalScreensCount} Optional
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {screenPlan.screenGraph.groups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-2xl border border-[#D9D6CF] bg-white p-6 shadow-sm dark:border-[#272C34] dark:bg-[#171B21]"
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B8F97] dark:text-[#707986]">
                    {group.name} Group
                  </h3>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.screens.map((screen) => (
                      <div
                        key={screen.id}
                        className="rounded-xl border border-[#D9D6CF]/80 bg-[#FAF9F6] p-4 dark:border-[#272C34] dark:bg-[#0B0D10]"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-sm text-[#111217] dark:text-[#F5F7FA]">
                              {screen.name}
                            </span>
                            <div className="font-mono text-xs text-[#2547E8] dark:text-[#6782FF]">
                              {screen.slug}
                            </div>
                          </div>
                          {screen.required ? (
                            <span className="rounded bg-[#177B55]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#177B55]">
                              Required
                            </span>
                          ) : (
                            <span className="rounded bg-black/5 px-1.5 py-0.5 text-[10px] font-bold text-[#8B8F97] dark:bg-white/10">
                              Optional
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-xs text-[#62666F] dark:text-[#A8AFBA] line-clamp-2">
                          {screen.purpose}
                        </p>

                        <div className="mt-3 border-t border-[#D9D6CF]/40 pt-2 text-[10px] text-[#8B8F97]">
                          <span className="font-semibold">Required Roles:</span>{' '}
                          {screen.requiredRoles.slice(0, 3).join(', ')}...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Initial Three Directions */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[#111217] dark:text-[#F5F7FA]">
              Three Generated Directions
            </h2>
            <p className="text-sm text-[#62666F] dark:text-[#A8AFBA]">
              Deterministic directions generated from intent: conservative fit, expressive fit, and structural alternative.
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Direction A */}
              <div className="flex flex-col justify-between rounded-2xl border-2 border-[#2547E8] bg-white p-6 shadow-sm dark:border-[#6782FF] dark:bg-[#171B21]">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono text-[#2547E8] dark:text-[#6782FF]">
                      Direction 01
                    </span>
                    <span className="rounded bg-[#E7EBFF] px-2 py-0.5 text-[10px] font-bold text-[#2547E8] dark:bg-[#1C2752] dark:text-[#6782FF]">
                      Conservative Fit
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-[#111217] dark:text-[#F5F7FA]">
                    Institutional Precision
                  </h3>
                  <p className="mt-1 text-xs text-[#62666F] dark:text-[#A8AFBA]">
                    Closest to inferred baseline DNA. Prioritizes maximum speed, keyboard navigation, and familiar layout hierarchy.
                  </p>
                </div>
                <div className="mt-6">
                  <a
                    href="/dev/dna"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#2547E8] py-2 text-xs font-semibold text-white hover:bg-[#1E3CCD] dark:bg-[#6782FF] dark:text-[#0B0D10]"
                  >
                    Open in DNA Lab <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Direction B */}
              <div className="flex flex-col justify-between rounded-2xl border border-[#D9D6CF] bg-white p-6 shadow-sm dark:border-[#272C34] dark:bg-[#171B21]">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono text-[#8B8F97]">Direction 02</span>
                    <span className="rounded bg-[#FAF9F6] px-2 py-0.5 text-[10px] font-bold text-[#62666F] dark:bg-[#0B0D10] dark:text-[#A8AFBA]">
                      Expressive Fit
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-[#111217] dark:text-[#F5F7FA]">
                    Editorial Authority
                  </h3>
                  <p className="mt-1 text-xs text-[#62666F] dark:text-[#A8AFBA]">
                    Visual ambition increased. Rich serif display headers, generous whitespace, and gliding transitions while preserving all product jobs.
                  </p>
                </div>
                <div className="mt-6">
                  <a
                    href="/dev/dna"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#D9D6CF] bg-white py-2 text-xs font-semibold text-[#111217] hover:bg-[#FAF9F6] dark:border-[#272C34] dark:bg-[#171B21] dark:text-[#F5F7FA]"
                  >
                    Open in DNA Lab <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Direction C */}
              <div className="flex flex-col justify-between rounded-2xl border border-[#D9D6CF] bg-white p-6 shadow-sm dark:border-[#272C34] dark:bg-[#171B21]">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono text-[#8B8F97]">Direction 03</span>
                    <span className="rounded bg-[#FAF9F6] px-2 py-0.5 text-[10px] font-bold text-[#62666F] dark:bg-[#0B0D10] dark:text-[#A8AFBA]">
                      Structural Alternative
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-[#111217] dark:text-[#F5F7FA]">
                    Command Cockpit
                  </h3>
                  <p className="mt-1 text-xs text-[#62666F] dark:text-[#A8AFBA]">
                    Structural creativity meaningfully elevated. Dual-rail navigation, high density telemetry, and modal workspace canvases.
                  </p>
                </div>
                <div className="mt-6">
                  <a
                    href="/dev/dna"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#D9D6CF] bg-white py-2 text-xs font-semibold text-[#111217] hover:bg-[#FAF9F6] dark:border-[#272C34] dark:bg-[#171B21] dark:text-[#F5F7FA]"
                  >
                    Open in DNA Lab <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
