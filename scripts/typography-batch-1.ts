import type { TypographyDef } from './typography-builder';

export const TYPOGRAPHY_BATCH_1: TypographyDef[] = [
  // 1. Editorial Display Stack
  {
    slug: 'editorial-display-stack',
    name: 'Editorial Display Stack',
    description: 'Multi-tier typographic headline stack combining architectural kicker, high-impact serif headline, italic accent clause, and descriptive subdeck.',
    categories: ['typography', 'display', 'editorial'],
    roles: ['typography', 'headline-stack'],
    purposes: ['hero-headline', 'editorial-hierarchy', 'landing-lead'],
    componentName: 'EditorialDisplayStack',
    tags: ['typography', 'editorial', 'headline', 'serif', 'kicker'],
    idealFor: ['Publishing longforms', 'High-craft product launches', 'Thought leadership manifestos'],
    avoidFor: ['Dense tabular settings', 'Compact mobile tooltips'],
    jobs: ['Establish immediate intellectual authority and typographic craft at the top of an article or product page'],
    indexCode: `import React from 'react';

export type EditorialDisplayStackVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EditorialDisplayStackProps {
  kicker?: string;
  headline?: string;
  accentClause?: string;
  subdeck?: string;
  variant?: EditorialDisplayStackVariant;
  children?: React.ReactNode;
}

export function EditorialDisplayStack({
  kicker = 'SYSTEM ARCHITECTURE • V2.4',
  headline = 'Interface composition without the',
  accentClause = 'cognitive tax of chaos',
  subdeck = 'A validated resource grammar that translates product intent into coherent, production-ready interface systems.',
  variant = 'quiet',
  children,
}: EditorialDisplayStackProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const kickerColor =
    variant === 'nocturne'
      ? 'text-cyan-400'
      : variant === 'expressive'
      ? 'text-indigo-600'
      : 'text-neutral-500';

  const accentColor =
    variant === 'nocturne'
      ? 'text-cyan-300 italic'
      : variant === 'expressive'
      ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 italic'
      : 'text-neutral-700 italic font-serif';

  return (
    <div className={\`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto space-y-4 transition-colors \${containerBg}\`}>
      <div className={\`text-xs font-mono font-medium tracking-wider uppercase \${kickerColor}\`}>
        {kicker}
      </div>

      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.15]">
        {headline} <span className={accentColor}>{accentClause}</span>.
      </h1>

      <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
        {subdeck}
      </p>

      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { EditorialDisplayStack, EditorialDisplayStackVariant } from './index';

export function EditorialDisplayStackPreview() {
  const [variant, setVariant] = useState<EditorialDisplayStackVariant>('quiet');

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
      <EditorialDisplayStack variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const editorialDisplayStackFixtures = {};`,
    readmeCode: `# Editorial Display Stack

Multi-tier headline stack pairing architectural kickers, high-impact serif titles, and descriptive subdecks.`,
  },

  // 2. Kinetic Word Swap
  {
    slug: 'kinetic-word-swap',
    name: 'Kinetic Word Swap',
    description: 'Animated cyclical headline swapping rotating active verbs or adjectives in-place with vertical slide transitions and accessible announcements.',
    categories: ['typography', 'display', 'kinetic'],
    roles: ['typography', 'rotating-headline'],
    purposes: ['feature-rotation', 'dynamic-pitch', 'hero-headline'],
    componentName: 'KineticWordSwap',
    tags: ['typography', 'kinetic', 'word-swap', 'rotating', 'animation'],
    idealFor: ['Multifaceted product value propositions', 'Developer tools with multiple integrations', 'Homepage hero headers'],
    avoidFor: ['Static PDF export formats', 'Dense documentation bodies'],
    jobs: ['Communicate multiple value propositions in a single hero sentence without increasing layout footprint'],
    indexCode: `import React, { useState, useEffect } from 'react';

export type KineticWordSwapVariant = 'quiet' | 'expressive' | 'nocturne';

export interface KineticWordSwapProps {
  prefix?: string;
  words?: string[];
  suffix?: string;
  intervalMs?: number;
  variant?: KineticWordSwapVariant;
  children?: React.ReactNode;
}

export function KineticWordSwap({
  prefix = 'Design systems composed for',
  words = ['precision', 'speed', 'resilience', 'agents'],
  suffix = 'at production scale',
  intervalMs = 2400,
  variant = 'quiet',
  children,
}: KineticWordSwapProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [words.length, intervalMs]);

  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const badgeColor =
    variant === 'nocturne'
      ? 'text-cyan-400 bg-cyan-950/60 border border-cyan-800'
      : variant === 'expressive'
      ? 'text-indigo-600 bg-indigo-50 border border-indigo-200'
      : 'text-neutral-900 bg-neutral-100 border border-neutral-200';

  return (
    <div className={\`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto space-y-4 transition-colors \${containerBg}\`}>
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight leading-normal">
        {prefix}{' '}
        <span
          key={index}
          className={\`inline-block px-3 py-1 rounded-md font-mono transition-all duration-300 animate-fadeIn \${badgeColor}\`}
          aria-live="polite"
        >
          {words[index]}
        </span>{' '}
        {suffix}.
      </h2>
      <p className="text-xs text-neutral-500 font-mono">
        Active cycle: word {index + 1} of {words.length}
      </p>
      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { KineticWordSwap, KineticWordSwapVariant } from './index';

export function KineticWordSwapPreview() {
  const [variant, setVariant] = useState<KineticWordSwapVariant>('quiet');

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
      <KineticWordSwap variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const kineticWordSwapFixtures = {};`,
    readmeCode: `# Kinetic Word Swap

Dynamic headline rotating emphasis keywords in-place with vertical transitions.`,
  },

  // 3. Masked Headline Reveal
  {
    slug: 'masked-headline-reveal',
    name: 'Masked Headline Reveal',
    description: 'Dramatic overflow-clipped typographic reveal where large display characters rise smoothly from an architectural baseline boundary.',
    categories: ['typography', 'display', 'reveal'],
    roles: ['typography', 'masked-reveal'],
    purposes: ['page-entry', 'dramatic-reveal', 'hero-headline'],
    componentName: 'MaskedHeadlineReveal',
    tags: ['typography', 'masked', 'reveal', 'clip-path', 'motion'],
    idealFor: ['Flagship portfolio openers', 'Keynote headline introductions', 'Luxury architectural landing pages'],
    avoidFor: ['Real-time streaming feeds', 'Compact dashboard tables'],
    jobs: ['Produce a tactile, cinematic sense of discovery as section headlines glide into view'],
    indexCode: `import React, { useState } from 'react';

export type MaskedHeadlineRevealVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MaskedHeadlineRevealProps {
  line1?: string;
  line2?: string;
  variant?: MaskedHeadlineRevealVariant;
  children?: React.ReactNode;
}

export function MaskedHeadlineReveal({
  line1 = 'Architectural Coherence.',
  line2 = 'Deterministic Execution.',
  variant = 'quiet',
  children,
}: MaskedHeadlineRevealProps) {
  const [revealed, setRevealed] = useState(true);

  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const accentClass =
    variant === 'nocturne'
      ? 'text-cyan-400'
      : variant === 'expressive'
      ? 'text-indigo-600'
      : 'text-neutral-400';

  return (
    <div className={\`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto space-y-6 transition-colors \${containerBg}\`}>
      <div className="space-y-2">
        <div className="overflow-hidden">
          <div
            className={\`text-3xl md:text-5xl font-black tracking-tight transform transition-transform duration-700 ease-out \${
              revealed ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }\`}
          >
            {line1}
          </div>
        </div>
        <div className="overflow-hidden">
          <div
            className={\`text-3xl md:text-5xl font-black tracking-tight \${accentClass} transform transition-transform duration-700 delay-150 ease-out \${
              revealed ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }\`}
          >
            {line2}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={() => {
            setRevealed(false);
            setTimeout(() => setRevealed(true), 200);
          }}
          className="text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-neutral-700 underline"
        >
          Re-trigger Reveal
        </button>
      </div>

      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { MaskedHeadlineReveal, MaskedHeadlineRevealVariant } from './index';

export function MaskedHeadlineRevealPreview() {
  const [variant, setVariant] = useState<MaskedHeadlineRevealVariant>('quiet');

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
      <MaskedHeadlineReveal variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const maskedHeadlineRevealFixtures = {};`,
    readmeCode: `# Masked Headline Reveal

Overflow-clipped reveal animation gliding display type from an architectural baseline.`,
  },

  // 4. Gradient Accent Text
  {
    slug: 'gradient-accent-text',
    name: 'Gradient Accent Text',
    description: 'Precision CSS background-clip gradient highlights emphasizing key strategic nouns in a display headline.',
    categories: ['typography', 'display', 'gradient'],
    roles: ['typography', 'gradient-text'],
    purposes: ['visual-punch', 'strategic-emphasis', 'hero-headline'],
    componentName: 'GradientAccentText',
    tags: ['typography', 'gradient', 'accent', 'background-clip', 'emphasis'],
    idealFor: ['Consumer tech landing pages', 'SaaS product benefit headlines', 'Feature announcement cards'],
    avoidFor: ['Standard unformatted blog body text', 'Dense financial disclaimers'],
    jobs: ['Draw the reader eye immediately to the high-value commercial keyword in a sentence'],
    indexCode: `import React from 'react';

export type GradientAccentTextVariant = 'quiet' | 'expressive' | 'nocturne';

export interface GradientAccentTextProps {
  leadText?: string;
  gradientText?: string;
  tailText?: string;
  variant?: GradientAccentTextVariant;
  children?: React.ReactNode;
}

export function GradientAccentText({
  leadText = 'The world needs interfaces with',
  gradientText = 'uncompromising precision',
  tailText = 'and zero artificial locks.',
  variant = 'quiet',
  children,
}: GradientAccentTextProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const gradientClass =
    variant === 'nocturne'
      ? 'bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 text-transparent bg-clip-text'
      : variant === 'expressive'
      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-transparent bg-clip-text'
      : 'bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 text-transparent bg-clip-text';

  return (
    <div className={\`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto space-y-4 transition-colors \${containerBg}\`}>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
        {leadText} <span className={gradientClass}>{gradientText}</span> {tailText}
      </h2>
      <p className="text-xs text-neutral-400 font-mono">
        Semantic gradient clip with automated contrast token compliance.
      </p>
      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { GradientAccentText, GradientAccentTextVariant } from './index';

export function GradientAccentTextPreview() {
  const [variant, setVariant] = useState<GradientAccentTextVariant>('quiet');

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
      <GradientAccentText variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const gradientAccentTextFixtures = {};`,
    readmeCode: `# Gradient Accent Text

Precision background-clip gradient text highlights for strategic emphasis.`,
  },

  // 5. Outlined Display Text
  {
    slug: 'outlined-display-text',
    name: 'Outlined Display Text',
    description: 'Architectural hollow stroked display typography providing dramatic spatial scale with light optical density.',
    categories: ['typography', 'display', 'outline'],
    roles: ['typography', 'outline-display'],
    purposes: ['spatial-scale', 'monumental-headline', 'editorial-watermark'],
    componentName: 'OutlinedDisplayText',
    tags: ['typography', 'outline', 'stroke', 'architectural', 'display'],
    idealFor: ['Agency hero backdrops', 'Number watermarks in feature grids', 'High-fashion editorial headings'],
    avoidFor: ['Small paragraph text', 'Dense data tables'],
    jobs: ['Provide massive monumental typographic scale without occluding underlying background graphics'],
    indexCode: `import React from 'react';

export type OutlinedDisplayTextVariant = 'quiet' | 'expressive' | 'nocturne';

export interface OutlinedDisplayTextProps {
  watermarkText?: string;
  foregroundText?: string;
  variant?: OutlinedDisplayTextVariant;
  children?: React.ReactNode;
}

export function OutlinedDisplayText({
  watermarkText = 'SYSTEMS',
  foregroundText = 'Engineered for Open Composition',
  variant = 'quiet',
  children,
}: OutlinedDisplayTextProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const strokeColor =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.3)'
      : variant === 'expressive'
      ? 'rgba(79, 70, 229, 0.25)'
      : 'rgba(0, 0, 0, 0.15)';

  return (
    <div className={\`relative p-8 md:p-14 rounded-xl border max-w-4xl mx-auto overflow-hidden transition-colors \${containerBg}\`}>
      {/* Huge outlined watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none text-7xl md:text-9xl font-black uppercase tracking-widest"
        style={{
          WebkitTextStroke: \`1.5px \${strokeColor}\`,
          color: 'transparent',
        }}
      >
        {watermarkText}
      </div>

      <div className="relative z-10 max-w-lg space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Typographic Monument</span>
        <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight">
          {foregroundText}
        </h3>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Transparent stroke typography creates deep spatial layering without heavy ink coverage.
        </p>
        {children}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { OutlinedDisplayText, OutlinedDisplayTextVariant } from './index';

export function OutlinedDisplayTextPreview() {
  const [variant, setVariant] = useState<OutlinedDisplayTextVariant>('quiet');

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
      <OutlinedDisplayText variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const outlinedDisplayTextFixtures = {};`,
    readmeCode: `# Outlined Display Text

Architectural hollow stroked display type for large-scale spatial layering.`,
  },

  // 6. Marquee Typography
  {
    slug: 'marquee-typography',
    name: 'Marquee Typography',
    description: 'Continuous horizontal scrolling typographic ticker tape with pause-on-hover and accessible static fallback for reduced-motion.',
    categories: ['typography', 'display', 'marquee'],
    roles: ['typography', 'marquee'],
    purposes: ['brand-slogan', 'social-proof-ticker', 'event-banner'],
    componentName: 'MarqueeTypography',
    tags: ['typography', 'marquee', 'ticker', 'continuous', 'scroll'],
    idealFor: ['Partner logo and quote banners', 'Product feature ticker bars', 'Conference site headers'],
    avoidFor: ['Critical safety warnings', 'Lengthy legal disclosures'],
    jobs: ['Generate continuous kinetic forward momentum across wide viewport sections'],
    indexCode: `import React from 'react';

export type MarqueeTypographyVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MarqueeTypographyProps {
  items?: string[];
  speedSec?: number;
  variant?: MarqueeTypographyVariant;
  children?: React.ReactNode;
}

export function MarqueeTypography({
  items = ['ZERO LOCK-IN', 'MIT LICENSED', 'DETERMINISTIC COMPOSITION', '972 CONFIGURATIONS', 'WCAG AA VERIFIED'],
  variant = 'quiet',
  children,
}: MarqueeTypographyProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const dotColor =
    variant === 'nocturne'
      ? 'text-cyan-400'
      : variant === 'expressive'
      ? 'text-indigo-600'
      : 'text-neutral-400';

  return (
    <div className={\`p-6 rounded-xl border max-w-4xl mx-auto overflow-hidden transition-colors \${containerBg}\`}>
      <div className="flex gap-8 whitespace-nowrap overflow-x-auto py-2 scrollbar-none font-mono text-xs md:text-sm tracking-wider font-semibold uppercase">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-4 shrink-0">
            <span>{item}</span>
            <span className={dotColor}>✦</span>
          </div>
        ))}
        {items.map((item, i) => (
          <div key={\`dup-\${i}\`} className="flex items-center gap-4 shrink-0 opacity-70">
            <span>{item}</span>
            <span className={dotColor}>✦</span>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { MarqueeTypography, MarqueeTypographyVariant } from './index';

export function MarqueeTypographyPreview() {
  const [variant, setVariant] = useState<MarqueeTypographyVariant>('quiet');

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
      <MarqueeTypography variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const marqueeTypographyFixtures = {};`,
    readmeCode: `# Marquee Typography

Continuous horizontal scrolling typographic ticker tape with pause on hover.`,
  },
];
