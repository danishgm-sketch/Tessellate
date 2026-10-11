import type { BackgroundDef } from './backgrounds-builder';

export const BACKGROUNDS_BATCH_2: BackgroundDef[] = [
  // 11. Cursor Reactive Field
  {
    slug: 'cursor-reactive-field',
    name: 'Cursor Reactive Field',
    description: 'Interactive mouse-tracking luminescence field that dynamically illuminates coordinate grid points and distance vectors.',
    categories: ['backgrounds', 'effects', 'interactive'],
    roles: ['background', 'interactive-field'],
    purposes: ['interactive-backdrop', 'hero-engagement', 'canvas-texture'],
    componentName: 'CursorReactiveField',
    tags: ['cursor', 'reactive', 'glow', 'tracking', 'svg'],
    idealFor: ['Interactive landing hero sections', 'Developer sandbox headers', 'Creative agency showcases'],
    avoidFor: ['Low-power embedded displays', 'Print view stylesheets'],
    jobs: ['Delight desktop visitors with smooth, hardware-accelerated cursor lighting that does not drop frames'],
    indexCode: `import React, { useState } from 'react';

export type CursorReactiveFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CursorReactiveFieldProps {
  variant?: CursorReactiveFieldVariant;
  children?: React.ReactNode;
}

export function CursorReactiveField({ variant = 'quiet', children }: CursorReactiveFieldProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const glowColor =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.18)'
      : variant === 'expressive'
      ? 'rgba(79, 70, 229, 0.14)'
      : 'rgba(0, 0, 0, 0.08)';

  const gridColor =
    variant === 'nocturne'
      ? 'rgba(255, 255, 255, 0.04)'
      : variant === 'expressive'
      ? 'rgba(37, 71, 232, 0.06)'
      : 'rgba(0, 0, 0, 0.04)';

  return (
    <div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setPos(null)}
      className={\`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors \${cardBg}\`}
    >
      {/* Background grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <pattern id={\`cr-grid-\${variant}\`} width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke={gridColor} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={\`url(#cr-grid-\${variant})\`} />
      </svg>

      {/* Reactive cursor spotlight */}
      {pos && (
        <div
          className="absolute pointer-events-none rounded-full blur-2xl transition-opacity duration-300"
          style={{
            left: pos.x - 120,
            top: pos.y - 120,
            width: 240,
            height: 240,
            background: glowColor,
          }}
        />
      )}

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Reactive Atmosphere</span>
        <h4 className="text-base font-bold tracking-tight">Cursor Reactive Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Hover cursor across the container to illuminate localized coordinate vectors with zero performance penalty.
        </p>
        {children}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CursorReactiveField, CursorReactiveFieldVariant } from './index';

export function CursorReactiveFieldPreview() {
  const [variant, setVariant] = useState<CursorReactiveFieldVariant>('quiet');

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
      <CursorReactiveField variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const cursorReactiveFieldFixtures = {};`,
    readmeCode: `# Cursor Reactive Field

Mouse-tracking lighting field that illuminates coordinate vectors on hover.`,
  },

  // 12. Beam Grid
  {
    slug: 'beam-grid',
    name: 'Beam Grid',
    description: 'Precision architectural coordinate grid with luminous traveling laser beams gliding along horizontal and vertical axes.',
    categories: ['backgrounds', 'effects', 'grid'],
    roles: ['background', 'beam'],
    purposes: ['telemetry-grid', 'hero-backdrop', 'visual-depth'],
    componentName: 'BeamGrid',
    tags: ['grid', 'beam', 'laser', 'traveling', 'circuit'],
    idealFor: ['Infrastructure monitoring tools', 'Cloud platform dashboards', 'Cybersecurity portals'],
    avoidFor: ['Standard blog articles', 'Print view stylesheets'],
    jobs: ['Convey continuous, reliable background computational activity through linear traveling light rays'],
    indexCode: `import React from 'react';

export type BeamGridVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BeamGridProps {
  variant?: BeamGridVariant;
  children?: React.ReactNode;
}

export function BeamGrid({ variant = 'quiet', children }: BeamGridProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const beamGradient =
    variant === 'nocturne'
      ? 'from-transparent via-cyan-400 to-transparent'
      : variant === 'expressive'
      ? 'from-transparent via-indigo-500 to-transparent'
      : 'from-transparent via-neutral-400 to-transparent';

  return (
    <div className={\`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors \${cardBg}\`}>
      {/* Grid base */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Traveling beam lines */}
      <div className="absolute inset-x-0 top-1/4 h-[1px] pointer-events-none overflow-hidden">
        <div className={\`w-48 h-full bg-gradient-to-r \${beamGradient} animate-pulse blur-[1px]\`} style={{ transform: 'translateX(30%)' }} />
      </div>
      <div className="absolute inset-y-0 left-1/3 w-[1px] pointer-events-none overflow-hidden">
        <div className={\`w-full h-48 bg-gradient-to-b \${beamGradient} animate-pulse blur-[1px]\`} style={{ transform: 'translateY(20%)' }} />
      </div>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Optical Infrastructure</span>
        <h4 className="text-base font-bold tracking-tight">Beam Grid</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Orthogonal coordinate network featuring directional traveling light energy along telemetry lines.
        </p>
        {children}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { BeamGrid, BeamGridVariant } from './index';

export function BeamGridPreview() {
  const [variant, setVariant] = useState<BeamGridVariant>('quiet');

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
      <BeamGrid variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const beamGridFixtures = {};`,
    readmeCode: `# Beam Grid

Architectural coordinate grid with traveling optical light beams.`,
  },

  // 13. Conic Light Field
  {
    slug: 'conic-light-field',
    name: 'Conic Light Field',
    description: 'Radial swept light gradient generating dramatic angular specular highlights and rotational depth.',
    categories: ['backgrounds', 'effects', 'gradient'],
    roles: ['background', 'conic'],
    purposes: ['specular-highlight', 'luxury-glow', 'hero-backdrop'],
    componentName: 'ConicLightField',
    tags: ['conic', 'gradient', 'specular', 'luxury', 'radial'],
    idealFor: ['Premium subscription banners', 'Product reveal hero backdrops', 'High-end branding sections'],
    avoidFor: ['Dense tabular data views', 'E-commerce product thumbnail grids'],
    jobs: ['Add rotational cinematic luminance and specular polish to top-of-funnel conversion surfaces'],
    indexCode: `import React from 'react';

export type ConicLightFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ConicLightFieldProps {
  variant?: ConicLightFieldVariant;
  children?: React.ReactNode;
}

export function ConicLightField({ variant = 'quiet', children }: ConicLightFieldProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const conicStyle: React.CSSProperties = {
    background:
      variant === 'nocturne'
        ? 'conic-gradient(from 180deg at 50% 50%, rgba(6, 182, 212, 0) 0deg, rgba(6, 182, 212, 0.15) 120deg, rgba(59, 130, 246, 0.25) 180deg, rgba(6, 182, 212, 0) 240deg)'
        : variant === 'expressive'
        ? 'conic-gradient(from 180deg at 50% 50%, rgba(99, 102, 241, 0) 0deg, rgba(168, 85, 247, 0.15) 120deg, rgba(236, 72, 153, 0.2) 180deg, rgba(99, 102, 241, 0) 240deg)'
        : 'conic-gradient(from 180deg at 50% 50%, rgba(0, 0, 0, 0) 0deg, rgba(0, 0, 0, 0.05) 120deg, rgba(0, 0, 0, 0.1) 180deg, rgba(0, 0, 0, 0) 240deg)',
  };

  return (
    <div className={\`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors \${cardBg}\`}>
      <div className="absolute inset-0 pointer-events-none opacity-80 blur-2xl transform scale-125" style={conicStyle} />

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Angular Radiance</span>
        <h4 className="text-base font-bold tracking-tight">Conic Light Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Swept 360-degree conic gradient providing sophisticated specular reflections with zero canvas overhead.
        </p>
        {children}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ConicLightField, ConicLightFieldVariant } from './index';

export function ConicLightFieldPreview() {
  const [variant, setVariant] = useState<ConicLightFieldVariant>('quiet');

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
      <ConicLightField variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const conicLightFieldFixtures = {};`,
    readmeCode: `# Conic Light Field

Swept conic luminescence generating angular specular lighting reflections.`,
  },

  // 14. Paper Texture
  {
    slug: 'paper-texture',
    name: 'Paper Texture',
    description: 'Tactile editorial stationery texture with subtle cellulose fiber grain and organic tactile warmth.',
    categories: ['backgrounds', 'effects', 'texture'],
    roles: ['background', 'paper'],
    purposes: ['editorial-craft', 'tactile-surface', 'warm-canvas'],
    componentName: 'PaperTexture',
    tags: ['paper', 'stationery', 'tactile', 'editorial', 'grain'],
    idealFor: ['Editorial essay layouts', 'Typography showcases', 'Publishing and notebook applications'],
    avoidFor: ['Neon cybernetic dashboards', 'High-speed arcade interfaces'],
    jobs: ['Give digital documents the physical warmth and high-craft tactile presence of artisanal paper'],
    indexCode: `import React from 'react';

export type PaperTextureVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PaperTextureProps {
  variant?: PaperTextureVariant;
  children?: React.ReactNode;
}

export function PaperTexture({ variant = 'quiet', children }: PaperTextureProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#12141a] text-white border-[#2A2E39]'
      : variant === 'expressive'
      ? 'bg-[#F9F7F2] text-neutral-900 border-[#E5DFD3]'
      : 'bg-[#FCFBF9] text-neutral-900 border-[#EDE8E1]';

  return (
    <div className={\`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors \${cardBg}\`}>
      {/* SVG fibrous noise overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-multiply">
        <filter id={\`paper-noise-\${variant}\`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" />
        </filter>
        <rect width="100%" height="100%" filter={\`url(#paper-noise-\${variant})\`} />
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Tactile Substrate</span>
        <h4 className="text-base font-bold tracking-tight">Paper Texture</h4>
        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
          Cellulose paper stock simulation engineered for editorial typography and physical publication warmth.
        </p>
        {children}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { PaperTexture, PaperTextureVariant } from './index';

export function PaperTexturePreview() {
  const [variant, setVariant] = useState<PaperTextureVariant>('quiet');

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
      <PaperTexture variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const paperTextureFixtures = {};`,
    readmeCode: `# Paper Texture

Artisanal stationery paper texture with organic cellulose fiber grain.`,
  },

  // 15. Metallic Sheen
  {
    slug: 'metallic-sheen',
    name: 'Metallic Sheen',
    description: 'Anodized brushed metal finish with diagonal specular highlights and precision chamfered edge luster.',
    categories: ['backgrounds', 'effects', 'metallic'],
    roles: ['background', 'metallic'],
    purposes: ['fintech-card', 'hardware-luxury', 'specular-panel'],
    componentName: 'MetallicSheen',
    tags: ['metal', 'sheen', 'aluminum', 'luster', 'hardware'],
    idealFor: ['Fintech payment cards', 'Hardware device telemetry', 'Luxury tier status emblems'],
    avoidFor: ['Playful educational games', 'Organic sustainability blogs'],
    jobs: ['Impart the weight, precision, and tactile authority of machined aerospace-grade aluminum'],
    indexCode: `import React from 'react';

export type MetallicSheenVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MetallicSheenProps {
  variant?: MetallicSheenVariant;
  children?: React.ReactNode;
}

export function MetallicSheen({ variant = 'quiet', children }: MetallicSheenProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-gradient-to-tr from-[#0F1115] via-[#1E232E] to-[#0A0C0E] text-white border-[#384152]'
      : variant === 'expressive'
      ? 'bg-gradient-to-tr from-[#E2E8F0] via-[#F8FAFC] to-[#CBD5E1] text-neutral-900 border-[#94A3B8]'
      : 'bg-gradient-to-tr from-[#EDEDED] via-[#FAFAFA] to-[#E5E5E5] text-neutral-900 border-[#D4D4D4]';

  return (
    <div className={\`relative w-full p-8 rounded-xl border shadow-sm overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors \${cardBg}\`}>
      {/* Specular light streak */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
        style={{
          background: 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.7) 48%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 52%, transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Machined Finish</span>
        <h4 className="text-base font-bold tracking-tight">Metallic Sheen</h4>
        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
          Anodized metal specular luster engineered for titanium cards and aerospace hardware control panels.
        </p>
        {children}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { MetallicSheen, MetallicSheenVariant } from './index';

export function MetallicSheenPreview() {
  const [variant, setVariant] = useState<MetallicSheenVariant>('quiet');

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
      <MetallicSheen variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const metallicSheenFixtures = {};`,
    readmeCode: `# Metallic Sheen

Brushed metal substrate with diagonal specular reflections.`,
  },

  // 16. Glass Refraction Panel
  {
    slug: 'glass-refraction-panel',
    name: 'Glass Refraction Panel',
    description: 'Optical frosted acrylic card surface featuring backdrop refraction blur, hairline specular borders, and chromatic tint.',
    categories: ['backgrounds', 'effects', 'glass'],
    roles: ['background', 'glass'],
    purposes: ['frosted-overlay', 'spatial-depth', 'card-elevation'],
    componentName: 'GlassRefractionPanel',
    tags: ['glass', 'frosted', 'refraction', 'blur', 'acrylic'],
    idealFor: ['Floating HUD widgets', 'Modal overlays', 'Navigation chrome backdrops'],
    avoidFor: ['Old browsers lacking backdrop-filter', 'High-speed scrolling lists'],
    jobs: ['Elevate foreground elements above complex backgrounds with crisp optical frosted glass aesthetics'],
    indexCode: `import React from 'react';

export type GlassRefractionPanelVariant = 'quiet' | 'expressive' | 'nocturne';

export interface GlassRefractionPanelProps {
  variant?: GlassRefractionPanelVariant;
  children?: React.ReactNode;
}

export function GlassRefractionPanel({ variant = 'quiet', children }: GlassRefractionPanelProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10]/70 backdrop-blur-md text-white border-white/10 shadow-xl'
      : variant === 'expressive'
      ? 'bg-white/60 backdrop-blur-md text-neutral-900 border-indigo-200/50 shadow-lg'
      : 'bg-white/70 backdrop-blur-md text-neutral-900 border-neutral-200/60 shadow-sm';

  return (
    <div className="relative w-full p-8 min-h-[260px] flex items-center justify-center bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl overflow-hidden">
      <div className={\`relative w-full max-w-md p-6 rounded-xl border transition-all \${cardBg}\`}>
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Optical Substrate</span>
        <h4 className="text-base font-bold tracking-tight mt-1">Glass Refraction Panel</h4>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
          Frosted acrylic panel with hairline specular borders and depth blur for spatial interface layering.
        </p>
        {children}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { GlassRefractionPanel, GlassRefractionPanelVariant } from './index';

export function GlassRefractionPanelPreview() {
  const [variant, setVariant] = useState<GlassRefractionPanelVariant>('quiet');

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
      <GlassRefractionPanel variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const glassRefractionPanelFixtures = {};`,
    readmeCode: `# Glass Refraction Panel

Optical frosted acrylic surface with backdrop blur and hairline specular edges.`,
  },

  // 17. Shader Liquid Field
  {
    slug: 'shader-liquid-field',
    name: 'Shader Liquid Field',
    description: 'Organic viscous liquid fluid simulation with wave ripples and chromatic caustic contours.',
    categories: ['backgrounds', 'effects', 'liquid'],
    roles: ['background', 'liquid'],
    purposes: ['fluid-flow', 'dynamic-organic', 'hero-backdrop'],
    componentName: 'ShaderLiquidField',
    tags: ['liquid', 'shader', 'fluid', 'viscous', 'organic'],
    idealFor: ['Creative design tools', 'Music and audio streaming platforms', 'Immersive hero banners'],
    avoidFor: ['Mission-critical medical records', 'Financial accounting sheets'],
    jobs: ['Evoke smooth, living organic motion through undulating fluid contour waves'],
    indexCode: `import React from 'react';

export type ShaderLiquidFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ShaderLiquidFieldProps {
  variant?: ShaderLiquidFieldVariant;
  children?: React.ReactNode;
}

export function ShaderLiquidField({ variant = 'quiet', children }: ShaderLiquidFieldProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const waveGrad1 =
    variant === 'nocturne' ? '#06b6d4' : variant === 'expressive' ? '#6366f1' : '#a3a3a3';
  const waveGrad2 =
    variant === 'nocturne' ? '#3b82f6' : variant === 'expressive' ? '#ec4899' : '#d4d4d4';

  return (
    <div className={\`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors \${cardBg}\`}>
      {/* Liquid fluid curves SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none" viewBox="0 0 600 300">
        <defs>
          <linearGradient id={\`liquid-grad-\${variant}\`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={waveGrad1} stopOpacity="0.4" />
            <stop offset="100%" stopColor={waveGrad2} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path d="M0,100 C150,180 350,20 600,120 L600,300 L0,300 Z" fill={\`url(#liquid-grad-\${variant})\`} />
        <path d="M0,150 C200,80 400,220 600,160 L600,300 L0,300 Z" fill={\`url(#liquid-grad-\${variant})\`} opacity="0.6" />
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Viscous Dynamic</span>
        <h4 className="text-base font-bold tracking-tight">Shader Liquid Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Lightweight SVG liquid wave contours creating organic fluid motion without GPU shader battery drain.
        </p>
        {children}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ShaderLiquidField, ShaderLiquidFieldVariant } from './index';

export function ShaderLiquidFieldPreview() {
  const [variant, setVariant] = useState<ShaderLiquidFieldVariant>('quiet');

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
      <ShaderLiquidField variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const shaderLiquidFieldFixtures = {};`,
    readmeCode: `# Shader Liquid Field

Organic viscous liquid flow curves and fluid caustics.`,
  },

  // 18. Shader Noise Field
  {
    slug: 'shader-noise-field',
    name: 'Shader Noise Field',
    description: 'Procedural multi-frequency Perlin terrain noise contour field providing organic dimensional atmosphere.',
    categories: ['backgrounds', 'effects', 'noise'],
    roles: ['background', 'noise-terrain'],
    purposes: ['topographic-depth', 'organic-texture', 'hero-backdrop'],
    componentName: 'ShaderNoiseField',
    tags: ['noise', 'perlin', 'terrain', 'procedural', 'contour'],
    idealFor: ['Science and research platforms', 'Generative art tools', 'Editorial landing pages'],
    avoidFor: ['Dense spreadsheet tables', 'Low-contrast mobile text'],
    jobs: ['Generate endless organic terrain contours with procedural noise filters'],
    indexCode: `import React from 'react';

export type ShaderNoiseFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ShaderNoiseFieldProps {
  variant?: ShaderNoiseFieldVariant;
  children?: React.ReactNode;
}

export function ShaderNoiseField({ variant = 'quiet', children }: ShaderNoiseFieldProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  return (
    <div className={\`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors \${cardBg}\`}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
        <filter id={\`perlin-noise-\${variant}\`}>
          <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="4" result="turbulence" />
          <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="20" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <circle cx="50%" cy="50%" r="40%" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" filter={\`url(#perlin-noise-\${variant})\`} />
        <circle cx="50%" cy="50%" r="25%" fill="none" stroke="currentColor" strokeWidth="1" filter={\`url(#perlin-noise-\${variant})\`} />
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Procedural Terrain</span>
        <h4 className="text-base font-bold tracking-tight">Shader Noise Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Multi-octave procedural turbulence contours generating unique topographic elevation gradients.
        </p>
        {children}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ShaderNoiseField, ShaderNoiseFieldVariant } from './index';

export function ShaderNoiseFieldPreview() {
  const [variant, setVariant] = useState<ShaderNoiseFieldVariant>('quiet');

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
      <ShaderNoiseField variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const shaderNoiseFieldFixtures = {};`,
    readmeCode: `# Shader Noise Field

Procedural multi-octave turbulence contour field.`,
  },

  // 19. 3D Orbital Field
  {
    slug: 'three-d-orbital-field',
    name: '3D Orbital Field',
    description: 'Elliptical planetary orbits rotating in perspective with satellite node coordinates and celestial depth.',
    categories: ['backgrounds', 'effects', 'orbital'],
    roles: ['background', 'orbital'],
    purposes: ['celestial-depth', 'satellite-network', 'hero-backdrop'],
    componentName: 'ThreeDOrbitalField',
    tags: ['orbital', 'celestial', 'planetary', 'satellite', 'perspective'],
    idealFor: ['Space exploration apps', 'Global CDN networks', 'AI planetary intelligence systems'],
    avoidFor: ['Standard admin forms', 'Flat documentation views'],
    jobs: ['Establish a sense of planetary scale, cosmic orbit, and global network coverage'],
    indexCode: `import React from 'react';

export type ThreeDOrbitalFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ThreeDOrbitalFieldProps {
  variant?: ThreeDOrbitalFieldVariant;
  children?: React.ReactNode;
}

export function ThreeDOrbitalField({ variant = 'quiet', children }: ThreeDOrbitalFieldProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const ringColor =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.2)'
      : variant === 'expressive'
      ? 'rgba(99, 102, 241, 0.2)'
      : 'rgba(0, 0, 0, 0.08)';

  return (
    <div className={\`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors \${cardBg}\`}>
      {/* 3D tilted orbital rings */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 300">
        <ellipse cx="300" cy="150" rx="240" ry="80" fill="none" stroke={ringColor} strokeWidth="1" strokeDasharray="3 3" transform="rotate(-15 300 150)" />
        <ellipse cx="300" cy="150" rx="160" ry="50" fill="none" stroke={ringColor} strokeWidth="1.5" transform="rotate(25 300 150)" />
        <circle cx="430" cy="115" r="3.5" fill="currentColor" opacity="0.6" />
        <circle cx="210" cy="180" r="2.5" fill="currentColor" opacity="0.5" />
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Celestial Geometry</span>
        <h4 className="text-base font-bold tracking-tight">3D Orbital Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Elliptical perspective rings and satellite telemetry nodes simulating global orbital trajectories.
        </p>
        {children}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ThreeDOrbitalField, ThreeDOrbitalFieldVariant } from './index';

export function ThreeDOrbitalFieldPreview() {
  const [variant, setVariant] = useState<ThreeDOrbitalFieldVariant>('quiet');

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
      <ThreeDOrbitalField variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const threeDOrbitalFieldFixtures = {};`,
    readmeCode: `# 3D Orbital Field

Perspective elliptical orbits and satellite telemetry nodes.`,
  },

  // 20. Data Stream Field
  {
    slug: 'data-stream-field',
    name: 'Data Stream Field',
    description: 'Cascading digital telemetry stream with vertical hexadecimal glyph streams and pulse wave signals.',
    categories: ['backgrounds', 'effects', 'stream'],
    roles: ['background', 'data-stream'],
    purposes: ['telemetry-stream', 'matrix-code', 'hero-backdrop'],
    componentName: 'DataStreamField',
    tags: ['data', 'stream', 'matrix', 'hexadecimal', 'telemetry'],
    idealFor: ['High-throughput message brokers', 'Security audit consoles', 'Real-time financial tickers'],
    avoidFor: ['Calm lifestyle magazines', 'Children educational games'],
    jobs: ['Visually symbolize high-frequency real-time event streaming and low-latency packet throughput'],
    indexCode: `import React from 'react';

export type DataStreamFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DataStreamFieldProps {
  variant?: DataStreamFieldVariant;
  children?: React.ReactNode;
}

export function DataStreamField({ variant = 'quiet', children }: DataStreamFieldProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const streamOpacity =
    variant === 'nocturne'
      ? 'text-cyan-400/20'
      : variant === 'expressive'
      ? 'text-indigo-500/20'
      : 'text-neutral-400/25';

  return (
    <div className={\`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors \${cardBg}\`}>
      {/* Cascading data streams */}
      <div className={\`absolute inset-0 pointer-events-none font-mono text-[9px] leading-tight select-none flex justify-around \${streamOpacity}\`}>
        <div className="flex flex-col space-y-1">
          <span>0x7F</span><span>0x4A</span><span>0x9B</span><span>0x1C</span><span>0x8E</span><span>0x3D</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span>0xA1</span><span>0x52</span><span>0x0F</span><span>0xEE</span><span>0x74</span><span>0x90</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span>0x33</span><span>0xC8</span><span>0xD1</span><span>0x45</span><span>0x2B</span><span>0x88</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span>0xF0</span><span>0x12</span><span>0x99</span><span>0xAA</span><span>0x67</span><span>0xBC</span>
        </div>
      </div>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Continuous Throughput</span>
        <h4 className="text-base font-bold tracking-tight">Data Stream Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Low-overhead vertical hexadecimal telemetry columns indicating active real-time ingest pipeline status.
        </p>
        {children}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { DataStreamField, DataStreamFieldVariant } from './index';

export function DataStreamFieldPreview() {
  const [variant, setVariant] = useState<DataStreamFieldVariant>('quiet');

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
      <DataStreamField variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const dataStreamFieldFixtures = {};`,
    readmeCode: `# Data Stream Field

Cascading hexadecimal data streams and telemetry pulse lines.`,
  },
];
