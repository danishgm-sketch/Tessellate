import type { TypographyDef } from './typography-builder';

export const TYPOGRAPHY_BATCH_2: TypographyDef[] = [
  // 7. Split-Line Headline
  {
    slug: 'split-line-headline',
    name: 'Split-Line Headline',
    description: 'Staggered multi-line headline where each line occupies an intentional asymmetrical indentation margin, establishing editorial rhythm.',
    categories: ['typography', 'display', 'editorial'],
    roles: ['typography', 'split-headline'],
    purposes: ['editorial-rhythm', 'asymmetrical-layout', 'hero-headline'],
    componentName: 'SplitLineHeadline',
    tags: ['typography', 'split-line', 'asymmetrical', 'editorial', 'rhythm'],
    idealFor: ['Magazine feature openers', 'Creative studio homepages', 'Architectural firm case studies'],
    avoidFor: ['Centered compact alert modals', 'Mobile forms'],
    jobs: ['Break visual monotony with editorial pacing and architectural margin alignment'],
    indexCode: `import React from 'react';

export type SplitLineHeadlineVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SplitLineHeadlineProps {
  line1?: string;
  line2?: string;
  line3?: string;
  variant?: SplitLineHeadlineVariant;
  children?: React.ReactNode;
}

export function SplitLineHeadline({
  line1 = 'Composing systems',
  line2 = 'not isolated fragments',
  line3 = 'for humans and agents.',
  variant = 'quiet',
  children,
}: SplitLineHeadlineProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const line2Class =
    variant === 'nocturne'
      ? 'text-cyan-400 pl-8 md:pl-16'
      : variant === 'expressive'
      ? 'text-indigo-600 pl-8 md:pl-16 font-serif italic'
      : 'text-neutral-500 pl-8 md:pl-16 font-serif italic';

  const line3Class = 'pl-16 md:pl-32';

  return (
    <div className={\`p-8 md:p-14 rounded-xl border max-w-4xl mx-auto space-y-3 transition-colors \${containerBg}\`}>
      <div className="text-3xl md:text-5xl font-black tracking-tight">{line1}</div>
      <div className={\`text-3xl md:text-5xl font-black tracking-tight \${line2Class}\`}>{line2}</div>
      <div className={\`text-3xl md:text-5xl font-black tracking-tight \${line3Class}\`}>{line3}</div>
      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { SplitLineHeadline, SplitLineHeadlineVariant } from './index';

export function SplitLineHeadlinePreview() {
  const [variant, setVariant] = useState<SplitLineHeadlineVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <SplitLineHeadline variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const splitLineHeadlineFixtures = {};`,
    readmeCode: `# Split-Line Headline

Asymmetrical staggered multi-line headline establishing high-craft editorial cadence.`,
  },

  // 8. Variable Weight Hover
  {
    slug: 'variable-weight-hover',
    name: 'Variable Weight Hover',
    description: 'Interactive typography that smoothly transitions optical font-weight and character spacing when hovered.',
    categories: ['typography', 'display', 'interactive'],
    roles: ['typography', 'variable-weight'],
    purposes: ['interactive-text', 'tactile-feedback', 'hero-headline'],
    componentName: 'VariableWeightHover',
    tags: ['typography', 'variable-font', 'hover', 'interactive', 'weight'],
    idealFor: ['Interactive studio portfolios', 'Creative agency headlines', 'Type foundry specimen displays'],
    avoidFor: ['Standard longform prose', 'E-reader exports'],
    jobs: ['Provide tactile, physical feedback in display type without shifting surrounding layout flow'],
    indexCode: `import React, { useState } from 'react';

export type VariableWeightHoverVariant = 'quiet' | 'expressive' | 'nocturne';

export interface VariableWeightHoverProps {
  words?: string[];
  variant?: VariableWeightHoverVariant;
  children?: React.ReactNode;
}

export function VariableWeightHover({
  words = ['PRECISION', 'HARMONY', 'STRUCTURE', 'CADENCE'],
  variant = 'quiet',
  children,
}: VariableWeightHoverProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const hoverHighlight =
    variant === 'nocturne'
      ? 'text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]'
      : variant === 'expressive'
      ? 'text-indigo-600'
      : 'text-neutral-950';

  return (
    <div className={\`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto space-y-6 transition-colors \${containerBg}\`}>
      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Tactile Weight Shift</span>
      <div className="flex flex-wrap gap-4 md:gap-8">
        {words.map((w, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <span
              key={w}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={\`text-3xl md:text-5xl tracking-tight cursor-pointer select-none transition-all duration-200 \${
                isHovered ? \`font-black scale-105 \${hoverHighlight}\` : 'font-light opacity-75'
              }\`}
            >
              {w}
            </span>
          );
        })}
      </div>
      <p className="text-xs text-neutral-500 font-mono">
        Hover individual keywords to modulate optical weight and character dilation.
      </p>
      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { VariableWeightHover, VariableWeightHoverVariant } from './index';

export function VariableWeightHoverPreview() {
  const [variant, setVariant] = useState<VariableWeightHoverVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <VariableWeightHover variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const variableWeightHoverFixtures = {};`,
    readmeCode: `# Variable Weight Hover

Interactive typography modulating font weight dynamically on cursor hover.`,
  },

  // 9. Monospace Data Headline
  {
    slug: 'monospace-data-headline',
    name: 'Monospace Data Headline',
    description: 'Technical terminal display headline pairing monospace telemetry coordinates, system tags, and blinking prompt caret.',
    categories: ['typography', 'display', 'monospace'],
    roles: ['typography', 'monospace-headline'],
    purposes: ['telemetry-header', 'developer-hero', 'terminal-prompt'],
    componentName: 'MonospaceDataHeadline',
    tags: ['typography', 'monospace', 'terminal', 'developer', 'telemetry'],
    idealFor: ['Developer tool homepages', 'CLI documentation hero sections', 'Cybersecurity dashboards'],
    avoidFor: ['Floral wedding stationery', 'Casual lifestyle blogs'],
    jobs: ['Communicate engineering rigor and machine-level precision in primary headings'],
    indexCode: `import React from 'react';

export type MonospaceDataHeadlineVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MonospaceDataHeadlineProps {
  systemTag?: string;
  commandText?: string;
  statusBadge?: string;
  variant?: MonospaceDataHeadlineVariant;
  children?: React.ReactNode;
}

export function MonospaceDataHeadline({
  systemTag = '[SYS.CORE :: 0x88F2]',
  commandText = 'tess compose --archetype=saas --strict',
  statusBadge = '200 OK • VERIFIED',
  variant = 'quiet',
  children,
}: MonospaceDataHeadlineProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const promptSymbol =
    variant === 'nocturne'
      ? 'text-cyan-400'
      : variant === 'expressive'
      ? 'text-indigo-600'
      : 'text-neutral-400';

  const badgeClass =
    variant === 'nocturne'
      ? 'bg-cyan-950/60 text-cyan-400 border-cyan-800'
      : variant === 'expressive'
      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
      : 'bg-neutral-100 text-neutral-700 border-neutral-200';

  return (
    <div className={\`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto space-y-4 font-mono transition-colors \${containerBg}\`}>
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>{systemTag}</span>
        <span className={\`px-2 py-0.5 rounded text-[10px] font-bold border \${badgeClass}\`}>
          {statusBadge}
        </span>
      </div>

      <div className="text-xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
        <span className={promptSymbol}>$</span>
        <span>{commandText}</span>
        <span className={\`w-2.5 h-6 animate-pulse \${variant === 'nocturne' ? 'bg-cyan-400' : 'bg-neutral-800 dark:bg-neutral-200'}\`} />
      </div>

      <p className="text-xs text-neutral-500 font-sans leading-relaxed">
        Terminal-grade display typography grounded in monospaced coordinate syntax.
      </p>
      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { MonospaceDataHeadline, MonospaceDataHeadlineVariant } from './index';

export function MonospaceDataHeadlinePreview() {
  const [variant, setVariant] = useState<MonospaceDataHeadlineVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <MonospaceDataHeadline variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const monospaceDataHeadlineFixtures = {};`,
    readmeCode: `# Monospace Data Headline

Terminal display headline pairing monospace telemetry coordinates with prompt caret.`,
  },

  // 10. Counter Typography
  {
    slug: 'counter-typography',
    name: 'Counter Typography',
    description: 'Massive architectural numeric display figures paired with stacked typographic unit descriptions and statistical delta markers.',
    categories: ['typography', 'display', 'counter'],
    roles: ['typography', 'counter-display'],
    purposes: ['numeric-hero', 'metric-headline', 'social-proof'],
    componentName: 'CounterTypography',
    tags: ['typography', 'counter', 'numbers', 'metrics', 'stats'],
    idealFor: ['Product milestone sections', 'Annual revenue report highlights', 'Infrastructure throughput metrics'],
    avoidFor: ['Prose article intros', 'Compact mobile menu headers'],
    jobs: ['Turn numerical evidence into monumental architectural typographic statements'],
    indexCode: `import React from 'react';

export type CounterTypographyVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CounterTypographyProps {
  value?: string;
  unit?: string;
  label?: string;
  deltaText?: string;
  variant?: CounterTypographyVariant;
  children?: React.ReactNode;
}

export function CounterTypography({
  value = '99.98',
  unit = '%',
  label = 'Deterministic system compliance across 972 canonical launch configurations',
  deltaText = '+14.2% YoY',
  variant = 'quiet',
  children,
}: CounterTypographyProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const deltaColor =
    variant === 'nocturne'
      ? 'text-cyan-400 bg-cyan-950/60 border-cyan-800'
      : variant === 'expressive'
      ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
      : 'text-neutral-700 bg-neutral-100 border-neutral-200';

  return (
    <div className={\`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto space-y-4 transition-colors \${containerBg}\`}>
      <div className="flex items-baseline gap-2">
        <span className="text-6xl md:text-8xl font-black tracking-tighter tabular-nums leading-none">
          {value}
        </span>
        <span className="text-3xl md:text-5xl font-bold text-neutral-400">
          {unit}
        </span>
        <span className={\`ml-4 text-xs font-mono font-bold px-2 py-0.5 rounded border \${deltaColor}\`}>
          {deltaText}
        </span>
      </div>

      <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 max-w-md leading-relaxed">
        {label}
      </p>
      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CounterTypography, CounterTypographyVariant } from './index';

export function CounterTypographyPreview() {
  const [variant, setVariant] = useState<CounterTypographyVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <CounterTypography variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const counterTypographyFixtures = {};`,
    readmeCode: `# Counter Typography

Massive architectural numeric display figures with stacked unit labels.`,
  },

  // 11. Vertical Label System
  {
    slug: 'vertical-label-system',
    name: 'Vertical Label System',
    description: 'Rotated 90-degree typographic rails, category anchors, and section boundary labels establishing structural coordinates.',
    categories: ['typography', 'display', 'vertical'],
    roles: ['typography', 'vertical-label'],
    purposes: ['margin-anchor', 'section-boundary', 'architectural-rail'],
    componentName: 'VerticalLabelSystem',
    tags: ['typography', 'vertical', 'rail', 'margin', 'coordinates'],
    idealFor: ['Multi-section longform layouts', 'Technical catalog boundary rails', 'Editorial magazine spreads'],
    avoidFor: ['Narrow horizontal banners', 'Mobile bottom navigation'],
    jobs: ['Ground layout regions with spatial vertical boundary markings in peripheral whitespace'],
    indexCode: `import React from 'react';

export type VerticalLabelSystemVariant = 'quiet' | 'expressive' | 'nocturne';

export interface VerticalLabelSystemProps {
  railLabel?: string;
  sectionTitle?: string;
  sectionDescription?: string;
  variant?: VerticalLabelSystemVariant;
  children?: React.ReactNode;
}

export function VerticalLabelSystem({
  railLabel = 'SEC.08 — SPECIFICATION LAYER',
  sectionTitle = 'Systematic Design Grammar',
  sectionDescription = 'Tessellate does not sell a pile of components. It composes a coherent interface system from an open resource vocabulary.',
  variant = 'quiet',
  children,
}: VerticalLabelSystemProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const railColor =
    variant === 'nocturne'
      ? 'text-cyan-400 border-[#2E3440]'
      : variant === 'expressive'
      ? 'text-indigo-600 border-[#D9D6CF]'
      : 'text-neutral-400 border-neutral-200';

  return (
    <div className={\`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto flex gap-8 items-start transition-colors \${containerBg}\`}>
      {/* 90-degree vertical rail label */}
      <div
        className={\`hidden sm:block shrink-0 pr-4 border-r font-mono text-[11px] font-bold uppercase tracking-widest \${railColor}\`}
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        {railLabel}
      </div>

      <div className="space-y-3">
        <span className="sm:hidden text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
          {railLabel}
        </span>
        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {sectionTitle}
        </h3>
        <p className="text-sm text-neutral-500 leading-relaxed max-w-xl">
          {sectionDescription}
        </p>
        {children}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { VerticalLabelSystem, VerticalLabelSystemVariant } from './index';

export function VerticalLabelSystemPreview() {
  const [variant, setVariant] = useState<VerticalLabelSystemVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <VerticalLabelSystem variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const verticalLabelSystemFixtures = {};`,
    readmeCode: `# Vertical Label System

Rotated 90-degree typographic rails and section boundary markings.`,
  },

  // 12. Text Path Arc
  {
    slug: 'text-path-arc',
    name: 'Text Path Arc',
    description: 'Vector SVG curved arc typography using textPath for circular seal emblems, status stamps, and orbital ribbons.',
    categories: ['typography', 'display', 'arc'],
    roles: ['typography', 'curved-text'],
    purposes: ['circular-badge', 'seal-emblem', 'hero-stamp'],
    componentName: 'TextPathArc',
    tags: ['typography', 'arc', 'svg', 'textpath', 'circle', 'badge'],
    idealFor: ['Certified quality seals', 'Founding year commemorative stamps', 'Rotating interactive badges'],
    avoidFor: ['Standard paragraphs', 'Search result items'],
    jobs: ['Add artisanal authenticity and circular dimensional presence to quality emblems'],
    indexCode: `import React from 'react';

export type TextPathArcVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TextPathArcProps {
  text?: string;
  centerText?: string;
  variant?: TextPathArcVariant;
  children?: React.ReactNode;
}

export function TextPathArc({
  text = 'OPEN RESOURCE VOCABULARY • ZERO RUNTIME LOCK-IN • ',
  centerText = 'MIT',
  variant = 'quiet',
  children,
}: TextPathArcProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const strokeColor =
    variant === 'nocturne'
      ? '#06b6d4'
      : variant === 'expressive'
      ? '#4f46e5'
      : '#737373';

  return (
    <div className={\`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 transition-colors \${containerBg}\`}>
      {/* SVG Circular text badge */}
      <div className="shrink-0 relative w-44 h-44 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_20s_linear_infinite]">
          <path
            id={\`circle-path-\${variant}\`}
            d="M 100, 100 m -65, 0 a 65,65 0 1,1 130,0 a 65,65 0 1,1 -130,0"
            fill="none"
            stroke={strokeColor}
            strokeWidth="0.75"
            strokeDasharray="2 2"
          />
          <text fill="currentColor" className="text-[10px] font-mono uppercase tracking-widest font-bold">
            <textPath href={\`#circle-path-\${variant}\`} startOffset="0%">
              {text}
            </textPath>
          </text>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-black font-mono tracking-tight">{centerText}</span>
          <span className="text-[8px] font-mono uppercase text-neutral-400">Certified</span>
        </div>
      </div>

      <div className="space-y-2 text-center md:text-left max-w-md">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Vector Curvature</span>
        <h4 className="text-xl font-bold tracking-tight">Curved Text Path Arc</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Circular vector textPath generating continuous orbital badges and certification stamps with zero image assets.
        </p>
        {children}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { TextPathArc, TextPathArcVariant } from './index';

export function TextPathArcPreview() {
  const [variant, setVariant] = useState<TextPathArcVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <TextPathArc variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const textPathArcFixtures = {};`,
    readmeCode: `# Text Path Arc

Vector SVG curved arc typography using textPath for circular seal emblems and badges.`,
  },
];
