import React, { useState, useMemo } from 'react';
import {
  type DesignDNA,
  type DesignDNANumericKey,
  type PartialDesignDNA,
  DIMENSIONS_METADATA,
  DESIGN_DNA_NUMERIC_KEYS,
  DEFAULT_DESIGN_DNA,
  DNA_PRESETS,
  getDNAPreset,
  parseFeelDescriptors,
  applyFeelDescriptors,
  VISUAL_AMBITION_STOPS,
  STRUCTURAL_CREATIVITY_STOPS,
  getVisualAmbitionStop,
  getStructuralCreativityStop,
  applyVisualAmbition,
  applyStructuralCreativity,
  SEMANTIC_PALETTES,
  TYPOGRAPHY_PAIRINGS,
  MOTION_PERSONALITIES,
  resolveNodeHierarchyDNA,
  inspectAllDNAProperties,
} from '@tessellate/dna';
import {
  Sliders,
  Palette,
  Type,
  Activity,
  Layers,
  Sparkles,
  RotateCcw,
  Search,
  Eye,
  Check,
  Zap,
} from 'lucide-react';

type LabTab =
  | 'presets'
  | 'feel'
  | 'sliders'
  | 'palettes'
  | 'typography'
  | 'motion'
  | 'inheritance';

export function DnaLab() {
  const [activeTab, setActiveTab] = useState<LabTab>('presets');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('institutional-intelligence');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDna, setActiveDna] = useState<DesignDNA>(() => {
    return getDNAPreset('institutional-intelligence')?.dna ?? DEFAULT_DESIGN_DNA;
  });

  // Feel mixer state
  const [feelQuery, setFeelQuery] = useState<string>('professional but playful');

  // Palette preview state
  const [paletteMode, setPaletteMode] = useState<'light' | 'dark'>('light');

  // Hierarchy inheritance simulator state
  const [pageOverrides, setPageOverrides] = useState<PartialDesignDNA>({ curvature: 60 });
  const [sectionOverrides, setSectionOverrides] = useState<PartialDesignDNA>({ warmth: 80 });
  const [componentOverrides, setComponentOverrides] = useState<PartialDesignDNA>({ playfulness: 75 });
  const [elementOverrides, setElementOverrides] = useState<PartialDesignDNA>({});

  // Active motion test trigger
  const [motionActiveKey, setMotionActiveKey] = useState<string | null>(null);

  const selectedPreset = useMemo(() => {
    return getDNAPreset(selectedPresetId) ?? DNA_PRESETS[0]!;
  }, [selectedPresetId]);

  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return DNA_PRESETS;
    const q = searchQuery.toLowerCase().trim();
    return DNA_PRESETS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const parsedFeel = useMemo(() => {
    return parseFeelDescriptors(feelQuery);
  }, [feelQuery]);

  const effectiveHierarchyDna = useMemo(() => {
    return resolveNodeHierarchyDNA({
      project: activeDna,
      page: pageOverrides,
      section: sectionOverrides,
      component: componentOverrides,
      element: elementOverrides,
    });
  }, [activeDna, pageOverrides, sectionOverrides, componentOverrides, elementOverrides]);

  const inspectedProperties = useMemo(() => {
    return inspectAllDNAProperties({
      project: activeDna,
      page: pageOverrides,
      section: sectionOverrides,
      component: componentOverrides,
      element: elementOverrides,
    });
  }, [activeDna, pageOverrides, sectionOverrides, componentOverrides, elementOverrides]);

  const handleSelectPreset = (id: string) => {
    setSelectedPresetId(id);
    const p = getDNAPreset(id);
    if (p) {
      setActiveDna(p.dna);
    }
  };

  const handleApplyFeel = () => {
    const next = applyFeelDescriptors(activeDna, feelQuery);
    setActiveDna(next);
  };

  const handleResetToDefault = () => {
    setActiveDna(DEFAULT_DESIGN_DNA);
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 border-b border-[#D9D6CF] pb-6 dark:border-[#272C34] md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E7EBFF] px-2.5 py-0.5 text-[11px] font-semibold text-[#2547E8] dark:bg-[#1C2752] dark:text-[#6782FF]">
            <Sparkles className="h-3 w-3" /> Phase 5 Client Instrument
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#111217] dark:text-[#F5F7FA]">
            Design DNA Lab
          </h1>
          <p className="mt-1 text-sm text-[#62666F] dark:text-[#A8AFBA]">
            Explore 30 canonical presets, 28 numeric dimensions, feel mappings, 5-stop ambition & structure sliders, and 5-level node inheritance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D9D6CF] bg-white px-3 py-1.5 text-xs font-medium text-[#111217] hover:bg-[#FAF9F6] dark:border-[#272C34] dark:bg-[#171B21] dark:text-[#F5F7FA] dark:hover:bg-[#1C2128]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Baseline
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[#D9D6CF] pb-3 dark:border-[#272C34]">
        {[
          { id: 'presets', label: 'Presets (30)', icon: Layers },
          { id: 'feel', label: 'Feel Mixer', icon: Sparkles },
          { id: 'sliders', label: 'Ambition & Structure', icon: Sliders },
          { id: 'palettes', label: 'Palettes (20)', icon: Palette },
          { id: 'typography', label: 'Typography (16)', icon: Type },
          { id: 'motion', label: 'Motion (24)', icon: Activity },
          { id: 'inheritance', label: 'Inheritance Explorer', icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as LabTab)}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#2547E8] text-white shadow-sm dark:bg-[#6782FF] dark:text-[#0B0D10]'
                  : 'bg-transparent text-[#62666F] hover:bg-[#FAF9F6] hover:text-[#111217] dark:text-[#A8AFBA] dark:hover:bg-[#171B21] dark:hover:text-[#F5F7FA]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRESETS */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Preset Selector Rail */}
          <div className="lg:col-span-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8B8F97]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter 30 presets..."
                className="w-full rounded-lg border border-[#D9D6CF] bg-white py-2 pl-9 pr-3 text-xs text-[#111217] focus:border-[#2547E8] focus:outline-none dark:border-[#272C34] dark:bg-[#171B21] dark:text-[#F5F7FA]"
              />
            </div>

            <div className="max-h-[640px] space-y-1.5 overflow-y-auto pr-1">
              {filteredPresets.map((preset) => {
                const isSelected = preset.id === selectedPresetId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`w-full text-left rounded-lg p-3 text-xs transition-all ${
                      isSelected
                        ? 'border-2 border-[#2547E8] bg-[#E7EBFF] dark:border-[#6782FF] dark:bg-[#1C2752]'
                        : 'border border-[#D9D6CF] bg-white hover:bg-[#FAF9F6] dark:border-[#272C34] dark:bg-[#171B21] dark:hover:bg-[#1C2128]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#111217] dark:text-[#F5F7FA]">
                        {preset.name}
                      </span>
                      <span className="rounded bg-black/5 px-1.5 py-0.5 text-[10px] uppercase font-mono text-[#62666F] dark:bg-white/10 dark:text-[#A8AFBA]">
                        {preset.category}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[#62666F] dark:text-[#A8AFBA]">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Preset Inspector */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-xl border border-[#D9D6CF] bg-white p-6 shadow-sm dark:border-[#272C34] dark:bg-[#171B21]">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-[#111217] dark:text-[#F5F7FA]">
                    {selectedPreset.name}
                  </h2>
                  <p className="mt-1 text-sm text-[#62666F] dark:text-[#A8AFBA]">
                    {selectedPreset.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-md border border-[#D9D6CF] bg-[#FAF9F6] px-2 py-1 font-mono text-[#111217] dark:border-[#272C34] dark:bg-[#0B0D10] dark:text-[#F5F7FA]">
                    Palette: {selectedPreset.recommendedPalette}
                  </span>
                  <span className="rounded-md border border-[#D9D6CF] bg-[#FAF9F6] px-2 py-1 font-mono text-[#111217] dark:border-[#272C34] dark:bg-[#0B0D10] dark:text-[#F5F7FA]">
                    Type: {selectedPreset.recommendedTypography}
                  </span>
                  <span className="rounded-md border border-[#D9D6CF] bg-[#FAF9F6] px-2 py-1 font-mono text-[#111217] dark:border-[#272C34] dark:bg-[#0B0D10] dark:text-[#F5F7FA]">
                    Motion: {selectedPreset.recommendedMotion}
                  </span>
                </div>
              </div>

              {/* 28 Dimensions Breakdown */}
              <div className="mt-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B8F97] dark:text-[#707986]">
                  28 Canonical Dimensions
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {DESIGN_DNA_NUMERIC_KEYS.map((key) => {
                    const meta = DIMENSIONS_METADATA[key];
                    const val = activeDna[key] as number;
                    return (
                      <div
                        key={key}
                        className="rounded-lg border border-[#D9D6CF]/60 bg-[#FAF9F6] p-3 dark:border-[#272C34] dark:bg-[#0B0D10]"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#111217] dark:text-[#F5F7FA]">
                            {meta.label}
                          </span>
                          <span className="font-mono font-semibold text-[#2547E8] dark:text-[#6782FF]">
                            {val}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#ECE9E2] dark:bg-[#1C2128]">
                          <div
                            className="h-full rounded-full bg-[#2547E8] transition-all dark:bg-[#6782FF]"
                            style={{ width: `${val}%` }}
                          />
                        </div>
                        <p className="mt-1.5 text-[10px] text-[#8B8F97] dark:text-[#707986] line-clamp-1">
                          {meta.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Categorical Dimensions */}
              <div className="mt-8 border-t border-[#D9D6CF] pt-6 dark:border-[#272C34]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B8F97] dark:text-[#707986]">
                  Categorical Configurations
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 text-xs">
                  <div className="rounded p-2 bg-[#FAF9F6] dark:bg-[#0B0D10]">
                    <div className="text-[10px] text-[#8B8F97]">Archetype</div>
                    <div className="font-semibold">{activeDna.primaryArchetype}</div>
                  </div>
                  <div className="rounded p-2 bg-[#FAF9F6] dark:bg-[#0B0D10]">
                    <div className="text-[10px] text-[#8B8F97]">Visual Mode</div>
                    <div className="font-semibold">{activeDna.visualMode}</div>
                  </div>
                  <div className="rounded p-2 bg-[#FAF9F6] dark:bg-[#0B0D10]">
                    <div className="text-[10px] text-[#8B8F97]">Geometry</div>
                    <div className="font-semibold">{activeDna.geometryFamily}</div>
                  </div>
                  <div className="rounded p-2 bg-[#FAF9F6] dark:bg-[#0B0D10]">
                    <div className="text-[10px] text-[#8B8F97]">Navigation</div>
                    <div className="font-semibold">{activeDna.navigationModel}</div>
                  </div>
                  <div className="rounded p-2 bg-[#FAF9F6] dark:bg-[#0B0D10]">
                    <div className="text-[10px] text-[#8B8F97]">Content Tone</div>
                    <div className="font-semibold">{activeDna.contentTone}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FEEL MIXER */}
      {activeTab === 'feel' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#D9D6CF] bg-white p-6 shadow-sm dark:border-[#272C34] dark:bg-[#171B21]">
            <h2 className="text-lg font-bold text-[#111217] dark:text-[#F5F7FA]">
              Natural Language Feel Mixer
            </h2>
            <p className="mt-1 text-xs text-[#62666F] dark:text-[#A8AFBA]">
              Type adjective phrases (including compound conjunctions like “professional but playful” or “luxury without being flashy”).
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={feelQuery}
                onChange={(e) => setFeelQuery(e.target.value)}
                placeholder="e.g. professional but playful, luxury without being flashy, technical and dense"
                className="flex-1 rounded-lg border border-[#D9D6CF] bg-white px-3.5 py-2 text-sm text-[#111217] focus:border-[#2547E8] focus:outline-none dark:border-[#272C34] dark:bg-[#0B0D10] dark:text-[#F5F7FA]"
              />
              <button
                type="button"
                onClick={handleApplyFeel}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2547E8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3CCD] dark:bg-[#6782FF] dark:text-[#0B0D10]"
              >
                <Zap className="h-4 w-4" /> Apply Feel to DNA
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-[#8B8F97]">Try:</span>
              {[
                'professional but playful',
                'luxury without being flashy',
                'institutional but contemporary',
                'technical, dense and fast',
                'cinematic and bold',
                'calm, warm and minimal',
              ].map((phrase) => (
                <button
                  key={phrase}
                  type="button"
                  onClick={() => setFeelQuery(phrase)}
                  className="rounded-full border border-[#D9D6CF] bg-[#FAF9F6] px-2.5 py-0.5 text-[11px] text-[#62666F] hover:border-[#2547E8] hover:text-[#2547E8] dark:border-[#272C34] dark:bg-[#0B0D10] dark:text-[#A8AFBA]"
                >
                  {phrase}
                </button>
              ))}
            </div>

            {/* Parsing Details */}
            <div className="mt-6 rounded-lg border border-[#D9D6CF]/80 bg-[#FAF9F6] p-4 dark:border-[#272C34] dark:bg-[#0B0D10]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B8F97]">
                Parser Telemetry
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {parsedFeel.recognizedAdjectives.map((adj, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded bg-[#E7EBFF] px-2 py-0.5 text-xs font-semibold text-[#2547E8] dark:bg-[#1C2752] dark:text-[#6782FF]"
                  >
                    <Check className="h-3 w-3" /> {adj}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs font-mono">
                {Object.entries(parsedFeel.accumulatedDeltas).map(([k, delta]) => (
                  <div key={k} className="flex items-center justify-between border-b border-[#D9D6CF]/40 py-1 dark:border-[#272C34]">
                    <span className="text-[#62666F] dark:text-[#A8AFBA]">{k}</span>
                    <span className={typeof delta === 'number' && delta > 0 ? 'text-[#177B55]' : 'text-[#C83D48]'}>
                      {typeof delta === 'number' && delta > 0 ? `+${delta}` : delta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SLIDERS (VISUAL AMBITION & STRUCTURAL CREATIVITY) */}
      {activeTab === 'sliders' && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Visual Ambition */}
          <div className="rounded-xl border border-[#D9D6CF] bg-white p-6 shadow-sm dark:border-[#272C34] dark:bg-[#171B21] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#111217] dark:text-[#F5F7FA]">
                Visual Ambition (5 Stops)
              </h3>
              <span className="rounded bg-[#E7EBFF] px-2 py-0.5 text-xs font-semibold text-[#2547E8] uppercase dark:bg-[#1C2752] dark:text-[#6782FF]">
                {getVisualAmbitionStop(activeDna.visualAmbition)} ({activeDna.visualAmbition})
              </span>
            </div>
            <p className="text-xs text-[#62666F] dark:text-[#A8AFBA]">
              Controls expressive surface design budget, from essential clarity to experimental spectacle.
            </p>

            <div className="grid grid-cols-5 gap-1.5 pt-2">
              {(['essential', 'refined', 'striking', 'stunning', 'experimental'] as const).map(
                (stop) => {
                  const def = VISUAL_AMBITION_STOPS[stop];
                  const currentStop = getVisualAmbitionStop(activeDna.visualAmbition);
                  const isCurrent = currentStop === stop;
                  return (
                    <button
                      key={stop}
                      type="button"
                      onClick={() => setActiveDna(applyVisualAmbition(activeDna, stop))}
                      className={`rounded-lg p-2 text-center text-xs transition-all ${
                        isCurrent
                          ? 'border-2 border-[#2547E8] bg-[#E7EBFF] font-bold text-[#2547E8] dark:border-[#6782FF] dark:bg-[#1C2752] dark:text-[#6782FF]'
                          : 'border border-[#D9D6CF] bg-[#FAF9F6] text-[#62666F] hover:bg-white dark:border-[#272C34] dark:bg-[#0B0D10] dark:text-[#A8AFBA]'
                      }`}
                    >
                      <div>{def.label}</div>
                      <div className="text-[10px] opacity-75 font-mono">{def.defaultScore}</div>
                    </button>
                  );
                }
              )}
            </div>

            <p className="text-xs italic text-[#8B8F97] dark:text-[#707986]">
              {VISUAL_AMBITION_STOPS[getVisualAmbitionStop(activeDna.visualAmbition)].description}
            </p>
          </div>

          {/* Structural Creativity */}
          <div className="rounded-xl border border-[#D9D6CF] bg-white p-6 shadow-sm dark:border-[#272C34] dark:bg-[#171B21] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#111217] dark:text-[#F5F7FA]">
                Structural Creativity (5 Stops)
              </h3>
              <span className="rounded bg-[#E7EBFF] px-2 py-0.5 text-xs font-semibold text-[#2547E8] uppercase dark:bg-[#1C2752] dark:text-[#6782FF]">
                {getStructuralCreativityStop(activeDna.structuralCreativity)} ({activeDna.structuralCreativity})
              </span>
            </div>
            <p className="text-xs text-[#62666F] dark:text-[#A8AFBA]">
              Controls information architecture freedom, from familiar conventions to inventive layouts.
            </p>

            <div className="grid grid-cols-5 gap-1.5 pt-2">
              {(['familiar', 'modern', 'inventive', 'radical', 'experimental'] as const).map(
                (stop) => {
                  const def = STRUCTURAL_CREATIVITY_STOPS[stop];
                  const currentStop = getStructuralCreativityStop(activeDna.structuralCreativity);
                  const isCurrent = currentStop === stop;
                  return (
                    <button
                      key={stop}
                      type="button"
                      onClick={() => setActiveDna(applyStructuralCreativity(activeDna, stop))}
                      className={`rounded-lg p-2 text-center text-xs transition-all ${
                        isCurrent
                          ? 'border-2 border-[#2547E8] bg-[#E7EBFF] font-bold text-[#2547E8] dark:border-[#6782FF] dark:bg-[#1C2752] dark:text-[#6782FF]'
                          : 'border border-[#D9D6CF] bg-[#FAF9F6] text-[#62666F] hover:bg-white dark:border-[#272C34] dark:bg-[#0B0D10] dark:text-[#A8AFBA]'
                      }`}
                    >
                      <div>{def.label}</div>
                      <div className="text-[10px] opacity-75 font-mono">{def.defaultScore}</div>
                    </button>
                  );
                }
              )}
            </div>

            <p className="text-xs italic text-[#8B8F97] dark:text-[#707986]">
              {STRUCTURAL_CREATIVITY_STOPS[getStructuralCreativityStop(activeDna.structuralCreativity)].description}
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: PALETTES (20) */}
      {activeTab === 'palettes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#111217] dark:text-[#F5F7FA]">
              20 Semantic Palette Systems
            </h2>
            <div className="inline-flex rounded-lg border border-[#D9D6CF] bg-white p-1 dark:border-[#272C34] dark:bg-[#171B21]">
              <button
                type="button"
                onClick={() => setPaletteMode('light')}
                className={`rounded px-3 py-1 text-xs font-medium ${
                  paletteMode === 'light'
                    ? 'bg-[#2547E8] text-white'
                    : 'text-[#62666F] dark:text-[#A8AFBA]'
                }`}
              >
                Light Tokens
              </button>
              <button
                type="button"
                onClick={() => setPaletteMode('dark')}
                className={`rounded px-3 py-1 text-xs font-medium ${
                  paletteMode === 'dark'
                    ? 'bg-[#2547E8] text-white'
                    : 'text-[#62666F] dark:text-[#A8AFBA]'
                }`}
              >
                Dark Tokens
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SEMANTIC_PALETTES.map((pal) => {
              const tokens = pal[paletteMode];
              return (
                <div
                  key={pal.id}
                  className="rounded-xl border border-[#D9D6CF] p-4 shadow-sm transition-all hover:border-[#2547E8] dark:border-[#272C34]"
                  style={{ backgroundColor: tokens.canvas, color: tokens.textPrimary }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{pal.name}</span>
                    <span
                      className="rounded px-2 py-0.5 text-[10px] font-mono"
                      style={{ backgroundColor: tokens.surfaceRaised, color: tokens.textSecondary }}
                    >
                      {pal.mood}
                    </span>
                  </div>
                  <p className="mt-1 text-xs line-clamp-2" style={{ color: tokens.textSecondary }}>
                    {pal.description}
                  </p>

                  {/* Swatches */}
                  <div className="mt-4 grid grid-cols-6 gap-1">
                    <div
                      className="h-6 rounded border border-black/10"
                      style={{ backgroundColor: tokens.surface }}
                      title="Surface"
                    />
                    <div
                      className="h-6 rounded border border-black/10"
                      style={{ backgroundColor: tokens.surfaceRaised }}
                      title="Surface Raised"
                    />
                    <div
                      className="h-6 rounded"
                      style={{ backgroundColor: tokens.accent }}
                      title="Accent"
                    />
                    <div
                      className="h-6 rounded"
                      style={{ backgroundColor: tokens.signalLime }}
                      title="Signal Lime"
                    />
                    <div
                      className="h-6 rounded"
                      style={{ backgroundColor: tokens.signalDanger }}
                      title="Danger"
                    />
                    <div
                      className="h-6 rounded"
                      style={{ backgroundColor: tokens.signalSuccess }}
                      title="Success"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: TYPOGRAPHY (16) */}
      {activeTab === 'typography' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[#111217] dark:text-[#F5F7FA]">
            16 Typography Pairings
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {TYPOGRAPHY_PAIRINGS.map((pairing) => (
              <div
                key={pairing.id}
                className="rounded-xl border border-[#D9D6CF] bg-white p-6 shadow-sm dark:border-[#272C34] dark:bg-[#171B21]"
              >
                <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-3 dark:border-[#272C34]">
                  <div>
                    <h3 className="font-bold text-sm text-[#111217] dark:text-[#F5F7FA]">
                      {pairing.name}
                    </h3>
                    <p className="text-xs text-[#62666F] dark:text-[#A8AFBA]">
                      {pairing.description}
                    </p>
                  </div>
                  <span className="rounded bg-[#FAF9F6] px-2 py-1 text-xs font-mono text-[#2547E8] dark:bg-[#0B0D10] dark:text-[#6782FF]">
                    Ratio: {pairing.scaleRatio}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#8B8F97]">Display</span>
                    <div
                      className="text-2xl font-bold tracking-tight text-[#111217] dark:text-[#F5F7FA]"
                      style={{ fontFamily: pairing.displayFont }}
                    >
                      Interface Intelligence
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#8B8F97]">Body</span>
                    <div
                      className="text-sm text-[#62666F] dark:text-[#A8AFBA]"
                      style={{ fontFamily: pairing.bodyFont, lineHeight: pairing.bodyLineHeight }}
                    >
                      Tessellate composes validated interface systems using canonical Design DNA and open primitives.
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#8B8F97]">Monospace</span>
                    <div
                      className="text-xs font-mono text-[#2547E8] dark:text-[#6782FF]"
                      style={{ fontFamily: pairing.monoFont }}
                    >
                      const dnaScore = 92.4; // latency 4.2ms
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: MOTION (24) */}
      {activeTab === 'motion' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[#111217] dark:text-[#F5F7FA]">
            24 Motion Personalities
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {MOTION_PERSONALITIES.map((motion) => {
              const isAnimating = motionActiveKey === motion.id;
              return (
                <div
                  key={motion.id}
                  className="rounded-xl border border-[#D9D6CF] bg-white p-4 shadow-sm dark:border-[#272C34] dark:bg-[#171B21] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#111217] dark:text-[#F5F7FA]">
                        {motion.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#8B8F97]">
                        {motion.durationNormal}ms
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#62666F] dark:text-[#A8AFBA] line-clamp-2">
                      {motion.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#D9D6CF]/60 dark:border-[#272C34] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setMotionActiveKey(motion.id);
                        setTimeout(() => setMotionActiveKey(null), motion.durationSlow + 200);
                      }}
                      className="w-full rounded bg-[#E7EBFF] py-1.5 text-xs font-semibold text-[#2547E8] hover:bg-[#2547E8] hover:text-white transition-colors dark:bg-[#1C2752] dark:text-[#6782FF] dark:hover:bg-[#6782FF] dark:hover:text-[#0B0D10]"
                      style={{
                        transform: isAnimating ? `scale(${motion.hoverScale})` : 'scale(1)',
                        transition: `transform ${motion.durationNormal}ms ${motion.easing}`,
                      }}
                    >
                      {isAnimating ? 'Animating...' : 'Trigger Motion'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: INHERITANCE EXPLORER */}
      {activeTab === 'inheritance' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#D9D6CF] bg-white p-6 shadow-sm dark:border-[#272C34] dark:bg-[#171B21]">
            <h2 className="text-lg font-bold text-[#111217] dark:text-[#F5F7FA]">
              5-Level Node Inheritance Explorer
            </h2>
            <p className="mt-1 text-xs text-[#62666F] dark:text-[#A8AFBA]">
              Simulate DNA overrides flowing down Project → Page → Section → Component → Element. Notice how resets restore inherited values cleanly.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-5 text-xs">
              <div className="rounded-lg border border-[#D9D6CF] bg-[#FAF9F6] p-3 dark:border-[#272C34] dark:bg-[#0B0D10]">
                <div className="font-bold text-[#2547E8] dark:text-[#6782FF]">1. Project</div>
                <div className="mt-1 text-[11px] text-[#62666F]">Base defaults</div>
                <div className="mt-2 font-mono text-[10px]">Prof: {activeDna.professionalism}</div>
              </div>

              <div className="rounded-lg border border-[#D9D6CF] bg-[#FAF9F6] p-3 dark:border-[#272C34] dark:bg-[#0B0D10]">
                <div className="flex items-center justify-between font-bold">
                  <span>2. Page</span>
                  {pageOverrides.curvature !== undefined && (
                    <button
                      type="button"
                      onClick={() => setPageOverrides({})}
                      className="text-[10px] text-[#C83D48]"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-[#62666F]">Curvature: {pageOverrides.curvature ?? 'inherited'}</div>
              </div>

              <div className="rounded-lg border border-[#D9D6CF] bg-[#FAF9F6] p-3 dark:border-[#272C34] dark:bg-[#0B0D10]">
                <div className="flex items-center justify-between font-bold">
                  <span>3. Section</span>
                  {sectionOverrides.warmth !== undefined && (
                    <button
                      type="button"
                      onClick={() => setSectionOverrides({})}
                      className="text-[10px] text-[#C83D48]"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-[#62666F]">Warmth: {sectionOverrides.warmth ?? 'inherited'}</div>
              </div>

              <div className="rounded-lg border border-[#D9D6CF] bg-[#FAF9F6] p-3 dark:border-[#272C34] dark:bg-[#0B0D10]">
                <div className="flex items-center justify-between font-bold">
                  <span>4. Component</span>
                  {componentOverrides.playfulness !== undefined && (
                    <button
                      type="button"
                      onClick={() => setComponentOverrides({})}
                      className="text-[10px] text-[#C83D48]"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-[#62666F]">Playfulness: {componentOverrides.playfulness ?? 'inherited'}</div>
              </div>

              <div className="rounded-lg border border-[#D9D6CF] bg-[#FAF9F6] p-3 dark:border-[#272C34] dark:bg-[#0B0D10]">
                <div className="flex items-center justify-between font-bold">
                  <span>5. Element</span>
                  {elementOverrides.professionalism !== undefined ? (
                    <button
                      type="button"
                      onClick={() => setElementOverrides({})}
                      className="text-[10px] text-[#C83D48]"
                    >
                      Reset
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setElementOverrides({ professionalism: 98 })}
                      className="text-[10px] text-[#2547E8] dark:text-[#6782FF]"
                    >
                      Override
                    </button>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-[#62666F]">Prof: {elementOverrides.professionalism ?? 'inherited'}</div>
              </div>
            </div>

            {/* Effective Values Table */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B8F97]">
                  Effective Resolved Values & Provenance
                </h3>
                <span className="text-[11px] font-mono text-[#8B8F97]">
                  Archetype: {effectiveHierarchyDna.primaryArchetype} | Mode: {effectiveHierarchyDna.visualMode}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 text-xs">
                {['professionalism', 'playfulness', 'warmth', 'curvature', 'luxury', 'technicality'].map((k) => {
                  const key = k as DesignDNANumericKey;
                  const inspected = inspectedProperties[key];
                  return (
                    <div
                      key={key}
                      className="rounded border border-[#D9D6CF]/80 bg-[#FAF9F6] p-2.5 dark:border-[#272C34] dark:bg-[#0B0D10]"
                    >
                      <div className="text-[10px] text-[#8B8F97]">{key}</div>
                      <div className="text-sm font-bold text-[#111217] dark:text-[#F5F7FA]">
                        {inspected?.effectiveValue as number}
                      </div>
                      <div className="mt-1 text-[10px] font-mono">
                        {inspected?.isOverridden ? (
                          <span className="text-[#A66A15] dark:text-[#FBBF24]">
                            Overridden ({inspected.sourceLevel})
                          </span>
                        ) : (
                          <span className="text-[#177B55] dark:text-[#34D399]">
                            Inherited ({inspected.sourceLevel})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
