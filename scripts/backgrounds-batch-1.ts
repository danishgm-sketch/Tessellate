import type { BackgroundDef } from './backgrounds-builder';

export const BACKGROUNDS_BATCH_1: BackgroundDef[] = [
  // 1. Subtle Grid Field
  {
    slug: 'subtle-grid-field',
    name: 'Subtle Grid Field',
    description: 'Precision architectural grid coordinate backdrop with customizable spacing, hairline dividers, and radial fade mask.',
    categories: ['backgrounds', 'effects', 'grid'],
    roles: ['background', 'grid'],
    purposes: ['canvas-structure', 'architectural-grid', 'hero-backdrop'],
    componentName: 'SubtleGridField',
    tags: ['background', 'grid', 'architectural', 'svg', 'hairline'],
    idealFor: ['Developer tool landing heroes', 'Technical dashboard workspaces', 'Canvas composition backdrops'],
    avoidFor: ['Dense text documentation body', 'High-contrast mobile lists'],
    jobs: ['Provide quiet architectural coordinate grounding behind foreground cards and content'],
    indexCode: `import React from 'react';

export type SubtleGridFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SubtleGridFieldProps {
  variant?: SubtleGridFieldVariant;
  children?: React.ReactNode;
}

export function SubtleGridField({ variant = 'quiet', children }: SubtleGridFieldProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const gridStroke =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.12)'
      : variant === 'expressive'
      ? 'rgba(37, 71, 232, 0.08)'
      : 'rgba(0, 0, 0, 0.05)';

  return (
    <div className={\`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors \${cardBg}\`}>
      {/* Grid pattern SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <pattern id={\`grid-\${variant}\`} width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke={gridStroke} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={\`url(#grid-\${variant})\`} />
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Architectural Surface</span>
        <h4 className="text-base font-bold tracking-tight">Subtle Grid Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Vector coordinate grid providing structural rhythm with zero client bundle overhead.
        </p>
        {children}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { SubtleGridField, SubtleGridFieldVariant } from './index';

export function SubtleGridFieldPreview() {
  const [variant, setVariant] = useState<SubtleGridFieldVariant>('quiet');

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
      <SubtleGridField variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const subtleGridFieldFixtures = {};`,
    readmeCode: `# Subtle Grid Field

Precision architectural grid pattern with radial fade masking and coordinate alignment.`,
  },

  // 2. Dot Matrix Field
  {
    slug: 'dot-matrix-field',
    name: 'Dot Matrix Field',
    description: 'Polka-dot matrix point grid pattern creating technical texture behind feature cards.',
    categories: ['backgrounds', 'effects', 'dots'],
    roles: ['background', 'matrix'],
    purposes: ['dot-matrix-texture', 'technical-depth', 'card-backdrop'],
    componentName: 'DotMatrixField',
    tags: ['background', 'dots', 'matrix', 'texture', 'svg'],
    idealFor: ['Technical spec sheets', 'Feature cards', 'Developer dashboard panels'],
    avoidFor: ['Small 16px badge icons', 'Continuous reading ebooks'],
    jobs: ['Add subtle geometric dot texture across wide background surfaces'],
    indexCode: `import React from 'react';

export type DotMatrixFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DotMatrixFieldProps {
  variant?: DotMatrixFieldVariant;
  children?: React.ReactNode;
}

export function DotMatrixField({ variant = 'quiet', children }: DotMatrixFieldProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const dotFill =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.25)'
      : variant === 'expressive'
      ? 'rgba(37, 71, 232, 0.18)'
      : 'rgba(0, 0, 0, 0.12)';

  return (
    <div className={\`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors \${cardBg}\`}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <pattern id={\`dots-\${variant}\`} width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill={dotFill} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={\`url(#dots-\${variant})\`} />
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Technical Pattern</span>
        <h4 className="text-base font-bold tracking-tight">Dot Matrix Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Geometric 24px-spaced point matrix lending tactile engineering presence to interface surfaces.
        </p>
        {children}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { DotMatrixField, DotMatrixFieldVariant } from './index';

export function DotMatrixFieldPreview() {
  const [variant, setVariant] = useState<DotMatrixFieldVariant>('quiet');

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
      <DotMatrixField variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const dotMatrixFieldFixtures = {};`,
    readmeCode: `# Dot Matrix Field

Geometric point matrix pattern adding subtle engineering texture behind cards.`,
  },

  // 3. Editorial Grain
  {
    slug: 'editorial-grain',
    name: 'Editorial Grain',
    description: 'Film-like noise texture overlay delivering physical paper and print tactility.',
    categories: ['backgrounds', 'effects', 'grain'],
    roles: ['background', 'grain'],
    purposes: ['tactile-texture', 'editorial-feel', 'analog-warmth'],
    componentName: 'EditorialGrain',
    tags: ['background', 'grain', 'noise', 'editorial', 'texture'],
    idealFor: ['Editorial essay backgrounds', 'Luxury brand landing pages', 'Typography showcases'],
    avoidFor: ['Pure flat data dashboards', 'Code terminals'],
    jobs: ['Impart organic analog paper and film grain to digital surfaces'],
    indexCode: `import React from 'react';

export type EditorialGrainVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EditorialGrainProps {
  variant?: EditorialGrainVariant;
}

export function EditorialGrain({ variant = 'quiet' }: EditorialGrainProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-[#FBF9F5] text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  return (
    <div className={\`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors \${cardBg}\`}>
      {/* SVG feTurbulence grain */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25 mix-blend-overlay">
        <filter id="grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-filter)" />
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Analog Tactility</span>
        <h4 className="text-base font-bold tracking-tight">Editorial Film Grain</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Procedural SVG fractal noise filter evoking physical print paper and film grain tactility.
        </p>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { EditorialGrain, EditorialGrainVariant } from './index';

export function EditorialGrainPreview() {
  const [variant, setVariant] = useState<EditorialGrainVariant>('quiet');

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
      <EditorialGrain variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const editorialGrainFixtures = {};`,
    readmeCode: `# Editorial Grain

Procedural SVG fractal noise filter delivering analog print paper and film grain warmth.`,
  },

  // 4. Soft Mesh Gradient
  {
    slug: 'soft-mesh-gradient',
    name: 'Soft Mesh Gradient',
    description: 'Fluid multi-stop radial chromatic blend creating soft organic depth in hero sections.',
    categories: ['backgrounds', 'effects', 'gradient'],
    roles: ['background', 'mesh'],
    purposes: ['chromatic-depth', 'hero-ambience', 'soft-mesh'],
    componentName: 'SoftMeshGradient',
    tags: ['background', 'mesh', 'gradient', 'blur', 'chromatic'],
    idealFor: ['SaaS marketing hero banners', 'Feature highlight backdrops', 'App onboarding headers'],
    avoidFor: ['Dense tabular accounting sheets', 'Code review diffs'],
    jobs: ['Generate soft chromatic color fields with multi-stop radial blurs'],
    indexCode: `import React from 'react';

export type SoftMeshGradientVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SoftMeshGradientProps {
  variant?: SoftMeshGradientVariant;
}

export function SoftMeshGradient({ variant = 'quiet' }: SoftMeshGradientProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-white text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const meshOrbs =
    variant === 'nocturne'
      ? 'bg-gradient-to-tr from-cyan-950/40 via-indigo-950/40 to-transparent'
      : variant === 'expressive'
      ? 'bg-gradient-to-tr from-blue-100/60 via-purple-100/50 to-amber-50/40'
      : 'bg-gradient-to-tr from-neutral-100/80 via-neutral-50 to-transparent';

  return (
    <div className={\`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors \${cardBg}\`}>
      <div className={\`absolute inset-0 \${meshOrbs} filter blur-3xl pointer-events-none\`} />

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Atmospheric Depth</span>
        <h4 className="text-base font-bold tracking-tight">Soft Mesh Gradient</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Multi-stop blurred gradient blending atmospheric chroma into clean editorial canvases.
        </p>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { SoftMeshGradient, SoftMeshGradientVariant } from './index';

export function SoftMeshGradientPreview() {
  const [variant, setVariant] = useState<SoftMeshGradientVariant>('quiet');

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
      <SoftMeshGradient variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const softMeshGradientFixtures = {};`,
    readmeCode: `# Soft Mesh Gradient

Atmospheric multi-stop mesh gradient blending blurred chromatic washes into the canvas.`,
  },

  // 5. Radial Spotlight
  {
    slug: 'radial-spotlight',
    name: 'Radial Spotlight',
    description: 'Top-centered radial cone of light focusing attention downward onto hero headlines.',
    categories: ['backgrounds', 'effects', 'spotlight'],
    roles: ['background', 'spotlight'],
    purposes: ['headline-focus', 'radial-cone', 'hero-illumination'],
    componentName: 'RadialSpotlight',
    tags: ['background', 'spotlight', 'radial', 'illumination', 'hero'],
    idealFor: ['Hero section headlines', 'Product announcement showcases', 'Centered statement headers'],
    avoidFor: ['Footer links', 'Side navigation bars'],
    jobs: ['Focus perceptual hierarchy towards central headlines via radial illumination cones'],
    indexCode: `import React from 'react';

export type RadialSpotlightVariant = 'quiet' | 'expressive' | 'nocturne';

export interface RadialSpotlightProps {
  variant?: RadialSpotlightVariant;
}

export function RadialSpotlight({ variant = 'quiet' }: RadialSpotlightProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-white text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const coneColor =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.2)'
      : variant === 'expressive'
      ? 'rgba(37, 71, 232, 0.12)'
      : 'rgba(0, 0, 0, 0.05)';

  return (
    <div className={\`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col items-center justify-center text-center transition-colors \${cardBg}\`}>
      {/* Top cone spotlight */}
      <div
        className="absolute top-0 inset-x-0 h-64 pointer-events-none"
        style={{
          background: \`radial-gradient(ellipse 70% 80% at 50% 0%, \${coneColor}, transparent 75%)\`,
        }}
      />

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Focal Hierarchy</span>
        <h4 className="text-base font-bold tracking-tight">Radial Top Spotlight</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Centered elliptical gradient cone casting focus downwards across critical headline copy.
        </p>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { RadialSpotlight, RadialSpotlightVariant } from './index';

export function RadialSpotlightPreview() {
  const [variant, setVariant] = useState<RadialSpotlightVariant>('quiet');

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
      <RadialSpotlight variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const radialSpotlightFixtures = {};`,
    readmeCode: `# Radial Spotlight

Top-centered radial gradient cone illuminating hero statements and center headlines.`,
  },

  // 6. Aurora Field
  {
    slug: 'aurora-field',
    name: 'Aurora Field',
    description: 'Drifting organic northern-lights ribbon bands waving across deep dark backdrops.',
    categories: ['backgrounds', 'effects', 'aurora'],
    roles: ['background', 'aurora'],
    purposes: ['ambient-waves', 'aurora-borealis', 'cinematic-dark-mode'],
    componentName: 'AuroraField',
    tags: ['background', 'aurora', 'ribbons', 'dark-mode', 'waves'],
    idealFor: ['Nocturne dark mode landing pages', 'Web3 / AI futuristic hero banners', 'Cinematic product intros'],
    avoidFor: ['Standard high-contrast data tables', 'Text-heavy documentation'],
    jobs: ['Produce ethereal aurora luminescence waves across dark canvas backgrounds'],
    indexCode: `import React from 'react';

export type AuroraFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AuroraFieldProps {
  variant?: AuroraFieldVariant;
}

export function AuroraField({ variant = 'quiet' }: AuroraFieldProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-900 text-white border-neutral-800'
      : 'bg-white text-neutral-900 border-neutral-200';

  return (
    <div className={\`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors \${cardBg}\`}>
      {/* Animated aurora waves */}
      <div className="absolute inset-0 opacity-40 pointer-events-none filter blur-2xl flex">
        <div className="w-1/2 h-full bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 transform -rotate-12 scale-125" />
        <div className="w-1/2 h-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 transform rotate-12 scale-125" />
      </div>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">Cyber Luminescence</span>
        <h4 className="text-base font-bold tracking-tight">Aurora Wave Field</h4>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Dual chromatic ribbon fields crossing with soft blur to simulate undulating northern lights.
        </p>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AuroraField, AuroraFieldVariant } from './index';

export function AuroraFieldPreview() {
  const [variant, setVariant] = useState<AuroraFieldVariant>('quiet');

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
      <AuroraField variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const auroraFieldFixtures = {};`,
    readmeCode: `# Aurora Field

Organic aurora ribbon bands blending blurred chromatic waves across dark canvases.`,
  },

  // 7. Noise Gradient
  {
    slug: 'noise-gradient',
    name: 'Noise Gradient',
    description: 'Grain-diffused linear gradient eliminating digital color banding across wide screens.',
    categories: ['backgrounds', 'effects', 'noise'],
    roles: ['background', 'gradient'],
    purposes: ['dithered-gradient', 'banding-elimination', 'smooth-transition'],
    componentName: 'NoiseGradient',
    tags: ['background', 'gradient', 'noise', 'dither', 'texture'],
    idealFor: ['Large wide-aspect landing sections', 'OLED dark surfaces', 'Full page gradients'],
    avoidFor: ['Small 32px icon containers', 'Text input fields'],
    jobs: ['Eliminate harsh 8-bit color banding steps with micro-dithered grain dispersion'],
    indexCode: `import React from 'react';

export type NoiseGradientVariant = 'quiet' | 'expressive' | 'nocturne';

export interface NoiseGradientProps {
  variant?: NoiseGradientVariant;
}

export function NoiseGradient({ variant = 'quiet' }: NoiseGradientProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-gradient-to-b from-blue-50/70 to-white text-neutral-900 border-[#D9D6CF]'
      : 'bg-gradient-to-b from-neutral-50 to-white text-neutral-900 border-neutral-200';

  return (
    <div className={\`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors \${cardBg}\`}>
      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Dithered Texture</span>
        <h4 className="text-base font-bold tracking-tight">Noise-Diffused Gradient</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Smooth continuous tone graduation without digital quantization artifacts or color banding.
        </p>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { NoiseGradient, NoiseGradientVariant } from './index';

export function NoiseGradientPreview() {
  const [variant, setVariant] = useState<NoiseGradientVariant>('quiet');

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
      <NoiseGradient variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const noiseGradientFixtures = {};`,
    readmeCode: `# Noise Gradient

Grain-diffused continuous gradient preventing digital color banding across wide viewports.`,
  },

  // 8. Topographic Lines
  {
    slug: 'topographic-lines',
    name: 'Topographic Lines',
    description: 'Cartographic vector contour isolines undulating across background like geographic elevation maps.',
    categories: ['backgrounds', 'effects', 'topographic'],
    roles: ['background', 'contours'],
    purposes: ['cartographic-contours', 'topographic-texture', 'geographic-feel'],
    componentName: 'TopographicLines',
    tags: ['background', 'topographic', 'contours', 'cartography', 'svg'],
    idealFor: ['Geospatial / GIS apps', 'Outdoor / exploration brands', 'Technical architecture banners'],
    avoidFor: ['Standard form fields', 'Dense spreadsheet layouts'],
    jobs: ['Render elegant vector elevation contour lines across background canvas surfaces'],
    indexCode: `import React from 'react';

export type TopographicLinesVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TopographicLinesProps {
  variant?: TopographicLinesVariant;
}

export function TopographicLines({ variant = 'quiet' }: TopographicLinesProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const strokeColor =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.2)'
      : variant === 'expressive'
      ? 'rgba(37, 71, 232, 0.12)'
      : 'rgba(0, 0, 0, 0.08)';

  return (
    <div className={\`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors \${cardBg}\`}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80" viewBox="0 0 600 300">
        <path d="M 0 60 Q 150 120 300 40 T 600 80" fill="none" stroke={strokeColor} strokeWidth="1" />
        <path d="M 0 110 Q 180 180 340 90 T 600 130" fill="none" stroke={strokeColor} strokeWidth="1" />
        <path d="M 0 160 Q 210 240 380 140 T 600 180" fill="none" stroke={strokeColor} strokeWidth="1" />
        <path d="M 0 210 Q 240 300 420 190 T 600 230" fill="none" stroke={strokeColor} strokeWidth="1" />
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Cartographic Contours</span>
        <h4 className="text-base font-bold tracking-tight">Topographic Isolines</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Vector elevation lines undulating across the canvas evoking cartographic maps and terrain contours.
        </p>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { TopographicLines, TopographicLinesVariant } from './index';

export function TopographicLinesPreview() {
  const [variant, setVariant] = useState<TopographicLinesVariant>('quiet');

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
      <TopographicLines variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const topographicLinesFixtures = {};`,
    readmeCode: `# Topographic Lines

Cartographic vector elevation contour lines creating subtle landscape textures.`,
  },

  // 9. Animated Wave Field
  {
    slug: 'animated-wave-field',
    name: 'Animated Wave Field',
    description: 'Smooth SVG sine waves undulating horizontally with gentle frequency oscillation.',
    categories: ['backgrounds', 'effects', 'waves'],
    roles: ['background', 'waves'],
    purposes: ['fluid-motion', 'sine-wave-ambient', 'calm-animation'],
    componentName: 'AnimatedWaveField',
    tags: ['background', 'waves', 'sine', 'svg', 'ambient'],
    idealFor: ['Audio streaming interfaces', 'Oceanic and fluid branding', 'Hero section bottom dividers'],
    avoidFor: ['Dense financial order books', 'High-density spreadsheet tables'],
    jobs: ['Produce gentle harmonic sine wave oscillation across section baselines'],
    indexCode: `import React from 'react';

export type AnimatedWaveFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AnimatedWaveFieldProps {
  variant?: AnimatedWaveFieldVariant;
}

export function AnimatedWaveField({ variant = 'quiet' }: AnimatedWaveFieldProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const waveColor =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.15)'
      : variant === 'expressive'
      ? 'rgba(37, 71, 232, 0.1)'
      : 'rgba(0, 0, 0, 0.05)';

  return (
    <div className={\`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors \${cardBg}\`}>
      <svg className="absolute bottom-0 inset-x-0 w-full h-32 pointer-events-none" viewBox="0 0 600 120" preserveAspectRatio="none">
        <path
          d="M 0 60 C 150 100, 300 20, 450 60 C 525 80, 580 40, 600 50 L 600 120 L 0 120 Z"
          fill={waveColor}
        />
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Harmonic Motion</span>
        <h4 className="text-base font-bold tracking-tight">Animated Wave Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Smooth harmonic sine curve baseline providing organic fluid movement under section copy.
        </p>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AnimatedWaveField, AnimatedWaveFieldVariant } from './index';

export function AnimatedWaveFieldPreview() {
  const [variant, setVariant] = useState<AnimatedWaveFieldVariant>('quiet');

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
      <AnimatedWaveField variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const animatedWaveFieldFixtures = {};`,
    readmeCode: `# Animated Wave Field

Harmonic sine wave curve baseline creating gentle fluid movement under section copy.`,
  },

  // 10. Particle Constellation
  {
    slug: 'particle-constellation',
    name: 'Particle Constellation',
    description: 'Interconnected vector node points forming dynamic geometric constellations with proximate links.',
    categories: ['backgrounds', 'effects', 'constellation'],
    roles: ['background', 'constellation'],
    purposes: ['network-constellation', 'interconnected-nodes', 'cosmic-ambience'],
    componentName: 'ParticleConstellation',
    tags: ['background', 'particles', 'constellation', 'network', 'svg'],
    idealFor: ['AI network landing pages', 'Web3 / cryptographic protocols', 'Space / scientific portals'],
    avoidFor: ['Heavy form entry screens', 'Compact mobile drawer sheets'],
    jobs: ['Map proximate interconnected particle constellations across wide dark hero backdrops'],
    indexCode: `import React from 'react';

export type ParticleConstellationVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ParticleConstellationProps {
  variant?: ParticleConstellationVariant;
}

export function ParticleConstellation({ variant = 'quiet' }: ParticleConstellationProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-900 text-white border-neutral-800'
      : 'bg-white text-neutral-900 border-neutral-200';

  const dotFill =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#3B82F6' : '#171717';

  const points = [
    { x: 50, y: 40 },
    { x: 120, y: 90 },
    { x: 220, y: 50 },
    { x: 340, y: 110 },
    { x: 420, y: 60 },
    { x: 510, y: 120 },
  ];

  return (
    <div className={\`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors \${cardBg}\`}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 200">
        {/* Constellation links */}
        <polyline
          points={points.map((p) => \`\${p.x},\${p.y}\`).join(' ')}
          fill="none"
          stroke={dotFill}
          strokeWidth="1"
          strokeOpacity="0.25"
          strokeDasharray="4 4"
        />
        {/* Constellation nodes */}
        {points.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r="3" fill={dotFill} />
        ))}
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Cosmic Topology</span>
        <h4 className="text-base font-bold tracking-tight">Particle Constellation Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Interconnected vector star nodes forming celestial geometry across hero viewports.
        </p>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ParticleConstellation, ParticleConstellationVariant } from './index';

export function ParticleConstellationPreview() {
  const [variant, setVariant] = useState<ParticleConstellationVariant>('quiet');

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
      <ParticleConstellation variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const particleConstellationFixtures = {};`,
    readmeCode: `# Particle Constellation

Interconnected vector particle nodes forming geometric celestial constellations.`,
  },
];
