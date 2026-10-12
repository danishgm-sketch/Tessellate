import React, { useState, useEffect } from 'react';
import type { ResourceManifest } from '@tessellate/schemas';
import {
  Code,
  Layers,
  Sparkles,
  Palette,
  ShieldCheck,
  Zap,
  Package,
  History,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export interface ResourceTabsProps {
  manifest: ResourceManifest;
  sourceCode: string;
}

export type TabId =
  | 'intent'
  | 'code'
  | 'variants'
  | 'anatomy'
  | 'accessibility'
  | 'performance'
  | 'dependencies'
  | 'versions';

export function ResourceTabs({ manifest,sourceCode }: ResourceTabsProps) {
  const [origin,setOrigin]=useState('');
  const [copyStatus,setCopyStatus]=useState('');
  useEffect(()=>setOrigin(window.location.origin),[]);
  const install=`npx shadcn@latest add ${origin}/r/${manifest.slug}.json`;
  const copy=()=>{void navigator.clipboard.writeText(install).then(()=>setCopyStatus('Install command copied.')).catch(cause=>setCopyStatus(`Copy failed: ${String(cause)}`));};
  const [activeTab, setActiveTab] = useState<TabId>('intent');

  const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
    { id: 'intent', label: 'Intent', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'code', label: 'Code', icon: <Code className="w-3.5 h-3.5" /> },
    { id: 'variants', label: 'Variants', icon: <Palette className="w-3.5 h-3.5" /> },
    { id: 'anatomy', label: 'Anatomy', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'accessibility', label: 'Accessibility', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'performance', label: 'Performance', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'dependencies', label: 'Dependencies', icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'versions', label: 'Versions', icon: <History className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-col rounded-xl border border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-surface,#FAF9F6)] overflow-hidden shadow-xs">
      {/* Tab Navigation Header */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-canvas,#F4F2ED)] px-3 pt-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-all border-b-2 -mb-[1px] select-none ${
                isActive
                  ? 'border-[var(--tess-cobalt,#2547E8)] bg-white text-[var(--tess-cobalt,#2547E8)] font-semibold shadow-2xs'
                  : 'border-transparent text-[var(--tess-ink-secondary,#62666F)] hover:text-[var(--tess-ink,#111217)] hover:bg-white/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.id === 'intent' && (
                <span className="ml-1 text-[9px] font-mono px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                  Core
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div className="p-6 text-sm text-[var(--tess-ink,#111217)] leading-relaxed">
        {/* INTENT TAB (Mandatory) */}
        {activeTab === 'intent' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--tess-ink-muted,#8B8F97)] mb-1">
                Summary & Purpose
              </h4>
              <p className="text-base text-[var(--tess-ink,#111217)] font-medium">
                {manifest.intent.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ideal For */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>When It Works (Ideal For)</span>
                </div>
                <ul className="space-y-1 text-xs text-emerald-950">
                  {manifest.intent.idealFor.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-emerald-700">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Avoid For */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs uppercase tracking-wider">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>When It Is Inappropriate (Avoid For)</span>
                </div>
                <ul className="space-y-1 text-xs text-rose-950">
                  {manifest.intent.avoidFor.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-rose-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Jobs to be done */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--tess-ink-muted,#8B8F97)]">
                Jobs To Be Done
              </h4>
              <div className="flex flex-wrap gap-2">
                {manifest.intent.jobs.map((job, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[var(--tess-canvas,#F4F2ED)] border border-[var(--tess-hairline,#D9D6CF)] text-xs font-mono"
                  >
                    {job}
                  </span>
                ))}
              </div>
            </div>

            {/* Content Requirements */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--tess-ink-muted,#8B8F97)]">
                Expected Content Requirements
              </h4>
              <ul className="list-disc list-inside text-xs space-y-1 text-[var(--tess-ink-secondary,#62666F)]">
                {manifest.intent.contentRequirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>

            {/* Product Archetypes */}
            {manifest.productArchetypes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--tess-ink-muted,#8B8F97)]">
                  Target Product Archetypes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {manifest.productArchetypes.map((arch, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[var(--tess-canvas-strong,#ECE9E2)] text-xs font-medium text-[var(--tess-ink,#111217)]"
                    >
                      {arch.tag} ({arch.weight}%)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CODE TAB */}
        {activeTab === 'code' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[var(--tess-ink-secondary,#62666F)]">
                Install component via CLI:
              </span>
              <button
                type="button"
                onClick={copy}
                className="px-2 py-1 rounded bg-[var(--tess-canvas,#F4F2ED)] border border-[var(--tess-hairline,#D9D6CF)] text-[11px] hover:bg-white"
              >
                Copy
              </button>
            </div>
            <pre tabIndex={0} className="p-3.5 rounded-lg bg-neutral-900 text-neutral-100 overflow-x-auto text-[11px]">
              <code>{install}</code>
            </pre>

            <span className="text-[var(--tess-ink-secondary,#62666F)] block pt-2">
              Actual published source (React + Tailwind):
            </span>
            <pre tabIndex={0} className="p-3.5 rounded-lg bg-neutral-900 text-neutral-100 overflow-x-auto text-[11px]">
              <code>{sourceCode}</code>
            </pre>
          </div>
        )}

        <p role="status">{copyStatus}</p>
        {/* VARIANTS TAB */}
        {activeTab === 'variants' && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--tess-ink-secondary,#62666F)]">
              The configurations declared by this resource are listed below. Inspect them in the live preview.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {manifest.variants.map((v) => (
                <div
                  key={v.id}
                  className="rounded-xl border border-[var(--tess-hairline,#D9D6CF)] bg-white p-4 space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-sm">{v.name}</h5>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--tess-canvas,#F4F2ED)] text-[var(--tess-ink-secondary,#62666F)]">
                      {v.id}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--tess-ink-secondary,#62666F)]">
                    {v.description ?? 'Standard variant configuration'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANATOMY TAB */}
        {activeTab === 'anatomy' && (
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--tess-ink-muted,#8B8F97)]">
              Configurable Slots & Props
            </h4>
            <div className="rounded-xl border border-[var(--tess-hairline,#D9D6CF)] bg-white overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-canvas,#F4F2ED)] text-[var(--tess-ink-secondary,#62666F)]">
                    <th className="p-3 font-semibold">Slot / Prop</th>
                    <th className="p-3 font-semibold">Type</th>
                    <th className="p-3 font-semibold">Required</th>
                    <th className="p-3 font-semibold">Default</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--tess-hairline,#D9D6CF)]">
                  {manifest.slots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-neutral-50/50">
                      <td className="p-3 font-mono font-medium">{slot.name} ({slot.id})</td>
                      <td className="p-3 font-mono text-[var(--tess-cobalt,#2547E8)]">{slot.type}</td>
                      <td className="p-3">{slot.required ? 'Yes' : 'No'}</td>
                      <td className="p-3 font-mono text-[var(--tess-ink-muted,#8B8F97)]">
                        {String(slot.defaultValue ?? '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ACCESSIBILITY TAB */}
        {activeTab === 'accessibility' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[var(--tess-ink-secondary,#62666F)]">
                Compliance Level Target:
              </span>
              <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-100 text-emerald-800">
                WCAG {manifest.accessibility.levelTarget}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Keyboard Navigation', verified: manifest.accessibility.keyboardVerified },
                { label: 'Screen Reader Semantics', verified: manifest.accessibility.screenReaderSemantics },
                { label: 'Reduced Motion Verified', verified: manifest.accessibility.reducedMotionVerified },
                { label: 'Contrast Compatible', verified: manifest.accessibility.contrastTokenCompatible },
                { label: 'Visible Focus State', verified: manifest.accessibility.focusVisible },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[var(--tess-hairline,#D9D6CF)] bg-white p-3 flex items-center justify-between text-xs"
                >
                  <span>{item.label}</span>
                  {item.verified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PERFORMANCE TAB */}
        {activeTab === 'performance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-[var(--tess-hairline,#D9D6CF)] bg-white p-3">
                <span className="text-[11px] text-[var(--tess-ink-muted,#8B8F97)] block">JS Payload</span>
                <span className="text-sm font-semibold uppercase font-mono text-[var(--tess-cobalt,#2547E8)]">
                  {manifest.performance.jsCost}
                </span>
              </div>
              <div className="rounded-xl border border-[var(--tess-hairline,#D9D6CF)] bg-white p-3">
                <span className="text-[11px] text-[var(--tess-ink-muted,#8B8F97)] block">GPU Overhead</span>
                <span className="text-sm font-semibold uppercase font-mono">
                  {manifest.performance.gpuCost}
                </span>
              </div>
              <div className="rounded-xl border border-[var(--tess-hairline,#D9D6CF)] bg-white p-3">
                <span className="text-[11px] text-[var(--tess-ink-muted,#8B8F97)] block">Runtime Complexity</span>
                <span className="text-sm font-semibold uppercase font-mono">
                  {manifest.performance.runtimeComplexity}
                </span>
              </div>
              <div className="rounded-xl border border-[var(--tess-hairline,#D9D6CF)] bg-white p-3">
                <span className="text-[11px] text-[var(--tess-ink-muted,#8B8F97)] block">Lazy Load Recommended</span>
                <span className="text-sm font-semibold font-mono">
                  {manifest.performance.lazyRecommended ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* DEPENDENCIES TAB */}
        {activeTab === 'dependencies' && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--tess-ink-secondary,#62666F)]">
              Declared runtime and registry dependencies for this resource:
            </p>
            {manifest.dependencies.length === 0 ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 font-medium">
                ✓ Zero extra runtime dependencies. Uses native React and Tailwind CSS 4.
              </div>
            ) : (
              <ul className="space-y-2">
                {manifest.dependencies.map((dep, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-lg border border-[var(--tess-hairline,#D9D6CF)] bg-white flex items-center justify-between text-xs"
                  >
                    <span className="font-mono font-semibold">{dep.package}</span>
                    <span className="font-mono text-[var(--tess-ink-muted,#8B8F97)]">{dep.range}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* VERSIONS TAB */}
        {activeTab === 'versions' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-[var(--tess-hairline,#D9D6CF)] bg-white space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm">v{manifest.version}</span>
                <span className="text-[11px] text-[var(--tess-ink-muted,#8B8F97)]">Initial Release</span>
              </div>
              <p className="text-xs text-[var(--tess-ink-secondary,#62666F)]">
                Launch release with verified Quiet, Expressive, and Nocturne variants.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
