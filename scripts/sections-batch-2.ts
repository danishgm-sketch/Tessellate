import type { SectionDef } from './sections-builder.js';

export const SECTIONS_BATCH_2: SectionDef[] = [
  // 19. Testimonial Grid
  {
    slug: 'testimonial-grid',
    name: 'Testimonial Grid',
    description: '3-column card grid of customer endorsements with rating stars and company tags.',
    categories: ['sections', 'marketing', 'trust'],
    roles: ['trust', 'testimonials'],
    purposes: ['Social proof volume', 'Community feedback showcase'],
    componentName: 'TestimonialGrid',
    tags: ['testimonial-grid', 'testimonials', 'grid', 'social-proof'],
    idealFor: ['Broad social proof across varied developer personas'],
    avoidFor: ['Single-partner exclusive launches'],
    jobs: ['Display multiple enthusiastic customer endorsements in a readable grid'],
    indexCode: `import React from 'react';

export type TestimonialGridVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TestimonialGridProps {
  variant?: TestimonialGridVariant;
  title?: string;
  testimonials?: Array<{ quote: string; author: string; role: string; company: string }>;
}

export function TestimonialGrid({
  variant = 'quiet',
  title = 'Loved by builders, engineers, and product designers.',
  testimonials = [
    { quote: 'The cleanest component architecture I have seen in modern React.', author: 'Marcus Vance', role: 'Staff Engineer', company: 'Linear Systems' },
    { quote: 'Reduced our front-end maintenance overhead to near zero.', author: 'Aria Chen', role: 'CTO', company: 'Prism Health' },
    { quote: 'Zero lock-in means our team owns every byte of output.', author: 'Devon Patel', role: 'Lead Architect', company: 'Apex Cloud' },
  ],
}: TestimonialGridProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200 shadow-2xs';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/40 border-blue-100 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440] shadow-lg';
  }

  return (
    <section className={\`relative w-full py-20 sm:py-28 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-center mb-16">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.author} className={\`p-6 rounded-xl border flex flex-col justify-between \${card}\`}>
              <div className="mb-6">
                <div className="text-amber-500 text-xs mb-3">★★★★★</div>
                <p className="text-sm opacity-90 leading-relaxed">"{t.quote}"</p>
              </div>
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                <div className="font-semibold text-xs">{t.author}</div>
                <div className="text-[11px] opacity-70">{t.role}, {t.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { TestimonialGrid, TestimonialGridVariant } from './index.js';

export function TestimonialGridPreview() {
  const [variant, setVariant] = useState<TestimonialGridVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Testimonial Grid Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as TestimonialGridVariant[]).map((v) => (
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
      <TestimonialGrid variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const testimonialGridFixtures = {
  title: 'Loved by builders, engineers, and product designers.',
};`,
    readmeCode: `# Testimonial Grid

Card grid displaying multiple customer testimonials with star ratings and company roles.`,
  },

  // 20. Testimonial Carousel
  {
    slug: 'testimonial-carousel',
    name: 'Testimonial Carousel',
    description: 'Paginated card slider with testimonial quotes, author details, and next/prev controls.',
    categories: ['sections', 'marketing', 'trust'],
    roles: ['trust', 'carousel'],
    purposes: ['Space-saving customer proof', 'Featured review showcase'],
    componentName: 'TestimonialCarousel',
    tags: ['testimonial-carousel', 'testimonial', 'carousel', 'slider'],
    idealFor: ['Pages with limited vertical height requiring rich customer stories'],
    avoidFor: ['Print stylesheets'],
    jobs: ['Allow user to cycle through customer case statements comfortably'],
    indexCode: `import React, { useState } from 'react';

export type TestimonialCarouselVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TestimonialCarouselProps {
  variant?: TestimonialCarouselVariant;
  items?: Array<{ quote: string; author: string; company: string }>;
}

export function TestimonialCarousel({
  variant = 'quiet',
  items = [
    { quote: 'We rebuilt our entire data suite using Tessellate in under three weeks.', author: 'Samantha Reed', company: 'Nova Logic' },
    { quote: 'The Design DNA system eliminated endless meetings about spacing and colors.', author: 'Liam Gallagher', company: 'Aether OS' },
    { quote: 'Our lighthouse scores went from 68 to 100 on desktop and mobile.', author: 'Kenji Sato', company: 'HyperScale' },
  ],
}: TestimonialCarouselProps) {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === items.length - 1 ? 0 : i + 1));

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-blue-50/20 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-100 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const current = items[index] || items[0] || { quote: '', author: '', company: '' };

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <div className={\`w-full p-8 sm:p-12 rounded-2xl border text-center transition-all \${card}\`}>
          <p className="text-lg sm:text-2xl font-medium tracking-tight mb-8 leading-snug">
            "{current.quote}"
          </p>
          <div className="font-semibold text-sm">{current.author}</div>
          <div className="text-xs opacity-70 mb-8">{current.company}</div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous testimonial"
              className="p-2 rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              ←
            </button>
            <span className="text-xs font-mono opacity-60">
              {index + 1} / {items.length}
            </span>
            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="p-2 rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { TestimonialCarousel, TestimonialCarouselVariant } from './index.js';

export function TestimonialCarouselPreview() {
  const [variant, setVariant] = useState<TestimonialCarouselVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Testimonial Carousel Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as TestimonialCarouselVariant[]).map((v) => (
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
      <TestimonialCarousel variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const testimonialCarouselFixtures = {
  items: [
    { quote: 'We rebuilt our entire data suite in three weeks.', author: 'Samantha Reed', company: 'Nova Logic' },
  ],
};`,
    readmeCode: `# Testimonial Carousel

Accessible slider allowing users to cycle through verified customer praise.`,
  },

  // 21. Case Study Spotlight
  {
    slug: 'case-study-spotlight',
    name: 'Case Study Spotlight',
    description: 'In-depth customer story card featuring measurable impact metrics, quote, and read study link.',
    categories: ['sections', 'marketing', 'trust'],
    roles: ['trust', 'case-study'],
    purposes: ['Enterprise sales acceleration', 'Deep customer outcomes'],
    componentName: 'CaseStudySpotlight',
    tags: ['case-study-spotlight', 'case-study', 'metrics', 'trust'],
    idealFor: ['Deep-dive enterprise case study features'],
    avoidFor: ['Casual generic landing pages'],
    jobs: ['Prove ROI through concrete numbers and customer narrative'],
    indexCode: `import React from 'react';

export type CaseStudySpotlightVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CaseStudySpotlightProps {
  variant?: CaseStudySpotlightVariant;
  client?: string;
  metric?: string;
  metricLabel?: string;
  headline?: string;
  summary?: string;
}

export function CaseStudySpotlight({
  variant = 'quiet',
  client = 'KRONOS ANALYTICS',
  metric = '4.2x',
  metricLabel = 'Faster front-end delivery speed',
  headline = 'How Kronos migrated 18 legacy micro-frontends into a singular coherent system.',
  summary = 'By introducing Tessellate manifests and deterministic DNA validation, the Kronos team consolidated 140 disparate components into 36 verified primitives.',
}: CaseStudySpotlightProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200 shadow-sm';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-gradient-to-br from-blue-50/50 to-white border-blue-200 shadow-xl';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440] shadow-2xl';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto">
        <div className={\`rounded-2xl border p-8 sm:p-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-center \${card}\`}>
          <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 pb-8 md:pb-0 md:pr-8">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-4 block">{client}</span>
            <div className="text-5xl sm:text-6xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 mb-2">{metric}</div>
            <p className="text-xs font-medium opacity-80">{metricLabel}</p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-4">{headline}</h3>
            <p className="text-sm opacity-80 leading-relaxed mb-6">{summary}</p>
            <button type="button" className="text-xs font-semibold uppercase tracking-wider underline hover:opacity-75 transition-opacity">
              Read Complete Technical Case Study →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CaseStudySpotlight, CaseStudySpotlightVariant } from './index.js';

export function CaseStudySpotlightPreview() {
  const [variant, setVariant] = useState<CaseStudySpotlightVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Case Study Spotlight Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as CaseStudySpotlightVariant[]).map((v) => (
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
      <CaseStudySpotlight variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const caseStudySpotlightFixtures = {
  client: 'KRONOS ANALYTICS',
  metric: '4.2x',
};`,
    readmeCode: `# Case Study Spotlight

Enterprise customer outcome card pairing bold metric multiplier with technical narrative.`,
  },

  // 22. Customer Story Split
  {
    slug: 'customer-story-split',
    name: 'Customer Story Split',
    description: 'Side-by-side narrative with customer team photo on one side and challenge-solution story on other.',
    categories: ['sections', 'marketing', 'trust'],
    roles: ['trust', 'story'],
    purposes: ['Human-centric testimonials', 'In-depth brand stories'],
    componentName: 'CustomerStorySplit',
    tags: ['customer-story-split', 'story', 'split', 'trust'],
    idealFor: ['Stories where customer culture and craft resonate with prospective buyers'],
    avoidFor: ['Short teaser banners'],
    jobs: ['Explain the problem before Tessellate and the outcome after'],
    indexCode: `import React from 'react';

export type CustomerStorySplitVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CustomerStorySplitProps {
  variant?: CustomerStorySplitVariant;
  company?: string;
  challenge?: string;
  solution?: string;
}

export function CustomerStorySplit({
  variant = 'quiet',
  company = 'Helios Autonomous Systems',
  challenge = 'Before Tessellate, our robotics dashboard suffered from 12 disconnected design styles and heavy bundle sizes.',
  solution = 'Within days of adopting Tessellate, we composed our entire telemetry interface using verified blocks that load in under 20ms.',
}: CustomerStorySplitProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let box = 'bg-neutral-100 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/50 text-neutral-950 border-[#D9D6CF]';
    box = 'bg-blue-50/50 border-blue-200';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    box = 'bg-[#151921] border-[#2E3440]';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className={\`aspect-square rounded-2xl border flex items-center justify-center p-8 text-center \${box}\`}>
          <div className="flex flex-col items-center">
            <span className="font-mono text-xs uppercase tracking-widest opacity-60 mb-2">Team Spotlight</span>
            <span className="font-bold text-lg">{company}</span>
            <span className="text-xs opacity-75 mt-2">Engineering & Autonomy Squad</span>
          </div>
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4 block">The Transformation</span>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-4">From Fragmentation to Unified Speed</h3>
          <div className="space-y-4 text-sm opacity-80 leading-relaxed mb-6">
            <p><strong>The Challenge:</strong> {challenge}</p>
            <p><strong>The Solution:</strong> {solution}</p>
          </div>
          <button type="button" className="text-xs font-semibold uppercase tracking-wider underline hover:opacity-75 transition-opacity">
            Explore Helios System Architecture →
          </button>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CustomerStorySplit, CustomerStorySplitVariant } from './index.js';

export function CustomerStorySplitPreview() {
  const [variant, setVariant] = useState<CustomerStorySplitVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Customer Story Split Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as CustomerStorySplitVariant[]).map((v) => (
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
      <CustomerStorySplit variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const customerStorySplitFixtures = {
  company: 'Helios Autonomous Systems',
};`,
    readmeCode: `# Customer Story Split

Two-column challenge-versus-solution format highlighting customer transformation.`,
  },

  // 23. Feature Grid 3x2
  {
    slug: 'feature-grid-3x2',
    name: 'Feature Grid 3x2',
    description: 'Balanced 6-card grid with icon headers, descriptive copy, and subtle hover borders.',
    categories: ['sections', 'marketing', 'features'],
    roles: ['features', 'grid'],
    purposes: ['Core capabilities', 'Platform feature breakdown'],
    componentName: 'FeatureGrid3x2',
    tags: ['feature-grid-3x2', 'features', 'grid', 'capabilities'],
    idealFor: ['Presenting the 6 fundamental pillars of a platform'],
    avoidFor: ['Single focused metric callouts'],
    jobs: ['Explain comprehensive breadth of features with clean symmetry'],
    indexCode: `import React from 'react';

export type FeatureGrid3x2Variant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureGrid3x2Props {
  variant?: FeatureGrid3x2Variant;
  headline?: string;
  subheadline?: string;
  features?: Array<{ title: string; desc: string }>;
}

export function FeatureGrid3x2({
  variant = 'quiet',
  headline = 'Engineered for durability across every layer of the interface.',
  subheadline = 'Six architectural pillars powering the Tessellate composition runtime.',
  features = [
    { title: 'Zero Runtime Lock-In', desc: 'Exports directly to clean React and Tailwind CSS without hidden proprietary libraries.' },
    { title: 'Deterministic DNA', desc: 'Enforces mathematical harmony across spacing, curvature, typography, and contrast.' },
    { title: 'Sub-Millisecond Parsing', desc: 'Validates entire component trees in microseconds using local Zod schemas.' },
    { title: 'Accessible by Default', desc: 'Meets WCAG 2.2 AA standards with full keyboard traversal and contrast tokens.' },
    { title: 'Agent-Ready Registry', desc: 'Equipped with OpenAPI, llms.txt, and MCP servers for autonomous coding tools.' },
    { title: 'Guest-First Storage', desc: 'Operates completely client-side with optional GitHub OAuth for cloud sync.' },
  ],
}: FeatureGrid3x2Props) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200 shadow-2xs hover:border-neutral-400';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/30 border-blue-100 shadow-sm hover:border-[#2547E8] hover:shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440] hover:border-cyan-400';
  }

  return (
    <section className={\`relative w-full py-20 sm:py-28 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">{headline}</h2>
          <p className="text-base sm:text-lg opacity-75">{subheadline}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={f.title} className={\`p-6 rounded-xl border transition-all \${card}\`}>
              <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-mono text-xs font-bold mb-4">
                0{i + 1}
              </div>
              <h3 className="font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-xs sm:text-sm opacity-75 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FeatureGrid3x2, FeatureGrid3x2Variant } from './index.js';

export function FeatureGrid3x2Preview() {
  const [variant, setVariant] = useState<FeatureGrid3x2Variant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Feature Grid 3x2 Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FeatureGrid3x2Variant[]).map((v) => (
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
      <FeatureGrid3x2 variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const featureGrid3x2Fixtures = {
  headline: 'Engineered for durability across every layer.',
};`,
    readmeCode: `# Feature Grid 3x2

Balanced 6-item feature grid outlining the primary functional pillars of a platform.`,
  },

  // 24. Feature Bento
  {
    slug: 'feature-bento',
    name: 'Feature Bento',
    description: 'Asymmetric bento box layout combining wide hero card, tall telemetry card, and compact utility cards.',
    categories: ['sections', 'marketing', 'features'],
    roles: ['features', 'bento'],
    purposes: ['Visual storytelling', 'Dynamic capability showcase'],
    componentName: 'FeatureBento',
    tags: ['feature-bento', 'bento', 'features', 'marketing'],
    idealFor: ['Modern SaaS platforms with diverse complementary features'],
    avoidFor: ['Plain text legal documentation'],
    jobs: ['Showcase feature richness through varied card dimensions and visual rhythms'],
    indexCode: `import React from 'react';

export type FeatureBentoVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureBentoProps {
  variant?: FeatureBentoVariant;
}

export function FeatureBento({ variant = 'quiet' }: FeatureBentoProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/50 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440] shadow-xl';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-center mb-16">The Bento System</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={\`md:col-span-2 p-8 rounded-2xl border flex flex-col justify-between min-h-[260px] \${card}\`}>
            <div>
              <span className="text-xs font-mono font-bold uppercase text-neutral-500 mb-2 block">Flagship Feature</span>
              <h3 className="text-2xl font-bold mb-3">Live Token Synchronization</h3>
              <p className="text-sm opacity-80 max-w-lg leading-relaxed">
                When you tweak curvature or contrast in Design DNA, all 324 components update in real time with zero layout thrashing.
              </p>
            </div>
            <div className="h-10 rounded-lg bg-neutral-200/60 dark:bg-neutral-800 flex items-center px-4 font-mono text-xs opacity-70">
              --tess-density: 85; --tess-radius: 6px;
            </div>
          </div>

          <div className={\`p-8 rounded-2xl border flex flex-col justify-between min-h-[260px] \${card}\`}>
            <div>
              <span className="text-xs font-mono font-bold uppercase text-neutral-500 mb-2 block">Performance</span>
              <h3 className="text-xl font-bold mb-2">0.4ms Latency</h3>
              <p className="text-xs opacity-75 leading-relaxed">Sub-millisecond verification pipeline powered by local in-memory indices.</p>
            </div>
            <div className="text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400">100/100</div>
          </div>

          <div className={\`p-8 rounded-2xl border flex flex-col justify-between min-h-[240px] \${card}\`}>
            <div>
              <h3 className="text-lg font-bold mb-2">MCP Agent Ready</h3>
              <p className="text-xs opacity-75">Connect Cursor, Claude Code, or Antigravity directly to local tooling.</p>
            </div>
            <span className="text-xs font-mono opacity-60">stdio / sse</span>
          </div>

          <div className={\`md:col-span-2 p-8 rounded-2xl border flex flex-col justify-between min-h-[240px] \${card}\`}>
            <div>
              <h3 className="text-lg font-bold mb-2">Verified Ecosystem Integrity</h3>
              <p className="text-xs opacity-75 max-w-md">972 curated combinations across Quiet, Expressive, and Nocturne with 0 lint warnings.</p>
            </div>
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="h-3 w-3 rounded-full bg-purple-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FeatureBento, FeatureBentoVariant } from './index.js';

export function FeatureBentoPreview() {
  const [variant, setVariant] = useState<FeatureBentoVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Feature Bento Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FeatureBentoVariant[]).map((v) => (
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
      <FeatureBento variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const featureBentoFixtures = {};`,
    readmeCode: `# Feature Bento

Dynamic asymmetric grid combining wide and tall feature blocks for modern marketing aesthetics.`,
  },

  // 25. Feature Alternating Rows
  {
    slug: 'feature-alternating-rows',
    name: 'Feature Alternating Rows',
    description: 'Left-right alternating feature narrative with illustrative preview frames.',
    categories: ['sections', 'marketing', 'features'],
    roles: ['features', 'alternating'],
    purposes: ['Deep-dive feature explanations', 'Guided product tour'],
    componentName: 'FeatureAlternatingRows',
    tags: ['feature-alternating-rows', 'features', 'alternating', 'narrative'],
    idealFor: ['Detailed product walkthroughs requiring ample text and accompanying imagery'],
    avoidFor: ['Quick summary teaser strips'],
    jobs: ['Take visitor through step-by-step feature breakdown with alternating visual balance'],
    indexCode: `import React from 'react';

export type FeatureAlternatingRowsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureAlternatingRowsProps {
  variant?: FeatureAlternatingRowsVariant;
  rows?: Array<{ title: string; desc: string; tag: string }>;
}

export function FeatureAlternatingRows({
  variant = 'quiet',
  rows = [
    { title: 'Deterministic Manifest Grammar', desc: 'Every resource is declared with machine-readable schemas specifying slots, variants, and visual DNA bounds.', tag: 'SCHEMAS' },
    { title: 'The Three-Pane Composition Studio', desc: 'Direct drag-and-drop hierarchy tree paired with instant live iframe canvas and token inspector.', tag: 'WORKBENCH' },
    { title: 'Autonomous CLI & MCP Integration', desc: 'Coding agents query and assemble verified components without needing human UI intervention.', tag: 'AGENTS' },
  ],
}: FeatureAlternatingRowsProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let frame = 'bg-white border-neutral-200 shadow-sm';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    frame = 'bg-blue-50/40 border-blue-200 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    frame = 'bg-[#151921] border-[#2E3440] shadow-xl';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto space-y-20">
        {rows.map((r, i) => {
          const isReverse = i % 2 === 1;
          return (
            <div key={r.title} className={\`grid grid-cols-1 md:grid-cols-2 gap-12 items-center \${isReverse ? 'md:flex-row-reverse' : ''}\`}>
              <div className={\`\${isReverse ? 'md:order-2' : ''}\`}>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-3 block">{r.tag}</span>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">{r.title}</h3>
                <p className="text-sm opacity-80 leading-relaxed mb-6">{r.desc}</p>
                <button type="button" className="text-xs font-semibold uppercase tracking-wider underline hover:opacity-75">
                  Learn more →
                </button>
              </div>
              <div className={\`p-8 rounded-2xl border min-h-[220px] flex items-center justify-center text-center \${frame} \${isReverse ? 'md:order-1' : ''}\`}>
                <span className="font-mono text-xs opacity-60">Interactive Preview: {r.tag}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FeatureAlternatingRows, FeatureAlternatingRowsVariant } from './index.js';

export function FeatureAlternatingRowsPreview() {
  const [variant, setVariant] = useState<FeatureAlternatingRowsVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Feature Alternating Rows Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FeatureAlternatingRowsVariant[]).map((v) => (
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
      <FeatureAlternatingRows variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const featureAlternatingRowsFixtures = {};`,
    readmeCode: `# Feature Alternating Rows

Left-right alternating narrative format providing balanced text and illustration cadence.`,
  },

  // 26. Feature Sticky Narrative
  {
    slug: 'feature-sticky-narrative',
    name: 'Feature Sticky Narrative',
    description: 'Side-by-side section with sticky headline/story progression beside scrollable detail cards.',
    categories: ['sections', 'marketing', 'features'],
    roles: ['features', 'sticky'],
    purposes: ['Long-form narrative presentation', 'Complex architecture explanation'],
    componentName: 'FeatureStickyNarrative',
    tags: ['feature-sticky-narrative', 'features', 'sticky', 'narrative'],
    idealFor: ['Detailed multi-step technical narratives'],
    avoidFor: ['Small mobile-only embeds without scrolling room'],
    jobs: ['Keep high-level narrative anchored while user reads detailed feature cards'],
    indexCode: `import React from 'react';

export type FeatureStickyNarrativeVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureStickyNarrativeProps {
  variant?: FeatureStickyNarrativeVariant;
}

export function FeatureStickyNarrative({ variant = 'quiet' }: FeatureStickyNarrativeProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-3 block">Architecture</span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">Designed for longevity and auditability.</h2>
          <p className="text-sm opacity-80 leading-relaxed">
            Every layer of Tessellate is structured so you retain 100% control over output artifacts without proprietary cloud dependencies.
          </p>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {[1, 2, 3].map((num) => (
            <div key={num} className={\`p-8 rounded-2xl border \${card}\`}>
              <span className="text-xs font-mono font-bold text-neutral-500 mb-2 block">Phase 0{num}</span>
              <h3 className="text-xl font-bold mb-2">Canonical Verification Standard</h3>
              <p className="text-xs sm:text-sm opacity-75 leading-relaxed">
                Resources must pass deterministic checks: zero undeclared dependencies, AA accessibility scores, and multi-viewport responsiveness.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FeatureStickyNarrative, FeatureStickyNarrativeVariant } from './index.js';

export function FeatureStickyNarrativePreview() {
  const [variant, setVariant] = useState<FeatureStickyNarrativeVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Feature Sticky Narrative Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FeatureStickyNarrativeVariant[]).map((v) => (
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
      <FeatureStickyNarrative variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const featureStickyNarrativeFixtures = {};`,
    readmeCode: `# Feature Sticky Narrative

Sticky column layout pairing anchored narrative headline with scrollable detail blocks.`,
  },

  // 27. Feature Tabs
  {
    slug: 'feature-tabs',
    name: 'Feature Tabs',
    description: 'Interactive tabbed feature display switching between workflows, previews, and feature descriptions.',
    categories: ['sections', 'marketing', 'features'],
    roles: ['features', 'tabs'],
    purposes: ['Multi-perspective product tour', 'Workflow showcases'],
    componentName: 'FeatureTabs',
    tags: ['feature-tabs', 'features', 'tabs', 'interactive'],
    idealFor: ['Showcasing multiple distinct user journeys in a single section'],
    avoidFor: ['Linear single-feature landing pages'],
    jobs: ['Allow user to switch seamlessly between workflow perspectives'],
    indexCode: `import React, { useState } from 'react';

export type FeatureTabsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureTabsProps {
  variant?: FeatureTabsVariant;
}

export function FeatureTabs({ variant = 'quiet' }: FeatureTabsProps) {
  const [activeTab, setActiveTab] = useState<'design' | 'code' | 'agents'>('design');

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let tabActive = 'bg-neutral-900 text-white';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    tabActive = 'bg-[#2547E8] text-white';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    tabActive = 'bg-cyan-500 text-black font-semibold';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-center mb-8">One System. Three Audiences.</h2>

        <div className="flex gap-2 p-1.5 rounded-xl bg-neutral-200/60 dark:bg-neutral-800 mb-12">
          {(['design', 'code', 'agents'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={\`px-6 py-2 rounded-lg text-xs font-semibold capitalize transition-all \${
                activeTab === tab ? tabActive : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }\`}
            >
              For {tab}
            </button>
          ))}
        </div>

        <div className="w-full p-8 sm:p-12 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#151921] text-center max-w-3xl shadow-sm">
          {activeTab === 'design' && (
            <div>
              <h3 className="text-xl font-bold mb-2">Designers get mathematical token guardrails.</h3>
              <p className="text-xs sm:text-sm opacity-75 max-w-lg mx-auto">No drift. Curvature, spacing, and density behave as systemic invariants.</p>
            </div>
          )}
          {activeTab === 'code' && (
            <div>
              <h3 className="text-xl font-bold mb-2">Engineers get raw React & Tailwind source code.</h3>
              <p className="text-xs sm:text-sm opacity-75 max-w-lg mx-auto">Zero obfuscated wrapper packages. You own the component tree completely.</p>
            </div>
          )}
          {activeTab === 'agents' && (
            <div>
              <h3 className="text-xl font-bold mb-2">Autonomous agents get schemas and MCP tools.</h3>
              <p className="text-xs sm:text-sm opacity-75 max-w-lg mx-auto">Structured JSON manifests let LLMs compose verified UIs without guesswork.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FeatureTabs, FeatureTabsVariant } from './index.js';

export function FeatureTabsPreview() {
  const [variant, setVariant] = useState<FeatureTabsVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Feature Tabs Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FeatureTabsVariant[]).map((v) => (
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
      <FeatureTabs variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const featureTabsFixtures = {};`,
    readmeCode: `# Feature Tabs

Segmented interactive tabs highlighting product value across diverse user personas.`,
  },

  // 28. Feature Carousel
  {
    slug: 'feature-carousel',
    name: 'Feature Carousel',
    description: 'Interactive swipeable feature card reel with slide indicators and category tags.',
    categories: ['sections', 'marketing', 'features'],
    roles: ['features', 'carousel'],
    purposes: ['Horizontal feature discovery', 'Mobile-friendly feature showcase'],
    componentName: 'FeatureCarousel',
    tags: ['feature-carousel', 'features', 'carousel', 'slider'],
    idealFor: ['Expansive feature sets that exceed vertical screen space'],
    avoidFor: ['Small 2-feature comparisons'],
    jobs: ['Enable fast horizontal navigation across multiple product features'],
    indexCode: `import React, { useState } from 'react';

export type FeatureCarouselVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureCarouselProps {
  variant?: FeatureCarouselVariant;
}

export function FeatureCarousel({ variant = 'quiet' }: FeatureCarouselProps) {
  const [idx, setIdx] = useState(0);
  const cards = [
    { title: 'Composition Engine', desc: 'Drag, nest, and mutate verified components dynamically.' },
    { title: 'Design DNA Lab', desc: 'Tune 25+ visual dimensions across your entire layout in real time.' },
    { title: 'Accessibility Lab', desc: 'Simulate color blindness, verify contrast, and test keyboard focus.' },
  ];

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-blue-50/20 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const currentCard = cards[idx] || cards[0] || { title: '', desc: '' };

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tight mb-8">Feature Reel</h2>

        <div className={\`w-full p-8 rounded-2xl border text-center transition-all \${card}\`}>
          <span className="text-xs font-mono font-bold text-neutral-500 mb-2 block">0{idx + 1} / 0{cards.length}</span>
          <h3 className="text-2xl font-bold mb-4">{currentCard.title}</h3>
          <p className="text-sm opacity-80 max-w-md mx-auto mb-8">{currentCard.desc}</p>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setIdx((i) => (i === 0 ? cards.length - 1 : i - 1))}
              className="px-4 py-1.5 rounded-lg border text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setIdx((i) => (i === cards.length - 1 ? 0 : i + 1))}
              className="px-4 py-1.5 rounded-lg border text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FeatureCarousel, FeatureCarouselVariant } from './index.js';

export function FeatureCarouselPreview() {
  const [variant, setVariant] = useState<FeatureCarouselVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Feature Carousel Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FeatureCarouselVariant[]).map((v) => (
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
      <FeatureCarousel variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const featureCarouselFixtures = {};`,
    readmeCode: `# Feature Carousel

Reel card slider facilitating smooth sequential discovery of core capabilities.`,
  },

  // 29. Feature Comparison
  {
    slug: 'feature-comparison',
    name: 'Feature Comparison',
    description: 'Side-by-side "Before vs After" or "Old Way vs Modern Way" comparative feature breakdown.',
    categories: ['sections', 'marketing', 'features'],
    roles: ['features', 'comparison'],
    purposes: ['Competitive positioning', 'Paradigm shift explanation'],
    componentName: 'FeatureComparison',
    tags: ['feature-comparison', 'comparison', 'features', 'before-after'],
    idealFor: ['Contrasting legacy fragile UI workflows with modern deterministic architecture'],
    avoidFor: ['Basic single-tier announcements'],
    jobs: ['Contrast the pain of old workflows against the benefits of Tessellate'],
    indexCode: `import React from 'react';

export type FeatureComparisonVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureComparisonProps {
  variant?: FeatureComparisonVariant;
}

export function FeatureComparison({ variant = 'quiet' }: FeatureComparisonProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-center mb-16">The Paradigm Shift</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl border border-red-200/60 dark:border-red-900/40 bg-red-50/20 dark:bg-red-950/10">
            <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400 mb-2 block uppercase">The Fragile Way</span>
            <h3 className="text-xl font-bold mb-4">Ad-hoc Component Gluing</h3>
            <ul className="space-y-3 text-xs sm:text-sm opacity-80">
              <li>✕ Copying inconsistent snippets across disparate repos</li>
              <li>✕ Conflicting Tailwind color tokens and spacing overrides</li>
              <li>✕ Unchecked dependency bloat and vendor lock-in</li>
              <li>✕ Inaccessible contrast and broken focus rings</li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10">
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-2 block uppercase">The Tessellate Way</span>
            <h3 className="text-xl font-bold mb-4">Deterministic Composition</h3>
            <ul className="space-y-3 text-xs sm:text-sm opacity-80">
              <li>✓ Validated JSON manifests with Zod schemas</li>
              <li>✓ Mathematical Design DNA consistency guarantees</li>
              <li>✓ 100% clean TypeScript source code export</li>
              <li>✓ Certified WCAG 2.2 AA accessibility out of the box</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FeatureComparison, FeatureComparisonVariant } from './index.js';

export function FeatureComparisonPreview() {
  const [variant, setVariant] = useState<FeatureComparisonVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Feature Comparison Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FeatureComparisonVariant[]).map((v) => (
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
      <FeatureComparison variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const featureComparisonFixtures = {};`,
    readmeCode: `# Feature Comparison

Side-by-side contrast section proving technical superiority over legacy ad-hoc approaches.`,
  },

  // 30. Feature with Live Demo
  {
    slug: 'feature-with-live-demo',
    name: 'Feature with Live Demo',
    description: 'Feature showcase paired directly with an interactive sandbox state toggle.',
    categories: ['sections', 'marketing', 'features'],
    roles: ['features', 'live-demo'],
    purposes: ['Interactive proof', 'Sandbox preview'],
    componentName: 'FeatureWithLiveDemo',
    tags: ['feature-with-live-demo', 'features', 'interactive', 'demo'],
    idealFor: ['Features best demonstrated by direct state interaction'],
    avoidFor: ['Static brochure sites'],
    jobs: ['Give visitor tactile control of a real component inside the feature card'],
    indexCode: `import React, { useState } from 'react';

export type FeatureWithLiveDemoVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureWithLiveDemoProps {
  variant?: FeatureWithLiveDemoVariant;
}

export function FeatureWithLiveDemo({ variant = 'quiet' }: FeatureWithLiveDemoProps) {
  const [active, setActive] = useState(true);

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
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-mono font-bold uppercase text-neutral-500 mb-3 block">Live Sandbox</span>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Tactile state transitions without re-render cascades.</h2>
          <p className="text-sm opacity-80 leading-relaxed mb-6">
            Observe how state toggles propagate smoothly across nested manifests without incurring unwanted DOM rewrites.
          </p>
        </div>

        <div className={\`p-8 rounded-2xl border flex flex-col items-center justify-center text-center \${card}\`}>
          <span className="text-xs font-mono opacity-60 mb-6">Interactive Toggle Component</span>
          <button
            type="button"
            onClick={() => setActive(!active)}
            className={\`px-6 py-3 rounded-xl font-semibold text-xs tracking-wider transition-all \${
              active ? 'bg-emerald-600 text-white' : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
            }\`}
          >
            {active ? 'SYSTEM ACTIVE [ONLINE]' : 'SYSTEM STANDBY [OFFLINE]'}
          </button>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FeatureWithLiveDemo, FeatureWithLiveDemoVariant } from './index.js';

export function FeatureWithLiveDemoPreview() {
  const [variant, setVariant] = useState<FeatureWithLiveDemoVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Feature with Live Demo Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FeatureWithLiveDemoVariant[]).map((v) => (
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
      <FeatureWithLiveDemo variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const featureWithLiveDemoFixtures = {};`,
    readmeCode: `# Feature with Live Demo

Feature showcase directly integrating an interactive stateful control.`,
  },

  // 31. Feature with Code
  {
    slug: 'feature-with-code',
    name: 'Feature with Code',
    description: 'Deep-dive feature section pairing architectural narrative with typed code snippet tabs.',
    categories: ['sections', 'marketing', 'features'],
    roles: ['features', 'code'],
    purposes: ['Developer education', 'API presentation'],
    componentName: 'FeatureWithCode',
    tags: ['feature-with-code', 'features', 'code', 'developer'],
    idealFor: ['Technical products explaining an SDK or CLI interface'],
    avoidFor: ['Non-technical audience pages'],
    jobs: ['Show how concise and clean the code is to use in production'],
    indexCode: `import React from 'react';

export type FeatureWithCodeVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureWithCodeProps {
  variant?: FeatureWithCodeVariant;
}

export function FeatureWithCode({ variant = 'quiet' }: FeatureWithCodeProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let term = 'bg-[#18181B] text-white border-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    term = 'bg-[#0E1528] text-blue-100 border-blue-900/50 shadow-xl';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    term = 'bg-[#12161F] text-cyan-50 border-[#2E3440] shadow-2xl';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-mono font-bold uppercase text-neutral-500 mb-3 block">TypeScript Native</span>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Type-safe manifest composition.</h2>
          <p className="text-sm opacity-80 leading-relaxed mb-6">
            Construct and validate complex page topologies in pure TypeScript with complete autocomplete and compile-time schema checking.
          </p>
        </div>

        <div className={\`p-6 rounded-2xl border font-mono text-xs overflow-x-auto shadow-md \${term}\`}>
          <div className="text-neutral-500 pb-2 mb-2 border-b border-white/10 text-[11px]">composition.ts</div>
          <pre className="text-emerald-400">
            {\`import { composeProject } from '@tessellate/engine';

const project = composeProject({
  theme: 'nocturne',
  sections: [
    'editorial-hero',
    'pricing-three-tier'
  ],
});\`}
          </pre>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FeatureWithCode, FeatureWithCodeVariant } from './index.js';

export function FeatureWithCodePreview() {
  const [variant, setVariant] = useState<FeatureWithCodeVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Feature with Code Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FeatureWithCodeVariant[]).map((v) => (
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
      <FeatureWithCode variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const featureWithCodeFixtures = {};`,
    readmeCode: `# Feature with Code

Developer feature breakdown pairing narrative copy with syntax-highlighted TypeScript.`,
  },

  // 32. Feature Timeline
  {
    slug: 'feature-timeline',
    name: 'Feature Timeline',
    description: 'Chronological evolution or milestone timeline with connecting guides and release tags.',
    categories: ['sections', 'marketing', 'features'],
    roles: ['features', 'timeline'],
    purposes: ['Product evolution', 'Roadmap milestones'],
    componentName: 'FeatureTimeline',
    tags: ['feature-timeline', 'features', 'timeline', 'roadmap'],
    idealFor: ['Changelogs, roadmaps, and architectural phase evolution'],
    avoidFor: ['Small single-purpose feature callouts'],
    jobs: ['Show sequential progression of capability over time'],
    indexCode: `import React from 'react';

export type FeatureTimelineVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureTimelineProps {
  variant?: FeatureTimelineVariant;
}

export function FeatureTimeline({ variant = 'quiet' }: FeatureTimelineProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const milestones = [
    { phase: 'Phase 01', title: 'Schemas & Contract Stabilization', desc: 'Authored canonical Zod models for DNA, Resources, and Projects.' },
    { phase: 'Phase 02', title: 'Composition Engine & Validation', desc: 'Sub-millisecond graph solver enforcing geometric consistency.' },
    { phase: 'Phase 03', title: '324 Canonical Launch Resources', desc: 'Complete coverage across primitives, shells, sections, and blocks.' },
  ];

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Architectural Evolution</h2>

        <div className="space-y-10 border-l-2 border-neutral-200 dark:border-neutral-800 ml-4 sm:ml-8 pl-6 sm:pl-10">
          {milestones.map((m) => (
            <div key={m.phase} className="relative">
              <span className="absolute -left-[31px] sm:-left-[47px] top-1 h-3.5 w-3.5 rounded-full bg-neutral-900 dark:bg-white border-2 border-white dark:border-[#0B0D10]" />
              <span className="text-xs font-mono font-bold text-neutral-500 mb-1 block uppercase">{m.phase}</span>
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
import { FeatureTimeline, FeatureTimelineVariant } from './index.js';

export function FeatureTimelinePreview() {
  const [variant, setVariant] = useState<FeatureTimelineVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Feature Timeline Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FeatureTimelineVariant[]).map((v) => (
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
      <FeatureTimeline variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const featureTimelineFixtures = {};`,
    readmeCode: `# Feature Timeline

Vertical milestone timeline charting chronological progress and engineering phases.`,
  },

  // 33. Feature Steps
  {
    slug: 'feature-steps',
    name: 'Feature Steps',
    description: 'Sequential 3-step feature walkthrough emphasizing onboarding ease and operational flow.',
    categories: ['sections', 'marketing', 'features'],
    roles: ['features', 'steps'],
    purposes: ['Workflow onboarding', 'Quick-start walkthrough'],
    componentName: 'FeatureSteps',
    tags: ['feature-steps', 'features', 'steps', 'workflow'],
    idealFor: ['Explaining a simple 1-2-3 operational onboarding model'],
    avoidFor: ['Complex non-linear branching systems'],
    jobs: ['Convince visitor that getting started takes three straightforward steps'],
    indexCode: `import React from 'react';

export type FeatureStepsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureStepsProps {
  variant?: FeatureStepsVariant;
}

export function FeatureSteps({ variant = 'quiet' }: FeatureStepsProps) {
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
    { num: '01', title: 'Select Blueprint', desc: 'Choose a battle-tested archetype tailored to your product category.' },
    { num: '02', title: 'Tune Design DNA', desc: 'Adjust typography, density, and curvature with real-time feedback.' },
    { num: '03', title: 'Export Full Code', desc: 'Download standalone TypeScript and Tailwind files with 0 runtime lock-in.' },
  ];

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Three Steps to Production</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.num} className={\`p-6 rounded-2xl border \${card}\`}>
              <div className="text-3xl font-mono font-bold mb-4 opacity-50">{s.num}</div>
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
import { FeatureSteps, FeatureStepsVariant } from './index.js';

export function FeatureStepsPreview() {
  const [variant, setVariant] = useState<FeatureStepsVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Feature Steps Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FeatureStepsVariant[]).map((v) => (
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
      <FeatureSteps variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const featureStepsFixtures = {};`,
    readmeCode: `# Feature Steps

Sequential 3-step feature walkthrough emphasizing straightforward onboarding.`,
  },

  // 34. Feature Spotlight
  {
    slug: 'feature-spotlight',
    name: 'Feature Spotlight',
    description: 'Full-width spotlight card highlighting a single flagship capability with glow accents.',
    categories: ['sections', 'marketing', 'features'],
    roles: ['features', 'spotlight'],
    purposes: ['Flagship capability focus', 'Core value accentuation'],
    componentName: 'FeatureSpotlight',
    tags: ['feature-spotlight', 'features', 'spotlight', 'marketing'],
    idealFor: ['Spotlighting the single most differentiated technology in a product'],
    avoidFor: ['Broad lists of minor bug fixes'],
    jobs: ['Focus visitor attention on the flagship architectural innovation'],
    indexCode: `import React from 'react';

export type FeatureSpotlightVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureSpotlightProps {
  variant?: FeatureSpotlightVariant;
}

export function FeatureSpotlight({ variant = 'quiet' }: FeatureSpotlightProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-[#FAF8F5] border-neutral-300';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-xl';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440] shadow-2xl';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto">
        <div className={\`p-8 sm:p-16 rounded-3xl border text-center flex flex-col items-center \${card}\`}>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-4">Spotlight Innovation</span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight max-w-2xl mb-6">
            Autonomous Graph Solvers for Coherent Front-Ends
          </h2>
          <p className="text-sm sm:text-base opacity-80 max-w-xl leading-relaxed mb-8">
            Unlike static template libraries, Tessellate understands mathematical compatibility between navigation, content blocks, and typography.
          </p>
          <button type="button" className="px-6 py-3 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold text-xs uppercase tracking-wider hover:opacity-90">
            Read Graph Architecture Paper
          </button>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FeatureSpotlight, FeatureSpotlightVariant } from './index.js';

export function FeatureSpotlightPreview() {
  const [variant, setVariant] = useState<FeatureSpotlightVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Feature Spotlight Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FeatureSpotlightVariant[]).map((v) => (
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
      <FeatureSpotlight variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const featureSpotlightFixtures = {};`,
    readmeCode: `# Feature Spotlight

Full-width showcase card spotlighting a single flagship technical capability.`,
  },

  // 35. Feature Metrics
  {
    slug: 'feature-metrics',
    name: 'Feature Metrics',
    description: 'Feature section backed by empirical benchmark graphs and performance comparison stats.',
    categories: ['sections', 'marketing', 'features'],
    roles: ['features', 'metrics'],
    purposes: ['Empirical performance verification', 'Technical differentiation'],
    componentName: 'FeatureMetrics',
    tags: ['feature-metrics', 'features', 'metrics', 'benchmarks'],
    idealFor: ['Proving benchmark claims with empirical latency and payload data'],
    avoidFor: ['Purely subjective design arguments'],
    jobs: ['Support architectural claims with measurable speed and size statistics'],
    indexCode: `import React from 'react';

export type FeatureMetricsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureMetricsProps {
  variant?: FeatureMetricsVariant;
}

export function FeatureMetrics({ variant = 'quiet' }: FeatureMetricsProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/40 border-blue-100 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Audited Performance Metrics</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className={\`p-6 rounded-2xl border text-center \${card}\`}>
            <div className="text-4xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-2">&lt; 150 KB</div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1">Gzip Bundle Ceiling</div>
            <p className="text-xs opacity-70">Strict budget enforced on public pages.</p>
          </div>
          <div className={\`p-6 rounded-2xl border text-center \${card}\`}>
            <div className="text-4xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-2">0.0 ms</div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1">Third-Party Tracking</div>
            <p className="text-xs opacity-70">Zero analytics cookies or ad beacons.</p>
          </div>
          <div className={\`p-6 rounded-2xl border text-center \${card}\`}>
            <div className="text-4xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-2">100/100</div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1">Lighthouse Performance</div>
            <p className="text-xs opacity-70">Desktop and mobile verified clean.</p>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FeatureMetrics, FeatureMetricsVariant } from './index.js';

export function FeatureMetricsPreview() {
  const [variant, setVariant] = useState<FeatureMetricsVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Feature Metrics Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FeatureMetricsVariant[]).map((v) => (
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
      <FeatureMetrics variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const featureMetricsFixtures = {};`,
    readmeCode: `# Feature Metrics

Quantitative feature proof section validating payload budgets and Lighthouse scores.`,
  },

  // 36. Feature Matrix
  {
    slug: 'feature-matrix',
    name: 'Feature Matrix',
    description: 'Comprehensive feature availability grid categorized across core functional pillars.',
    categories: ['sections', 'marketing', 'features'],
    roles: ['features', 'matrix'],
    purposes: ['Detailed capability breakdown', 'Comprehensive spec sheet'],
    componentName: 'FeatureMatrix',
    tags: ['feature-matrix', 'features', 'matrix', 'specifications'],
    idealFor: ['Technical spec sheets comparing capabilities across the platform'],
    avoidFor: ['Minimal single-line hero banners'],
    jobs: ['Provide thorough tabular inventory of features and supported attributes'],
    indexCode: `import React from 'react';

export type FeatureMatrixVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureMatrixProps {
  variant?: FeatureMatrixVariant;
}

export function FeatureMatrix({ variant = 'quiet' }: FeatureMatrixProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let tableBorder = 'border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    tableBorder = 'border-blue-100';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    tableBorder = 'border-[#2E3440]';
  }

  const rows = [
    { capability: 'Verified Zod Schemas', primitives: 'Yes', shells: 'Yes', sections: 'Yes', blocks: 'Yes' },
    { capability: 'WCAG 2.2 AA Contrast', primitives: 'Yes', shells: 'Yes', sections: 'Yes', blocks: 'Yes' },
    { capability: 'Zero External CSS Dependencies', primitives: 'Yes', shells: 'Yes', sections: 'Yes', blocks: 'Yes' },
    { capability: 'Curated Nocturne Theme', primitives: 'Yes', shells: 'Yes', sections: 'Yes', blocks: 'Yes' },
  ];

  return (
    <section className={\`relative w-full py-20 px-6 sm:px-12 border-b transition-colors \${bg}\`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Capability Matrix</h2>

        <div className={\`overflow-x-auto rounded-xl border \${tableBorder}\`}>
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b bg-neutral-100/60 dark:bg-neutral-900/60 text-xs uppercase tracking-wider font-mono">
              <tr>
                <th className="p-4">Capability</th>
                <th className="p-4">Primitives</th>
                <th className="p-4">Shells</th>
                <th className="p-4">Sections</th>
                <th className="p-4">Blocks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {rows.map((r) => (
                <tr key={r.capability} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                  <td className="p-4 font-semibold">{r.capability}</td>
                  <td className="p-4 text-emerald-600 dark:text-emerald-400 font-mono">{r.primitives}</td>
                  <td className="p-4 text-emerald-600 dark:text-emerald-400 font-mono">{r.shells}</td>
                  <td className="p-4 text-emerald-600 dark:text-emerald-400 font-mono">{r.sections}</td>
                  <td className="p-4 text-emerald-600 dark:text-emerald-400 font-mono">{r.blocks}</td>
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
import { FeatureMatrix, FeatureMatrixVariant } from './index.js';

export function FeatureMatrixPreview() {
  const [variant, setVariant] = useState<FeatureMatrixVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Feature Matrix Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FeatureMatrixVariant[]).map((v) => (
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
      <FeatureMatrix variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const featureMatrixFixtures = {};`,
    readmeCode: `# Feature Matrix

Tabular breakdown comparing resource capabilities across primitives, shells, sections, and blocks.`,
  },
];
