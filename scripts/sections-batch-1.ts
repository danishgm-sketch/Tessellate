import type { SectionDef } from './sections-builder.js';

export const SECTIONS_BATCH_1: SectionDef[] = [
  // 1. Editorial Hero
  {
    slug: 'editorial-hero',
    name: 'Editorial Hero',
    description: 'Restrained asymmetric typographic hero with oversized headline, deck text, and dual CTAs.',
    categories: ['sections', 'marketing', 'hero'],
    roles: ['hero', 'headline'],
    purposes: ['Product launches', 'SaaS homepages', 'Creative studio landing pages'],
    componentName: 'EditorialHero',
    tags: ['editorial-hero', 'hero', 'typography', 'marketing'],
    idealFor: ['High-craft developer and design products with strong editorial voice'],
    avoidFor: ['Complex multi-form lead capture screens'],
    jobs: ['Deliver commanding brand proposition and invite immediate action'],
    indexCode: `import React from 'react';

export type EditorialHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EditorialHeroProps {
  variant?: EditorialHeroVariant;
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  primaryCta?: { label: string; href?: string; onClick?: () => void };
  secondaryCta?: { label: string; href?: string; onClick?: () => void };
  note?: string;
}

export function EditorialHero({
  variant = 'quiet',
  eyebrow = 'Announcing Version 2.0',
  headline = 'Engineered for deliberate craft and structural speed.',
  subheadline = 'Compose resilient interfaces from a unified design vocabulary. Uncompromising typography, zero lock-in, and sub-millisecond execution.',
  primaryCta = { label: 'Explore Catalogue' },
  secondaryCta = { label: 'Read Architecture' },
  note = 'Free & open core • No credit card required',
}: EditorialHeroProps) {
  let container = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let eyebrowStyle = 'text-neutral-600 bg-neutral-200/60 border-neutral-300';
  let primaryBtn = 'bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-neutral-900';
  let secondaryBtn = 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50';
  let noteColor = 'text-neutral-500';

  if (variant === 'expressive') {
    container = 'bg-gradient-to-b from-blue-50/40 via-white to-amber-50/20 text-neutral-950 border-[#D9D6CF]';
    eyebrowStyle = 'text-[#2547E8] bg-blue-100/70 border-blue-200 font-semibold';
    primaryBtn = 'bg-[#2547E8] text-white hover:bg-[#1B35B4] shadow-md hover:shadow-lg focus-visible:ring-[#2547E8]';
    secondaryBtn = 'bg-white text-neutral-900 border-neutral-300 hover:border-neutral-400';
    noteColor = 'text-neutral-600';
  } else if (variant === 'nocturne') {
    container = 'bg-[#0B0D10] text-white border-[#2E3440]';
    eyebrowStyle = 'text-cyan-400 bg-cyan-950/40 border-cyan-800/60';
    primaryBtn = 'bg-cyan-500 text-black hover:bg-cyan-400 font-medium focus-visible:ring-cyan-400';
    secondaryBtn = 'bg-[#151921] text-neutral-200 border-[#2E3440] hover:bg-[#1C222E]';
    noteColor = 'text-neutral-400';
  }

  return (
    <section className={\`relative w-full py-24 sm:py-32 px-6 sm:px-12 border-b transition-colors \${container}\`}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        {eyebrow && (
          <span className={\`inline-flex items-center gap-2 px-3 py-1 text-xs tracking-wide rounded-full border mb-8 transition-colors \${eyebrowStyle}\`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {eyebrow}
          </span>
        )}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] max-w-3xl mb-8">
          {headline}
        </h1>
        <p className="text-lg sm:text-xl text-balance max-w-2xl mb-10 leading-relaxed opacity-85">
          {subheadline}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          <button
            type="button"
            onClick={primaryCta.onClick}
            className={\`px-6 py-3 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 \${primaryBtn}\`}
          >
            {primaryCta.label}
          </button>
          <button
            type="button"
            onClick={secondaryCta.onClick}
            className={\`px-6 py-3 rounded-lg text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 \${secondaryBtn}\`}
          >
            {secondaryCta.label}
          </button>
        </div>
        {note && <p className={\`text-xs \${noteColor}\`}>{note}</p>}
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { EditorialHero, EditorialHeroVariant } from './index.js';

export function EditorialHeroPreview() {
  const [variant, setVariant] = useState<EditorialHeroVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Editorial Hero Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as EditorialHeroVariant[]).map((v) => (
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
      <EditorialHero variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const editorialHeroFixtures = {
  quiet: {
    eyebrow: 'System Blueprint 01',
    headline: 'High-density computational tooling for modern software teams.',
    subheadline: 'Pure React primitives tuned for verifiable performance and tactile clarity.',
  },
  expressive: {
    eyebrow: 'Dynamic Engine',
    headline: 'Unmatched typographic expression with instant reactive responsiveness.',
    subheadline: 'Craft cinematic user journeys that bridge human intent and agentic generation.',
  },
  nocturne: {
    eyebrow: 'Terminal Precision',
    headline: 'Obsidian dark themes tailored for mission-critical operations.',
    subheadline: 'Razor-sharp contrast ratios and zero-latency hardware acceleration.',
  },
};`,
    readmeCode: `# Editorial Hero

Commanding typographic header section designed for high-craft tech and design products.

## Features
- Fully responsive typographic scales from 360px up to ultra-wide displays.
- Three curated visual directions: Quiet, Expressive, and Nocturne.
- Accessible heading hierarchy with WCAG AA contrast compliance.
- Support for dual interactive calls-to-action and trust footnotes.`,
  },

  // 2. Product Screenshot Hero
  {
    slug: 'product-screenshot-hero',
    name: 'Product Screenshot Hero',
    description: 'Centered headline with perspective tilted application screenshot frame and browser chrome.',
    categories: ['sections', 'marketing', 'hero'],
    roles: ['hero', 'showcase'],
    purposes: ['SaaS marketing', 'Developer tool showcase', 'Web app launch'],
    componentName: 'ProductScreenshotHero',
    tags: ['product-screenshot-hero', 'hero', 'screenshot', 'marketing'],
    idealFor: ['Software products demonstrating a rich UI or desktop application'],
    avoidFor: ['Content-first editorial magazines'],
    jobs: ['Preview product interface instantly while communicating core value proposition'],
    indexCode: `import React from 'react';

export type ProductScreenshotHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProductScreenshotHeroProps {
  variant?: ProductScreenshotHeroVariant;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
}

export function ProductScreenshotHero({
  variant = 'quiet',
  headline = 'The interface workbench for discerning product teams.',
  subheadline = 'Inspect Design DNA, mutate token systems in real time, and export directly to clean React and Tailwind code.',
  ctaText = 'Start Building Free',
}: ProductScreenshotHeroProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let frame = 'bg-neutral-50 border-neutral-300 shadow-xl';
  let chrome = 'bg-neutral-100 border-b border-neutral-200 text-neutral-500';
  let btn = 'bg-neutral-900 text-white hover:bg-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-b from-blue-50/50 via-white to-neutral-50 text-neutral-950 border-[#D9D6CF]';
    frame = 'bg-white border-blue-200/80 shadow-2xl ring-1 ring-blue-500/10';
    chrome = 'bg-blue-50/60 border-b border-blue-100 text-blue-900';
    btn = 'bg-[#2547E8] text-white hover:bg-[#1B35B4] shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    frame = 'bg-[#151921] border-[#2E3440] shadow-2xl shadow-cyan-950/20';
    chrome = 'bg-[#0E1217] border-b border-[#2E3440] text-neutral-400';
    btn = 'bg-cyan-500 text-black hover:bg-cyan-400 font-medium';
  }

  return (
    <section className={\`relative w-full pt-20 pb-28 px-6 sm:px-12 border-b overflow-hidden transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto text-center flex flex-col items-center mb-16">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl mb-6">
          {headline}
        </h1>
        <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mb-8 leading-relaxed">
          {subheadline}
        </p>
        <button
          type="button"
          className={\`px-6 py-3 rounded-lg text-sm font-medium transition-all \${btn}\`}
        >
          {ctaText}
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className={\`rounded-xl border overflow-hidden transition-all \${frame}\`}>
          <div className={\`px-4 py-3 flex items-center justify-between text-xs \${chrome}\`}>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <span className="font-mono text-[11px] opacity-80">https://workbench.tessellate.design</span>
            <div className="w-10" />
          </div>
          <div className="p-8 sm:p-12 min-h-[320px] flex flex-col justify-center items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-current opacity-10 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-wide">Interactive Canvas & Manifest Tree</span>
            <span className="text-xs opacity-70 max-w-md">324 validated resources loaded into memory. Real-time token synchronization active.</span>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ProductScreenshotHero, ProductScreenshotHeroVariant } from './index.js';

export function ProductScreenshotHeroPreview() {
  const [variant, setVariant] = useState<ProductScreenshotHeroVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Product Screenshot Hero Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as ProductScreenshotHeroVariant[]).map((v) => (
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
      <ProductScreenshotHero variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const productScreenshotHeroFixtures = {
  headline: 'The definitive interface workbench for engineers.',
  subheadline: 'Construct complete UI architectures with audited performance.',
};`,
    readmeCode: `# Product Screenshot Hero

Showcases software UI with authentic browser chrome and responsive perspective containment.`,
  },

  // 3. Split Product Hero
  {
    slug: 'split-product-hero',
    name: 'Split Product Hero',
    description: '50/50 split layout with narrative copy on left and live interactive widget on right.',
    categories: ['sections', 'marketing', 'hero'],
    roles: ['hero', 'split-view'],
    purposes: ['SaaS feature launches', 'Conversion-focused homepages'],
    componentName: 'SplitProductHero',
    tags: ['split-product-hero', 'hero', 'split', 'marketing'],
    idealFor: ['Product introductions requiring side-by-side copy and tangible interaction'],
    avoidFor: ['Broad full-width video backdrops'],
    jobs: ['Explain benefit while allowing instant tactile verification'],
    indexCode: `import React, { useState } from 'react';

export type SplitProductHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SplitProductHeroProps {
  variant?: SplitProductHeroVariant;
  badge?: string;
  headline?: string;
  description?: string;
}

export function SplitProductHero({
  variant = 'quiet',
  badge = 'Validated Composability',
  headline = 'Mutate layout architecture with zero bundle penalty.',
  description = 'Every component conforms to deterministic DNA schemas, guaranteeing visual harmony without manual CSS overrides.',
}: SplitProductHeroProps) {
  const [activeTab, setActiveTab] = useState<'tokens' | 'manifest' | 'output'>('tokens');

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200 shadow-sm';
  let tabActive = 'bg-neutral-900 text-white';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-br from-white via-blue-50/30 to-amber-50/20 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-lg';
    tabActive = 'bg-[#2547E8] text-white';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440] shadow-xl';
    tabActive = 'bg-cyan-500 text-black font-semibold';
  }

  return (
    <section className={\`relative w-full py-20 sm:py-28 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="flex flex-col items-start">
          <span className="text-xs uppercase tracking-widest font-semibold text-neutral-500 mb-4">{badge}</span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">{headline}</h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">{description}</p>
          <div className="flex items-center gap-4">
            <button type="button" className="px-5 py-2.5 rounded-lg text-sm font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity">
              Launch Sandbox
            </button>
            <button type="button" className="px-5 py-2.5 rounded-lg text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              Documentation
            </button>
          </div>
        </div>

        <div className={\`p-6 rounded-2xl border transition-all \${card}\`}>
          <div className="flex items-center justify-between border-b pb-4 mb-6 text-xs">
            <span className="font-mono font-semibold">Tessellate Engine</span>
            <div className="flex gap-1.5">
              {(['tokens', 'manifest', 'output'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={\`px-3 py-1 rounded capitalize text-xs transition-colors \${
                    activeTab === tab ? tabActive : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }\`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="font-mono text-xs p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900/80 leading-relaxed overflow-x-auto min-h-[160px]">
            {activeTab === 'tokens' && (
              <pre className="text-emerald-600 dark:text-emerald-400">
                {\`{
  "theme": "nocturne",
  "density": 85,
  "curvature": "sharp",
  "tokens": 42
}\`}
              </pre>
            )}
            {activeTab === 'manifest' && (
              <pre className="text-blue-600 dark:text-blue-400">
                {\`{
  "resourceType": "section",
  "status": "verified",
  "quality": 96
}\`}
              </pre>
            )}
            {activeTab === 'output' && (
              <pre className="text-purple-600 dark:text-purple-400">
                {\`// Direct React + Tailwind export
export function RenderedSection() {
  return <div className="p-4" />
}\`}
              </pre>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { SplitProductHero, SplitProductHeroVariant } from './index.js';

export function SplitProductHeroPreview() {
  const [variant, setVariant] = useState<SplitProductHeroVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Split Product Hero Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as SplitProductHeroVariant[]).map((v) => (
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
      <SplitProductHero variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const splitProductHeroFixtures = {
  headline: 'Mutate layout architecture with zero bundle penalty.',
  description: 'Deterministic DNA schema compliance guarantees clean composition.',
};`,
    readmeCode: `# Split Product Hero

Balanced two-column hero uniting persuasive narrative with interactive token inspection.`,
  },

  // 4. Video Hero
  {
    slug: 'video-hero',
    name: 'Video Hero',
    description: 'Cinematic header with ambient video background placeholder, gradient veil, and play trigger.',
    categories: ['sections', 'marketing', 'hero'],
    roles: ['hero', 'media'],
    purposes: ['Product launches', 'Showreels', 'Design agency portfolios'],
    componentName: 'VideoHero',
    tags: ['video-hero', 'hero', 'video', 'media', 'marketing'],
    idealFor: ['Visually driven product showcases with motion showreels'],
    avoidFor: ['Low-bandwidth offline data terminals'],
    jobs: ['Draw users into high-impact audiovisual presentation of the platform'],
    indexCode: `import React, { useState } from 'react';

export type VideoHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface VideoHeroProps {
  variant?: VideoHeroVariant;
  headline?: string;
  subheadline?: string;
  videoDuration?: string;
}

export function VideoHero({
  variant = 'quiet',
  headline = 'See the composition engine in continuous motion.',
  subheadline = 'Watch how arbitrary manifests transform into production-ready React applications with zero manual wiring.',
  videoDuration = '1:45',
}: VideoHeroProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  let bg = 'bg-neutral-900 text-white';
  let badgeColor = 'bg-white/10 text-white border-white/20';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-b from-[#1B35B4] via-[#0B1536] to-black text-white';
    badgeColor = 'bg-blue-500/20 text-blue-200 border-blue-400/30';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#08090C] text-white';
    badgeColor = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
  }

  return (
    <section className={\`relative w-full py-24 sm:py-32 px-6 sm:px-12 overflow-hidden transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center relative z-10">
        <span className={\`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border mb-6 \${badgeColor}\`}>
          <span>SHOWREEL</span>
          <span>•</span>
          <span>{videoDuration}</span>
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl mb-6">{headline}</h1>
        <p className="text-lg text-neutral-300 max-w-2xl mb-10 leading-relaxed">{subheadline}</p>

        <div className="relative w-full max-w-3xl aspect-video rounded-2xl border border-white/10 overflow-hidden bg-black/60 flex items-center justify-center group shadow-2xl">
          <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/80" />
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause video showreel' : 'Play video showreel'}
            className="relative z-20 w-16 h-16 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <span className="absolute bottom-4 left-6 z-20 text-xs font-mono text-white/70">
            {isPlaying ? 'Playing High-Fidelity Showreel (4K)' : 'Click to launch preview playback'}
          </span>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { VideoHero, VideoHeroVariant } from './index.js';

export function VideoHeroPreview() {
  const [variant, setVariant] = useState<VideoHeroVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Video Hero Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as VideoHeroVariant[]).map((v) => (
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
      <VideoHero variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const videoHeroFixtures = {
  headline: 'See the composition engine in continuous motion.',
  videoDuration: '1:45',
};`,
    readmeCode: `# Video Hero

Ambient media showcase hero with accessible play/pause states and WCAG AA contrast.`,
  },

  // 5. Cinematic Media Hero
  {
    slug: 'cinematic-media-hero',
    name: 'Cinematic Media Hero',
    description: 'Full-bleed immersive atmospheric hero with dark contrast, floating badge, and headline.',
    categories: ['sections', 'marketing', 'hero'],
    roles: ['hero', 'cinematic'],
    purposes: ['Flagship product drops', 'Next-gen enterprise software'],
    componentName: 'CinematicMediaHero',
    tags: ['cinematic-media-hero', 'hero', 'cinematic', 'marketing'],
    idealFor: ['Immersive dark mode products and premium brand statements'],
    avoidFor: ['Light editorial blogs'],
    jobs: ['Create theatrical, monumental first impressions'],
    indexCode: `import React from 'react';

export type CinematicMediaHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CinematicMediaHeroProps {
  variant?: CinematicMediaHeroVariant;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function CinematicMediaHero({
  variant = 'quiet',
  eyebrow = 'CHAPTER ONE // GENESIS',
  title = 'The Architecture of Absolute Coherence',
  subtitle = 'A unified resource universe where components, layouts, and Design DNA behave as mathematical invariants.',
}: CinematicMediaHeroProps) {
  let glow = 'from-neutral-700/20 via-transparent to-transparent';
  let accent = 'text-neutral-400';

  if (variant === 'expressive') {
    glow = 'from-blue-600/30 via-indigo-900/20 to-transparent';
    accent = 'text-blue-400 font-semibold';
  } else if (variant === 'nocturne') {
    glow = 'from-cyan-500/20 via-blue-950/20 to-transparent';
    accent = 'text-cyan-400 font-mono';
  }

  return (
    <section className="relative w-full py-32 sm:py-44 px-6 sm:px-12 bg-black text-white overflow-hidden border-b border-neutral-800">
      <div className={\`absolute inset-0 bg-radial \${glow} pointer-events-none\`} />
      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        <span className={\`text-xs tracking-[0.25em] mb-8 uppercase \${accent}\`}>{eyebrow}</span>
        <h1 className="text-4xl sm:text-7xl font-bold tracking-tighter leading-[1.05] mb-8 text-balance">
          {title}
        </h1>
        <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mb-12 leading-relaxed">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button type="button" className="px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors">
            Enter Platform
          </button>
          <button type="button" className="px-8 py-3.5 rounded-full border border-neutral-700 text-white font-medium text-sm hover:bg-neutral-900 transition-colors">
            Read Whitepaper
          </button>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CinematicMediaHero, CinematicMediaHeroVariant } from './index.js';

export function CinematicMediaHeroPreview() {
  const [variant, setVariant] = useState<CinematicMediaHeroVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Cinematic Media Hero Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as CinematicMediaHeroVariant[]).map((v) => (
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
      <CinematicMediaHero variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const cinematicMediaHeroFixtures = {
  title: 'The Architecture of Absolute Coherence',
  subtitle: 'Unified design vocabulary engineered for precision.',
};`,
    readmeCode: `# Cinematic Media Hero

Full-bleed atmospheric presentation section with subtle radial illumination.`,
  },

  // 6. Interactive Demo Hero
  {
    slug: 'interactive-demo-hero',
    name: 'Interactive Demo Hero',
    description: 'Hero with inline interactive tabbed preview allowing immediate hands-on feature exploration.',
    categories: ['sections', 'marketing', 'hero'],
    roles: ['hero', 'interactive'],
    purposes: ['Product walkthroughs', 'Developer conversion', 'Interactive demos'],
    componentName: 'InteractiveDemoHero',
    tags: ['interactive-demo-hero', 'hero', 'demo', 'interactive'],
    idealFor: ['Technical tools where users want to try the product before signing up'],
    avoidFor: ['Passive brochure pages'],
    jobs: ['Deliver instantaneous proof of capability through interactive widgets'],
    indexCode: `import React, { useState } from 'react';

export type InteractiveDemoHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface InteractiveDemoHeroProps {
  variant?: InteractiveDemoHeroVariant;
  headline?: string;
  subheadline?: string;
}

export function InteractiveDemoHero({
  variant = 'quiet',
  headline = 'Interactive composition at your fingertips.',
  subheadline = 'Toggle tokens directly in this hero to observe real-time DOM normalisation.',
}: InteractiveDemoHeroProps) {
  const [scale, setScale] = useState<'compact' | 'normal' | 'relaxed'>('normal');
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>('light');

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let demoCard = 'bg-white border-neutral-200 shadow-md';

  if (variant === 'expressive') {
    bg = 'bg-blue-50/30 text-neutral-950 border-[#D9D6CF]';
    demoCard = 'bg-white border-blue-200 shadow-xl';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    demoCard = 'bg-[#151921] border-[#2E3440] shadow-2xl';
  }

  return (
    <section className={\`relative w-full py-20 sm:py-28 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">{headline}</h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">{subheadline}</p>
      </div>

      <div className={\`max-w-3xl mx-auto rounded-2xl border p-6 sm:p-8 transition-all \${demoCard}\`}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6 mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span>Density:</span>
            {(['compact', 'normal', 'relaxed'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScale(s)}
                className={\`px-2.5 py-1 rounded capitalize transition-colors \${
                  scale === s ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800'
                }\`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span>Mode:</span>
            <button
              type="button"
              onClick={() => setActiveTheme(activeTheme === 'light' ? 'dark' : 'light')}
              className="px-3 py-1 rounded bg-neutral-100 dark:bg-neutral-800 capitalize"
            >
              {activeTheme}
            </button>
          </div>
        </div>

        <div className={\`rounded-xl border p-6 transition-all \${
          activeTheme === 'dark' ? 'bg-[#0B0D10] text-white border-neutral-800' : 'bg-neutral-50 text-neutral-900 border-neutral-200'
        } \${scale === 'compact' ? 'space-y-2' : scale === 'relaxed' ? 'space-y-6' : 'space-y-4'}\`}>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">Preview Workspace</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono">200 OK</span>
          </div>
          <p className="text-xs opacity-75">
            Active configuration: {scale} scale across {activeTheme} theme tokens. Zero styling leakage detected.
          </p>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { InteractiveDemoHero, InteractiveDemoHeroVariant } from './index.js';

export function InteractiveDemoHeroPreview() {
  const [variant, setVariant] = useState<InteractiveDemoHeroVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Interactive Demo Hero Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as InteractiveDemoHeroVariant[]).map((v) => (
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
      <InteractiveDemoHero variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const interactiveDemoHeroFixtures = {
  headline: 'Interactive composition at your fingertips.',
};`,
    readmeCode: `# Interactive Demo Hero

Hero with embedded stateful preview allowing visitors to manipulate tokens and inspect output immediately.`,
  },

  // 7. Search-First Hero
  {
    slug: 'search-first-hero',
    name: 'Search-First Hero',
    description: 'Command-bar-centric hero with prominent search input, trending suggestions, and category chips.',
    categories: ['sections', 'marketing', 'hero'],
    roles: ['hero', 'search'],
    purposes: ['Resource catalogues', 'Documentation hubs', 'Marketplaces'],
    componentName: 'SearchFirstHero',
    tags: ['search-first-hero', 'hero', 'search', 'marketing'],
    idealFor: ['Large repositories, component registries, and documentation portals'],
    avoidFor: ['Single-product narrative landing pages'],
    jobs: ['Route users directly to what they need with instant query matching'],
    indexCode: `import React, { useState } from 'react';

export type SearchFirstHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SearchFirstHeroProps {
  variant?: SearchFirstHeroVariant;
  headline?: string;
  placeholder?: string;
  suggestions?: string[];
}

export function SearchFirstHero({
  variant = 'quiet',
  headline = 'Search 324 validated resources and design blueprints.',
  placeholder = 'Search components, shells, DNA tokens, or blueprints...',
  suggestions = ['Editorial Hero', 'Pricing Table', 'Data Grid', 'Nocturne Theme', 'Command Menu'],
}: SearchFirstHeroProps) {
  const [query, setQuery] = useState('');

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let inputBorder = 'border-neutral-300 focus-within:border-neutral-900 focus-within:ring-neutral-900';
  let chip = 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-b from-blue-50/40 via-white to-neutral-50 text-neutral-950 border-[#D9D6CF]';
    inputBorder = 'border-blue-200 focus-within:border-[#2547E8] focus-within:ring-[#2547E8] shadow-lg';
    chip = 'bg-blue-50 text-blue-800 hover:bg-blue-100';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    inputBorder = 'border-[#2E3440] bg-[#151921] focus-within:border-cyan-400 focus-within:ring-cyan-400 shadow-xl';
    chip = 'bg-[#151921] text-neutral-300 hover:bg-[#1E2430] border border-[#2E3440]';
  }

  return (
    <section className={\`relative w-full py-24 sm:py-32 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-8 max-w-2xl">{headline}</h1>

        <div className={\`w-full max-w-2xl flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ring-1 ring-transparent \${inputBorder}\`}>
          <svg className="w-5 h-5 opacity-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label="Search resources"
            className="w-full bg-transparent text-sm sm:text-base outline-none placeholder:text-neutral-400"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            ⌘K
          </kbd>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-xs">
          <span className="opacity-60">Trending:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className={\`px-3 py-1 rounded-full transition-colors \${chip}\`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { SearchFirstHero, SearchFirstHeroVariant } from './index.js';

export function SearchFirstHeroPreview() {
  const [variant, setVariant] = useState<SearchFirstHeroVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Search-First Hero Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as SearchFirstHeroVariant[]).map((v) => (
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
      <SearchFirstHero variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const searchFirstHeroFixtures = {
  headline: 'Find any primitive, block, or pattern instantly.',
};`,
    readmeCode: `# Search-First Hero

Primary exploration hero designed for extensive component registries and documentation portals.`,
  },

  // 8. AI Prompt Hero
  {
    slug: 'ai-prompt-hero',
    name: 'AI Prompt Hero',
    description: 'Conversational prompt bar with preset suggestions, model picker pill, and generate CTA.',
    categories: ['sections', 'marketing', 'hero'],
    roles: ['hero', 'ai'],
    purposes: ['AI products', 'Generative UI tools', 'Autonomous developer engines'],
    componentName: 'AiPromptHero',
    tags: ['ai-prompt-hero', 'hero', 'ai', 'prompt', 'marketing'],
    idealFor: ['Next-gen AI assistant tools and generative software platforms'],
    avoidFor: ['Standard brochureware sites'],
    jobs: ['Prompt the user to express natural-language intent for interface generation'],
    indexCode: `import React, { useState } from 'react';

export type AiPromptHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AiPromptHeroProps {
  variant?: AiPromptHeroVariant;
  headline?: string;
  subheadline?: string;
}

export function AiPromptHero({
  variant = 'quiet',
  headline = 'Describe your product. Generate the entire interface system.',
  subheadline = 'Tessellate pairs natural language intent with deterministic layout grammars and accessible schemas.',
}: AiPromptHeroProps) {
  const [prompt, setPrompt] = useState('');
  const presets = [
    'A high-density trading terminal with Nocturne styling',
    'A modern B2B SaaS analytics dashboard with 3-tier pricing',
    'A minimalist developer documentation portal',
  ];

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let box = 'bg-white border-neutral-300 shadow-sm';
  let btn = 'bg-neutral-900 text-white hover:bg-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-b from-blue-50/50 via-white to-purple-50/30 text-neutral-950 border-[#D9D6CF]';
    box = 'bg-white border-blue-200 shadow-xl ring-1 ring-blue-500/10';
    btn = 'bg-[#2547E8] text-white hover:bg-[#1B35B4] shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    box = 'bg-[#151921] border-[#2E3440] shadow-2xl';
    btn = 'bg-cyan-500 text-black hover:bg-cyan-400 font-medium';
  }

  return (
    <section className={\`relative w-full py-24 sm:py-32 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">{headline}</h1>
        <p className="text-base sm:text-lg opacity-75 max-w-xl mb-10">{subheadline}</p>

        <div className={\`w-full rounded-2xl border p-4 text-left transition-all \${box}\`}>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g. Create a healthcare admin console with patient timeline and audit log..."
            className="w-full bg-transparent text-sm sm:text-base outline-none resize-none placeholder:text-neutral-400"
          />
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-mono opacity-60">Engine: Gemini 2.5 Flash / BYO Key</span>
            <button
              type="button"
              className={\`px-4 py-2 rounded-lg text-xs font-semibold transition-all \${btn}\`}
            >
              Synthesize Blueprint →
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6 justify-center text-xs">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPrompt(p)}
              className="px-3 py-1 rounded-full bg-neutral-200/60 dark:bg-neutral-800 opacity-80 hover:opacity-100 transition-opacity truncate max-w-xs"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AiPromptHero, AiPromptHeroVariant } from './index.js';

export function AiPromptHeroPreview() {
  const [variant, setVariant] = useState<AiPromptHeroVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">AI Prompt Hero Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as AiPromptHeroVariant[]).map((v) => (
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
      <AiPromptHero variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const aiPromptHeroFixtures = {
  headline: 'Describe your product. Generate the entire interface system.',
};`,
    readmeCode: `# AI Prompt Hero

Natural-language generative interface prompt section with multi-line input and instant presets.`,
  },

  // 9. Code Hero
  {
    slug: 'code-hero',
    name: 'Code Hero',
    description: 'Developer-focused hero with syntax-highlighted editor preview, copy button, and package manager tabs.',
    categories: ['sections', 'marketing', 'hero'],
    roles: ['hero', 'developer'],
    purposes: ['Developer tools', 'CLI tools', 'Open-source libraries'],
    componentName: 'CodeHero',
    tags: ['code-hero', 'hero', 'code', 'developer', 'marketing'],
    idealFor: ['Technical founders, engineering tools, and open-source packages'],
    avoidFor: ['General consumer products'],
    jobs: ['Show code purity and rapid install command upfront'],
    indexCode: `import React, { useState } from 'react';

export type CodeHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CodeHeroProps {
  variant?: CodeHeroVariant;
  headline?: string;
  installCommand?: string;
}

export function CodeHero({
  variant = 'quiet',
  headline = 'Install cleanly. Zero lock-in. Full TypeScript source.',
  installCommand = 'npx @tessellate/cli add editorial-hero',
}: CodeHeroProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let term = 'bg-[#18181B] text-neutral-100 border-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-b from-blue-50/40 via-white to-neutral-50 text-neutral-950 border-[#D9D6CF]';
    term = 'bg-[#0E1528] text-blue-100 border-blue-900/40 shadow-xl';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    term = 'bg-[#12161F] text-cyan-50 border-[#2E3440] shadow-2xl';
  }

  return (
    <section className={\`relative w-full py-24 sm:py-32 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-8 max-w-2xl">{headline}</h1>

        <div className={\`w-full max-w-2xl rounded-xl border p-4 font-mono text-xs sm:text-sm text-left shadow-lg \${term}\`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 text-xs opacity-70">
            <span>Terminal</span>
            <button
              type="button"
              onClick={handleCopy}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">$</span>
            <span>{installCommand}</span>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CodeHero, CodeHeroVariant } from './index.js';

export function CodeHeroPreview() {
  const [variant, setVariant] = useState<CodeHeroVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Code Hero Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as CodeHeroVariant[]).map((v) => (
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
      <CodeHero variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const codeHeroFixtures = {
  installCommand: 'npx @tessellate/cli add editorial-hero',
};`,
    readmeCode: `# Code Hero

Terminal-styled developer hero prioritizing one-line package installation.`,
  },

  // 10. Data Hero
  {
    slug: 'data-hero',
    name: 'Data Hero',
    description: 'Financial/analytical hero featuring live sparklines, streaming metric tickers, and status badges.',
    categories: ['sections', 'marketing', 'hero'],
    roles: ['hero', 'data'],
    purposes: ['Fintech platforms', 'Trading terminals', 'Telemetry portals'],
    componentName: 'DataHero',
    tags: ['data-hero', 'hero', 'data', 'finance', 'marketing'],
    idealFor: ['Data-intensive SaaS and quantitative products'],
    avoidFor: ['Content marketing blogs'],
    jobs: ['Communicate analytical density and real-time computation speeds'],
    indexCode: `import React from 'react';

export type DataHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DataHeroProps {
  variant?: DataHeroVariant;
  headline?: string;
  metrics?: Array<{ label: string; value: string; change: string }>;
}

export function DataHero({
  variant = 'quiet',
  headline = 'Real-time telemetry and programmatic precision.',
  metrics = [
    { label: 'Ingestion Rate', value: '4.2M req/s', change: '+12.4%' },
    { label: 'P99 Latency', value: '1.4 ms', change: '-8.1%' },
    { label: 'Memory Footprint', value: '18.2 MB', change: '-45.0%' },
  ],
}: DataHeroProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/40 border-blue-100 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440] shadow-lg';
  }

  return (
    <section className={\`relative w-full py-20 sm:py-28 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto text-center flex flex-col items-center mb-12">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6 max-w-2xl">{headline}</h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-xl">
          Engineered for mission-critical dashboards where microsecond delays are unacceptable.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        {metrics.map((m) => (
          <div key={m.label} className={\`p-6 rounded-xl border flex flex-col items-start \${card}\`}>
            <span className="text-xs uppercase tracking-wider text-neutral-500 mb-2 font-mono">{m.label}</span>
            <span className="text-3xl font-bold font-mono tracking-tight mb-2">{m.value}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{m.change} vs baseline</span>
          </div>
        ))}
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { DataHero, DataHeroVariant } from './index.js';

export function DataHeroPreview() {
  const [variant, setVariant] = useState<DataHeroVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Data Hero Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as DataHeroVariant[]).map((v) => (
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
      <DataHero variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const dataHeroFixtures = {
  headline: 'Real-time telemetry and programmatic precision.',
};`,
    readmeCode: `# Data Hero

Financial and quantitative hero section emphasizing live throughput metrics and low latency.`,
  },

  // 11. Minimal Statement Hero
  {
    slug: 'minimal-statement-hero',
    name: 'Minimal Statement Hero',
    description: 'Ultra-bold typography-only manifesto statement hero with maximum negative space.',
    categories: ['sections', 'marketing', 'hero'],
    roles: ['hero', 'statement'],
    purposes: ['Design manifestos', 'Brand relaunches', 'Creative agency websites'],
    componentName: 'MinimalStatementHero',
    tags: ['minimal-statement-hero', 'hero', 'manifesto', 'typography'],
    idealFor: ['Uncompromising design systems that rely on typographic purity'],
    avoidFor: ['Complex multi-tier feature offerings'],
    jobs: ['Express a strong philosophical stance through typographic scale'],
    indexCode: `import React from 'react';

export type MinimalStatementHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MinimalStatementHeroProps {
  variant?: MinimalStatementHeroVariant;
  statement?: string;
  author?: string;
}

export function MinimalStatementHero({
  variant = 'quiet',
  statement = 'Software is not a collection of parts. It is a single coherent gesture.',
  author = 'The Tessellate Principles',
}: MinimalStatementHeroProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-950 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <section className={\`relative w-full py-32 sm:py-48 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto">
        <blockquote className="text-3xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-8">
          "{statement}"
        </blockquote>
        <cite className="text-sm sm:text-base font-mono not-italic opacity-60">
          — {author}
        </cite>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { MinimalStatementHero, MinimalStatementHeroVariant } from './index.js';

export function MinimalStatementHeroPreview() {
  const [variant, setVariant] = useState<MinimalStatementHeroVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Minimal Statement Hero Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as MinimalStatementHeroVariant[]).map((v) => (
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
      <MinimalStatementHero variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const minimalStatementHeroFixtures = {
  statement: 'Software is not a collection of parts. It is a single coherent gesture.',
};`,
    readmeCode: `# Minimal Statement Hero

Oversized typography statement hero maximizing negative space and editorial gravitas.`,
  },

  // 12. Social Proof Hero
  {
    slug: 'social-proof-hero',
    name: 'Social Proof Hero',
    description: 'Headline anchored by trust metrics, customer avatar stack, and star review rating strip.',
    categories: ['sections', 'marketing', 'hero'],
    roles: ['hero', 'social-proof'],
    purposes: ['Consumer SaaS', 'Growth landing pages', 'High-conversion funnels'],
    componentName: 'SocialProofHero',
    tags: ['social-proof-hero', 'hero', 'social-proof', 'trust'],
    idealFor: ['Conversion-critical landing pages requiring immediate user validation'],
    avoidFor: ['Stealth enterprise landing pages'],
    jobs: ['Build instant trust with verified customer counts and ratings'],
    indexCode: `import React from 'react';

export type SocialProofHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SocialProofHeroProps {
  variant?: SocialProofHeroVariant;
  headline?: string;
  subheadline?: string;
  userCount?: string;
  rating?: string;
}

export function SocialProofHero({
  variant = 'quiet',
  headline = 'Trusted by 40,000+ engineers building modern web applications.',
  subheadline = 'From early-stage startups to publicly traded technology companies, Tessellate powers reliable UI architecture.',
  userCount = '42,800+ teams',
  rating = '4.9/5 from 1,200 reviews',
}: SocialProofHeroProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let badge = 'bg-neutral-100 text-neutral-700';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-b from-blue-50/50 via-white to-neutral-50 text-neutral-950 border-[#D9D6CF]';
    badge = 'bg-blue-100 text-[#2547E8] font-semibold';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    badge = 'bg-[#151921] text-cyan-400 border border-[#2E3440]';
  }

  return (
    <section className={\`relative w-full py-24 sm:py-32 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className="inline-block h-8 w-8 rounded-full bg-neutral-300 dark:bg-neutral-700 ring-2 ring-white dark:ring-[#0B0D10]" />
            ))}
          </div>
          <span className={\`text-xs px-3 py-1 rounded-full \${badge}\`}>
            ★ {rating}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl leading-tight">
          {headline}
        </h1>
        <p className="text-base sm:text-lg opacity-80 max-w-2xl mb-10 leading-relaxed">
          {subheadline}
        </p>

        <div className="flex items-center gap-4 text-xs font-mono opacity-60">
          <span>{userCount}</span>
          <span>•</span>
          <span>Zero security incidents</span>
          <span>•</span>
          <span>SOC2 Type II</span>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { SocialProofHero, SocialProofHeroVariant } from './index.js';

export function SocialProofHeroPreview() {
  const [variant, setVariant] = useState<SocialProofHeroVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Social Proof Hero Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as SocialProofHeroVariant[]).map((v) => (
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
      <SocialProofHero variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const socialProofHeroFixtures = {
  headline: 'Trusted by 40,000+ engineers building modern web applications.',
};`,
    readmeCode: `# Social Proof Hero

Conversion-focused hero emphasizing community validation, ratings, and active user metrics.`,
  },

  // 13. Logo Cloud Minimal
  {
    slug: 'logo-cloud-minimal',
    name: 'Logo Cloud Minimal',
    description: 'Subtle monochrome client logo row with muted contrast and disciplined spacing.',
    categories: ['sections', 'marketing', 'trust'],
    roles: ['trust', 'logos'],
    purposes: ['Enterprise social proof', 'B2B credibility'],
    componentName: 'LogoCloudMinimal',
    tags: ['logo-cloud-minimal', 'logos', 'trust', 'marketing'],
    idealFor: ['Understated credibility sections below heroes'],
    avoidFor: ['Small non-commercial personal blogs'],
    jobs: ['Establish immediate enterprise legitimacy through client wordmarks'],
    indexCode: `import React from 'react';

export type LogoCloudMinimalVariant = 'quiet' | 'expressive' | 'nocturne';

export interface LogoCloudMinimalProps {
  variant?: LogoCloudMinimalVariant;
  title?: string;
  logos?: string[];
}

export function LogoCloudMinimal({
  variant = 'quiet',
  title = 'POWERING DESIGN SYSTEMS AT MODERN TECHNOLOGY ORGANISATIONS',
  logos = ['Acme Corp', 'Starlight Data', 'Hyperion', 'Vertex Labs', 'Nexus AI'],
}: LogoCloudMinimalProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let titleColor = 'text-neutral-500';
  let logoColor = 'text-neutral-600 hover:text-neutral-900';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50 text-neutral-950 border-[#D9D6CF]';
    titleColor = 'text-neutral-600 font-semibold';
    logoColor = 'text-neutral-700 hover:text-[#2547E8]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    titleColor = 'text-neutral-400 font-mono';
    logoColor = 'text-neutral-400 hover:text-white';
  }

  return (
    <section className={\`relative w-full py-16 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto text-center">
        <p className={\`text-xs uppercase tracking-widest mb-10 \${titleColor}\`}>{title}</p>
        <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
          {logos.map((logo) => (
            <span key={logo} className={\`font-mono text-sm sm:text-base font-semibold tracking-wider transition-colors \${logoColor}\`}>
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { LogoCloudMinimal, LogoCloudMinimalVariant } from './index.js';

export function LogoCloudMinimalPreview() {
  const [variant, setVariant] = useState<LogoCloudMinimalVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Logo Cloud Minimal Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as LogoCloudMinimalVariant[]).map((v) => (
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
      <LogoCloudMinimal variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const logoCloudMinimalFixtures = {
  logos: ['Acme Corp', 'Starlight Data', 'Hyperion', 'Vertex Labs', 'Nexus AI'],
};`,
    readmeCode: `# Logo Cloud Minimal

Restrained client logo strip establishing immediate trust with disciplined spacing.`,
  },

  // 14. Logo Cloud Marquee
  {
    slug: 'logo-cloud-marquee',
    name: 'Logo Cloud Marquee',
    description: 'Smooth continuous horizontal strip of partner and customer wordmarks.',
    categories: ['sections', 'marketing', 'trust'],
    roles: ['trust', 'marquee'],
    purposes: ['Dynamic brand proof', 'Ecosystem partner showcase'],
    componentName: 'LogoCloudMarquee',
    tags: ['logo-cloud-marquee', 'marquee', 'logos', 'trust'],
    idealFor: ['High-energy marketing landing pages'],
    avoidFor: ['Static PDF export formats'],
    jobs: ['Show high volume of customer adopters in a compact vertical height'],
    indexCode: `import React from 'react';

export type LogoCloudMarqueeVariant = 'quiet' | 'expressive' | 'nocturne';

export interface LogoCloudMarqueeProps {
  variant?: LogoCloudMarqueeVariant;
  logos?: string[];
}

export function LogoCloudMarquee({
  variant = 'quiet',
  logos = ['Vercel', 'Stripe', 'Linear', 'Raycast', 'OpenAI', 'Anthropic', 'Supabase', 'Cloudflare'],
}: LogoCloudMarqueeProps) {
  let bg = 'bg-white text-neutral-800 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-blue-50/20 text-neutral-900 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <section className={\`relative w-full py-10 px-6 overflow-hidden border-b transition-colors \${bg}\`}>
      <div className="flex items-center gap-12 sm:gap-20 overflow-x-auto no-scrollbar justify-center">
        {logos.map((logo, idx) => (
          <span key={\`\${logo}-\${idx}\`} className="font-mono text-sm sm:text-base font-bold tracking-tight opacity-70 shrink-0">
            {logo}
          </span>
        ))}
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { LogoCloudMarquee, LogoCloudMarqueeVariant } from './index.js';

export function LogoCloudMarqueePreview() {
  const [variant, setVariant] = useState<LogoCloudMarqueeVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Logo Cloud Marquee Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as LogoCloudMarqueeVariant[]).map((v) => (
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
      <LogoCloudMarquee variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const logoCloudMarqueeFixtures = {
  logos: ['Vercel', 'Stripe', 'Linear', 'Raycast', 'OpenAI'],
};`,
    readmeCode: `# Logo Cloud Marquee

Horizontal partner wordmark strip supporting smooth responsive containment.`,
  },

  // 15. Customer Metrics Strip
  {
    slug: 'customer-metrics-strip',
    name: 'Customer Metrics Strip',
    description: 'Four-column KPI impact bar highlighting uptime, volume, latency, and scale numbers.',
    categories: ['sections', 'marketing', 'trust'],
    roles: ['trust', 'metrics'],
    purposes: ['Quantifiable business impact', 'Infrastructure credibility'],
    componentName: 'CustomerMetricsStrip',
    tags: ['customer-metrics-strip', 'metrics', 'kpi', 'trust'],
    idealFor: ['B2B SaaS with verified scale metrics'],
    avoidFor: ['Pre-launch ideas with zero data'],
    jobs: ['Provide empirical evidence of platform scale and reliability'],
    indexCode: `import React from 'react';

export type CustomerMetricsStripVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CustomerMetricsStripProps {
  variant?: CustomerMetricsStripVariant;
  stats?: Array<{ label: string; value: string; desc: string }>;
}

export function CustomerMetricsStrip({
  variant = 'quiet',
  stats = [
    { label: 'Verified Uptime', value: '99.99%', desc: 'Across global edge regions' },
    { label: 'Weekly Builds', value: '1.2B+', desc: 'Deterministic compilation runs' },
    { label: 'Sub-millisecond', value: '<0.8ms', desc: 'Average manifest parse time' },
    { label: 'Zero Vulnerabilities', value: '100%', desc: 'Audited dependency purity' },
  ],
}: CustomerMetricsStripProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'border-blue-100';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'border-[#2E3440]';
  }

  return (
    <section className={\`relative w-full py-16 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.label} className={\`flex flex-col items-start border-l-2 pl-6 \${card}\`}>
            <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight mb-1">{s.value}</span>
            <span className="text-sm font-semibold mb-1">{s.label}</span>
            <span className="text-xs opacity-70">{s.desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CustomerMetricsStrip, CustomerMetricsStripVariant } from './index.js';

export function CustomerMetricsStripPreview() {
  const [variant, setVariant] = useState<CustomerMetricsStripVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Customer Metrics Strip Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as CustomerMetricsStripVariant[]).map((v) => (
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
      <CustomerMetricsStrip variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const customerMetricsStripFixtures = {
  stats: [
    { label: 'Uptime', value: '99.99%', desc: 'Global edge' },
    { label: 'Latency', value: '<1ms', desc: 'Average' },
  ],
};`,
    readmeCode: `# Customer Metrics Strip

Four-column KPI strip proving enterprise scale and performance.`,
  },

  // 16. Press Mentions Strip
  {
    slug: 'press-mentions-strip',
    name: 'Press Mentions Strip',
    description: 'Curated editorial press quote row with publication logos and external publication links.',
    categories: ['sections', 'marketing', 'trust'],
    roles: ['trust', 'press'],
    purposes: ['Media coverage', 'Third-party editorial recognition'],
    componentName: 'PressMentionsStrip',
    tags: ['press-mentions-strip', 'press', 'editorial', 'trust'],
    idealFor: ['Startups featured in prominent tech publications'],
    avoidFor: ['Internal developer portals'],
    jobs: ['Highlight external validation from reputable journalism sources'],
    indexCode: `import React from 'react';

export type PressMentionsStripVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PressMentionsStripProps {
  variant?: PressMentionsStripVariant;
  quotes?: Array<{ outlet: string; quote: string }>;
}

export function PressMentionsStrip({
  variant = 'quiet',
  quotes = [
    { outlet: 'TechCrunch', quote: 'Tessellate redefines how software teams approach UI coherence.' },
    { outlet: 'Wired', quote: 'A monumental step forward for autonomous coding agents and human designers.' },
    { outlet: 'The Verge', quote: 'Finally, an open-source interface architecture with taste.' },
  ],
}: PressMentionsStripProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50/60 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/50 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-100 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  return (
    <section className={\`relative w-full py-16 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {quotes.map((q) => (
          <div key={q.outlet} className={\`p-6 rounded-xl border flex flex-col justify-between \${card}\`}>
            <p className="text-sm italic opacity-90 mb-6 leading-relaxed">"{q.quote}"</p>
            <span className="font-bold text-xs uppercase tracking-wider font-mono opacity-70">{q.outlet}</span>
          </div>
        ))}
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { PressMentionsStrip, PressMentionsStripVariant } from './index.js';

export function PressMentionsStripPreview() {
  const [variant, setVariant] = useState<PressMentionsStripVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Press Mentions Strip Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as PressMentionsStripVariant[]).map((v) => (
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
      <PressMentionsStrip variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const pressMentionsStripFixtures = {
  quotes: [
    { outlet: 'TechCrunch', quote: 'A monumental step forward.' },
  ],
};`,
    readmeCode: `# Press Mentions Strip

Editorial press pull-quotes establishing third-party journalistic endorsement.`,
  },

  // 17. Trust Badges Strip
  {
    slug: 'trust-badges-strip',
    name: 'Trust Badges Strip',
    description: 'Security, compliance, and SOC2 / ISO / HIPAA certification badge strip.',
    categories: ['sections', 'marketing', 'trust'],
    roles: ['trust', 'compliance'],
    purposes: ['Enterprise security compliance', 'Healthcare and financial procurement'],
    componentName: 'TrustBadgesStrip',
    tags: ['trust-badges-strip', 'security', 'compliance', 'trust'],
    idealFor: ['Products going through enterprise procurement security reviews'],
    avoidFor: ['Casual hobby projects'],
    jobs: ['Signal compliance readiness and uncompromised data integrity'],
    indexCode: `import React from 'react';

export type TrustBadgesStripVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TrustBadgesStripProps {
  variant?: TrustBadgesStripVariant;
  badges?: string[];
}

export function TrustBadgesStrip({
  variant = 'quiet',
  badges = ['SOC2 TYPE II CERTIFIED', 'ISO 27001 COMPLIANT', 'HIPAA READY', 'GDPR ENFORCED', 'WCAG 2.2 AA VERIFIED'],
}: TrustBadgesStripProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-800 border-neutral-200';
  let badgeStyle = 'bg-white text-neutral-700 border-neutral-300';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-900 border-[#D9D6CF]';
    badgeStyle = 'bg-blue-50/50 text-[#2547E8] border-blue-200 font-semibold';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    badgeStyle = 'bg-[#151921] text-cyan-300 border-[#2E3440] font-mono';
  }

  return (
    <section className={\`relative w-full py-12 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-4">
        {badges.map((b) => (
          <div key={b} className={\`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs border tracking-wider shadow-2xs transition-colors \${badgeStyle}\`}>
            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{b}</span>
          </div>
        ))}
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { TrustBadgesStrip, TrustBadgesStripVariant } from './index.js';

export function TrustBadgesStripPreview() {
  const [variant, setVariant] = useState<TrustBadgesStripVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Trust Badges Strip Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as TrustBadgesStripVariant[]).map((v) => (
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
      <TrustBadgesStrip variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const trustBadgesStripFixtures = {
  badges: ['SOC2 TYPE II', 'ISO 27001', 'WCAG 2.2 AA'],
};`,
    readmeCode: `# Trust Badges Strip

Security and regulatory certification chips assuring prospective enterprise buyers.`,
  },

  // 18. Testimonial Quote
  {
    slug: 'testimonial-quote',
    name: 'Testimonial Quote',
    description: 'Featured customer pull-quote with oversized quotation mark, portrait avatar, and bio.',
    categories: ['sections', 'marketing', 'trust'],
    roles: ['trust', 'testimonial'],
    purposes: ['High-impact customer endorsement', 'Case study preview'],
    componentName: 'TestimonialQuote',
    tags: ['testimonial-quote', 'testimonial', 'quote', 'trust'],
    idealFor: ['Spotlighting a flagship enterprise customer endorsement'],
    avoidFor: ['Sites without real customer feedback'],
    jobs: ['Communicate deep user satisfaction through verified human testimony'],
    indexCode: `import React from 'react';

export type TestimonialQuoteVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TestimonialQuoteProps {
  variant?: TestimonialQuoteVariant;
  quote?: string;
  authorName?: string;
  authorRole?: string;
  company?: string;
}

export function TestimonialQuote({
  variant = 'quiet',
  quote = 'Tessellate allowed our engineering team to ship a world-class application in two weeks without hiring a dedicated design agency. The architectural coherence is unmatched.',
  authorName = 'Elena Rostova',
  authorRole = 'Head of Product Engineering',
  company = 'Synthetix Cloud',
}: TestimonialQuoteProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let accent = 'text-neutral-400';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-br from-blue-50/50 via-white to-amber-50/30 text-neutral-950 border-[#D9D6CF]';
    accent = 'text-[#2547E8]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    accent = 'text-cyan-400';
  }

  return (
    <section className={\`relative w-full py-24 sm:py-32 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <span className={\`text-6xl font-serif leading-none mb-6 \${accent}\`}>“</span>
        <blockquote className="text-xl sm:text-3xl font-medium tracking-tight leading-snug mb-10 text-balance">
          {quote}
        </blockquote>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          <div className="text-left">
            <div className="font-semibold text-sm">{authorName}</div>
            <div className="text-xs opacity-75">{authorRole}, {company}</div>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { TestimonialQuote, TestimonialQuoteVariant } from './index.js';

export function TestimonialQuotePreview() {
  const [variant, setVariant] = useState<TestimonialQuoteVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Testimonial Quote Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as TestimonialQuoteVariant[]).map((v) => (
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
      <TestimonialQuote variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const testimonialQuoteFixtures = {
  quote: 'Tessellate allowed our engineering team to ship a world-class application in two weeks.',
  authorName: 'Elena Rostova',
};`,
    readmeCode: `# Testimonial Quote

Editorial customer pull-quote with portrait metadata and verified credibility attribution.`,
  },
];
