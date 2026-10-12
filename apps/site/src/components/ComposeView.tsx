import React, { useState, useCallback, useEffect } from 'react';
import {
  PRODUCT_BLUEPRINTS,
  getAllGoldenBriefs,
  getGoldenBrief,
  getAllProductArchetypes,
  planScreenGraph,
  type ProductBriefInput,
} from '@tessellate/composer';
import {
  composeProjectPipeline,
  type ComposedDirectionOutput,
} from '@tessellate/compatibility';
import { Dialog } from '@tessellate/ui';
import { saveLocalProject } from '@tessellate/workbench';
import { ManifestRenderer } from '@tessellate/renderer';
import { ResourceManifestSchema, type ProjectManifest, type ResourceManifest } from '@tessellate/schemas';
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
    'An employee experience platform with a warm marketing site, a refined team dashboard, playful onboarding and conservative settings.'
  );
  const [selectedArchetypeOverride, setSelectedArchetypeOverride] = useState<string>('');
  const [feel, setFeel] = useState<string>('professional but playful');
  const [visualAmbition, setVisualAmbition] = useState<number>(40);
  const [structuralCreativity, setStructuralCreativity] = useState<number>(35);
  const [accessibilityFloor, setAccessibilityFloor] = useState<'A' | 'AA' | 'AAA'>('AA');
  const [performanceCeiling, setPerformanceCeiling] = useState<'lightweight' | 'balanced' | 'rich'>('rich');
  const [targetDevices, setTargetDevices] = useState<Array<'desktop' | 'tablet' | 'mobile'>>(['desktop','tablet','mobile']);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Result state
  const [compositionError,setCompositionError] = useState('');
  const [hasComposed, setHasComposed] = useState<boolean>(false);
  const [catalogStatus, setCatalogStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [catalogResources, setCatalogResources] = useState<ResourceManifest[]>([]);

  const loadCatalog = () => {
    setCatalogStatus('loading');
    fetch('/data/catalog.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.resources) && data.resources.length > 0) {
          setCatalogResources(ResourceManifestSchema.array().parse(data.resources));
          setCatalogStatus('ready');
        } else {
          throw new Error('Empty or invalid catalogue payload');
        }
      })
      .catch((err) => {
        console.error('Failed to load /data/catalog.json in ComposeView:', err);
        setCatalogStatus('error');
      });
  };

  useEffect(() => {
    const params=new URLSearchParams(window.location.search);
    const blueprint=PRODUCT_BLUEPRINTS.find(item=>item.id===params.get('blueprint'));
    if(params.get('brief'))setDescription(params.get('brief')!);
    else if(blueprint){setDescription(`${blueprint.description} ${blueprint.defaultObjective}. For ${blueprint.defaultAudience}.`);setSelectedArchetypeOverride(blueprint.archetypeId);}
    loadCatalog();
  }, []);

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

  // Commit generation only on submit. Editing a brief must never alter a chosen snapshot.
  const [compositionResult,setCompositionResult] = useState(()=>composeProjectPipeline(briefInput,{catalogResources:[],seed:'initial-unsubmitted'}));

  const { productModel, screenGraph: _screenGraph, inferredAssumptions, directionA, directionB, directionC } = compositionResult;
  const screenPlan = planScreenGraph(productModel);

  const handleOpenDirection = async (manifest: ProjectManifest) => {
    try {
      const outputs = [compositionResult.directionA,compositionResult.directionB,compositionResult.directionC];
      const siblings=outputs.map(output=>output.manifest);
      for(const sibling of siblings) {
        localStorage.setItem(`tessellate_project_${sibling.id}`,JSON.stringify(sibling));
        await saveLocalProject(sibling);
      }
      localStorage.setItem(`tessellate_directions_${manifest.id}`,JSON.stringify(siblings));
      localStorage.setItem('tessellate_active_project',JSON.stringify(manifest));
      window.location.href=`/workbench?project=${encodeURIComponent(manifest.id)}`;
    } catch(cause) { setCompositionError(`Could not save your direction: ${String(cause)}. Your preview remains available.`); }
  };

  const handleCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (catalogStatus !== 'ready' || catalogResources.length === 0) {
      return;
    }
    try {
      const generated = composeProjectPipeline(briefInput,{catalogResources,seed:crypto.randomUUID()});
      setCompositionResult(generated);
      setCompositionError('');
      setHasComposed(true);
    } catch(cause) {setCompositionError(`Composition failed: ${String(cause)}`);}

  };

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#E7EBFF] px-2.5 py-0.5 text-[11px] font-semibold text-[#2547E8] dark:bg-[#1C2752] dark:text-[#879DFF]">
          <Cpu className="h-3 w-3" /> Local product composer
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[#111217] dark:text-[#F5F7FA]">
          Describe the product. Get the interface.
        </h1>
        <p className="max-w-3xl text-base text-[#62666F] dark:text-[#A8AFBA]">
          Tessellate understands product architecture without requiring an LLM. Enter your product brief below to generate a validated ProductModel, ScreenGraph, and three design directions.
        </p>

        {/* Golden Brief Preset Pills */}
        <div className="pt-2">
          <div className="text-xs font-semibold text-[var(--text-muted)] dark:text-[var(--text-muted)]">
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
              <span className="text-xs font-semibold text-[#2547E8] uppercase dark:text-[#879DFF]">
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
              <span className="text-xs font-semibold text-[#2547E8] uppercase dark:text-[#879DFF]">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs" data-testid="catalog-status">
            {catalogStatus === 'loading' && (
              <span className="inline-flex items-center gap-1.5 text-[#62666F] dark:text-[#A8AFBA]">
                <Cpu className="h-3.5 w-3.5 animate-spin text-[#2547E8]" />
                Loading interface intelligence…
              </span>
            )}
            {catalogStatus === 'ready' && (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Catalogue ready
              </span>
            )}
            {catalogStatus === 'error' && (
              <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Catalogue unavailable —{' '}
                <button
                  type="button"
                  onClick={loadCatalog}
                  className="underline font-semibold hover:text-rose-700 ml-1 cursor-pointer"
                >
                  retry
                </button>
              </span>
            )}
          </div>

          <button
            type="submit"
            data-testid="compose-submit-btn"
            disabled={catalogStatus !== 'ready'}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2547E8] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1E3CCD] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#6782FF] dark:text-[#0B0D10] dark:hover:bg-[#879DFF]"
          >
            <Sparkles className="h-4 w-4" />
            Compose Interface System
          </button>
        </div>
      </form>

      {compositionError && <p role="alert" className="text-[#C83D48]">{compositionError}</p>}
      {/* Output Sections (Visible after composing with ready catalogue) */}
      {hasComposed && catalogStatus === 'ready' && (
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
              <span className="rounded-full bg-[#177B55]/10 px-3 py-1 text-xs font-bold text-[#12603F]">
                Validated product model
              </span>
            </div>

            {/* Inferred Assumptions Box */}
            <div className="rounded-xl border border-[#D9D6CF] bg-[#FAF9F6] p-5 dark:border-[#272C34] dark:bg-[#111419]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2547E8] dark:text-[#879DFF]">
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
                <div className="text-[10px] text-[var(--text-muted)]">Primary Archetype</div>
                <div className="mt-1 font-bold text-sm text-[#2547E8] uppercase dark:text-[#879DFF]">
                  {productModel.entities.some(entity=>entity.name==='Employee') ? 'Employee experience' : productModel.productArchetypes[0]?.tag}
                </div>
              </div>
              <div className="rounded-xl border border-[#D9D6CF] bg-white p-4 dark:border-[#272C34] dark:bg-[#171B21]">
                <div className="text-[10px] text-[var(--text-muted)]">User Sophistication</div>
                <div className="mt-1 font-mono font-bold text-base">{productModel.userSophistication}/100</div>
              </div>
              <div className="rounded-xl border border-[#D9D6CF] bg-white p-4 dark:border-[#272C34] dark:bg-[#171B21]">
                <div className="text-[10px] text-[var(--text-muted)]">Trust Requirement</div>
                <div className="mt-1 font-mono font-bold text-base">{productModel.trustRequirement}/100</div>
              </div>
              <div className="rounded-xl border border-[#D9D6CF] bg-white p-4 dark:border-[#272C34] dark:bg-[#171B21]">
                <div className="text-[10px] text-[var(--text-muted)]">Data Density</div>
                <div className="mt-1 font-mono font-bold text-base">{productModel.dataDensity}/100</div>
              </div>
              <div className="rounded-xl border border-[#D9D6CF] bg-white p-4 dark:border-[#272C34] dark:bg-[#171B21]">
                <div className="text-[10px] text-[var(--text-muted)]">Information Complexity</div>
                <div className="mt-1 font-mono font-bold text-base">{productModel.informationComplexity}/100</div>
              </div>
              <div className="rounded-xl border border-[#D9D6CF] bg-white p-4 dark:border-[#272C34] dark:bg-[#171B21]">
                <div className="text-[10px] text-[var(--text-muted)]">Mobile Priority</div>
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
                <span className="rounded bg-[#E7EBFF] px-2.5 py-1 font-semibold text-[#2547E8] dark:bg-[#1C2752] dark:text-[#879DFF]">
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-[var(--text-muted)]">
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
                            <div className="font-mono text-xs text-[#2547E8] dark:text-[#879DFF]">
                              {screen.slug}
                            </div>
                          </div>
                          {screen.required ? (
                            <span className="rounded bg-[#177B55]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#12603F]">
                              Required
                            </span>
                          ) : (
                            <span className="rounded bg-black/5 px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-muted)] dark:bg-white/10">
                              Optional
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-xs text-[#62666F] dark:text-[#A8AFBA] line-clamp-2">
                          {screen.purpose}
                        </p>

                        <div className="mt-3 border-t border-[#D9D6CF]/40 pt-2 text-[10px] text-[var(--text-muted)]">
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
              <DirectionCard
                number="01"
                output={directionA}
                isFeatured={true}
                onOpen={handleOpenDirection}
              />
              <DirectionCard
                number="02"
                output={directionB}
                isFeatured={false}
                onOpen={handleOpenDirection}
              />
              <DirectionCard
                number="03"
                output={directionC}
                isFeatured={false}
                onOpen={handleOpenDirection}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function DirectionCard({
  output,
  number,
  isFeatured = false,
  onOpen,
}: {
  output: ComposedDirectionOutput;
  number: string;
  isFeatured?: boolean;
  onOpen: (manifest: ProjectManifest) => void;
}) {
  const { direction, manifest } = output;
  const primaryScreen = manifest.screens.find(screen=>screen.slug==='/overview') ?? manifest.screens[0];
  const [previewOpen,setPreviewOpen] = useState(false);
  const [previewScreen,setPreviewScreen] = useState(primaryScreen?.id ?? '');
  const closePreview=useCallback(()=>setPreviewOpen(false),[]);


  return (
    <div
      data-testid={`direction-card-${number}`} data-project-id={manifest.id}
      className={`flex flex-col justify-between rounded-2xl p-6 shadow-sm transition-all ${
        isFeatured
          ? 'border-2 border-[#2547E8] bg-white dark:border-[#6782FF] dark:bg-[#171B21]'
          : 'border border-[#D9D6CF] bg-white dark:border-[#272C34] dark:bg-[#171B21]'
      }`}
    >
      <div className="space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase font-bold text-[#2547E8] dark:text-[#879DFF]">
            Direction {number}
          </span>
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
              isFeatured
                ? 'bg-[#E7EBFF] text-[#2547E8] dark:bg-[#1C2752] dark:text-[#879DFF]'
                : 'bg-[#FAF9F6] text-[#62666F] dark:bg-[#0B0D10] dark:text-[#A8AFBA]'
            }`}
          >
            {direction.type === 'conservative'
              ? 'Conservative Fit'
              : direction.type === 'expressive'
              ? 'Expressive Fit'
              : 'Structural Alternative'}
          </span>
        </div>

        {/* Title & Tagline */}
        <div>
          <h3 className="text-lg font-bold text-[#111217] dark:text-[#F5F7FA]">
            {direction.name}
          </h3>
          <p className="mt-1 text-xs text-[#62666F] dark:text-[#A8AFBA]">
            {direction.rationale}
          </p>
        </div>

        {/* Telemetry metadata */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#FAF9F6] p-2.5 text-[11px] dark:bg-[#0B0D10]">
          <div>
            <span className="text-[var(--text-muted)]">Navigation:</span>{' '}
            <span className="font-semibold text-[#111217] dark:text-[#F5F7FA] uppercase">
              {direction.navigationModel}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Layout:</span>{' '}
            <span className="font-semibold text-[#111217] dark:text-[#F5F7FA]">
              {direction.layoutFamily}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Visual Ambition:</span>{' '}
            <span className="font-semibold text-[#2547E8] dark:text-[#879DFF]">
              {direction.dna.visualAmbition}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Creativity:</span>{' '}
            <span className="font-semibold text-[#2547E8] dark:text-[#879DFF]">
              {direction.dna.structuralCreativity}
            </span>
          </div>
        </div>

        {/* Real Scaled Project Preview */}
        <div className="rounded-xl border border-[#D9D6CF]/70 bg-[#FAF9F6] p-3 dark:border-[#272C34] dark:bg-[#0B0D10]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[var(--text-muted)]">
            <span>Screen Preview: {primaryScreen?.name ?? 'Overview'}</span>
            <span>{manifest.screens.length} Screens</span>
          </div>

          <div
            data-testid={`direction-preview-${number}`}
            aria-label={`Direction ${number} preview`} role="region" tabIndex={0} className="mt-2 relative h-72 w-full overflow-auto rounded-lg border border-[#D9D6CF] bg-white shadow-inner dark:border-[#272C34] dark:bg-[#0B0D10]"
          >
            <div
              className="w-full"
            >
              <ManifestRenderer
                manifest={manifest}
                activeScreenId={primaryScreen?.id}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          data-testid={`open-workbench-dir-${number}`}
          onClick={() => onOpen(manifest)}
          className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold shadow-sm transition-all ${
            isFeatured
              ? 'bg-[#2547E8] text-white hover:bg-[#1E3CCD] dark:bg-[#6782FF] dark:text-[#0B0D10]'
              : 'border border-[#2547E8] bg-white text-[#2547E8] hover:bg-[#FAF9F6] dark:border-[#6782FF] dark:bg-[#171B21] dark:text-[#879DFF]'
          }`}
        >
          Open in Workbench <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={()=>setPreviewOpen(true)} className="underline py-2 text-sm">Inspect full preview and DNA</button>
        <Dialog open={previewOpen} onClose={closePreview} title={`Direction ${number}: ${direction.name}`} className="max-w-[1400px] max-h-[92vh] overflow-auto">
          <label className="block mb-4">Screen <select aria-label="Direction preview screen" className="border p-2" value={previewScreen} onChange={event=>setPreviewScreen(event.target.value)}>{manifest.screens.map(screen=><option key={screen.id} value={screen.id}>{screen.name}</option>)}</select></label>
          <div onClickCapture={event=>{const anchor=(event.target as HTMLElement).closest('a[href^="#"]');const id=anchor?.getAttribute('href')?.slice(1);if(id && manifest.screens.some(screen=>screen.id===id)){event.preventDefault();setPreviewScreen(id);}}}><ManifestRenderer manifest={manifest} activeScreenId={previewScreen}/></div>
          <details className="mt-4"><summary>Design DNA and resource references</summary><pre className="text-xs overflow-auto">{JSON.stringify({id:manifest.id,dna:manifest.designDNA,navigation:manifest.navigation,grammar:direction.primaryGrammarId,screens:manifest.screens,diagnostics:output.diagnostics},null,2)}</pre></details>
        </Dialog>
      </div>
    </div>
  );
}
