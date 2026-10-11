import type { SectionDef } from './sections-builder.js';

export const SECTIONS_BATCH_4: SectionDef[] = [
  // 55. FAQ Two Column
  {
    slug: 'faq-two-column',
    name: 'FAQ Two Column',
    description: 'Dual-column question layout for high question density without excessive vertical length.',
    categories: ['sections', 'marketing', 'faq'],
    roles: ['faq', 'two-column'],
    purposes: ['High density FAQ', 'Quick answer browsing'],
    componentName: 'FaqTwoColumn',
    tags: ['faq-two-column', 'faq', 'two-column', 'answers'],
    idealFor: ['Presenting 6+ questions compactly without requiring clicks to expand'],
    avoidFor: ['Narrow single-column mobile-only pages'],
    jobs: ['Display questions in side-by-side balanced columns'],
    indexCode: `import React from 'react';

export type FaqTwoColumnVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FaqTwoColumnProps {
  variant?: FaqTwoColumnVariant;
}

export function FaqTwoColumn({ variant = 'quiet' }: FaqTwoColumnProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const items = [
    { q: 'How does Design DNA maintain visual coherence?', a: 'Design DNA treats curvature, contrast, and whitespace as numeric dimensions mapped to project tokens.' },
    { q: 'Can I export to other frameworks like Vue or Svelte?', a: 'V1 is canonically targeted to React + TypeScript + Tailwind 4. Additional AST emitters can be added cleanly.' },
    { q: 'What happens if my network goes offline?', a: 'Tessellate operates guest-first in memory with local IndexedDB persistence, running fully offline.' },
    { q: 'How do you prevent breaking updates?', a: 'Every resource is immutable by schema version. Upgrades use verified migration scripts.' },
  ];

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Questions & Answers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {items.map((it) => (
            <div key={it.q} className="space-y-2">
              <h3 className="font-semibold text-sm sm:text-base">{it.q}</h3>
              <p className="text-xs sm:text-sm opacity-75 leading-relaxed">{it.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FaqTwoColumn, FaqTwoColumnVariant } from './index.js';

export function FaqTwoColumnPreview() {
  const [variant, setVariant] = useState<FaqTwoColumnVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">FAQ Two Column Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FaqTwoColumnVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <FaqTwoColumn variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const faqTwoColumnFixtures = {};`,
    readmeCode: `# FAQ Two Column

Dual-column question layout for high answer density.`,
  },

  // 56. FAQ Searchable
  {
    slug: 'faq-searchable',
    name: 'FAQ Searchable',
    description: 'Filterable FAQ section with live search input and category filter chips.',
    categories: ['sections', 'marketing', 'faq'],
    roles: ['faq', 'searchable'],
    purposes: ['Instant question lookup', 'Large knowledge base preview'],
    componentName: 'FaqSearchable',
    tags: ['faq-searchable', 'faq', 'search', 'filter'],
    idealFor: ['Extensive documentation knowledge bases'],
    avoidFor: ['Small 3-question landing sections'],
    jobs: ['Allow visitors to filter answers via live text input'],
    indexCode: `import React, { useState } from 'react';

export type FaqSearchableVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FaqSearchableProps {
  variant?: FaqSearchableVariant;
}

export function FaqSearchable({ variant = 'quiet' }: FaqSearchableProps) {
  const [query, setQuery] = useState('');

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let inputBorder = 'border-neutral-300';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    inputBorder = 'border-blue-200';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    inputBorder = 'border-[#2E3440] bg-[#151921]';
  }

  const list = [
    { q: 'Is there a commercial license requirement?', a: 'No, all core resources are MIT licensed.' },
    { q: 'How does MCP communication work?', a: 'Tessellate runs an MCP server exposing search, manifest inspection, and recommendation tools.' },
    { q: 'Where are my user projects stored?', a: 'In local browser storage by default, with optional Cloudflare D1 encrypted sync.' },
  ];

  const filtered = list.filter((item) =>
    item.q.toLowerCase().includes(query.toLowerCase()) || item.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-8">Search Help & FAQ</h2>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter questions..."
          className={\`w-full p-3 rounded-xl border text-sm mb-8 outline-none \${inputBorder}\`}
        />

        <div className="space-y-4">
          {filtered.map((item) => (
            <div key={item.q} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#151921]">
              <h3 className="font-semibold text-sm mb-1">{item.q}</h3>
              <p className="text-xs opacity-75">{item.a}</p>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-xs opacity-60">No matching questions found.</p>
          )}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FaqSearchable, FaqSearchableVariant } from './index.js';

export function FaqSearchablePreview() {
  const [variant, setVariant] = useState<FaqSearchableVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">FAQ Searchable Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FaqSearchableVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <FaqSearchable variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const faqSearchableFixtures = {};`,
    readmeCode: `# FAQ Searchable

Live search input filtering questions dynamically on keypress.`,
  },

  // 57. Security Proof
  {
    slug: 'security-proof',
    name: 'Security Proof',
    description: 'Comprehensive enterprise security overview covering encryption, RBAC, and data residency.',
    categories: ['sections', 'marketing', 'technical-proof'],
    roles: ['technical-proof', 'security'],
    purposes: ['Enterprise security clearance', 'Compliance demonstration'],
    componentName: 'SecurityProof',
    tags: ['security-proof', 'security', 'encryption', 'compliance'],
    idealFor: ['Convincing security architects and enterprise CISOs'],
    avoidFor: ['Casual hobby websites'],
    jobs: ['Outline security safeguards and zero-vulnerability guarantees'],
    indexCode: `import React from 'react';

export type SecurityProofVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SecurityProofProps {
  variant?: SecurityProofVariant;
}

export function SecurityProof({ variant = 'quiet' }: SecurityProofProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-100 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const items = [
    { title: 'End-to-End Encryption', desc: 'Encrypted at rest using AES-256 and in transit via TLS 1.3.' },
    { title: 'No Arbitrary Eval Runtime', desc: 'Zero runtime eval or dynamic arbitrary script injection.' },
    { title: 'Isolated Sandboxes', desc: 'Untrusted previews run in sandboxed cross-origin iframes.' },
  ];

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Enterprise Security Architecture</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((it) => (
            <div key={it.title} className={\`p-6 rounded-2xl border \${card}\`}>
              <span className="text-emerald-500 font-mono text-sm block mb-3">✓ SECURE</span>
              <h3 className="font-bold text-base mb-2">{it.title}</h3>
              <p className="text-xs sm:text-sm opacity-75 leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { SecurityProof, SecurityProofVariant } from './index.js';

export function SecurityProofPreview() {
  const [variant, setVariant] = useState<SecurityProofVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Security Proof Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as SecurityProofVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <SecurityProof variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const securityProofFixtures = {};`,
    readmeCode: `# Security Proof

Enterprise security section validating sandboxed execution and zero eval policy.`,
  },

  // 58. Compliance Proof
  {
    slug: 'compliance-proof',
    name: 'Compliance Proof',
    description: 'Regulatory compliance showcase displaying certified badges and downloadable reports.',
    categories: ['sections', 'marketing', 'technical-proof'],
    roles: ['technical-proof', 'compliance'],
    purposes: ['Regulatory audit demonstration', 'Enterprise procurement trust'],
    componentName: 'ComplianceProof',
    tags: ['compliance-proof', 'compliance', 'audit', 'gdpr'],
    idealFor: ['Healthcare, finance, and enterprise sales pages'],
    avoidFor: ['Casual developer side projects'],
    jobs: ['Show downloadable audit attestations and compliance badges'],
    indexCode: `import React from 'react';

export type ComplianceProofVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ComplianceProofProps {
  variant?: ComplianceProofVariant;
}

export function ComplianceProof({ variant = 'quiet' }: ComplianceProofProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/30 border-blue-100 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-8">Audited Regulatory Compliance</h2>
        <p className="text-xs sm:text-sm opacity-80 max-w-xl mx-auto mb-12">
          Independent third-party audits verify that Tessellate satisfies rigorous global data protection standards.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          <div className={\`p-6 rounded-2xl border \${card}\`}>
            <span className="font-mono text-xs font-bold uppercase text-neutral-500 mb-2 block">SOC 2 Type II</span>
            <p className="text-xs opacity-75">Full annual audit covering Security, Availability, and Confidentiality trust principles.</p>
          </div>
          <div className={\`p-6 rounded-2xl border \${card}\`}>
            <span className="font-mono text-xs font-bold uppercase text-neutral-500 mb-2 block">GDPR & CCPA</span>
            <p className="text-xs opacity-75">Guaranteed data residency controls, zero third-party telemetry, and instant data deletion.</p>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ComplianceProof, ComplianceProofVariant } from './index.js';

export function ComplianceProofPreview() {
  const [variant, setVariant] = useState<ComplianceProofVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Compliance Proof Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as ComplianceProofVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <ComplianceProof variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const complianceProofFixtures = {};`,
    readmeCode: `# Compliance Proof

Regulatory compliance section outlining SOC2, GDPR, and independent verification.`,
  },

  // 59. Architecture Diagram Section
  {
    slug: 'architecture-diagram-section',
    name: 'Architecture Diagram Section',
    description: 'Technical blueprint illustrating client-edge-database infrastructure topology.',
    categories: ['sections', 'marketing', 'technical-proof'],
    roles: ['technical-proof', 'architecture'],
    purposes: ['Infrastructure transparency', 'Technical due diligence'],
    componentName: 'ArchitectureDiagramSection',
    tags: ['architecture-diagram-section', 'architecture', 'diagram', 'infrastructure'],
    idealFor: ['Engineering decision-makers evaluating platform architecture'],
    avoidFor: ['Casual marketing landing pages'],
    jobs: ['Map out client, worker, and database boundaries clearly'],
    indexCode: `import React from 'react';

export type ArchitectureDiagramSectionVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ArchitectureDiagramSectionProps {
  variant?: ArchitectureDiagramSectionVariant;
}

export function ArchitectureDiagramSection({ variant = 'quiet' }: ArchitectureDiagramSectionProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let box = 'bg-neutral-100 border-neutral-300 font-mono text-xs';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    box = 'bg-white border-blue-200 shadow-sm font-mono text-xs';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    box = 'bg-[#151921] border-[#2E3440] font-mono text-xs';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Infrastructure Topology</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className={\`p-6 rounded-2xl border \${box}\`}>
            <span className="text-[10px] font-bold opacity-60 uppercase mb-2 block">Client Layer</span>
            <div className="font-bold text-sm mb-1">React + Zustand</div>
            <p className="text-[11px] opacity-75">In-memory graph & DNA mutations</p>
          </div>
          <div className={\`p-6 rounded-2xl border \${box}\`}>
            <span className="text-[10px] font-bold opacity-60 uppercase mb-2 block">Edge Layer</span>
            <div className="font-bold text-sm mb-1">Cloudflare Workers</div>
            <p className="text-[11px] opacity-75">Hono API & sub-millisecond routing</p>
          </div>
          <div className={\`p-6 rounded-2xl border \${box}\`}>
            <span className="text-[10px] font-bold opacity-60 uppercase mb-2 block">Storage Layer</span>
            <div className="font-bold text-sm mb-1">D1 + R2 Registry</div>
            <p className="text-[11px] opacity-75">Encrypted checkpoints & static bundles</p>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ArchitectureDiagramSection, ArchitectureDiagramSectionVariant } from './index.js';

export function ArchitectureDiagramSectionPreview() {
  const [variant, setVariant] = useState<ArchitectureDiagramSectionVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Architecture Diagram Section Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as ArchitectureDiagramSectionVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <ArchitectureDiagramSection variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const architectureDiagramSectionFixtures = {};`,
    readmeCode: `# Architecture Diagram Section

Three-tier topology diagram explaining client, edge worker, and storage tiers.`,
  },

  // 60. Performance Benchmark Section
  {
    slug: 'performance-benchmark-section',
    name: 'Performance Benchmark Section',
    description: 'Bar chart benchmarks comparing execution latency and throughput against industry baselines.',
    categories: ['sections', 'marketing', 'technical-proof'],
    roles: ['technical-proof', 'benchmarks'],
    purposes: ['Speed differentiation', 'Audited benchmarks'],
    componentName: 'PerformanceBenchmarkSection',
    tags: ['performance-benchmark-section', 'benchmarks', 'speed', 'performance'],
    idealFor: ['Proving superiority over bloated UI framework alternatives'],
    avoidFor: ['Non-performance critical domains'],
    jobs: ['Show empirical comparative latency against alternative runtimes'],
    indexCode: `import React from 'react';

export type PerformanceBenchmarkSectionVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PerformanceBenchmarkSectionProps {
  variant?: PerformanceBenchmarkSectionVariant;
}

export function PerformanceBenchmarkSection({ variant = 'quiet' }: PerformanceBenchmarkSectionProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const benchmarks = [
    { name: 'Tessellate Manifest Parse', val: '0.4 ms', width: '12%', color: 'bg-emerald-500' },
    { name: 'Industry Benchmark A', val: '4.8 ms', width: '60%', color: 'bg-neutral-400' },
    { name: 'Legacy Bundler Framework', val: '12.4 ms', width: '95%', color: 'bg-neutral-400' },
  ];

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Audited Latency Benchmarks</h2>

        <div className="space-y-6">
          {benchmarks.map((b) => (
            <div key={b.name} className="space-y-2">
              <div className="flex justify-between text-xs font-semibold font-mono">
                <span>{b.name}</span>
                <span>{b.val}</span>
              </div>
              <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div style={{ width: b.width }} className={\`h-full rounded-full transition-all \${b.color}\`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { PerformanceBenchmarkSection, PerformanceBenchmarkSectionVariant } from './index.js';

export function PerformanceBenchmarkSectionPreview() {
  const [variant, setVariant] = useState<PerformanceBenchmarkSectionVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Performance Benchmark Section Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as PerformanceBenchmarkSectionVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <PerformanceBenchmarkSection variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const performanceBenchmarkSectionFixtures = {};`,
    readmeCode: `# Performance Benchmark Section

Comparative horizontal bar chart demonstrating parsing and execution speeds.`,
  },

  // 61. Accessibility Commitment Section
  {
    slug: 'accessibility-commitment-section',
    name: 'Accessibility Commitment Section',
    description: 'Formal WCAG 2.2 AA compliance manifesto with automated audit guarantees.',
    categories: ['sections', 'marketing', 'technical-proof'],
    roles: ['technical-proof', 'accessibility'],
    purposes: ['Inclusion commitment', 'Compliance guarantee'],
    componentName: 'AccessibilityCommitmentSection',
    tags: ['accessibility-commitment-section', 'a11y', 'wcag', 'keyboard'],
    idealFor: ['Demonstrating non-negotiable accessibility quality standards'],
    avoidFor: ['Pages where a11y has not been audited'],
    jobs: ['Explain WCAG 2.2 AA conformance and keyboard guarantees'],
    indexCode: `import React from 'react';

export type AccessibilityCommitmentSectionVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AccessibilityCommitmentSectionProps {
  variant?: AccessibilityCommitmentSectionVariant;
}

export function AccessibilityCommitmentSection({ variant = 'quiet' }: AccessibilityCommitmentSectionProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-100 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const pillars = [
    { title: 'Keyboard First', desc: '100% of interactive controls support standard Tab, Enter, Space, and Escape navigation.' },
    { title: 'Contrast Guardrails', desc: 'Every color token is algorithmically verified to pass 4.5:1 AA ratios against its background.' },
    { title: 'Reduced Motion', desc: 'Interfaces respect prefers-reduced-motion automatically, replacing springs with clean crossfades.' },
  ];

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Universal Accessibility (WCAG 2.2 AA)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className={\`p-6 rounded-2xl border \${card}\`}>
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2 block">AA CERTIFIED</span>
              <h3 className="font-bold text-base mb-2">{p.title}</h3>
              <p className="text-xs sm:text-sm opacity-75 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AccessibilityCommitmentSection, AccessibilityCommitmentSectionVariant } from './index.js';

export function AccessibilityCommitmentSectionPreview() {
  const [variant, setVariant] = useState<AccessibilityCommitmentSectionVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Accessibility Commitment Section Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as AccessibilityCommitmentSectionVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <AccessibilityCommitmentSection variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const accessibilityCommitmentSectionFixtures = {};`,
    readmeCode: `# Accessibility Commitment Section

WCAG 2.2 AA conformance manifesto guaranteeing full keyboard traversal and contrast.`,
  },

  // 62. CTA Minimal
  {
    slug: 'cta-minimal',
    name: 'CTA Minimal',
    description: 'Focused single-line headline with primary action button and supporting footnote.',
    categories: ['sections', 'marketing', 'cta'],
    roles: ['cta', 'minimal'],
    purposes: ['Bottom of page conversion', 'Action prompt'],
    componentName: 'CtaMinimal',
    tags: ['cta-minimal', 'cta', 'conversion', 'action'],
    idealFor: ['Restrained bottom-of-page sign-off'],
    avoidFor: ['Complex multi-tier sign-up forms'],
    jobs: ['Prompt user to take next step with clean simplicity'],
    indexCode: `import React from 'react';

export type CtaMinimalVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CtaMinimalProps {
  variant?: CtaMinimalVariant;
}

export function CtaMinimal({ variant = 'quiet' }: CtaMinimalProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let btn = 'bg-neutral-900 text-white hover:bg-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-blue-50/40 text-neutral-950 border-[#D9D6CF]';
    btn = 'bg-[#2547E8] text-white hover:bg-[#1B35B4] shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    btn = 'bg-cyan-500 text-black hover:bg-cyan-400 font-medium';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Start composing with Tessellate today.</h2>
        <p className="text-xs sm:text-sm opacity-75 mb-8">No accounts, no credit cards, zero proprietary dependencies.</p>
        <button type="button" className={\`px-6 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all \${btn}\`}>
          Open Free Workbench →
        </button>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CtaMinimal, CtaMinimalVariant } from './index.js';

export function CtaMinimalPreview() {
  const [variant, setVariant] = useState<CtaMinimalVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">CTA Minimal Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as CtaMinimalVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <CtaMinimal variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const ctaMinimalFixtures = {};`,
    readmeCode: `# CTA Minimal

Restrained single-action call-to-action banner for clean page conclusions.`,
  },

  // 63. CTA Split
  {
    slug: 'cta-split',
    name: 'CTA Split',
    description: 'Two-column callout with compelling copy on left and email capture form on right.',
    categories: ['sections', 'marketing', 'cta'],
    roles: ['cta', 'split'],
    purposes: ['Lead capture', 'Newsletter signup'],
    componentName: 'CtaSplit',
    tags: ['cta-split', 'cta', 'form', 'email'],
    idealFor: ['Pages converting visitors to an email newsletter or private beta'],
    avoidFor: ['Sites with no signup capture required'],
    jobs: ['Pair persuasive text with an inline input form'],
    indexCode: `import React, { useState } from 'react';

export type CtaSplitVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CtaSplitProps {
  variant?: CtaSplitVariant;
}

export function CtaSplit({ variant = 'quiet' }: CtaSplitProps) {
  const [email, setEmail] = useState('');

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let inputBorder = 'border-neutral-300';
  let btn = 'bg-neutral-900 text-white hover:bg-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/50 text-neutral-950 border-[#D9D6CF]';
    inputBorder = 'border-blue-200';
    btn = 'bg-[#2547E8] text-white hover:bg-[#1B35B4] shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    inputBorder = 'border-[#2E3440] bg-[#151921]';
    btn = 'bg-cyan-500 text-black hover:bg-cyan-400 font-medium';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Stay ahead of the interface revolution.</h2>
          <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
            Get weekly updates on newly verified blueprints, Design DNA algorithms, and autonomous agent patterns.
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setEmail(''); }} className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@domain.com"
            required
            className={\`w-full p-3 rounded-lg border text-xs sm:text-sm outline-none \${inputBorder}\`}
          />
          <button type="submit" className={\`px-6 py-3 rounded-lg text-xs font-semibold whitespace-nowrap uppercase tracking-wider transition-all \${btn}\`}>
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CtaSplit, CtaSplitVariant } from './index.js';

export function CtaSplitPreview() {
  const [variant, setVariant] = useState<CtaSplitVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">CTA Split Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as CtaSplitVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <CtaSplit variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const ctaSplitFixtures = {};`,
    readmeCode: `# CTA Split

Two-column email lead capture banner pairing editorial invitation with responsive form.`,
  },

  // 64. CTA Product Preview
  {
    slug: 'cta-product-preview',
    name: 'CTA Product Preview',
    description: 'High-impact banner featuring a peek into the application interface with join action.',
    categories: ['sections', 'marketing', 'cta'],
    roles: ['cta', 'preview'],
    purposes: ['Visual temptation', 'Action banner'],
    componentName: 'CtaProductPreview',
    tags: ['cta-product-preview', 'cta', 'preview', 'marketing'],
    idealFor: ['Visually compelling product teasers right before footer'],
    avoidFor: ['Pure text legal sections'],
    jobs: ['Show preview of the workspace to entice final clickthrough'],
    indexCode: `import React from 'react';

export type CtaProductPreviewVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CtaProductPreviewProps {
  variant?: CtaProductPreviewVariant;
}

export function CtaProductPreview({ variant = 'quiet' }: CtaProductPreviewProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let box = 'bg-white border-neutral-200 shadow-md';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-b from-white to-blue-50/50 text-neutral-950 border-[#D9D6CF]';
    box = 'bg-white border-blue-200 shadow-xl';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    box = 'bg-[#151921] border-[#2E3440] shadow-2xl';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b overflow-hidden transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Build Without Friction</h2>
        <p className="text-xs sm:text-sm opacity-75 max-w-md mb-8">Join thousands of developers using deterministic composition today.</p>
        <button type="button" className="px-6 py-3 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold uppercase tracking-wider mb-12">
          Open Canvas Now
        </button>

        <div className={\`w-full h-44 rounded-t-2xl border-t border-x p-6 flex items-center justify-center font-mono text-xs opacity-60 \${box}\`}>
          [Workbench Canvas Active: 324 Verified Manifests Ready]
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CtaProductPreview, CtaProductPreviewVariant } from './index.js';

export function CtaProductPreviewPreview() {
  const [variant, setVariant] = useState<CtaProductPreviewVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">CTA Product Preview Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as CtaProductPreviewVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <CtaProductPreview variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const ctaProductPreviewFixtures = {};`,
    readmeCode: `# CTA Product Preview

Action callout with peek preview of the live Workbench canvas.`,
  },

  // 65. CTA Demo Booking
  {
    slug: 'cta-demo-booking',
    name: 'CTA Demo Booking',
    description: 'Calendar booking card with time-slot picker preview and sales team call-to-action.',
    categories: ['sections', 'marketing', 'cta'],
    roles: ['cta', 'demo-booking'],
    purposes: ['Sales meeting scheduling', 'Enterprise demo'],
    componentName: 'CtaDemoBooking',
    tags: ['cta-demo-booking', 'cta', 'calendar', 'sales'],
    idealFor: ['High ACV enterprise SaaS scheduling'],
    avoidFor: ['Self-serve open source tools'],
    jobs: ['Schedule an architectural consultation with technical sales'],
    indexCode: `import React from 'react';

export type CtaDemoBookingVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CtaDemoBookingProps {
  variant?: CtaDemoBookingVariant;
}

export function CtaDemoBooking({ variant = 'quiet' }: CtaDemoBookingProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Book an Architecture Consultation</h2>
        <p className="text-xs sm:text-sm opacity-75 max-w-md mb-8">Speak with our core team about integrating Tessellate into your enterprise monorepo.</p>

        <div className={\`p-6 rounded-2xl border w-full max-w-sm \${card}\`}>
          <div className="text-xs font-semibold mb-4 text-left">Available Times (Tomorrow):</div>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {['10:00 AM', '11:30 AM', '2:00 PM', '4:30 PM'].map((time) => (
              <button key={time} type="button" className="p-2 rounded border text-xs font-mono hover:bg-neutral-200 dark:hover:bg-neutral-800">
                {time}
              </button>
            ))}
          </div>
          <button type="button" className="w-full py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold uppercase tracking-wider">
            Confirm Slot
          </button>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CtaDemoBooking, CtaDemoBookingVariant } from './index.js';

export function CtaDemoBookingPreview() {
  const [variant, setVariant] = useState<CtaDemoBookingVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">CTA Demo Booking Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as CtaDemoBookingVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <CtaDemoBooking variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const ctaDemoBookingFixtures = {};`,
    readmeCode: `# CTA Demo Booking

Interactive calendar slot picker for scheduling enterprise consultations.`,
  },

  // 66. CTA Download
  {
    slug: 'cta-download',
    name: 'CTA Download',
    description: 'Multi-platform installer button group (macOS, Windows, Linux, CLI) with version pill.',
    categories: ['sections', 'marketing', 'cta'],
    roles: ['cta', 'download'],
    purposes: ['Desktop app download', 'CLI install options'],
    componentName: 'CtaDownload',
    tags: ['cta-download', 'download', 'cli', 'installer'],
    idealFor: ['Desktop software and CLI tool distribution'],
    avoidFor: ['Pure SaaS web apps with no download binary'],
    jobs: ['Provide multi-OS binary download links with version badges'],
    indexCode: `import React from 'react';

export type CtaDownloadVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CtaDownloadProps {
  variant?: CtaDownloadVariant;
}

export function CtaDownload({ variant = 'quiet' }: CtaDownloadProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <span className="text-xs font-mono px-3 py-1 rounded-full border bg-neutral-200/60 dark:bg-neutral-800 mb-6">v1.0.0 RELEASE READY</span>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Install the Tessellate Engine</h2>
        <p className="text-xs sm:text-sm opacity-75 max-w-md mb-8">Available as a global CLI or local development dependency.</p>

        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" className="px-5 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold">
            npm install @tessellate/cli
          </button>
          <button type="button" className="px-5 py-2.5 rounded-lg border text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800">
            pnpm add @tessellate/cli
          </button>
          <button type="button" className="px-5 py-2.5 rounded-lg border text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800">
            brew install tessellate
          </button>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CtaDownload, CtaDownloadVariant } from './index.js';

export function CtaDownloadPreview() {
  const [variant, setVariant] = useState<CtaDownloadVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">CTA Download Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as CtaDownloadVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <CtaDownload variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const ctaDownloadFixtures = {};`,
    readmeCode: `# CTA Download

Package manager install options and version notification banner.`,
  },

  // 67. CTA Community
  {
    slug: 'cta-community',
    name: 'CTA Community',
    description: 'Invitation banner to Discord / GitHub discussions with member counter badge.',
    categories: ['sections', 'marketing', 'cta'],
    roles: ['cta', 'community'],
    purposes: ['Community growth', 'Developer engagement'],
    componentName: 'CtaCommunity',
    tags: ['cta-community', 'community', 'discord', 'github'],
    idealFor: ['Open source projects building a developer community'],
    avoidFor: ['Strict enterprise confidentiality sites'],
    jobs: ['Invite developers to join community forums and Discord server'],
    indexCode: `import React from 'react';

export type CtaCommunityVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CtaCommunityProps {
  variant?: CtaCommunityVariant;
}

export function CtaCommunity({ variant = 'quiet' }: CtaCommunityProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-blue-50/20 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Join 12,000+ UI Engineers</h2>
        <p className="text-xs sm:text-sm opacity-75 max-w-md mb-8">Discuss blueprints, contribute verified manifests, and shape the future of composition.</p>

        <div className="flex gap-4">
          <button type="button" className="px-6 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold">
            Join Discord Community
          </button>
          <button type="button" className="px-6 py-2.5 rounded-lg border text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800">
            Star on GitHub
          </button>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CtaCommunity, CtaCommunityVariant } from './index.js';

export function CtaCommunityPreview() {
  const [variant, setVariant] = useState<CtaCommunityVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">CTA Community Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as CtaCommunityVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <CtaCommunity variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const ctaCommunityFixtures = {};`,
    readmeCode: `# CTA Community

Community engagement invitation with Discord and GitHub star actions.`,
  },

  // 68. Footer Minimal
  {
    slug: 'footer-minimal',
    name: 'Footer Minimal',
    description: 'Single-line copyright, status indicator, and legal links with minimal footprint.',
    categories: ['sections', 'marketing', 'footer'],
    roles: ['footer', 'minimal'],
    purposes: ['Restrained page closure', 'Legal compliance'],
    componentName: 'FooterMinimal',
    tags: ['footer-minimal', 'footer', 'copyright', 'minimal'],
    idealFor: ['Focused tools and single-page apps'],
    avoidFor: ['Massive sitemap directories'],
    jobs: ['Provide subtle copyright and operational status indicator'],
    indexCode: `import React from 'react';

export type FooterMinimalVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FooterMinimalProps {
  variant?: FooterMinimalVariant;
}

export function FooterMinimal({ variant = 'quiet' }: FooterMinimalProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-600 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-700 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-neutral-400 border-[#2E3440]';
  }

  return (
    <footer className={\`w-full py-8 px-6 sm:px-12 border-t text-xs transition-colors \${bg}\`}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-tight text-neutral-900 dark:text-white">Tessellate</span>
          <span>© {new Date().getFullYear()} Tessellate Core. MIT License.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Status: Operational</a>
        </div>
      </div>
    </footer>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FooterMinimal, FooterMinimalVariant } from './index.js';

export function FooterMinimalPreview() {
  const [variant, setVariant] = useState<FooterMinimalVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Footer Minimal Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FooterMinimalVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <FooterMinimal variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const footerMinimalFixtures = {};`,
    readmeCode: `# Footer Minimal

Single-line footer providing copyright, status, and legal links.`,
  },

  // 69. Footer Sitemap
  {
    slug: 'footer-sitemap',
    name: 'Footer Sitemap',
    description: 'Multi-column directory footer with category link lists, logo, and language selector.',
    categories: ['sections', 'marketing', 'footer'],
    roles: ['footer', 'sitemap'],
    purposes: ['Comprehensive site navigation', 'SEO link index'],
    componentName: 'FooterSitemap',
    tags: ['footer-sitemap', 'footer', 'sitemap', 'navigation'],
    idealFor: ['Large web portals and resource registries'],
    avoidFor: ['Single-view desktop utilities'],
    jobs: ['Organize extensive cross-site navigation links'],
    indexCode: `import React from 'react';

export type FooterSitemapVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FooterSitemapProps {
  variant?: FooterSitemapVariant;
}

export function FooterSitemap({ variant = 'quiet' }: FooterSitemapProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/50 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const cols = [
    { title: 'Resources', links: ['Primitives', 'Shells', 'Sections', 'Blocks', 'Data Vis'] },
    { title: 'Platform', links: ['Workbench', 'Design DNA Lab', 'MCP Server', 'CLI Tools'] },
    { title: 'Community', links: ['GitHub', 'Discord', 'Docs', 'Contributing'] },
    { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Security', 'License'] },
  ];

  return (
    <footer className={\`w-full py-16 px-6 sm:px-12 border-t transition-colors \${bg}\`}>
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
        {cols.map((col) => (
          <div key={col.title}>
            <div className="font-bold text-xs uppercase tracking-wider mb-4 font-mono opacity-80">{col.title}</div>
            <ul className="space-y-2 text-xs opacity-70">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:underline">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FooterSitemap, FooterSitemapVariant } from './index.js';

export function FooterSitemapPreview() {
  const [variant, setVariant] = useState<FooterSitemapVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Footer Sitemap Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FooterSitemapVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <FooterSitemap variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const footerSitemapFixtures = {};`,
    readmeCode: `# Footer Sitemap

Multi-column link directory grouping platform documentation, resources, and community.`,
  },

  // 70. Footer Product
  {
    slug: 'footer-product',
    name: 'Footer Product',
    description: 'Product-centric footer featuring release changelog badge, newsletter input, and nav columns.',
    categories: ['sections', 'marketing', 'footer'],
    roles: ['footer', 'product'],
    purposes: ['Product changelog spotlight', 'SaaS footer'],
    componentName: 'FooterProduct',
    tags: ['footer-product', 'footer', 'changelog', 'product'],
    idealFor: ['Active SaaS products spotlighting frequent release updates'],
    avoidFor: ['Archival sites'],
    jobs: ['Highlight recent changelog alongside navigational links'],
    indexCode: `import React from 'react';

export type FooterProductVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FooterProductProps {
  variant?: FooterProductVariant;
}

export function FooterProduct({ variant = 'quiet' }: FooterProductProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <footer className={\`w-full py-16 px-6 sm:px-12 border-t transition-colors \${bg}\`}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-sm">
          <div className="font-bold text-sm tracking-tight mb-2">Tessellate Engine</div>
          <p className="text-xs opacity-75 mb-4">Autonomous composition and Design DNA runtime.</p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Latest: v1.0.0 Stable</span>
          </div>
        </div>

        <div className="flex gap-12 text-xs">
          <div>
            <div className="font-bold mb-3">Workbench</div>
            <ul className="space-y-2 opacity-75">
              <li><a href="#" className="hover:underline">DNA Lab</a></li>
              <li><a href="#" className="hover:underline">Catalog</a></li>
              <li><a href="#" className="hover:underline">Inspector</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold mb-3">Developers</div>
            <ul className="space-y-2 opacity-75">
              <li><a href="#" className="hover:underline">CLI</a></li>
              <li><a href="#" className="hover:underline">MCP Server</a></li>
              <li><a href="#" className="hover:underline">Schemas</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FooterProduct, FooterProductVariant } from './index.js';

export function FooterProductPreview() {
  const [variant, setVariant] = useState<FooterProductVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Footer Product Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FooterProductVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <FooterProduct variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const footerProductFixtures = {};`,
    readmeCode: `# Footer Product

Product-focused footer featuring release indicator and navigation columns.`,
  },

  // 71. Footer Developer
  {
    slug: 'footer-developer',
    name: 'Footer Developer',
    description: 'Terminal-styled developer footer with CLI command snippet, API status, and git commit sha.',
    categories: ['sections', 'marketing', 'footer'],
    roles: ['footer', 'developer'],
    purposes: ['Developer tool branding', 'Technical page closure'],
    componentName: 'FooterDeveloper',
    tags: ['footer-developer', 'footer', 'terminal', 'developer'],
    idealFor: ['Technical tools, CLI homepages, and developer ecosystems'],
    avoidFor: ['Consumer lifestyle products'],
    jobs: ['Provide terminal-styled developer footer with CLI snippets and git sha'],
    indexCode: `import React from 'react';

export type FooterDeveloperVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FooterDeveloperProps {
  variant?: FooterDeveloperVariant;
}

export function FooterDeveloper({ variant = 'quiet' }: FooterDeveloperProps) {
  let bg = 'bg-[#18181B] text-neutral-300 border-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-[#0E1528] text-blue-100 border-blue-900/50';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-cyan-50 border-[#2E3440]';
  }

  return (
    <footer className={\`w-full py-12 px-6 sm:px-12 border-t font-mono text-xs transition-colors \${bg}\`}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400">$</span>
          <span>npx @tessellate/cli --version</span>
          <span className="opacity-50">// 1.0.0</span>
        </div>
        <div className="flex items-center gap-6 text-[11px] opacity-70">
          <span>SHA: c4b2a9f</span>
          <span>Edge: 100% OK</span>
          <span>Latency: 0.8ms</span>
        </div>
      </div>
    </footer>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FooterDeveloper, FooterDeveloperVariant } from './index.js';

export function FooterDeveloperPreview() {
  const [variant, setVariant] = useState<FooterDeveloperVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Footer Developer Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FooterDeveloperVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <FooterDeveloper variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const footerDeveloperFixtures = {};`,
    readmeCode: `# Footer Developer

Terminal-styled developer footer featuring CLI verification and edge status telemetry.`,
  },

  // 72. Footer Newsletter
  {
    slug: 'footer-newsletter',
    name: 'Footer Newsletter',
    description: 'Focused email subscription banner with privacy assurance and social icon bar.',
    categories: ['sections', 'marketing', 'footer'],
    roles: ['footer', 'newsletter'],
    purposes: ['Audience retention', 'Community updates'],
    componentName: 'FooterNewsletter',
    tags: ['footer-newsletter', 'footer', 'newsletter', 'email'],
    idealFor: ['Publications and products with a regular newsletter'],
    avoidFor: ['Internal dashboards with zero newsletter program'],
    jobs: ['Prompt final email subscription with clear privacy statement'],
    indexCode: `import React, { useState } from 'react';

export type FooterNewsletterVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FooterNewsletterProps {
  variant?: FooterNewsletterVariant;
}

export function FooterNewsletter({ variant = 'quiet' }: FooterNewsletterProps) {
  const [email, setEmail] = useState('');

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let inputBorder = 'border-neutral-300';
  let btn = 'bg-neutral-900 text-white hover:bg-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    inputBorder = 'border-blue-200';
    btn = 'bg-[#2547E8] text-white hover:bg-[#1B35B4] shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    inputBorder = 'border-[#2E3440] bg-[#151921]';
    btn = 'bg-cyan-500 text-black hover:bg-cyan-400 font-medium';
  }

  return (
    <footer className={\`w-full py-20 px-6 sm:px-12 border-t transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Tessellate Dispatch</h2>
        <p className="text-xs sm:text-sm opacity-75 max-w-md mb-8">
          Weekly dispatches on computational aesthetics, autonomous composition, and Design DNA.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); setEmail(''); }} className="w-full max-w-md flex gap-2 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@domain.com"
            required
            className={\`w-full p-2.5 rounded-lg border text-xs sm:text-sm outline-none \${inputBorder}\`}
          />
          <button type="submit" className={\`px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all \${btn}\`}>
            Join
          </button>
        </form>

        <p className="text-[11px] opacity-60">Zero spam. Pure front-end engineering signal. Unsubscribe at any time.</p>
      </div>
    </footer>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FooterNewsletter, FooterNewsletterVariant } from './index.js';

export function FooterNewsletterPreview() {
  const [variant, setVariant] = useState<FooterNewsletterVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Footer Newsletter Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FooterNewsletterVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <FooterNewsletter variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const footerNewsletterFixtures = {};`,
    readmeCode: `# Footer Newsletter

Subscription footer delivering weekly engineering dispatches and blueprint updates.`,
  },
];
