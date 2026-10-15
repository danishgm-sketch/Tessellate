import React, { useEffect, useMemo, useState } from 'react';
import { getAllGoldenBriefs } from '@tessellate/composer';
import { composeFromInterpretation, type ComposedDirectionOutput, type FullCompositionResult } from '@tessellate/compatibility';
import { newProjectId, requestInterpretation, saveLocalProject, type QueueProgress } from '@tessellate/workbench';
import { DEFAULT_RESOURCE_RENDERERS, ManifestRenderer } from '@tessellate/renderer';
import {
  SUGGESTED_ENTITY_CONFIDENCE,
  type BriefInterpretation,
  type ProjectManifest,
  type ResourceManifest,
  type ScreenNode,
} from '@tessellate/schemas';
import { VISUAL_AMBITION_STOPS, STRUCTURAL_CREATIVITY_STOPS, getVisualAmbitionStop, getStructuralCreativityStop } from '@tessellate/dna';
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';

type Stage = 'brief' | 'working' | 'review' | 'directions';

const fieldClass =
  'w-full rounded-lg border border-[#C7C3BA] bg-white px-3 py-2.5 text-sm text-[#111217] placeholder:text-[#8B8F97] focus:border-[#2547E8] focus:outline-none focus:ring-2 focus:ring-[#2547E8]/25';
const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#2547E8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E3CCD] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2547E8]';
const ghostBtn =
  'inline-flex items-center gap-1.5 rounded-lg border border-[#C7C3BA] bg-white px-3 py-2 text-sm font-medium text-[#111217] hover:bg-[#ECE9E2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2547E8]';

const ARCHETYPE_LABELS: Record<string, string> = {
  'healthcare-clinic': 'Healthcare clinic', 'booking-scheduling': 'Booking & scheduling', 'internal-tools': 'Internal tool',
  'helpdesk-support': 'Helpdesk & support', 'professional-services': 'Professional services', 'local-business': 'Local business',
  'nonprofit-fundraising': 'Non-profit & fundraising', 'government-public-service': 'Public service', saas: 'B2B SaaS', ai: 'AI product',
  'developer-tools': 'Developer tools', ecommerce: 'Ecommerce', marketplace: 'Marketplace', crm: 'CRM & pipeline',
  'erp-operations': 'ERP & operations', productivity: 'Productivity', education: 'Education', consumer: 'Consumer app',
};

function archetypeLabel(tag: string): string {
  return ARCHETYPE_LABELS[tag] ?? tag.split('-').map((w) => w[0]!.toUpperCase() + w.slice(1)).join(' ');
}

function plural(word: string): string {
  if (/[^aeiou]y$/i.test(word)) return word.slice(0, -1) + 'ies';
  return /(s|sh|ch|x)$/i.test(word) ? word + 'es' : word + 's';
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Applies the user's review edits to the interpretation before composing. */
function applyReview(
  base: BriefInterpretation,
  edits: { archetype: string; audience: string; removedEntities: Set<string>; addedEntities: string[]; excludedScreens: Set<string>; floor: 'A' | 'AA' | 'AAA' },
): BriefInterpretation {
  const pm = structuredClone(base.productModel);
  const top = base.alternatives.find((a) => a.tag === edits.archetype);
  pm.productArchetypes = [
    { tag: edits.archetype, weight: Math.max(1, Math.round((top?.probability ?? 0.6) * 100)) },
    ...pm.productArchetypes.filter((a) => a.tag !== edits.archetype).slice(0, 2),
  ];
  pm.primaryAudience = edits.audience.trim() || pm.primaryAudience;
  pm.entities = pm.entities.filter((e) => !edits.removedEntities.has(e.name));
  for (const name of edits.addedEntities) {
    pm.entities.push({ name, description: `A ${name.toLowerCase()} in this product.`, fields: ['name', 'status', 'created', 'notes'] });
  }
  pm.constraints = { ...pm.constraints, accessibilityFloor: edits.floor };

  const graph = structuredClone(base.screenGraph);
  graph.groups = graph.groups
    .map((g) => ({
      ...g,
      screens: g.screens.filter((s) => !edits.excludedScreens.has(s.id) && !(s.entity && edits.removedEntities.has(s.entity))),
    }))
    .filter((g) => g.screens.length > 0);
  const app = graph.groups.find((g) => g.id === 'group-app') ?? (graph.groups.push({ id: 'group-app', name: 'Application', screens: [] }), graph.groups.at(-1)!);
  for (const name of edits.addedEntities) {
    const key = slugify(name);
    const list: ScreenNode = {
      id: `screen-${key}-collection`, name: plural(name), slug: `/${slugify(plural(name))}`, screenType: 'index-list',
      purpose: `Browse, search and filter ${plural(name).toLowerCase()}.`, jobs: [], required: true, navigationVisibility: 'primary',
      importance: 70, expectedData: ['name', 'status', 'created'], requiredRoles: [], optionalRoles: [], entity: name,
    };
    app.screens.push(list, { ...list, id: `screen-${key}-detail`, name: `${name} details`, slug: `/${slugify(plural(name))}/detail`, screenType: 'detail-entity', purpose: `See and manage a single ${name.toLowerCase()}.`, required: false, navigationVisibility: 'secondary', importance: 50 });
  }
  pm.likelyScreens = graph.groups.flatMap((g) => g.screens.map((s) => ({ name: s.name, screenType: s.screenType, purpose: s.purpose })));
  return { ...base, productModel: pm, screenGraph: graph };
}

export function ComposeView() {
  const examples = getAllGoldenBriefs();
  const [stage, setStage] = useState<Stage>('brief');
  const [brief, setBrief] = useState('');
  const [visualAmbition, setVisualAmbition] = useState(40);
  const [structuralCreativity, setStructuralCreativity] = useState(35);
  const [progress, setProgress] = useState<QueueProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<BriefInterpretation | null>(null);

  // Review edits
  const [productName, setProductName] = useState('');
  const [archetype, setArchetype] = useState('');
  const [audience, setAudience] = useState('');
  const [feel, setFeel] = useState('');
  const [floor, setFloor] = useState<'A' | 'AA' | 'AAA'>('AA');
  const [removedEntities, setRemovedEntities] = useState<Set<string>>(new Set());
  const [addedEntities, setAddedEntities] = useState<string[]>([]);
  const [newEntity, setNewEntity] = useState('');
  const [excludedScreens, setExcludedScreens] = useState<Set<string>>(new Set());

  const [composition, setComposition] = useState<FullCompositionResult | null>(null);
  const [catalog, setCatalog] = useState<ResourceManifest[] | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  useEffect(() => {
    const fromHome = new URLSearchParams(window.location.search).get('brief');
    if (fromHome) setBrief(fromHome.slice(0, 4000));
  }, []);

  useEffect(() => {
    fetch('/data/catalog.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => setCatalog(Array.isArray(d.resources) ? d.resources : []))
      .catch(() => setCatalogError('The resource catalogue could not be loaded. Refresh the page to try again.'));
  }, []);

  const understand = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStage('working');
    const result = await requestInterpretation(brief, setProgress);
    setProgress(null);
    if (!result.success || !result.interpretation) {
      setError(result.error ?? 'Tessellate could not interpret this brief.');
      setStage('brief');
      return;
    }
    const interp = result.interpretation;
    setInterpretation(interp);
    setArchetype(interp.productModel.productArchetypes[0]?.tag ?? 'saas');
    setAudience(interp.productModel.primaryAudience);
    setFeel(interp.feel);
    setFloor(interp.productModel.constraints.accessibilityFloor);
    setRemovedEntities(new Set());
    setAddedEntities([]);
    setExcludedScreens(new Set());
    setStage('review');
  };

  const reviewed = useMemo(
    () => (interpretation ? applyReview(interpretation, { archetype, audience, removedEntities, addedEntities, excludedScreens, floor }) : null),
    [interpretation, archetype, audience, removedEntities, addedEntities, excludedScreens, floor],
  );

  const compose = () => {
    if (!reviewed || !catalog) return;
    try {
      setComposition(
        composeFromInterpretation(reviewed, {
          catalogResources: catalog,
          projectIdBase: newProjectId(),
          productName,
          isRenderable: (slug) => slug in DEFAULT_RESOURCE_RENDERERS,
          feel,
          visualAmbition,
          structuralCreativity,
        }),
      );
      setStage('directions');
    } catch (err) {
      setError(err instanceof Error ? `Could not compose this product: ${err.message}` : 'Could not compose this product.');
    }
  };

  const openDirection = async (manifest: ProjectManifest) => {
    const now = new Date().toISOString();
    const project: ProjectManifest = { ...manifest, id: newProjectId(), createdAt: now, updatedAt: now };
    try {
      await saveLocalProject(project);
      window.location.href = `/workbench?project=${encodeURIComponent(project.id)}`;
    } catch (err) {
      setOpenError(err instanceof Error ? `Could not save the project in this browser: ${err.message}` : 'Could not save the project in this browser.');
    }
  };

  const steps: Array<[Stage, string]> = [['brief', 'Describe'], ['review', 'Review'], ['directions', 'Choose a direction']];
  const stepIndex = stage === 'working' ? 0 : steps.findIndex(([s]) => s === stage);

  return (
    <div className="space-y-8">
      <ol className="flex flex-wrap gap-2 text-xs font-medium" aria-label="Steps">
        {steps.map(([id, label], i) => (
          <li
            key={id}
            aria-current={i === stepIndex ? 'step' : undefined}
            className={`rounded-full px-3 py-1 ${i === stepIndex ? 'bg-[#111217] text-white' : i < stepIndex ? 'bg-[#E7EBFF] text-[#1E3CCD]' : 'bg-[#ECE9E2] text-[#62666F]'}`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <div role="status" aria-live="polite">
        {error && <p className="rounded-lg border border-[#C83D48] bg-[#FCEDEE] px-4 py-3 text-sm text-[#8A1F29]">{error}</p>}
        {catalogError && <p className="rounded-lg border border-[#C83D48] bg-[#FCEDEE] px-4 py-3 text-sm text-[#8A1F29]">{catalogError}</p>}
      </div>

      {(stage === 'brief' || stage === 'working') && (
        <form onSubmit={understand} className="space-y-6 rounded-2xl border border-[#D9D6CF] bg-white p-6">
          <div className="space-y-2">
            <label htmlFor="brief" className="block text-sm font-semibold">What are you building?</label>
            <p id="brief-help" className="text-sm text-[#62666F]">
              Say who uses it and what they do in it. For example: “A booking platform for physiotherapy clinics. Patients book
              appointments and pay deposits; clinicians manage treatment notes and invoices. Calm and accessible for older users.”
            </p>
            <textarea
              id="brief"
              aria-describedby="brief-help"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={5}
              maxLength={4000}
              className={fieldClass}
              placeholder="Describe the product…"
              disabled={stage === 'working'}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#62666F]">Or start from an example</p>
            <div className="flex flex-wrap gap-2">
              {examples.slice(0, 6).map((ex) => (
                <button key={ex.id} type="button" className={ghostBtn} onClick={() => setBrief(ex.input.description)} disabled={stage === 'working'}>
                  {ex.title}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <StopPicker legend="Visual ambition" stops={Object.values(VISUAL_AMBITION_STOPS)} active={getVisualAmbitionStop(visualAmbition)} onPick={setVisualAmbition} />
            <StopPicker legend="Structural creativity" stops={Object.values(STRUCTURAL_CREATIVITY_STOPS)} active={getStructuralCreativityStop(structuralCreativity)} onPick={setStructuralCreativity} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className={primaryBtn} disabled={stage === 'working' || brief.trim().length < 12}>
              {stage === 'working' ? 'Understanding your brief…' : 'Understand my product'} <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            {progress && (
              <span data-testid="compose-progress" className={`text-sm ${progress.status === 'offline' ? 'text-[#A66A15]' : 'text-[#62666F]'}`}>
                {progress.message}
                {progress.estimatedWaitSeconds ? ` · about ${progress.estimatedWaitSeconds}s` : ''}
              </span>
            )}
          </div>
        </form>
      )}

      {stage === 'review' && interpretation && reviewed && (
        <section aria-labelledby="review-heading" className="space-y-6 rounded-2xl border border-[#D9D6CF] bg-white p-6" data-testid="review-step">
          <div>
            <h2 id="review-heading" className="text-lg font-semibold">Review what Tessellate understood</h2>
            <p className="mt-1 text-sm text-[#62666F]">
              Check this before composing. Items marked <span className="font-medium text-[#A66A15]">suggested</span> were not in your
              brief; remove anything that does not belong. {interpretation.modelVersion ? `Model ${interpretation.modelVersion}.` : ''}
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="rv-name" className="block text-sm font-semibold">Product name</label>
            <input id="rv-name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Northside Physio" maxLength={80} className={`${fieldClass} max-w-md`} />
            <p className="text-xs text-[#62666F]">Used in navigation, headings and the exported code. You can change it later.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="rv-archetype" className="block text-sm font-semibold">Product type</label>
              <select id="rv-archetype" value={archetype} onChange={(e) => setArchetype(e.target.value)} className={fieldClass}>
                {interpretation.alternatives.map((a) => (
                  <option key={a.tag} value={a.tag}>
                    {archetypeLabel(a.tag)} ({Math.round(a.probability * 100)}%)
                  </option>
                ))}
              </select>
              {interpretation.confidence.archetype < 0.5 && (
                <p className="text-xs text-[#A66A15]">Tessellate was not sure about this — please check it.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="rv-audience" className="block text-sm font-semibold">Who uses it</label>
              <input id="rv-audience" value={audience} onChange={(e) => setAudience(e.target.value)} className={fieldClass} />
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">Things the product manages</legend>
            <ul className="flex flex-wrap gap-2" aria-label="Entities">
              {interpretation.productModel.entities
                .filter((e) => !removedEntities.has(e.name))
                .map((e) => {
                  const conf = interpretation.confidence.entities[e.name] ?? 0.5;
                  const suggested = conf <= SUGGESTED_ENTITY_CONFIDENCE;
                  return (
                    <li key={e.name} data-testid="review-entity" className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${suggested ? 'border-dashed border-[#A66A15] bg-[#FFF8EC]' : 'border-[#C7C3BA] bg-[#FAF9F6]'}`}>
                      {e.name}
                      {suggested && <span className="text-xs text-[#A66A15]">suggested</span>}
                      <button type="button" aria-label={`Remove ${e.name}`} onClick={() => setRemovedEntities(new Set([...removedEntities, e.name]))} className="rounded p-0.5 hover:bg-[#ECE9E2]">
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </li>
                  );
                })}
              {addedEntities.map((name) => (
                <li key={name} data-testid="review-entity" className="inline-flex items-center gap-1.5 rounded-full border border-[#2547E8] bg-[#E7EBFF] px-3 py-1 text-sm">
                  {name}
                  <button type="button" aria-label={`Remove ${name}`} onClick={() => setAddedEntities(addedEntities.filter((n) => n !== name))} className="rounded p-0.5 hover:bg-white">
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const name = newEntity.trim().replace(/s$/i, '');
                if (name && !addedEntities.includes(name)) setAddedEntities([...addedEntities, name[0]!.toUpperCase() + name.slice(1)]);
                setNewEntity('');
              }}
            >
              <label htmlFor="rv-add-entity" className="sr-only">Add something the product manages</label>
              <input id="rv-add-entity" value={newEntity} onChange={(e) => setNewEntity(e.target.value)} placeholder="Add, e.g. Voucher" className={`${fieldClass} max-w-xs`} />
              <button type="submit" className={ghostBtn}><Plus className="h-4 w-4" aria-hidden /> Add</button>
            </form>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">Screens</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {interpretation.screenGraph.groups.map((g) => {
                const visible = g.screens.filter((s) => !(s.entity && removedEntities.has(s.entity)));
                if (visible.length === 0) return null;
                return (
                  <div key={g.id} className="rounded-xl border border-[#ECE9E2] p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#62666F]">{g.name}</p>
                    <ul className="space-y-1">
                      {visible.map((s) => (
                        <li key={s.id}>
                          <label className="flex items-start gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={!excludedScreens.has(s.id)}
                              onChange={(e) => {
                                const next = new Set(excludedScreens);
                                if (e.target.checked) next.delete(s.id);
                                else next.add(s.id);
                                setExcludedScreens(next);
                              }}
                              className="mt-0.5"
                            />
                            <span>
                              {s.name}
                              <span className="block text-xs text-[#62666F]">{s.purpose}</span>
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="rv-feel" className="block text-sm font-semibold">Look and feel</label>
              <input id="rv-feel" value={feel} onChange={(e) => setFeel(e.target.value)} placeholder="e.g. calm, trustworthy" className={fieldClass} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="rv-floor" className="block text-sm font-semibold">Accessibility level</label>
              <select id="rv-floor" value={floor} onChange={(e) => setFloor(e.target.value as 'A' | 'AA' | 'AAA')} className={fieldClass}>
                <option value="AA">WCAG AA (standard)</option>
                <option value="AAA">WCAG AAA (older users, low vision)</option>
                <option value="A">WCAG A (minimum)</option>
              </select>
            </div>
          </div>

          {interpretation.assumptions.length > 0 && (
            <details className="rounded-xl bg-[#FAF9F6] p-3 text-sm">
              <summary className="cursor-pointer font-medium">What Tessellate assumed ({interpretation.assumptions.length})</summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[#62666F]">
                {interpretation.assumptions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </details>
          )}

          <div className="flex flex-wrap gap-3">
            <button type="button" className={ghostBtn} onClick={() => setStage('brief')}><ArrowLeft className="h-4 w-4" aria-hidden /> Edit brief</button>
            <button type="button" className={primaryBtn} onClick={compose} disabled={!catalog || reviewed.productModel.entities.length === 0}>
              Compose three directions <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </section>
      )}

      {stage === 'directions' && composition && (
        <section aria-labelledby="directions-heading" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="directions-heading" className="text-lg font-semibold">Three directions</h2>
              <p className="text-sm text-[#62666F]">Each opens as a new project you can edit, compare and export.</p>
            </div>
            <button type="button" className={ghostBtn} onClick={() => setStage('review')}><ArrowLeft className="h-4 w-4" aria-hidden /> Back to review</button>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <DirectionCard number="01" output={composition.directionA} isFeatured onOpen={openDirection} />
            <DirectionCard number="02" output={composition.directionB} onOpen={openDirection} />
            <DirectionCard number="03" output={composition.directionC} onOpen={openDirection} />
          </div>
          {openError && <p role="alert" className="rounded-lg border border-[#C83D48] bg-[#FCEDEE] px-4 py-3 text-sm text-[#8A1F29]">{openError}</p>}
        </section>
      )}
    </div>
  );
}

function StopPicker({
  legend,
  stops,
  active,
  onPick,
}: {
  legend: string;
  stops: Array<{ stop: string; label: string; defaultScore: number; description: string }>;
  active: string;
  onPick: (score: number) => void;
}) {
  const current = stops.find((s) => s.stop === active);
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold">
        {legend}: {current?.label}
      </legend>
      <div className="flex flex-wrap gap-1">
        {stops.map((s) => (
          <button
            key={s.stop}
            type="button"
            title={s.description}
            aria-pressed={s.stop === active}
            onClick={() => onPick(s.defaultScore)}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${s.stop === active ? 'bg-[#111217] text-white' : 'bg-[#ECE9E2] text-[#111217] hover:bg-[#E2DED5]'}`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </fieldset>
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
  const gaps = output.diagnostics?.length ?? 0;
  const primaryScreen = manifest.screens[0];
  const kind = direction.type === 'conservative' ? 'Conservative fit' : direction.type === 'expressive' ? 'Expressive fit' : 'Structural alternative';

  return (
    <div
      data-testid={`direction-card-${number}`}
      className={`flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ${isFeatured ? 'border-2 border-[#2547E8]' : 'border border-[#D9D6CF]'}`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold uppercase text-[#2547E8]">Direction {number}</span>
          <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${isFeatured ? 'bg-[#E7EBFF] text-[#1E3CCD]' : 'bg-[#FAF9F6] text-[#62666F]'}`}>{kind}</span>
        </div>
        <div>
          <h3 className="text-lg font-bold">{direction.name}</h3>
          <p className="mt-1 text-xs text-[#62666F]">{direction.rationale}</p>
          {gaps > 0 && (
            <p data-testid={`direction-gaps-${number}`} className="mt-2 text-xs text-[#8A5A10]">
              {gaps} section{gaps === 1 ? ' needs' : 's need'} a resource and {gaps === 1 ? 'is' : 'are'} marked as {gaps === 1 ? 'a gap' : 'gaps'} to fill in the Workbench.
            </p>
          )}
        </div>
        <div className="rounded-xl border border-[#ECE9E2] bg-[#FAF9F6] p-3">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#62666F]">
            <span>Preview: {primaryScreen?.name ?? 'Overview'}</span>
            <span>
              {manifest.screens.length} screens{gaps > 0 ? ` · ${gaps} gap${gaps === 1 ? '' : 's'}` : ''}
            </span>
          </div>
          <div data-testid={`direction-preview-${number}`} className="relative mt-2 h-48 w-full overflow-hidden rounded-lg border border-[#D9D6CF] bg-white shadow-inner" aria-hidden>
            <div className="pointer-events-none select-none" style={{ width: '1000px', minHeight: '700px', transform: 'scale(0.28)', transformOrigin: '0 0' }}>
              <ManifestRenderer manifest={manifest} activeScreenId={primaryScreen?.id} />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          data-testid={`open-workbench-dir-${number}`}
          onClick={() => onOpen(manifest)}
          className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold ${isFeatured ? 'bg-[#2547E8] text-white hover:bg-[#1E3CCD]' : 'border border-[#2547E8] bg-white text-[#2547E8] hover:bg-[#FAF9F6]'}`}
        >
          Open in Workbench <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </button>
        <a href={`/tools/dna`} className="text-center text-xs text-[#62666F] hover:text-[#111217]">Explore Design DNA</a>
      </div>
    </div>
  );
}
