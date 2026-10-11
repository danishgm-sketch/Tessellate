import type { MotionDef } from './motion-builder';

export const MOTION_BATCH_1: MotionDef[] = [
  // 1. Fade-Up Reveal
  {
    slug: 'fade-up-reveal',
    name: 'Fade-Up Reveal',
    description: 'Smooth vertical translate-y and opacity entrance reveal with springy or linear settling physics.',
    categories: ['motion', 'microinteractions', 'reveals'],
    roles: ['reveal', 'entrance'],
    purposes: ['page-load-entrance', 'card-reveal', 'scroll-triggered-entrance'],
    componentName: 'FadeUpReveal',
    tags: ['motion', 'fade-up', 'reveal', 'entrance', 'animation'],
    idealFor: ['Card grid stagger reveals', 'Hero section headline entry', 'Modal dialog entrance'],
    avoidFor: ['Continuous spinning loops', 'Static data tables with no entry'],
    jobs: ['Reveal content gracefully with vertical translation and opacity blend'],
    indexCode: `import React, { useState } from 'react';

export type FadeUpRevealVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FadeUpRevealProps {
  variant?: FadeUpRevealVariant;
  children?: React.ReactNode;
}

export function FadeUpReveal({ variant = 'quiet', children }: FadeUpRevealProps) {
  const [revealed, setRevealed] = useState(true);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const transitionClass =
    variant === 'expressive'
      ? 'transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]'
      : variant === 'nocturne'
      ? 'transition-all duration-500 ease-out'
      : 'transition-all duration-300 ease-linear';

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setRevealed(false);
            setTimeout(() => setRevealed(true), 50);
          }}
          className="text-xs px-3 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-current"
        >
          Replay Entrance
        </button>
      </div>

      <div
        className={\`w-full p-6 rounded-xl border \${cardBg} \${transitionClass} motion-reduce:transition-none motion-reduce:transform-none \${
          revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }\`}
      >
        {children ?? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold tracking-tight">Deterministic Fade-Up Reveal</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Entrance animation triggered with CSS transitions. Respects prefers-reduced-motion to eliminate motion sickness.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FadeUpReveal, FadeUpRevealVariant } from './index';

export function FadeUpRevealPreview() {
  const [variant, setVariant] = useState<FadeUpRevealVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
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
      <FadeUpReveal variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const fadeUpRevealFixtures = {};`,
    readmeCode: `# Fade-Up Reveal

Vertical translate-y entrance reveal with reduced-motion fallbacks and replay trigger.`,
  },

  // 2. Masked Text Reveal
  {
    slug: 'masked-text-reveal',
    name: 'Masked Text Reveal',
    description: 'Editorial overflow-hidden text mask sliding upwards from an invisible baseline boundary.',
    categories: ['motion', 'microinteractions', 'reveals'],
    roles: ['reveal', 'editorial'],
    purposes: ['headline-reveal', 'editorial-typography', 'premium-hero-transition'],
    componentName: 'MaskedTextReveal',
    tags: ['motion', 'masked-text', 'editorial', 'reveal', 'overflow'],
    idealFor: ['Editorial hero headlines', 'Launch announcement titles', 'Brand statement intros'],
    avoidFor: ['Dense 100-row tabular data', 'Code editor body'],
    jobs: ['Slide large typographic headlines out of an overflow clipping boundary'],
    indexCode: `import React, { useState } from 'react';

export type MaskedTextRevealVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MaskedTextRevealProps {
  variant?: MaskedTextRevealVariant;
  text?: string;
}

export function MaskedTextReveal({
  variant = 'quiet',
  text = 'Software Composed, Not Stitched.',
}: MaskedTextRevealProps) {
  const [revealed, setRevealed] = useState(true);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const textColor =
    variant === 'nocturne'
      ? 'text-white'
      : variant === 'expressive'
      ? 'text-[#2547E8]'
      : 'text-neutral-900 dark:text-white';

  return (
    <div className={\`w-full p-8 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-mono text-neutral-400">Masked Overflow Clip</span>
        <button
          onClick={() => {
            setRevealed(false);
            setTimeout(() => setRevealed(true), 50);
          }}
          className="text-xs px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-current"
        >
          Replay
        </button>
      </div>

      <div className="overflow-hidden py-1">
        <h2
          className={\`text-2xl sm:text-3xl font-bold tracking-tight transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:transform-none \${textColor} \${
            revealed ? 'translate-y-0' : 'translate-y-full'
          }\`}
        >
          {text}
        </h2>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { MaskedTextReveal, MaskedTextRevealVariant } from './index';

export function MaskedTextRevealPreview() {
  const [variant, setVariant] = useState<MaskedTextRevealVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
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
      <MaskedTextReveal variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const maskedTextRevealFixtures = {};`,
    readmeCode: `# Masked Text Reveal

Editorial headline entrance masking text inside an overflow-hidden boundary.`,
  },

  // 3. Word Stagger Reveal
  {
    slug: 'word-stagger-reveal',
    name: 'Word Stagger Reveal',
    description: 'Headline word sequence staggering entrance with progressive delay per token for dramatic cadence.',
    categories: ['motion', 'microinteractions', 'reveals'],
    roles: ['reveal', 'words'],
    purposes: ['progressive-text-reveal', 'narrative-pacing', 'hero-presentation'],
    componentName: 'WordStaggerReveal',
    tags: ['motion', 'stagger', 'words', 'typography', 'reveal'],
    idealFor: ['Product landing taglines', 'Mission statements', 'Presentation slide titles'],
    avoidFor: ['Fast tabular logs', 'Paragraph legal text'],
    jobs: ['Stagger sequential words into view with controlled perceptual cadence'],
    indexCode: `import React, { useState } from 'react';

export type WordStaggerRevealVariant = 'quiet' | 'expressive' | 'nocturne';

export interface WordStaggerRevealProps {
  variant?: WordStaggerRevealVariant;
}

export function WordStaggerReveal({ variant = 'quiet' }: WordStaggerRevealProps) {
  const [revealed, setRevealed] = useState(true);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const words = ['Precision', 'design', 'systems', 'engineered', 'for', 'autonomous', 'agents.'];

  return (
    <div className={\`w-full p-8 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-mono text-neutral-400">Word Stagger Sequence</span>
        <button
          onClick={() => {
            setRevealed(false);
            setTimeout(() => setRevealed(true), 50);
          }}
          className="text-xs px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-current"
        >
          Replay
        </button>
      </div>

      <div className="flex flex-wrap gap-x-2 gap-y-1">
        {words.map((w, idx) => (
          <span
            key={idx}
            style={{ transitionDelay: \`\${idx * 60}ms\` }}
            className={\`text-xl sm:text-2xl font-bold tracking-tight inline-block transition-all duration-500 motion-reduce:transition-none motion-reduce:transform-none \${
              revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }\`}
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { WordStaggerReveal, WordStaggerRevealVariant } from './index';

export function WordStaggerRevealPreview() {
  const [variant, setVariant] = useState<WordStaggerRevealVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
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
      <WordStaggerReveal variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const wordStaggerRevealFixtures = {};`,
    readmeCode: `# Word Stagger Reveal

Progressive word-by-word staggered entrance transition with delay intervals.`,
  },

  // 4. Character Stagger Reveal
  {
    slug: 'character-stagger-reveal',
    name: 'Character Stagger Reveal',
    description: 'Fine-grained character-by-character kinetic reveal for brand monograms, metrics, and hero phrases.',
    categories: ['motion', 'microinteractions', 'reveals'],
    roles: ['reveal', 'characters'],
    purposes: ['kinetic-typography', 'brand-intro', 'fine-grained-animation'],
    componentName: 'CharacterStaggerReveal',
    tags: ['motion', 'characters', 'kinetic', 'letters', 'reveal'],
    idealFor: ['Brand wordmarks', 'Hero metric numerals', 'Impact statements'],
    avoidFor: ['Standard paragraphs', 'Form helper descriptions'],
    jobs: ['Animate letters sequentially into place with hairline typographic precision'],
    indexCode: `import React, { useState } from 'react';

export type CharacterStaggerRevealVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CharacterStaggerRevealProps {
  variant?: CharacterStaggerRevealVariant;
}

export function CharacterStaggerReveal({ variant = 'quiet' }: CharacterStaggerRevealProps) {
  const [revealed, setRevealed] = useState(true);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const chars = 'TESSELLATE'.split('');

  return (
    <div className={\`w-full p-8 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-mono text-neutral-400">Kinetic Character Cascade</span>
        <button
          onClick={() => {
            setRevealed(false);
            setTimeout(() => setRevealed(true), 50);
          }}
          className="text-xs px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-current"
        >
          Replay
        </button>
      </div>

      <div className="flex justify-center tracking-[0.3em] font-mono text-3xl font-extrabold py-4">
        {chars.map((c, idx) => (
          <span
            key={idx}
            style={{ transitionDelay: \`\${idx * 35}ms\` }}
            className={\`inline-block transition-all duration-400 motion-reduce:transition-none motion-reduce:transform-none \${
              revealed ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-3'
            }\`}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CharacterStaggerReveal, CharacterStaggerRevealVariant } from './index';

export function CharacterStaggerRevealPreview() {
  const [variant, setVariant] = useState<CharacterStaggerRevealVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
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
      <CharacterStaggerReveal variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const characterStaggerRevealFixtures = {};`,
    readmeCode: `# Character Stagger Reveal

Fine-grained character-by-character kinetic reveal for brand monograms and hero metrics.`,
  },

  // 5. Blur-to-Sharp Reveal
  {
    slug: 'blur-to-sharp-reveal',
    name: 'Blur-to-Sharp Reveal',
    description: 'Defocus-to-crisp entrance transitioning from filter blur(8px) into razor-sharp focus.',
    categories: ['motion', 'microinteractions', 'reveals'],
    roles: ['reveal', 'filter'],
    purposes: ['optical-focus', 'cinematic-reveal', 'depth-transition'],
    componentName: 'BlurToSharpReveal',
    tags: ['motion', 'blur', 'focus', 'optical', 'reveal'],
    idealFor: ['Cinematic hero cards', 'Art direction showcases', 'Product screenshot reveals'],
    avoidFor: ['Low-end mobile devices under GPU constraints', 'Text input cursors'],
    jobs: ['Transition visual assets from blurred defocus into crisp optical sharpness'],
    indexCode: `import React, { useState } from 'react';

export type BlurToSharpRevealVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BlurToSharpRevealProps {
  variant?: BlurToSharpRevealVariant;
}

export function BlurToSharpReveal({ variant = 'quiet' }: BlurToSharpRevealProps) {
  const [revealed, setRevealed] = useState(true);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  return (
    <div className={\`w-full p-8 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-mono text-neutral-400">Optical Blur-to-Sharp Focus</span>
        <button
          onClick={() => {
            setRevealed(false);
            setTimeout(() => setRevealed(true), 50);
          }}
          className="text-xs px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-current"
        >
          Replay
        </button>
      </div>

      <div
        className={\`p-6 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-all duration-700 motion-reduce:transition-none motion-reduce:filter-none \${
          revealed ? 'opacity-100 filter-none' : 'opacity-0 blur-md'
        }\`}
      >
        <div className="text-sm font-semibold mb-1">Razor-Sharp Artifact Output</div>
        <p className="text-xs text-neutral-500 leading-relaxed">
          The blur-to-sharp transition provides a cinematic optical settling effect while gracefully degrading under reduced motion preferences.
        </p>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { BlurToSharpReveal, BlurToSharpRevealVariant } from './index';

export function BlurToSharpRevealPreview() {
  const [variant, setVariant] = useState<BlurToSharpRevealVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
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
      <BlurToSharpReveal variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const blurToSharpRevealFixtures = {};`,
    readmeCode: `# Blur-to-Sharp Reveal

Optical defocus transition blending CSS filter blur into razor-sharp focus.`,
  },

  // 6. Scale Reveal
  {
    slug: 'scale-reveal',
    name: 'Scale Reveal',
    description: 'Smooth scale-up entrance from 0.95 to 1.0 with subtle spring settling and opacity fade.',
    categories: ['motion', 'microinteractions', 'reveals'],
    roles: ['reveal', 'scale'],
    purposes: ['dialog-entrance', 'card-settling', 'tactile-pop'],
    componentName: 'ScaleReveal',
    tags: ['motion', 'scale', 'spring', 'reveal', 'pop'],
    idealFor: ['Modal dialogs', 'Tooltip popovers', 'Floating command palettes'],
    avoidFor: ['Full document scroll pages', 'Horizontal carousels'],
    jobs: ['Pop interactive surfaces into view with proportional scale settling'],
    indexCode: `import React, { useState } from 'react';

export type ScaleRevealVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ScaleRevealProps {
  variant?: ScaleRevealVariant;
}

export function ScaleReveal({ variant = 'quiet' }: ScaleRevealProps) {
  const [revealed, setRevealed] = useState(true);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white shadow-xl'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-xl'
      : 'bg-white border-neutral-200 text-neutral-900 shadow-md';

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setRevealed(false);
            setTimeout(() => setRevealed(true), 50);
          }}
          className="text-xs px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-current"
        >
          Replay Pop
        </button>
      </div>

      <div
        className={\`w-full p-6 rounded-xl border \${cardBg} transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none motion-reduce:transform-none \${
          revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }\`}
      >
        <h4 className="text-sm font-semibold mb-1">Scale Pop Dialog</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Pops into view using an intentional slight spring overshoot curve, delivering satisfying tactile feedback.
        </p>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ScaleReveal, ScaleRevealVariant } from './index';

export function ScaleRevealPreview() {
  const [variant, setVariant] = useState<ScaleRevealVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
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
      <ScaleReveal variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const scaleRevealFixtures = {};`,
    readmeCode: `# Scale Reveal

Scale-up entrance with subtle spring overshoot curve for modals and popovers.`,
  },

  // 7. Slide Clip Reveal
  {
    slug: 'slide-clip-reveal',
    name: 'Slide Clip Reveal',
    description: 'Horizontal or vertical clip-path swipe uncovering child content like a mechanical aperture.',
    categories: ['motion', 'microinteractions', 'reveals'],
    roles: ['reveal', 'clip'],
    purposes: ['clip-path-wipe', 'before-after-reveal', 'aperture-entrance'],
    componentName: 'SlideClipReveal',
    tags: ['motion', 'clip-path', 'wipe', 'reveal', 'aperture'],
    idealFor: ['Before-and-after image wipes', 'Brand unveilings', 'Feature comparison sliders'],
    avoidFor: ['Standard form inputs', 'Small icon badges'],
    jobs: ['Uncover surfaces smoothly with polygon clip-path geometry'],
    indexCode: `import React, { useState } from 'react';

export type SlideClipRevealVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SlideClipRevealProps {
  variant?: SlideClipRevealVariant;
}

export function SlideClipReveal({ variant = 'quiet' }: SlideClipRevealProps) {
  const [sliderPos, setSliderPos] = useState(50);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-mono text-neutral-400">Clip-Path Wipe Comparison</span>
        <span className="text-xs font-mono font-medium">{sliderPos}%</span>
      </div>

      <div className="relative w-full h-44 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 select-none">
        {/* Under layer (Quiet) */}
        <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-6 text-center">
          <div>
            <div className="text-xs font-mono font-bold uppercase text-neutral-500 mb-1">Quiet Mode</div>
            <div className="text-sm font-semibold">Calm Slate Minimalist Baseline</div>
          </div>
        </div>

        {/* Over layer (Nocturne / Expressive clipped) */}
        <div
          className="absolute inset-0 bg-neutral-950 text-white flex items-center justify-center p-6 text-center transition-all duration-75"
          style={{ clipPath: \`polygon(0 0, \${sliderPos}% 0, \${sliderPos}% 100%, 0 100%)\` }}
        >
          <div>
            <div className="text-xs font-mono font-bold uppercase text-cyan-400 mb-1">Nocturne Mode</div>
            <div className="text-sm font-semibold text-cyan-50">Obsidian Razor-Sharp Luminescence</div>
          </div>
        </div>

        {/* Divider bar */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
          style={{ left: \`\${sliderPos}%\` }}
        />
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={sliderPos}
        onChange={(e) => setSliderPos(Number(e.target.value))}
        className="w-full accent-neutral-900 dark:accent-white cursor-pointer"
      />
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { SlideClipReveal, SlideClipRevealVariant } from './index';

export function SlideClipRevealPreview() {
  const [variant, setVariant] = useState<SlideClipRevealVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
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
      <SlideClipReveal variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const slideClipRevealFixtures = {};`,
    readmeCode: `# Slide Clip Reveal

Interactive clip-path aperture reveal enabling dual-layer comparison wipes.`,
  },

  // 8. Scroll Progress
  {
    slug: 'scroll-progress',
    name: 'Scroll Progress',
    description: 'Header hairline progress track calculating document reading percentage and viewport completion.',
    categories: ['motion', 'microinteractions', 'scroll'],
    roles: ['progress', 'scroll'],
    purposes: ['reading-progress', 'scroll-completion', 'viewport-tracking'],
    componentName: 'ScrollProgress',
    tags: ['motion', 'scroll', 'progress', 'hairline', 'indicator'],
    idealFor: ['Long documentation pages', 'Editorial essays and case studies', 'Multi-step guided articles'],
    avoidFor: ['Short modal dialogs', 'Fixed non-scrolling dashboards'],
    jobs: ['Provide real-time visual progress indicator of reading and scroll completion'],
    indexCode: `import React, { useState } from 'react';

export type ScrollProgressVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ScrollProgressProps {
  variant?: ScrollProgressVariant;
}

export function ScrollProgress({ variant = 'quiet' }: ScrollProgressProps) {
  const [progress, setProgress] = useState(65);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const fillBg =
    variant === 'nocturne'
      ? 'bg-cyan-400'
      : variant === 'expressive'
      ? 'bg-[#2547E8]'
      : 'bg-neutral-900 dark:bg-white';

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Article Reading Progress</h4>
          <p className="text-xs text-neutral-500">Fixed top hairline telemetry</p>
        </div>
        <span className="text-xs font-mono font-medium">{progress}% Completed</span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <div
          className={\`h-full rounded-full transition-all duration-150 \${fillBg}\`}
          style={{ width: \`\${progress}%\` }}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <span className="text-xs text-neutral-400 font-mono">Simulate Scroll:</span>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="flex-1 accent-neutral-900 dark:accent-white cursor-pointer"
        />
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ScrollProgress, ScrollProgressVariant } from './index';

export function ScrollProgressPreview() {
  const [variant, setVariant] = useState<ScrollProgressVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
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
      <ScrollProgress variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const scrollProgressFixtures = {};`,
    readmeCode: `# Scroll Progress

Viewport and document scroll progress tracking bar with simulation controls.`,
  },

  // 9. Sticky Scroll Story
  {
    slug: 'sticky-scroll-story',
    name: 'Sticky Scroll Story',
    description: 'Sticky viewport container pairing stationary preview graphic with scrolling narrative chapters.',
    categories: ['motion', 'microinteractions', 'scroll'],
    roles: ['story', 'scroll'],
    purposes: ['product-walkthrough', 'narrative-demo', 'feature-storytelling'],
    componentName: 'StickyScrollStory',
    tags: ['motion', 'sticky', 'scroll', 'story', 'chapters'],
    idealFor: ['Product capability stories', 'Onboarding walkthroughs', 'Interactive architecture tours'],
    avoidFor: ['Dense spreadsheet editing', 'Command palettes'],
    jobs: ['Pair scrolling narrative chapter copy with a pinned, reactive visual display'],
    indexCode: `import React, { useState } from 'react';

export type StickyScrollStoryVariant = 'quiet' | 'expressive' | 'nocturne';

export interface StickyScrollStoryProps {
  variant?: StickyScrollStoryVariant;
}

export function StickyScrollStory({ variant = 'quiet' }: StickyScrollStoryProps) {
  const [activeChapter, setActiveChapter] = useState(0);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const chapters = [
    { title: '01. Ingestion', text: 'Telemetry streams continuously into edge workers with sub-5ms routing.' },
    { title: '02. Validation', text: 'Deterministic schema validation rejects malformed packets at the gateway boundary.' },
    { title: '03. Synthesis', text: 'Composed UI manifests update in real-time with zero client bundle penalties.' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col md:flex-row gap-6 transition-colors \${cardBg}\`}>
      <div className="flex-1 space-y-4">
        <h4 className="text-sm font-semibold tracking-tight">Sticky Story Chapters</h4>
        <div className="space-y-2">
          {chapters.map((c, idx) => (
            <div
              key={c.title}
              onClick={() => setActiveChapter(idx)}
              className={\`p-3 rounded-lg border text-xs cursor-pointer transition-colors \${
                activeChapter === idx
                  ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800 font-semibold'
                  : 'border-neutral-200 dark:border-neutral-800 opacity-60 hover:opacity-100'
              }\`}
            >
              <div className="mb-0.5">{c.title}</div>
              <div className="text-[11px] text-neutral-500 font-normal leading-relaxed">{c.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
        <div className="text-xs font-mono uppercase text-neutral-400 mb-1">Active Visual State</div>
        <div className="text-base font-bold mb-2">{chapters[activeChapter]?.title}</div>
        <div className="w-16 h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xl font-bold font-mono">
          {activeChapter + 1}
        </div>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { StickyScrollStory, StickyScrollStoryVariant } from './index';

export function StickyScrollStoryPreview() {
  const [variant, setVariant] = useState<StickyScrollStoryVariant>('quiet');

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
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
      <StickyScrollStory variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const stickyScrollStoryFixtures = {};`,
    readmeCode: `# Sticky Scroll Story

Narrative container pairing scrolling text chapters with a sticky reactive state preview.`,
  },

  // 10. Horizontal Scroll Story
  {
    slug: 'horizontal-scroll-story',
    name: 'Horizontal Scroll Story',
    description: 'Track-based horizontal pan card sequence with step indicators, scroll lock, and keyboard arrow navigation.',
    categories: ['motion', 'microinteractions', 'scroll'],
    roles: ['horizontal', 'story'],
    purposes: ['card-carousel', 'timeline-panning', 'step-walkthrough'],
    componentName: 'HorizontalScrollStory',
    tags: ['motion', 'horizontal', 'pan', 'carousel', 'scroll'],
    idealFor: ['Product milestone roadmaps', 'Feature carousel cards', 'Case study horizontal timelines'],
    avoidFor: ['Standard vertical blog reading', 'Dense setting menus'],
    jobs: ['Pan sequentially through horizontal milestone cards with snap points and arrows'],
    indexCode: `import React, { useState } from 'react';

export type HorizontalScrollStoryVariant = 'quiet' | 'expressive' | 'nocturne';

export interface HorizontalScrollStoryProps {
  variant?: HorizontalScrollStoryVariant;
}

export function HorizontalScrollStory({ variant = 'quiet' }: HorizontalScrollStoryProps) {
  const [activeStep, setActiveStep] = useState(0);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const cards = [
    { step: 'Phase 01', title: 'Catalog Discovery', desc: 'Auto-scan verified components in repository.' },
    { step: 'Phase 02', title: 'Constraint Solving', desc: 'Deterministic compatibility checks for tokens.' },
    { step: 'Phase 03', title: 'Standalone Export', desc: 'Pure React output with 0 runtime lock-in.' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors \${cardBg}\`}>
      <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Horizontal Build Order</h4>
          <p className="text-xs text-neutral-500">Step {activeStep + 1} of {cards.length}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 disabled:opacity-40"
          >
            ←
          </button>
          <button
            onClick={() => setActiveStep(Math.min(cards.length - 1, activeStep + 1))}
            disabled={activeStep === cards.length - 1}
            className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 disabled:opacity-40"
          >
            →
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-hidden py-2">
        {cards.map((c, idx) => {
          const isSelected = activeStep === idx;
          return (
            <div
              key={c.step}
              onClick={() => setActiveStep(idx)}
              className={\`flex-shrink-0 w-64 p-4 rounded-xl border text-xs cursor-pointer transition-all duration-300 \${
                isSelected
                  ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800 ring-1 ring-current scale-100'
                  : 'border-neutral-200 dark:border-neutral-800 opacity-60 scale-95'
              }\`}
            >
              <span className="text-[10px] font-mono font-bold text-neutral-400 block mb-1">{c.step}</span>
              <div className="font-semibold text-sm mb-1">{c.title}</div>
              <p className="text-neutral-500 leading-relaxed text-[11px]">{c.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { HorizontalScrollStory, HorizontalScrollStoryVariant } from './index';

export function HorizontalScrollStoryPreview() {
  const [variant, setVariant] = useState<HorizontalScrollStoryVariant>('quiet');

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
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
      <HorizontalScrollStory variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const horizontalScrollStoryFixtures = {};`,
    readmeCode: `# Horizontal Scroll Story

Horizontal card sequence panning through step progression with arrow controls and snap points.`,
  },

  // 11. Parallax Media
  {
    slug: 'parallax-media',
    name: 'Parallax Media',
    description: 'Subtle multi-plane parallax depth container translating background and foreground elements at differential velocities.',
    categories: ['motion', 'microinteractions', 'parallax'],
    roles: ['parallax', 'media'],
    purposes: ['depth-illusion', 'layered-media', 'hero-engagement'],
    componentName: 'ParallaxMedia',
    tags: ['motion', 'parallax', 'depth', 'planes', 'media'],
    idealFor: ['Hero product preview shots', 'Hardware device mockups', 'Artful editorial cover photos'],
    avoidFor: ['Functional spreadsheet tables', 'High-density terminal consoles'],
    jobs: ['Produce subtle differential optical depth across layered background and foreground elements'],
    indexCode: `import React, { useState } from 'react';

export type ParallaxMediaVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ParallaxMediaProps {
  variant?: ParallaxMediaVariant;
}

export function ParallaxMedia({ variant = 'quiet' }: ParallaxMediaProps) {
  const [offset, setOffset] = useState(0);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  return (
    <div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        setOffset(x * 20);
      }}
      onMouseLeave={() => setOffset(0)}
      className={\`w-full p-8 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden h-64 transition-colors \${cardBg}\`}
    >
      {/* Background layer (slow speed) */}
      <div
        className="absolute inset-0 bg-neutral-100/50 dark:bg-neutral-900/50 flex items-center justify-center pointer-events-none transition-transform duration-200 ease-out"
        style={{ transform: \`translateX(\${offset * 0.4}px)\` }}
      >
        <div className="w-48 h-48 rounded-full border border-dashed border-neutral-300 dark:border-neutral-700" />
      </div>

      {/* Foreground layer (fast speed) */}
      <div
        className="relative z-10 p-5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg text-center transition-transform duration-200 ease-out"
        style={{ transform: \`translateX(\${offset * 1.2}px)\` }}
      >
        <div className="text-xs font-mono font-bold uppercase text-neutral-400 mb-1">Multi-Plane Parallax</div>
        <div className="text-sm font-bold">Foreground Reactive Layer</div>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ParallaxMedia, ParallaxMediaVariant } from './index';

export function ParallaxMediaPreview() {
  const [variant, setVariant] = useState<ParallaxMediaVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
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
      <ParallaxMedia variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const parallaxMediaFixtures = {};`,
    readmeCode: `# Parallax Media

Multi-plane parallax depth container with differential speed motion between background and foreground layers.`,
  },

  // 12. Shared Element Transition
  {
    slug: 'shared-element-transition',
    name: 'Shared Element Transition',
    description: 'Smooth morphing container transitioning an element smoothly between thumbnail and expanded modal view.',
    categories: ['motion', 'microinteractions', 'transition'],
    roles: ['transition', 'morph'],
    purposes: ['seamless-expansion', 'thumbnail-to-detail', 'fluid-morph'],
    componentName: 'SharedElementTransition',
    tags: ['motion', 'shared-element', 'morph', 'transition', 'fluid'],
    idealFor: ['Gallery item expansion', 'Catalog card zoom-to-detail', 'Document inspector peek'],
    avoidFor: ['Standard pagination tables', 'Plain hyperlinked anchors'],
    jobs: ['Morph an item smoothly between inline thumbnail bounds and full dialog modal bounds'],
    indexCode: `import React, { useState } from 'react';

export type SharedElementTransitionVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SharedElementTransitionProps {
  variant?: SharedElementTransitionVariant;
}

export function SharedElementTransition({ variant = 'quiet' }: SharedElementTransitionProps) {
  const [expanded, setExpanded] = useState(false);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col items-center justify-center min-h-[260px] transition-colors \${cardBg}\`}>
      <div
        onClick={() => setExpanded(!expanded)}
        className={\`rounded-xl border border-neutral-300 dark:border-neutral-700 p-5 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:transform-none bg-neutral-50 dark:bg-neutral-900/80 \${
          expanded ? 'w-full max-w-lg shadow-2xl' : 'w-64 shadow-md'
        }\`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-neutral-400">Card Element</span>
          <span className="text-xs font-mono">{expanded ? 'Expanded' : 'Compact'}</span>
        </div>
        <h4 className="text-sm font-bold tracking-tight mb-1">Design DNA Matrix</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          {expanded
            ? 'Fully expanded view revealing all 27 mathematical design tokens, contrast ratios, and density vectors.'
            : 'Click to morph into expanded detailed view.'}
        </p>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { SharedElementTransition, SharedElementTransitionVariant } from './index';

export function SharedElementTransitionPreview() {
  const [variant, setVariant] = useState<SharedElementTransitionVariant>('quiet');

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
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
      <SharedElementTransition variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const sharedElementTransitionFixtures = {};`,
    readmeCode: `# Shared Element Transition

Morphing transition expanding inline thumbnail cards smoothly into full detail containers.`,
  },
];
