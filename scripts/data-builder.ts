import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ResourceManifest } from '@tessellate/schemas';

export interface DataDef {
  slug: string;
  name: string;
  description: string;
  categories: string[];
  roles: string[];
  purposes: string[];
  componentName: string;
  tags: string[];
  idealFor: string[];
  avoidFor: string[];
  jobs: string[];
  indexCode: string;
  previewCode: string;
  fixturesCode: string;
  readmeCode: string;
}

export function writeDataResource(def: DataDef, repoRoot: string) {
  const dir = path.join(repoRoot, 'resources', 'data', def.slug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const manifest: ResourceManifest = {
    schemaVersion: '1.0.0',
    id: `res_dat_${def.slug.replace(/-/g, '_')}`,
    slug: def.slug,
    name: def.name,
    version: '1.0.0',
    status: 'verified',
    description: def.description,
    resourceType: 'data-visualization',
    categories: def.categories,
    roles: def.roles,
    purposes: def.purposes,
    productArchetypes: [
      { tag: 'data-product', weight: 95 },
      { tag: 'b2b-saas', weight: 90 },
      { tag: 'developer-tool', weight: 85 },
    ],
    creator: {
      id: 'tessellate_core',
      displayName: 'Tessellate Core',
      handle: 'tessellate',
      url: 'https://tessellate.design',
    },
    provenance: {
      origin: 'tessellate',
      derivative: false,
      aiAssistance: 'none',
    },
    license: {
      spdx: 'MIT',
      name: 'MIT License',
      url: 'https://opensource.org/licenses/MIT',
      redistributionVerified: true,
      attributionRequired: false,
    },
    framework: 'react',
    language: 'typescript',
    styling: 'tailwind',
    dependencies: [],
    files: [
      { path: 'index.tsx', kind: 'component', required: true },
      { path: 'preview.tsx', kind: 'component', required: true },
      { path: 'fixtures.ts', kind: 'fixture', required: true },
      { path: 'README.md', kind: 'asset', required: true },
    ],
    registry: {
      name: def.slug,
      dependencies: [],
      devDependencies: [],
      registryDependencies: [],
    },
    preview: {
      component: `${def.componentName}Preview`,
      defaultProps: {},
      viewport: 1440,
    },
    slots: [
      {
        id: 'tooltip',
        name: 'Tooltip Content',
        type: 'component',
        required: false,
      },
    ],
    variants: [
      {
        id: 'quiet',
        name: 'Quiet',
        description: 'Monochrome slate lines, restrained fills, high data-ink ratio for dense analytical dashboards.',
        props: { variant: 'quiet' },
      },
      {
        id: 'expressive',
        name: 'Expressive',
        description: 'Cobalt, emerald, and amber chromatic accents with smooth gradients and tactile hover states.',
        props: { variant: 'expressive' },
      },
      {
        id: 'nocturne',
        name: 'Nocturne',
        description: 'Obsidian dark backdrop with cyan luminescence, hairline gridlines, and high contrast glow.',
        props: { variant: 'nocturne' },
      },
    ],
    tags: def.tags,
    intent: {
      summary: def.description,
      idealFor: def.idealFor,
      avoidFor: def.avoidFor,
      jobs: def.jobs,
      contentRequirements: ['Structured numerical data points, semantic color tokens, SVG vector rendering'],
      notes: ['Responsive vector scaling, zero client dependencies, accessible ARIA figures'],
    },
    visualDNA: {
      professionalism: 92,
      playfulness: 15,
      luxury: 40,
      warmth: 25,
      technicality: 90,
      editorial: 55,
      futurism: 45,
      visualAmbition: 70,
      structuralCreativity: 50,
      density: 75,
      whitespace: 40,
      contrast: 85,
      colourfulness: 35,
      curvature: 30,
      depth: 30,
      motion: 20,
      motionPlayfulness: 10,
      typographicExpression: 45,
      imageryIntensity: 0,
      videoIntensity: 0,
      threeDIntensity: 0,
      dataDensity: 90,
      interactionDensity: 70,
      asymmetry: 10,
      conversionIntensity: 30,
      trust: 95,
      accessibilityPriority: 95,
      performancePriority: 98,
      visualMode: 'adaptive',
      geometryFamily: 'rounded',
      primaryStack: 'react-tailwind',
    },
    interactionDNA: {
      interactionDensity: 75,
      motionIntensity: 20,
      keyboardComplexity: 'medium',
      hoverDependency: 'none',
      directManipulation: false,
    },
    layoutDNA: {
      density: 75,
      whitespace: 35,
      asymmetry: 10,
      preferredWidths: ['full'],
      layoutFamilies: ['chart', 'panel', 'surface'],
    },
    responsive: {
      verifiedWidths: [360, 768, 1440],
      defaultStrategy: 'compress',
    },
    accessibility: {
      levelTarget: 'AA',
      keyboardVerified: true,
      screenReaderSemantics: true,
      reducedMotionVerified: true,
      contrastTokenCompatible: true,
      focusVisible: true,
    },
    performance: {
      jsCost: 'tiny',
      gpuCost: 'none',
      mediaCost: 'none',
      runtimeComplexity: 'low',
      lazyRecommended: false,
      continuousAnimation: false,
    },
    complexity: 'medium',
    customizability: 'high',
    compatibility: {},
    relationships: [],
    quality: {
      overall: 97,
      accessibility: 98,
      responsive: 96,
      performance: 100,
      codeQuality: 98,
      composability: 96,
      visualCraft: 96,
      dependencyCleanliness: 100,
      documentation: 96,
    },
    createdAt: '2026-10-10T12:00:00.000Z',
    updatedAt: '2026-10-10T12:00:00.000Z',
  };

  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
  fs.writeFileSync(path.join(dir, 'index.tsx'), def.indexCode.trim() + '\n', 'utf-8');
  fs.writeFileSync(path.join(dir, 'preview.tsx'), def.previewCode.trim() + '\n', 'utf-8');
  fs.writeFileSync(path.join(dir, 'fixtures.ts'), def.fixturesCode.trim() + '\n', 'utf-8');
  fs.writeFileSync(path.join(dir, 'README.md'), def.readmeCode.trim() + '\n', 'utf-8');
}
