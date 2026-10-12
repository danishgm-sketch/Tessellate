import React, { useState, useMemo } from 'react';
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
    tagline: 'High-trust conversion journey engineered to turn technical evaluators into trials.',
    sections: [
      { id: 'sec-1', name: 'Hero Value Proposition & Composer', type: 'hero', description: 'Immediate punchy headline with interactive product simulation.', enabled: true },
      { id: 'sec-2', name: 'Institutional Trust & Compliance Badges', type: 'proof', description: 'SOC2, ISO27001, and enterprise customer logos.', enabled: true },
      { id: 'sec-3', name: 'Interactive Feature Playground', type: 'interactive', description: 'Zero-friction live browser sandbox demonstrating core capability.', enabled: true },
      { id: 'sec-4', name: 'Architectural Difference Matrix', type: 'feature', description: 'Side-by-side comparison with legacy alternatives.', enabled: true },
      { id: 'sec-5', name: 'Quantified Performance Proof', type: 'proof', description: 'Verified audit benchmarks, latency metrics, and throughput.', enabled: true },
      { id: 'sec-6', name: 'Transparent Pricing Tiers', type: 'pricing', description: 'Free tier, Pro workspace, and Enterprise custom tiers.', enabled: true },
      { id: 'sec-7', name: 'Technical Evaluation FAQ', type: 'faq', description: 'Answers to security, self-hosting, and export questions.', enabled: true },
      { id: 'sec-8', name: 'Final Action Call & Terminal Run', type: 'cta', description: 'Single-command CLI launch and web app entry.', enabled: true },
    ],
  },
  {
    id: 'developer-platform',
    name: 'Developer Documentation Hub',
    tagline: 'Terminal-first information architecture prioritizing fast reference and code examples.',
    sections: [
      { id: 'sec-1', name: 'Quickstart Hero & CLI Installation', type: 'hero', description: 'One-click npm/pnpm copy command and interactive sandbox.', enabled: true },
      { id: 'sec-2', name: 'API Reference Matrix', type: 'feature', description: 'Categorized endpoints and schema validations.', enabled: true },
      { id: 'sec-3', name: 'Live Code Sandbox', type: 'interactive', description: 'Editable TypeScript snippet with real-time output.', enabled: true },
      { id: 'sec-4', name: 'Architecture & Security Spec', type: 'proof', description: 'Sandboxed iframe, worker isolation, and data flow.', enabled: true },
      { id: 'sec-5', name: 'SDKs & Integrations Grid', type: 'feature', description: 'React, Node, CLI, and MCP client packages.', enabled: true },
      { id: 'sec-6', name: 'Community & GitHub Actions CTA', type: 'cta', description: 'Fork on GitHub and join Discord/Discussions.', enabled: true },
    ],
  },
  {
    id: 'fintech-analytics',
    name: 'Fintech Analytics Cockpit',
    tagline: 'High-density institutional ledger with real-time streaming charts and audit logging.',
    sections: [
      { id: 'sec-1', name: 'Executive Gross Volume Header', type: 'hero', description: 'Key metric pulse, delta indicators, and system health status.', enabled: true },
      { id: 'sec-2', name: 'Streaming Telemetry Time Series', type: 'interactive', description: 'WebGL chart with 100ms interval updates.', enabled: true },
      { id: 'sec-3', name: 'Audited Settlement Transaction Table', type: 'feature', description: 'Virtualised ledger with inline column filtering.', enabled: true },
      { id: 'sec-4', name: 'Risk & Compliance Scorecard', type: 'proof', description: '100-point deterministic security audit results.', enabled: true },
      { id: 'sec-5', name: 'Export & Regulatory Reporting CTA', type: 'cta', description: 'Generate signed audit PDF and CSV extract.', enabled: true },
    ],
  },
  {
    id: 'luxury-marketplace',
    name: 'Luxury Editorial Sanctuary',
    tagline: 'Generous whitespace, editorial typography, and high-resolution imagery pacing.',
    sections: [
      { id: 'sec-1', name: 'Cinematic Visual Hero', type: 'hero', description: 'Full-bleed imagery with bespoke serif title and quiet entrance.', enabled: true },
      { id: 'sec-2', name: 'Curated Collection Narrative', type: 'feature', description: 'Authorial statement on craftsmanship and origin.', enabled: true },
      { id: 'sec-3', name: 'Interactive Lookbook Pacing', type: 'interactive', description: 'Seamless horizontal image reel with detail cards.', enabled: true },
      { id: 'sec-4', name: 'Private Concierge Reservation', type: 'cta', description: 'Discreet appointment booking modal.', enabled: true },
    ],
  },
  {
    id: 'internal-tool',
    name: 'Operational Triage & Admin Tool',
    tagline: 'Utilitarian zero-distraction workspace for rapid bulk triage and account management.',
    sections: [
      { id: 'sec-1', name: 'Global Command Bar & Filters', type: 'hero', description: 'Keyboard-first query launcher and quick status chips.', enabled: true },
      { id: 'sec-2', name: 'Triage Queue Table', type: 'feature', description: 'High-density records table with multi-select bulk operations.', enabled: true },
      { id: 'sec-3', name: 'Side Inspector Panel', type: 'interactive', description: 'Deep record payload viewer with JSON diff.', enabled: true },
      { id: 'sec-4', name: 'Audit Action Trail', type: 'proof', description: 'Immutable chronological event log.', enabled: true },
    ],
  },
];

export function SectionPlanner() {
  const [objectiveId, setObjectiveId] = useState<PageObjectiveId>('saas-conversion');
  const [sections, setSections] = useState<SectionTemplateItem[]>(() => {
    return OBJECTIVE_BLUEPRINTS[0]!.sections.map((s) => ({ ...s }));
  });
  const [newSectionName, setNewSectionName] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

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
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D6CF] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
              Tool 07 · Narrative Orchestration
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#E7EBFF] text-[#2547E8]">
              Client-Side · Zero Login
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111217] mt-1">
            Section Planner
          </h1>
          <p className="text-sm text-[#62666F] mt-1">
            Generate and balance structured section grammars optimized for conversion, technical documentation, or editorial storytelling.
          </p>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2547E8] text-white text-xs font-semibold hover:bg-[#1E3CCD] transition-all shadow-sm"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Export Section Graph JSON</span>
          </button>
        </div>
      </div>

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
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                objectiveId === b.id
                  ? 'border-[#111217] bg-[#111217] text-white shadow-sm'
                  : 'border-[#D9D6CF] bg-white text-[#62666F] hover:text-[#111217] hover:border-[#8B8F97]'
              }`}
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
                Ordered Section Grammar ({activeSections.length} Active)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => selectObjective(objectiveId)}
              className="text-xs font-mono text-[var(--text-muted)] hover:text-[#111217] flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Order</span>
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
                    disabled={idx === 0}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-[#111217] disabled:opacity-30"
                    title="Move section up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(idx, 'down')}
                    disabled={idx === sections.length - 1}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-[#111217] disabled:opacity-30"
                    title="Move section down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSection(s.id)}
                    className={`px-2 py-1 text-[10px] font-semibold rounded ${
                      s.enabled ? 'bg-[#E7EBFF] text-[#2547E8]' : 'bg-[#D9D6CF] text-[#62666F]'
                    }`}
                  >
                    {s.enabled ? 'Active' : 'Omit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSection(s.id)}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-[#C83D48]"
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
            <input aria-label="Custom section title"
              type="text"
              placeholder="Add custom section title (e.g. Migration Guide)..."
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomSection()}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-[#D9D6CF] bg-[#FAF9F6] focus:bg-white outline-none"
            />
            <button
              type="button"
              onClick={addCustomSection}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#111217] text-white text-xs font-semibold hover:bg-[#2547E8] transition-colors"
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
                <h3 className="text-sm font-semibold text-[#111217]">
                  Grammar Balance Telemetry
                </h3>
              </div>
              <span className="font-mono text-[11px] text-[#12603F] font-semibold">
                BALANCED FLOW
              </span>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Attention (Hero & Visual)', count: typeCounts.hero, target: '1-2' },
                { label: 'Proof & Trust (Audit / Metrics)', count: typeCounts.proof, target: '1-3' },
                { label: 'Interaction (Playground / Sandbox)', count: typeCounts.interactive, target: '1-2' },
                { label: 'Information (Features / FAQ)', count: typeCounts.feature + typeCounts.faq, target: '2-4' },
                { label: 'Action & Conversion (Pricing / CTA)', count: typeCounts.pricing + typeCounts.cta, target: '1-2' },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-[#62666F]">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#111217]">{m.count} sections</span>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">
                      (target {m.target})
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-[#62666F] leading-relaxed pt-2 border-t border-[#D9D6CF]">
              A balanced section grammar establishes immediate clarity, backs claims with proof, offers zero-friction interaction, and guides users to decisive conversion.
            </p>
          </div>

          {/* Export JSON Block */}
          <div className="rounded-xl border border-[#D9D6CF] bg-[#0B0D10] text-[#F5F7FA] p-4 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#272B33] pb-1.5 text-[#A8AFBA]">
              <span>GRAMMAR MANIFEST</span>
              <button
                type="button"
                onClick={copyToClipboard}
                className="text-[#6782FF] hover:text-white"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre tabIndex={0} className="overflow-x-auto text-[10px] text-[#D9D6CF] leading-relaxed max-h-56">
              {exportedJson}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
