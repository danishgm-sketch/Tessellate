import React, { useEffect, useState, useMemo } from 'react';
import {
  ListOrdered,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { CopyFailureNotice, useToolClipboard } from './useToolClipboard';

export type PageObjectiveId =
  | 'saas-conversion'
  | 'developer-platform'
  | 'fintech-analytics'
  | 'luxury-marketplace'
  | 'internal-tool';

interface SectionTemplateItem {
  id: string;
  name: string;
  type: 'hero' | 'proof' | 'interactive' | 'feature' | 'pricing' | 'faq' | 'cta';
  description: string;
  enabled: boolean;
}

interface ObjectiveBlueprint {
  id: PageObjectiveId;
  name: string;
  tagline: string;
  sections: SectionTemplateItem[];
}

const OBJECTIVE_BLUEPRINTS: ObjectiveBlueprint[] = [
  {
    id: 'saas-conversion',
    name: 'B2B SaaS Conversion Landing',
    tagline:
      'Plan a page that helps technical evaluators review product value, evidence, pricing, and next steps.',
    sections: [
      {
        id: 'sec-1',
        name: 'Hero Value Proposition',
        type: 'hero',
        description: 'State the product’s value and link to an implemented primary action.',
        enabled: true,
      },
      {
        id: 'sec-2',
        name: 'Evidence and Customer References',
        type: 'proof',
        description:
          'Use certifications and customer references only when they are documented and approved.',
        enabled: true,
      },
      {
        id: 'sec-3',
        name: 'Interactive Feature Playground',
        type: 'interactive',
        description:
          'Add a product demo; connect a working sandbox before presenting it as interactive.',
        enabled: true,
      },
      {
        id: 'sec-4',
        name: 'Architectural Difference Matrix',
        type: 'feature',
        description: 'Compare product capabilities using criteria that are specific and supported.',
        enabled: true,
      },
      {
        id: 'sec-5',
        name: 'Measured Performance Evidence',
        type: 'proof',
        description: 'Include measured benchmarks and their methodology, or omit this section.',
        enabled: true,
      },
      {
        id: 'sec-6',
        name: 'Pricing and Plan Details',
        type: 'pricing',
        description: 'List current plan names and terms supplied by the product owner.',
        enabled: true,
      },
      {
        id: 'sec-7',
        name: 'Technical Evaluation FAQ',
        type: 'faq',
        description:
          'Answer security, hosting, and export questions from verified product documentation.',
        enabled: true,
      },
      {
        id: 'sec-8',
        name: 'Final Call to Action',
        type: 'cta',
        description: 'Use configured URLs or actions for web and CLI entry points.',
        enabled: true,
      },
    ],
  },
  {
    id: 'developer-platform',
    name: 'Developer Documentation Hub',
    tagline:
      'Organize a developer site around its quickstart, reference material, and code examples.',
    sections: [
      {
        id: 'sec-1',
        name: 'Quickstart Hero & CLI Installation',
        type: 'hero',
        description:
          'Show a verified install command and a first task that works with the current package.',
        enabled: true,
      },
      {
        id: 'sec-2',
        name: 'API Reference',
        type: 'feature',
        description: 'Link to current endpoints, request schemas, and response schemas.',
        enabled: true,
      },
      {
        id: 'sec-3',
        name: 'Code Example',
        type: 'feature',
        description: 'Show a code sample; add an executable sandbox only when one is connected.',
        enabled: true,
      },
      {
        id: 'sec-4',
        name: 'Architecture & Security Spec',
        type: 'proof',
        description: 'Describe the security boundaries and data flows that have been verified.',
        enabled: true,
      },
      {
        id: 'sec-5',
        name: 'Packages and Integrations',
        type: 'feature',
        description: 'List only packages and integrations that are currently supported.',
        enabled: true,
      },
      {
        id: 'sec-6',
        name: 'Community & GitHub Actions CTA',
        type: 'cta',
        description: 'Link to active repository or discussion destinations that are maintained.',
        enabled: true,
      },
    ],
  },
  {
    id: 'fintech-analytics',
    name: 'Fintech Analytics Cockpit',
    tagline:
      'Plan a financial analytics page around its data sources, review tasks, and reporting needs.',
    sections: [
      {
        id: 'sec-1',
        name: 'Financial Overview',
        type: 'hero',
        description: 'Show organization-approved measures from the selected data source.',
        enabled: true,
      },
      {
        id: 'sec-2',
        name: 'Time-Series Chart',
        type: 'interactive',
        description: 'Plot the selected series and state its update cadence only when measured.',
        enabled: true,
      },
      {
        id: 'sec-3',
        name: 'Transaction Table',
        type: 'feature',
        description:
          'Present transaction records and disclose whether data is sample, delayed, or live.',
        enabled: true,
      },
      {
        id: 'sec-4',
        name: 'Risk & Compliance Scorecard',
        type: 'proof',
        description: 'Summarize risk measures with their source, scope, and update time.',
        enabled: true,
      },
      {
        id: 'sec-5',
        name: 'Reporting Actions',
        type: 'cta',
        description:
          'Link to reporting formats the product actually provides; describe signing only when verified.',
        enabled: true,
      },
    ],
  },
  {
    id: 'luxury-marketplace',
    name: 'Luxury Editorial Sanctuary',
    tagline: 'Generous whitespace, editorial typography, and high-resolution imagery pacing.',
    sections: [
      {
        id: 'sec-1',
        name: 'Cinematic Visual Hero',
        type: 'hero',
        description:
          'Use licensed imagery with meaningful alt text and reduced-motion support for entrances.',
        enabled: true,
      },
      {
        id: 'sec-2',
        name: 'Curated Collection Narrative',
        type: 'feature',
        description:
          'Describe craftsmanship and origin using details supplied by the product owner.',
        enabled: true,
      },
      {
        id: 'sec-3',
        name: 'Interactive Lookbook Pacing',
        type: 'interactive',
        description:
          'If using a moving image reel, support keyboard, touch, and reduced-motion preferences.',
        enabled: true,
      },
      {
        id: 'sec-4',
        name: 'Private Concierge Reservation',
        type: 'cta',
        description:
          'Connect an appointment form or booking service before promising a reservation.',
        enabled: true,
      },
    ],
  },
  {
    id: 'internal-tool',
    name: 'Operational Triage & Admin Tool',
    tagline: 'Plan a focused workspace for prioritizing records and supported account actions.',
    sections: [
      {
        id: 'sec-1',
        name: 'Global Command Bar & Filters',
        type: 'hero',
        description: 'Expose keyboard commands only when the application handles them.',
        enabled: true,
      },
      {
        id: 'sec-2',
        name: 'Triage Queue Table',
        type: 'feature',
        description: 'Describe available bulk actions and confirm high-impact changes.',
        enabled: true,
      },
      {
        id: 'sec-3',
        name: 'Side Inspector Panel',
        type: 'interactive',
        description:
          'Show fields authorized for the current user and handle sensitive values carefully.',
        enabled: true,
      },
      {
        id: 'sec-4',
        name: 'Audit Action Trail',
        type: 'proof',
        description: 'List supported audit events with their access and retention rules.',
        enabled: true,
      },
    ],
  },
];

export function SectionPlanner() {
  const [isClientReady, setIsClientReady] = useState(false);
  const [objectiveId, setObjectiveId] = useState<PageObjectiveId>('saas-conversion');
  const [sections, setSections] = useState<SectionTemplateItem[]>(() => {
    return OBJECTIVE_BLUEPRINTS[0]!.sections.map((s) => ({ ...s }));
  });
  const [newSectionName, setNewSectionName] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const { copyText, copyFailed } = useToolClipboard();

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const selectObjective = (id: PageObjectiveId) => {
    setObjectiveId(id);
    const blueprint = OBJECTIVE_BLUEPRINTS.find((b) => b.id === id);
    if (blueprint) {
      setSections(blueprint.sections.map((s) => ({ ...s })));
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const next = [...sections];
    const item = next[index]!;
    next[index] = next[targetIndex]!;
    next[targetIndex] = item;
    setSections(next);
  };

  const toggleSection = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const addCustomSection = () => {
    if (!newSectionName.trim()) return;
    setSections((prev) => [
      ...prev,
      {
        id: `sec-${Date.now()}`,
        name: newSectionName.trim(),
        type: 'feature',
        description: 'Custom author-defined page section block.',
        enabled: true,
      },
    ]);
    setNewSectionName('');
  };

  // Section balance statistics
  const activeSections = useMemo(() => sections.filter((s) => s.enabled), [sections]);
  const typeCounts = useMemo(() => {
    const counts = { hero: 0, proof: 0, interactive: 0, feature: 0, pricing: 0, faq: 0, cta: 0 };
    for (const s of activeSections) {
      counts[s.type] = (counts[s.type] || 0) + 1;
    }
    return counts;
  }, [activeSections]);

  const balanceGuide = [
    { label: 'Attention (Hero & Visual)', count: typeCounts.hero, target: '1-2', min: 1, max: 2 },
    {
      label: 'Proof & Trust (Audit / Metrics)',
      count: typeCounts.proof,
      target: '1-3',
      min: 1,
      max: 3,
    },
    {
      label: 'Interaction (Playground / Sandbox)',
      count: typeCounts.interactive,
      target: '1-2',
      min: 1,
      max: 2,
    },
    {
      label: 'Information (Features / FAQ)',
      count: typeCounts.feature + typeCounts.faq,
      target: '2-4',
      min: 2,
      max: 4,
    },
    {
      label: 'Action & Conversion (Pricing / CTA)',
      count: typeCounts.pricing + typeCounts.cta,
      target: '1-2',
      min: 1,
      max: 2,
    },
  ];
  const withinBalanceGuide = balanceGuide.every(
    (row) => row.count >= row.min && row.count <= row.max
  );

  const exportedJson = useMemo(() => {
    return JSON.stringify(
      {
        pageObjective: objectiveId,
        totalSections: activeSections.length,
        grammar: activeSections.map((s, idx) => ({
          order: idx + 1,
          id: s.id,
          name: s.name,
          semanticRole: s.type,
          description: s.description,
        })),
      },
      null,
      2
    );
  }, [objectiveId, activeSections]);

  const copyToClipboard = async () => {
    const didCopy = await copyText(exportedJson);
    setCopied(didCopy);
    if (didCopy) setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {!isClientReady && (
        <p
          role="status"
          className="border-l-2 border-[#2547E8] bg-white px-3 py-2 text-xs text-[#62666F]"
        >
          Loading planner controls…
        </p>
      )}
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D6CF] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
              Tool 07 · Page Structure
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#E7EBFF] text-[#2547E8]">
              Client-Side · Zero Login
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111217] mt-1">
            Section Planner
          </h1>
          <p className="text-sm text-[#62666F] mt-1">
            Plan and edit example section structures for conversion pages, technical documentation,
            and editorial sites. The planner does not implement the described sections.
          </p>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyToClipboard}
            disabled={!isClientReady}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2547E8] text-white text-xs font-semibold hover:bg-[#1E3CCD] transition-all shadow-sm disabled:cursor-wait disabled:opacity-60"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy Section Graph JSON</span>
          </button>
        </div>
      </div>

      <CopyFailureNotice failed={copyFailed} />

      <p className="border-l-2 border-[#D9D6CF] pl-3 text-xs leading-relaxed text-[#62666F]">
        Template descriptions are planning prompts, not implementation or verified proof. Replace
        sample claims with sourced product details before publishing.
      </p>

      {/* Objective Blueprint Selector */}
      <div className="space-y-2">
        <span className="block font-mono text-xs font-semibold uppercase text-[var(--text-muted)]">
          Page Objective Archetypes
        </span>
        <div className="flex flex-wrap gap-2">
          {OBJECTIVE_BLUEPRINTS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => selectObjective(b.id)}
              aria-pressed={objectiveId === b.id}
              disabled={!isClientReady}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                objectiveId === b.id
                  ? 'border-[#111217] bg-[#111217] text-white shadow-sm'
                  : 'border-[#D9D6CF] bg-white text-[#62666F] hover:text-[#111217] hover:border-[#62666F]'
              } disabled:cursor-wait disabled:opacity-60`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Section Sequence (Left 7) & Composition Analytics (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sequence Editor Column */}
        <div className="lg:col-span-7 space-y-4 rounded-2xl border border-[#D9D6CF] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-3">
            <div className="flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-[#2547E8]" />
              <h2 className="text-sm font-semibold text-[#111217]">
                Page Sections ({activeSections.length} active)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => selectObjective(objectiveId)}
              disabled={!isClientReady}
              className="text-xs font-mono text-[var(--text-muted)] hover:text-[#111217] flex items-center gap-1 disabled:cursor-wait disabled:opacity-60"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Blueprint</span>
            </button>
          </div>

          {/* Section Items List */}
          <div className="space-y-2">
            {sections.map((s, idx) => (
              <div
                key={s.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  s.enabled
                    ? 'border-[#D9D6CF] bg-[#FAF9F6] shadow-sm'
                    : 'border-[#D9D6CF]/60 bg-white/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[var(--text-muted)] w-5">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#111217]">{s.name}</span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white border border-[#D9D6CF] text-[#62666F]">
                        {s.type}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#62666F] line-clamp-1 mt-0.5">
                      {s.description}
                    </span>
                  </div>
                </div>

                {/* Item Actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveSection(idx, 'up')}
                    disabled={!isClientReady || idx === 0}
                    aria-label={`Move ${s.name} up`}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-[#111217] disabled:opacity-30"
                    title="Move section up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(idx, 'down')}
                    disabled={!isClientReady || idx === sections.length - 1}
                    aria-label={`Move ${s.name} down`}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-[#111217] disabled:opacity-30"
                    title="Move section down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSection(s.id)}
                    aria-pressed={s.enabled}
                    aria-label={`${s.enabled ? 'Omit' : 'Include'} ${s.name}`}
                    disabled={!isClientReady}
                    className={`px-2 py-1 text-[10px] font-semibold rounded ${
                      s.enabled ? 'bg-[#E7EBFF] text-[#2547E8]' : 'bg-[#D9D6CF] text-[#62666F]'
                    } disabled:cursor-wait disabled:opacity-60`}
                  >
                    {s.enabled ? 'Active' : 'Omit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSection(s.id)}
                    aria-label={`Delete ${s.name}`}
                    disabled={!isClientReady}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-[#C83D48] disabled:cursor-wait disabled:opacity-60"
                    title="Delete section"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Section Input */}
          <div className="flex gap-2 pt-2 border-t border-[#D9D6CF]">
            <input
              id="custom-section-title"
              name="customSectionTitle"
              aria-label="Custom section title"
              type="text"
              disabled={!isClientReady}
              placeholder="Add custom section title (e.g. Migration Guide)..."
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomSection()}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-[#D9D6CF] bg-[#FAF9F6] focus:bg-white outline-none"
            />
            <button
              type="button"
              onClick={addCustomSection}
              disabled={!isClientReady}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#111217] text-white text-xs font-semibold hover:bg-[#2547E8] transition-colors disabled:cursor-wait disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Analytics & Balance Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-[#D9D6CF] bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9D6CF]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#12603F]" />
                <h3 className="text-sm font-semibold text-[#111217]">Section Mix Guide</h3>
              </div>
              <span
                className={`font-mono text-[11px] font-semibold ${withinBalanceGuide ? 'text-[#12603F]' : 'text-[#A66A15]'}`}
              >
                {withinBalanceGuide ? 'WITHIN GUIDE' : 'REVIEW MIX'}
              </span>
            </div>

            <div className="space-y-3">
              {balanceGuide.map((m) => (
                <div key={m.label} className="flex items-center justify-between text-xs">
                  <span className="text-[#62666F]">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#111217]">
                      {m.count} {m.count === 1 ? 'section' : 'sections'}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">
                      (guide {m.target})
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-[#62666F] leading-relaxed pt-2 border-t border-[#D9D6CF]">
              These reference ranges are prompts for review, not a quality score. Adjust the
              sequence to fit the product goal.
            </p>
          </div>

          {/* Export JSON Block */}
          <div className="rounded-xl border border-[#D9D6CF] bg-[#0B0D10] text-[#F5F7FA] p-4 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#272B33] pb-1.5 text-[#A8AFBA]">
              <span>GRAMMAR MANIFEST</span>
              <button
                type="button"
                onClick={copyToClipboard}
                disabled={!isClientReady}
                className="text-[#6782FF] hover:text-white disabled:cursor-wait disabled:opacity-60"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre
              tabIndex={0}
              className="overflow-x-auto text-[10px] text-[#D9D6CF] leading-relaxed max-h-56"
            >
              {exportedJson}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
