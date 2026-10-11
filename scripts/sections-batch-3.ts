import type { SectionDef } from './sections-builder.js';

export const SECTIONS_BATCH_3: SectionDef[] = [
  // 37. How It Works Steps
  {
    slug: 'how-it-works-steps',
    name: 'How It Works Steps',
    description: 'Numbered 3-part execution flow with step badges, titles, and illustrative diagrams.',
    categories: ['sections', 'marketing', 'explanation'],
    roles: ['explanation', 'steps'],
    purposes: ['Workflow breakdown', 'Getting started guide'],
    componentName: 'HowItWorksSteps',
    tags: ['how-it-works-steps', 'how-it-works', 'steps', 'process'],
    idealFor: ['Guiding first-time visitors through core product operation'],
    avoidFor: ['Complex API parameter reference'],
    jobs: ['Explain the lifecycle from installation to deployment'],
    indexCode: `import React from 'react';

export type HowItWorksStepsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface HowItWorksStepsProps {
  variant?: HowItWorksStepsVariant;
}

export function HowItWorksSteps({ variant = 'quiet' }: HowItWorksStepsProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/30 border-blue-100 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const steps = [
    { step: '01', title: 'Browse or Query', desc: 'Find validated primitives or let your coding agent query the MCP registry.' },
    { step: '02', title: 'Harmonize DNA', desc: 'Inspect density, curvature, and typography tokens with mathematical consistency.' },
    { step: '03', title: 'Compile & Ship', desc: 'Direct code emission to your local repository with zero SaaS runtime tax.' },
  ];

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">How Tessellate Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className={\`p-6 rounded-2xl border \${card}\`}>
              <span className="text-xs font-mono font-bold text-neutral-500 mb-4 block">STEP {s.step}</span>
              <h3 className="text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-xs sm:text-sm opacity-75 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { HowItWorksSteps, HowItWorksStepsVariant } from './index.js';

export function HowItWorksStepsPreview() {
  const [variant, setVariant] = useState<HowItWorksStepsVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">How It Works Steps Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as HowItWorksStepsVariant[]).map((v) => (
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
      <HowItWorksSteps variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const howItWorksStepsFixtures = {};`,
    readmeCode: `# How It Works Steps

Three-stage sequential narrative explaining how users and agents compose applications.`,
  },

  // 38. How It Works Timeline
  {
    slug: 'how-it-works-timeline',
    name: 'How It Works Timeline',
    description: 'Vertical progression path showing end-to-end user lifecycle from install to scale.',
    categories: ['sections', 'marketing', 'explanation'],
    roles: ['explanation', 'timeline'],
    purposes: ['Extended process explanation', 'Step progression'],
    componentName: 'HowItWorksTimeline',
    tags: ['how-it-works-timeline', 'timeline', 'process', 'guide'],
    idealFor: ['Detailed multi-step engineering onboarding guides'],
    avoidFor: ['Minimal single-metric banners'],
    jobs: ['Map out complete deployment journey with connected guides'],
    indexCode: `import React from 'react';

export type HowItWorksTimelineVariant = 'quiet' | 'expressive' | 'nocturne';

export interface HowItWorksTimelineProps {
  variant?: HowItWorksTimelineVariant;
}

export function HowItWorksTimeline({ variant = 'quiet' }: HowItWorksTimelineProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const milestones = [
    { title: 'Project Initialization', desc: 'Run npx @tessellate/cli init in any React + Tailwind codebase.' },
    { title: 'Semantic Normalisation', desc: 'Tessellate maps existing tokens to Design DNA dimensions.' },
    { title: 'Verified Expansion', desc: 'Pull verified blocks and sections as your product scales.' },
  ];

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">The Adoption Journey</h2>
        <div className="space-y-8 border-l-2 border-neutral-200 dark:border-neutral-800 ml-4 sm:ml-8 pl-6 sm:pl-10">
          {milestones.map((m, i) => (
            <div key={m.title} className="relative">
              <span className="absolute -left-[31px] sm:-left-[47px] top-1 h-3.5 w-3.5 rounded-full bg-neutral-900 dark:bg-white" />
              <span className="text-xs font-mono font-bold text-neutral-500 mb-1 block">STAGE 0{i + 1}</span>
              <h3 className="text-lg font-bold mb-1">{m.title}</h3>
              <p className="text-xs sm:text-sm opacity-75">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { HowItWorksTimeline, HowItWorksTimelineVariant } from './index.js';

export function HowItWorksTimelinePreview() {
  const [variant, setVariant] = useState<HowItWorksTimelineVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">How It Works Timeline Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as HowItWorksTimelineVariant[]).map((v) => (
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
      <HowItWorksTimeline variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const howItWorksTimelineFixtures = {};`,
    readmeCode: `# How It Works Timeline

Vertical step timeline illustrating adoption milestones from initialization to scale.`,
  },

  // 39. How It Works Interactive
  {
    slug: 'how-it-works-interactive',
    name: 'How It Works Interactive',
    description: 'Interactive stepper allowing users to click through stages of the pipeline.',
    categories: ['sections', 'marketing', 'explanation'],
    roles: ['explanation', 'interactive'],
    purposes: ['Hands-on exploration', 'Interactive walkthrough'],
    componentName: 'HowItWorksInteractive',
    tags: ['how-it-works-interactive', 'interactive', 'stepper', 'explanation'],
    idealFor: ['Step-by-step interactive product demos'],
    avoidFor: ['Printed documentation'],
    jobs: ['Let visitors actively step through system pipeline stages'],
    indexCode: `import React, { useState } from 'react';

export type HowItWorksInteractiveVariant = 'quiet' | 'expressive' | 'nocturne';

export interface HowItWorksInteractiveProps {
  variant?: HowItWorksInteractiveVariant;
}

export function HowItWorksInteractive({ variant = 'quiet' }: HowItWorksInteractiveProps) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { title: '1. Select Foundation', content: 'Choose from 36 application shells or 72 marketing sections validated against schema version 1.0.0.' },
    { title: '2. Enforce Invariants', content: 'Design DNA applies curvature and spacing rules across all nested children deterministically.' },
    { title: '3. Download Pure Code', content: 'Get pure TypeScript files with 0 external black-box library wrappers.' },
  ];

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/30 border-blue-100 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const currentStep = steps[activeStep] || steps[0] || { title: '', content: '' };

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-8">Step Through the Architecture</h2>

        <div className="flex gap-2 mb-8">
          {steps.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setActiveStep(i)}
              className={\`px-4 py-2 rounded-lg text-xs font-semibold transition-colors \${
                activeStep === i ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-200 dark:bg-neutral-800'
              }\`}
            >
              Step {i + 1}
            </button>
          ))}
        </div>

        <div className={\`w-full p-8 rounded-2xl border text-center max-w-xl transition-all \${card}\`}>
          <h3 className="text-xl font-bold mb-3">{currentStep.title}</h3>
          <p className="text-xs sm:text-sm opacity-80 leading-relaxed">{currentStep.content}</p>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { HowItWorksInteractive, HowItWorksInteractiveVariant } from './index.js';

export function HowItWorksInteractivePreview() {
  const [variant, setVariant] = useState<HowItWorksInteractiveVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">How It Works Interactive Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as HowItWorksInteractiveVariant[]).map((v) => (
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
      <HowItWorksInteractive variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const howItWorksInteractiveFixtures = {};`,
    readmeCode: `# How It Works Interactive

Clickable step-through section demonstrating the end-to-end interface composition workflow.`,
  },

  // 40. Process Diagram
  {
    slug: 'process-diagram',
    name: 'Process Diagram',
    description: 'Visual flowchart explaining system data pipeline from ingestion to output.',
    categories: ['sections', 'marketing', 'explanation'],
    roles: ['explanation', 'diagram'],
    purposes: ['System architecture overview', 'Dataflow explanation'],
    componentName: 'ProcessDiagram',
    tags: ['process-diagram', 'flowchart', 'architecture', 'dataflow'],
    idealFor: ['Technical deep-dives illustrating pipeline transformations'],
    avoidFor: ['Casual marketing teasers'],
    jobs: ['Explain the flow of manifests from registry to AST emission'],
    indexCode: `import React from 'react';

export type ProcessDiagramVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProcessDiagramProps {
  variant?: ProcessDiagramVariant;
}

export function ProcessDiagram({ variant = 'quiet' }: ProcessDiagramProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let node = 'bg-neutral-100 border-neutral-300';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    node = 'bg-white border-blue-200 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    node = 'bg-[#151921] border-[#2E3440]';
  }

  const nodes = ['Resource Manifest', 'DNA Constraint Solver', 'Virtual Component Tree', 'Clean TSX File'];

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">The Pipeline Architecture</h2>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {nodes.map((n, i) => (
            <React.Fragment key={n}>
              <div className={\`p-4 rounded-xl border text-center font-mono text-xs font-semibold w-full md:w-auto \${node}\`}>
                {n}
              </div>
              {i < nodes.length - 1 && (
                <div className="text-neutral-400 font-bold rotate-90 md:rotate-0">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ProcessDiagram, ProcessDiagramVariant } from './index.js';

export function ProcessDiagramPreview() {
  const [variant, setVariant] = useState<ProcessDiagramVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Process Diagram Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as ProcessDiagramVariant[]).map((v) => (
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
      <ProcessDiagram variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const processDiagramFixtures = {};`,
    readmeCode: `# Process Diagram

Horizontal architecture flowchart tracing data transformations through the compiler.`,
  },

  // 41. Workflow Narrative
  {
    slug: 'workflow-narrative',
    name: 'Workflow Narrative',
    description: 'Structured editorial walk-through explaining developer ergonomics and day-to-day use.',
    categories: ['sections', 'marketing', 'explanation'],
    roles: ['explanation', 'narrative'],
    purposes: ['Developer experience storytelling', 'Philosophy explanation'],
    componentName: 'WorkflowNarrative',
    tags: ['workflow-narrative', 'dx', 'developer-experience', 'narrative'],
    idealFor: ['Engineering blogs and philosophical position papers'],
    avoidFor: ['Short pricing teasers'],
    jobs: ['Explain the developer experience improvements when working with Tessellate'],
    indexCode: `import React from 'react';

export type WorkflowNarrativeVariant = 'quiet' | 'expressive' | 'nocturne';

export interface WorkflowNarrativeProps {
  variant?: WorkflowNarrativeVariant;
}

export function WorkflowNarrative({ variant = 'quiet' }: WorkflowNarrativeProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-3xl mx-auto">
        <span className="text-xs font-mono font-bold uppercase text-neutral-500 mb-3 block">Developer Ergonomics</span>
        <h2 className="text-3xl font-bold tracking-tight mb-6">Built for engineers who care about source code ownership.</h2>
        <div className="space-y-4 text-sm opacity-80 leading-relaxed">
          <p>
            When autonomous coding agents write code, they often produce fragmented CSS and arbitrary dependencies. Tessellate grounds agents in a verified resource vocabulary.
          </p>
          <p>
            The resulting code contains zero proprietary imports. It reads like the cleanest code written by your senior staff front-end architect.
          </p>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { WorkflowNarrative, WorkflowNarrativeVariant } from './index.js';

export function WorkflowNarrativePreview() {
  const [variant, setVariant] = useState<WorkflowNarrativeVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Workflow Narrative Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as WorkflowNarrativeVariant[]).map((v) => (
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
      <WorkflowNarrative variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const workflowNarrativeFixtures = {};`,
    readmeCode: `# Workflow Narrative

Editorial developer-experience narrative detailing why code ownership and zero lock-in matter.`,
  },

  // 42. Integration Grid
  {
    slug: 'integration-grid',
    name: 'Integration Grid',
    description: 'Icon grid displaying supported third-party tools, frameworks, and cloud services.',
    categories: ['sections', 'marketing', 'integrations'],
    roles: ['integrations', 'grid'],
    purposes: ['Ecosystem connectivity', 'Framework compatibility'],
    componentName: 'IntegrationGrid',
    tags: ['integration-grid', 'integrations', 'ecosystem', 'frameworks'],
    idealFor: ['Proving broad ecosystem and toolchain compatibility'],
    avoidFor: ['Proprietary closed systems'],
    jobs: ['Showcase supported frameworks and agent tools'],
    indexCode: `import React from 'react';

export type IntegrationGridVariant = 'quiet' | 'expressive' | 'nocturne';

export interface IntegrationGridProps {
  variant?: IntegrationGridVariant;
}

export function IntegrationGrid({ variant = 'quiet' }: IntegrationGridProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-100 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const tools = ['Next.js', 'Vite', 'Astro', 'Remix', 'Tailwind 4', 'TypeScript', 'Cursor', 'Claude Code', 'Antigravity'];

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Universal Ecosystem Compatibility</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-6">
          {tools.map((t) => (
            <div key={t} className={\`p-6 rounded-xl border text-center font-mono text-xs font-bold \${card}\`}>
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { IntegrationGrid, IntegrationGridVariant } from './index.js';

export function IntegrationGridPreview() {
  const [variant, setVariant] = useState<IntegrationGridVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Integration Grid Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as IntegrationGridVariant[]).map((v) => (
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
      <IntegrationGrid variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const integrationGridFixtures = {};`,
    readmeCode: `# Integration Grid

Framework and developer tool compatibility grid showing broad ecosystem interoperability.`,
  },

  // 43. Integration Orbit
  {
    slug: 'integration-orbit',
    name: 'Integration Orbit',
    description: 'Central product node surrounded by connected ecosystem nodes with radial alignment.',
    categories: ['sections', 'marketing', 'integrations'],
    roles: ['integrations', 'orbit'],
    purposes: ['Visual ecosystem nexus', 'Hub-and-spoke explanation'],
    componentName: 'IntegrationOrbit',
    tags: ['integration-orbit', 'orbit', 'integrations', 'ecosystem'],
    idealFor: ['Visually compelling platform hub demonstrations'],
    avoidFor: ['Dense tabular feature comparisons'],
    jobs: ['Visually portray Tessellate as the central orchestrator of UI composition'],
    indexCode: `import React from 'react';

export type IntegrationOrbitVariant = 'quiet' | 'expressive' | 'nocturne';

export interface IntegrationOrbitProps {
  variant?: IntegrationOrbitVariant;
}

export function IntegrationOrbit({ variant = 'quiet' }: IntegrationOrbitProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let centerNode = 'bg-neutral-900 text-white';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    centerNode = 'bg-[#2547E8] text-white shadow-xl';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    centerNode = 'bg-cyan-500 text-black font-semibold shadow-2xl';
  }

  const nodes = ['React', 'Tailwind', 'Zod', 'Orama', 'Better Auth', 'Cloudflare'];

  return (
    <section className={\`relative w-full py-24 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tight mb-16">The Orchestration Center</h2>

        <div className="relative w-72 h-72 rounded-full border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center">
          <div className={\`w-28 h-28 rounded-full flex items-center justify-center font-bold text-xs font-mono \${centerNode}\`}>
            TESSELLATE
          </div>
          {nodes.map((node, i) => {
            const angle = (i / nodes.length) * 2 * Math.PI;
            const x = Math.round(110 * Math.cos(angle));
            const y = Math.round(110 * Math.sin(angle));
            return (
              <div
                key={node}
                style={{ transform: \`translate(\${x}px, \${y}px)\` }}
                className="absolute px-3 py-1 rounded-full border bg-white dark:bg-[#151921] text-[10px] font-mono font-semibold shadow-xs"
              >
                {node}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { IntegrationOrbit, IntegrationOrbitVariant } from './index.js';

export function IntegrationOrbitPreview() {
  const [variant, setVariant] = useState<IntegrationOrbitVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Integration Orbit Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as IntegrationOrbitVariant[]).map((v) => (
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
      <IntegrationOrbit variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const integrationOrbitFixtures = {};`,
    readmeCode: `# Integration Orbit

Radial diagram positioning Tessellate at the center of modern web ecosystems.`,
  },

  // 44. Integration Directory Preview
  {
    slug: 'integration-directory-preview',
    name: 'Integration Directory Preview',
    description: 'Searchable catalog preview of ecosystem plugins with filter chips.',
    categories: ['sections', 'marketing', 'integrations'],
    roles: ['integrations', 'directory'],
    purposes: ['Plugin catalog discovery', 'Ecosystem browsing'],
    componentName: 'IntegrationDirectoryPreview',
    tags: ['integration-directory-preview', 'plugins', 'directory', 'integrations'],
    idealFor: ['Extensible platforms with numerous add-ons'],
    avoidFor: ['Fixed single-tool suites'],
    jobs: ['Preview available plugins with instant filter chips'],
    indexCode: `import React, { useState } from 'react';

export type IntegrationDirectoryPreviewVariant = 'quiet' | 'expressive' | 'nocturne';

export interface IntegrationDirectoryPreviewProps {
  variant?: IntegrationDirectoryPreviewVariant;
}

export function IntegrationDirectoryPreview({ variant = 'quiet' }: IntegrationDirectoryPreviewProps) {
  const [filter, setFilter] = useState('All');
  const items = [
    { name: 'GitHub OAuth Sync', cat: 'Auth' },
    { name: 'Cloudflare D1 Adapter', cat: 'Database' },
    { name: 'Orama Search Engine', cat: 'Search' },
    { name: 'Lucide Icon Mapper', cat: 'Assets' },
  ];

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-100 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const filtered = filter === 'All' ? items : items.filter((i) => i.cat === filter);

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-8">Plugin Directory</h2>

        <div className="flex justify-center gap-2 mb-10 text-xs">
          {['All', 'Auth', 'Database', 'Search', 'Assets'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={\`px-3 py-1 rounded-full border transition-colors \${
                filter === cat ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-transparent'
              }\`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div key={item.name} className={\`p-4 rounded-xl border flex items-center justify-between \${card}\`}>
              <span className="font-semibold text-xs sm:text-sm">{item.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">{item.cat}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { IntegrationDirectoryPreview, IntegrationDirectoryPreviewVariant } from './index.js';

export function IntegrationDirectoryPreviewPreview() {
  const [variant, setVariant] = useState<IntegrationDirectoryPreviewVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Integration Directory Preview Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as IntegrationDirectoryPreviewVariant[]).map((v) => (
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
      <IntegrationDirectoryPreview variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const integrationDirectoryPreviewFixtures = {};`,
    readmeCode: `# Integration Directory Preview

Searchable and category-filterable directory card previewing ecosystem integrations.`,
  },

  // 45. API Capability Section
  {
    slug: 'api-capability-section',
    name: 'API Capability Section',
    description: 'Developer section highlighting REST / GraphQL / SDK methods with endpoint pill tags.',
    categories: ['sections', 'marketing', 'integrations'],
    roles: ['integrations', 'api'],
    purposes: ['API reference preview', 'Developer integration proof'],
    componentName: 'ApiCapabilitySection',
    tags: ['api-capability-section', 'api', 'endpoints', 'developer'],
    idealFor: ['Technical products exposing webhooks and APIs'],
    avoidFor: ['Consumer non-technical apps'],
    jobs: ['Demonstrate clean API endpoint signatures and fast HTTP responses'],
    indexCode: `import React from 'react';

export type ApiCapabilitySectionVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ApiCapabilitySectionProps {
  variant?: ApiCapabilitySectionVariant;
}

export function ApiCapabilitySection({ variant = 'quiet' }: ApiCapabilitySectionProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200 font-mono text-xs';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/30 border-blue-100 shadow-sm font-mono text-xs';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440] font-mono text-xs';
  }

  const endpoints = [
    { method: 'GET', path: '/api/v1/resources/:slug', desc: 'Retrieve verified JSON manifest' },
    { method: 'POST', path: '/api/v1/compose', desc: 'Validate and compile project tree' },
    { method: 'GET', path: '/api/v1/dna/tokens', desc: 'Query calibrated Design DNA dimensions' },
  ];

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Programmatic API Access</h2>

        <div className="space-y-4">
          {endpoints.map((ep) => (
            <div key={ep.path} className={\`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 \${card}\`}>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">{ep.method}</span>
                <span className="font-semibold">{ep.path}</span>
              </div>
              <span className="text-xs opacity-70 font-sans">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ApiCapabilitySection, ApiCapabilitySectionVariant } from './index.js';

export function ApiCapabilitySectionPreview() {
  const [variant, setVariant] = useState<ApiCapabilitySectionVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">API Capability Section Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as ApiCapabilitySectionVariant[]).map((v) => (
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
      <ApiCapabilitySection variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const apiCapabilitySectionFixtures = {};`,
    readmeCode: `# API Capability Section

HTTP REST endpoint signature cards demonstrating programmatic developer interfaces.`,
  },

  // 46. Pricing Three Tier
  {
    slug: 'pricing-three-tier',
    name: 'Pricing Three Tier',
    description: 'Canonical 3-card pricing table (Free, Pro, Enterprise) with highlighted recommended tier.',
    categories: ['sections', 'marketing', 'pricing'],
    roles: ['pricing', 'three-tier'],
    purposes: ['SaaS monetization', 'Plan comparison'],
    componentName: 'PricingThreeTier',
    tags: ['pricing-three-tier', 'pricing', 'plans', 'conversion'],
    idealFor: ['Standard B2B SaaS pricing models'],
    avoidFor: ['Free-only open source projects without paid tiers'],
    jobs: ['Provide clean comparative pricing with transparent features'],
    indexCode: `import React from 'react';

export type PricingThreeTierVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PricingThreeTierProps {
  variant?: PricingThreeTierVariant;
}

export function PricingThreeTier({ variant = 'quiet' }: PricingThreeTierProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200';
  let featuredCard = 'bg-white border-neutral-900 shadow-lg ring-1 ring-neutral-900';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-neutral-50/50 border-neutral-200';
    featuredCard = 'bg-white border-[#2547E8] shadow-xl ring-2 ring-[#2547E8]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
    featuredCard = 'bg-[#151921] border-cyan-400 shadow-2xl ring-1 ring-cyan-400';
  }

  const tiers = [
    { name: 'Free Core', price: '£0', desc: 'Complete access to all 324 open source resources.', featured: false },
    { name: 'Team Sync', price: '£18', desc: 'Cloud project sharing, checkpoint history, and team roles.', featured: true },
    { name: 'Enterprise', price: 'Custom', desc: 'SSO, dedicated SLA, custom DNA tokens, and private registry.', featured: false },
  ];

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-center mb-16">Simple, Honest Pricing</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((t) => (
            <div key={t.name} className={\`p-8 rounded-2xl border flex flex-col justify-between transition-all \${t.featured ? featuredCard : card}\`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-lg">{t.name}</span>
                  {t.featured && <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">Recommended</span>}
                </div>
                <div className="text-4xl font-mono font-bold mb-4">{t.price}</div>
                <p className="text-xs sm:text-sm opacity-75 mb-6">{t.desc}</p>
              </div>
              <button
                type="button"
                className={\`w-full py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors \${
                  t.featured ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'border hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }\`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { PricingThreeTier, PricingThreeTierVariant } from './index.js';

export function PricingThreeTierPreview() {
  const [variant, setVariant] = useState<PricingThreeTierVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Pricing Three Tier Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as PricingThreeTierVariant[]).map((v) => (
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
      <PricingThreeTier variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const pricingThreeTierFixtures = {};`,
    readmeCode: `# Pricing Three Tier

Standard three-column pricing section with prominent recommended tier styling.`,
  },

  // 47. Pricing Two Tier
  {
    slug: 'pricing-two-tier',
    name: 'Pricing Two Tier',
    description: 'Focused 2-card comparison (Starter vs Business) for streamlined product offerings.',
    categories: ['sections', 'marketing', 'pricing'],
    roles: ['pricing', 'two-tier'],
    purposes: ['Streamlined pricing', 'Binary plan choice'],
    componentName: 'PricingTwoTier',
    tags: ['pricing-two-tier', 'pricing', 'two-tier', 'plans'],
    idealFor: ['Straightforward products with minimal tier complexity'],
    avoidFor: ['Complex enterprise sales matrices'],
    jobs: ['Keep buying decisions simple with two clear choices'],
    indexCode: `import React from 'react';

export type PricingTwoTierVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PricingTwoTierProps {
  variant?: PricingTwoTierVariant;
}

export function PricingTwoTier({ variant = 'quiet' }: PricingTwoTierProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Choose Your Plan</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={\`p-8 rounded-2xl border flex flex-col justify-between \${card}\`}>
            <div>
              <span className="font-bold text-lg mb-2 block">Starter Edition</span>
              <div className="text-4xl font-mono font-bold mb-4">Free</div>
              <p className="text-xs sm:text-sm opacity-75 mb-6">Local development and individual exploration.</p>
            </div>
            <button type="button" className="w-full py-2.5 rounded-lg border text-xs font-semibold">Start Free</button>
          </div>

          <div className={\`p-8 rounded-2xl border flex flex-col justify-between \${card}\`}>
            <div>
              <span className="font-bold text-lg mb-2 block">Organization Pro</span>
              <div className="text-4xl font-mono font-bold mb-4">£29<span className="text-xs font-normal">/mo</span></div>
              <p className="text-xs sm:text-sm opacity-75 mb-6">Centralized token libraries, audit logs, and priority updates.</p>
            </div>
            <button type="button" className="w-full py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold">Upgrade Now</button>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { PricingTwoTier, PricingTwoTierVariant } from './index.js';

export function PricingTwoTierPreview() {
  const [variant, setVariant] = useState<PricingTwoTierVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Pricing Two Tier Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as PricingTwoTierVariant[]).map((v) => (
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
      <PricingTwoTier variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const pricingTwoTierFixtures = {};`,
    readmeCode: `# Pricing Two Tier

Two-card pricing layout offering a clean binary choice between Starter and Pro.`,
  },

  // 48. Pricing Usage Based
  {
    slug: 'pricing-usage-based',
    name: 'Pricing Usage Based',
    description: 'Pay-as-you-go pricing card with tier volume sliders and unit-cost breakdowns.',
    categories: ['sections', 'marketing', 'pricing'],
    roles: ['pricing', 'usage-based'],
    purposes: ['Consumption billing', 'API pricing'],
    componentName: 'PricingUsageBased',
    tags: ['pricing-usage-based', 'pricing', 'consumption', 'api'],
    idealFor: ['Compute, bandwidth, and API credit monetization'],
    avoidFor: ['Fixed seat-license SaaS'],
    jobs: ['Explain consumption-based meter charges transparently'],
    indexCode: `import React, { useState } from 'react';

export type PricingUsageBasedVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PricingUsageBasedProps {
  variant?: PricingUsageBasedVariant;
}

export function PricingUsageBased({ variant = 'quiet' }: PricingUsageBasedProps) {
  const [units, setUnits] = useState(50);

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/30 border-blue-100 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const estimatedCost = Math.round(units * 0.4);

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Pay Only for Verified Compilations</h2>

        <div className={\`w-full p-8 rounded-2xl border max-w-xl transition-all \${card}\`}>
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-semibold">Monthly AST Compilations:</span>
            <span className="font-mono font-bold text-lg">{units}k runs</span>
          </div>

          <input
            type="range"
            min={10}
            max={200}
            value={units}
            onChange={(e) => setUnits(Number(e.target.value))}
            className="w-full mb-8 cursor-pointer"
          />

          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6 flex items-center justify-between">
            <span className="text-xs opacity-75">Estimated Total:</span>
            <span className="text-3xl font-mono font-bold">£{estimatedCost}/mo</span>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { PricingUsageBased, PricingUsageBasedVariant } from './index.js';

export function PricingUsageBasedPreview() {
  const [variant, setVariant] = useState<PricingUsageBasedVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Pricing Usage Based Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as PricingUsageBasedVariant[]).map((v) => (
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
      <PricingUsageBased variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const pricingUsageBasedFixtures = {};`,
    readmeCode: `# Pricing Usage Based

Interactive slider calculator demonstrating consumption-based billing models.`,
  },

  // 49. Pricing Enterprise
  {
    slug: 'pricing-enterprise',
    name: 'Pricing Enterprise',
    description: 'Dedicated high-touch enterprise tier section with custom contract feature list.',
    categories: ['sections', 'marketing', 'pricing'],
    roles: ['pricing', 'enterprise'],
    purposes: ['Enterprise sales lead capture', 'Custom procurement'],
    componentName: 'PricingEnterprise',
    tags: ['pricing-enterprise', 'pricing', 'enterprise', 'custom'],
    idealFor: ['Large organizations requiring bespoke security agreements'],
    avoidFor: ['Self-serve consumer apps'],
    jobs: ['Provide dedicated enterprise contract feature checklist and contact button'],
    indexCode: `import React from 'react';

export type PricingEnterpriseVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PricingEnterpriseProps {
  variant?: PricingEnterpriseVariant;
}

export function PricingEnterprise({ variant = 'quiet' }: PricingEnterpriseProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-xl';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto">
        <div className={\`p-8 sm:p-12 rounded-3xl border text-center flex flex-col items-center \${card}\`}>
          <span className="text-xs font-mono font-bold uppercase text-neutral-500 mb-3 block">High-Touch Security</span>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Enterprise Custom Contracts</h2>
          <p className="text-xs sm:text-sm opacity-80 max-w-lg mb-8 leading-relaxed">
            Includes custom VPC deployment, isolated R2 registries, custom SOC2 attestations, and 24/7 dedicated engineering support.
          </p>
          <button type="button" className="px-6 py-3 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold text-xs tracking-wider uppercase">
            Schedule Enterprise Consultation
          </button>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { PricingEnterprise, PricingEnterpriseVariant } from './index.js';

export function PricingEnterprisePreview() {
  const [variant, setVariant] = useState<PricingEnterpriseVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Pricing Enterprise Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as PricingEnterpriseVariant[]).map((v) => (
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
      <PricingEnterprise variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const pricingEnterpriseFixtures = {};`,
    readmeCode: `# Pricing Enterprise

Dedicated high-touch enterprise section for custom procurement and compliance agreements.`,
  },

  // 50. Pricing Comparison Table
  {
    slug: 'pricing-comparison-table',
    name: 'Pricing Comparison Table',
    description: 'Exhaustive checkmark matrix comparing feature tiers across 20+ dimensions.',
    categories: ['sections', 'marketing', 'pricing'],
    roles: ['pricing', 'comparison'],
    purposes: ['In-depth plan analysis', 'Transparency'],
    componentName: 'PricingComparisonTable',
    tags: ['pricing-comparison-table', 'pricing', 'matrix', 'comparison'],
    idealFor: ['Detailed side-by-side plan feature breakdown'],
    avoidFor: ['Mobile-only minimal splash pages'],
    jobs: ['Provide thorough checkmark comparison between plans'],
    indexCode: `import React from 'react';

export type PricingComparisonTableVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PricingComparisonTableProps {
  variant?: PricingComparisonTableVariant;
}

export function PricingComparisonTable({ variant = 'quiet' }: PricingComparisonTableProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let tableBorder = 'border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    tableBorder = 'border-blue-100';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    tableBorder = 'border-[#2E3440]';
  }

  const rows = [
    { feature: 'All 324 Launch Resources', free: '✓', team: '✓', enterprise: '✓' },
    { feature: 'TypeScript Source Code Export', free: '✓', team: '✓', enterprise: '✓' },
    { feature: 'Cloud Checkpoints & Sync', free: '—', team: '✓', enterprise: '✓' },
    { feature: 'Custom DNA Token Storage', free: '—', team: '—', enterprise: '✓' },
  ];

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Detailed Feature Matrix</h2>

        <div className={\`overflow-x-auto rounded-xl border \${tableBorder}\`}>
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b bg-neutral-100/60 dark:bg-neutral-900/60 font-mono text-xs uppercase">
              <tr>
                <th className="p-4">Feature</th>
                <th className="p-4">Free Core</th>
                <th className="p-4">Team</th>
                <th className="p-4">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {rows.map((r) => (
                <tr key={r.feature} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                  <td className="p-4 font-semibold">{r.feature}</td>
                  <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400">{r.free}</td>
                  <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400">{r.team}</td>
                  <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400">{r.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { PricingComparisonTable, PricingComparisonTableVariant } from './index.js';

export function PricingComparisonTablePreview() {
  const [variant, setVariant] = useState<PricingComparisonTableVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Pricing Comparison Table Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as PricingComparisonTableVariant[]).map((v) => (
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
      <PricingComparisonTable variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const pricingComparisonTableFixtures = {};`,
    readmeCode: `# Pricing Comparison Table

Comprehensive plan feature matrix with checkmarks and breakdown rows.`,
  },

  // 51. Pricing Toggle
  {
    slug: 'pricing-toggle',
    name: 'Pricing Toggle',
    description: 'Billing interval switcher (Monthly vs Annual with discount badge) above plan cards.',
    categories: ['sections', 'marketing', 'pricing'],
    roles: ['pricing', 'toggle'],
    purposes: ['Annual discount incentive', 'Billing interval selector'],
    componentName: 'PricingToggle',
    tags: ['pricing-toggle', 'pricing', 'annual', 'toggle'],
    idealFor: ['Offering discounted annual contracts to increase retention'],
    avoidFor: ['Non-recurring pricing'],
    jobs: ['Toggle between monthly and annual subscription rates'],
    indexCode: `import React, { useState } from 'react';

export type PricingToggleVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PricingToggleProps {
  variant?: PricingToggleVariant;
}

export function PricingToggle({ variant = 'quiet' }: PricingToggleProps) {
  const [annual, setAnnual] = useState(false);

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const price = annual ? '£14' : '£18';

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-8">Flexible Billing</h2>

        <div className="flex items-center gap-3 mb-12 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={\`px-3 py-1.5 rounded-lg transition-colors \${!annual ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'opacity-60'}\`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={\`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 \${annual ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'opacity-60'}\`}
          >
            Annual <span className="text-[10px] text-emerald-500 font-mono">(Save 20%)</span>
          </button>
        </div>

        <div className={\`w-full max-w-sm p-8 rounded-2xl border text-center transition-all \${card}\`}>
          <span className="font-bold text-sm block mb-2">Team Pro Plan</span>
          <div className="text-4xl font-mono font-bold mb-4">{price}<span className="text-xs font-normal">/mo</span></div>
          <p className="text-xs opacity-75 mb-6">Billed {annual ? 'annually (£168/yr)' : 'monthly'}. Cancel anytime.</p>
          <button type="button" className="w-full py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold">
            Choose Plan
          </button>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { PricingToggle, PricingToggleVariant } from './index.js';

export function PricingTogglePreview() {
  const [variant, setVariant] = useState<PricingToggleVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Pricing Toggle Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as PricingToggleVariant[]).map((v) => (
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
      <PricingToggle variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const pricingToggleFixtures = {};`,
    readmeCode: `# Pricing Toggle

Billing frequency switcher dynamically calculating discounted annual rates.`,
  },

  // 52. Pricing Calculator Shell
  {
    slug: 'pricing-calculator-shell',
    name: 'Pricing Calculator Shell',
    description: 'Interactive slider calculator estimating monthly cost based on MAU or compute units.',
    categories: ['sections', 'marketing', 'pricing'],
    roles: ['pricing', 'calculator'],
    purposes: ['Cost estimation', 'Interactive pricing forecast'],
    componentName: 'PricingCalculatorShell',
    tags: ['pricing-calculator-shell', 'calculator', 'pricing', 'estimate'],
    idealFor: ['Helping enterprise buyers estimate monthly infrastructure invoices'],
    avoidFor: ['Flat rate plans'],
    jobs: ['Calculate estimated invoice according to user-selected scale sliders'],
    indexCode: `import React, { useState } from 'react';

export type PricingCalculatorShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PricingCalculatorShellProps {
  variant?: PricingCalculatorShellVariant;
}

export function PricingCalculatorShell({ variant = 'quiet' }: PricingCalculatorShellProps) {
  const [teamSize, setTeamSize] = useState(5);

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/30 border-blue-100 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const total = teamSize * 15;

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Team Cost Calculator</h2>

        <div className={\`w-full max-w-lg p-8 rounded-2xl border transition-all \${card}\`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold">Active Developers:</span>
            <span className="font-mono font-bold text-lg">{teamSize} seats</span>
          </div>

          <input
            type="range"
            min={1}
            max={50}
            value={teamSize}
            onChange={(e) => setTeamSize(Number(e.target.value))}
            className="w-full mb-8 cursor-pointer"
          />

          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6 flex items-center justify-between">
            <span className="text-xs opacity-75">Estimated Invoice:</span>
            <span className="text-3xl font-mono font-bold">£{total}/mo</span>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { PricingCalculatorShell, PricingCalculatorShellVariant } from './index.js';

export function PricingCalculatorShellPreview() {
  const [variant, setVariant] = useState<PricingCalculatorShellVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Pricing Calculator Shell Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as PricingCalculatorShellVariant[]).map((v) => (
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
      <PricingCalculatorShell variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const pricingCalculatorShellFixtures = {};`,
    readmeCode: `# Pricing Calculator Shell

Interactive slider-driven billing estimator for team seats and resource scale.`,
  },

  // 53. Plan Feature Matrix
  {
    slug: 'plan-feature-matrix',
    name: 'Plan Feature Matrix',
    description: 'Segmented feature comparison with expandable category groupings.',
    categories: ['sections', 'marketing', 'pricing'],
    roles: ['pricing', 'matrix'],
    purposes: ['Category-by-category plan audit', 'Thorough technical comparison'],
    componentName: 'PlanFeatureMatrix',
    tags: ['plan-feature-matrix', 'pricing', 'features', 'matrix'],
    idealFor: ['Exhaustive pricing audits categorizing security, storage, and tooling'],
    avoidFor: ['Quick marketing teasers'],
    jobs: ['Organize features into grouped sections for comprehensive evaluation'],
    indexCode: `import React from 'react';

export type PlanFeatureMatrixVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PlanFeatureMatrixProps {
  variant?: PlanFeatureMatrixVariant;
}

export function PlanFeatureMatrix({ variant = 'quiet' }: PlanFeatureMatrixProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let tableBorder = 'border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    tableBorder = 'border-blue-100';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    tableBorder = 'border-[#2E3440]';
  }

  const items = [
    { group: 'Core Composition', feature: 'Full Resource Manifests', free: 'Yes', pro: 'Yes' },
    { group: 'Core Composition', feature: 'React + Tailwind AST Output', free: 'Yes', pro: 'Yes' },
    { group: 'Team Collaboration', feature: 'Real-time Project Checkpoints', free: 'No', pro: 'Yes' },
    { group: 'Team Collaboration', feature: 'Role-Based Access Control', free: 'No', pro: 'Yes' },
  ];

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Categorized Feature Matrix</h2>

        <div className={\`overflow-x-auto rounded-xl border \${tableBorder}\`}>
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b bg-neutral-100/60 dark:bg-neutral-900/60 font-mono text-xs uppercase">
              <tr>
                <th className="p-4">Group</th>
                <th className="p-4">Feature</th>
                <th className="p-4">Free</th>
                <th className="p-4">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {items.map((it) => (
                <tr key={it.feature} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                  <td className="p-4 font-mono text-[11px] opacity-60 uppercase">{it.group}</td>
                  <td className="p-4 font-semibold">{it.feature}</td>
                  <td className="p-4 font-mono">{it.free}</td>
                  <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400">{it.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { PlanFeatureMatrix, PlanFeatureMatrixVariant } from './index.js';

export function PlanFeatureMatrixPreview() {
  const [variant, setVariant] = useState<PlanFeatureMatrixVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Plan Feature Matrix Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as PlanFeatureMatrixVariant[]).map((v) => (
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
      <PlanFeatureMatrix variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const planFeatureMatrixFixtures = {};`,
    readmeCode: `# Plan Feature Matrix

Categorized feature audit table grouping capabilities under distinct architectural pillars.`,
  },

  // 54. FAQ Accordion
  {
    slug: 'faq-accordion',
    name: 'FAQ Accordion',
    description: 'Clean expandable question list with keyboard navigation and smooth disclosure.',
    categories: ['sections', 'marketing', 'faq'],
    roles: ['faq', 'accordion'],
    purposes: ['Objection resolution', 'Pre-sale answers'],
    componentName: 'FaqAccordion',
    tags: ['faq-accordion', 'faq', 'accordion', 'questions'],
    idealFor: ['Addressing common developer questions cleanly'],
    avoidFor: ['Complex tutorial walkthroughs'],
    jobs: ['Resolve objections and clarify licensing with expandable accordions'],
    indexCode: `import React, { useState } from 'react';

export type FaqAccordionVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FaqAccordionProps {
  variant?: FaqAccordionVariant;
}

export function FaqAccordion({ variant = 'quiet' }: FaqAccordionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let itemBorder = 'border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    itemBorder = 'border-blue-100';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    itemBorder = 'border-[#2E3440]';
  }

  const faqs = [
    { q: 'Is Tessellate really 100% free and open core?', a: 'Yes. All 324 canonical launch resources, Design DNA tools, and export CLI commands are free under MIT.' },
    { q: 'Can autonomous coding agents use this directly?', a: 'Yes. Tessellate provides OpenAPI schemas, llms.txt, and official MCP server bindings for Cursor, Claude Code, and Antigravity.' },
    { q: 'Do I need to install any proprietary runtime package?', a: 'No. Tessellate exports pure React and Tailwind CSS source code directly into your repository.' },
  ];

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={f.q} className={\`border rounded-xl p-5 transition-all \${itemBorder}\`}>
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full text-left font-semibold text-sm sm:text-base flex justify-between items-center"
              >
                <span>{f.q}</span>
                <span className="font-mono text-xs opacity-60">{openIdx === i ? '−' : '+'}</span>
              </button>
              {openIdx === i && (
                <p className="text-xs sm:text-sm opacity-80 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 leading-relaxed">
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FaqAccordion, FaqAccordionVariant } from './index.js';

export function FaqAccordionPreview() {
  const [variant, setVariant] = useState<FaqAccordionVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">FAQ Accordion Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FaqAccordionVariant[]).map((v) => (
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
      <FaqAccordion variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const faqAccordionFixtures = {};`,
    readmeCode: `# FAQ Accordion

Expandable question accordion resolving pre-sale and architectural objections.`,
  },
];
