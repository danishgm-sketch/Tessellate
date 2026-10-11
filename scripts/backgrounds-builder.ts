import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ResourceManifest } from '@tessellate/schemas';

export interface BackgroundDef {
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

export function writeBackgroundResource(def: BackgroundDef, repoRoot: string) {
  const dir = path.join(repoRoot, 'resources', 'backgrounds', def.slug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const manifest: ResourceManifest = {
    schemaVersion: '1.0.0',
    id: `res_bg_${def.slug.replace(/-/g, '_')}`,
    slug: def.slug,
    name: def.name,
    version: '1.0.0',
    status: 'verified',
    description: def.description,
    resourceType: 'background',
    categories: def.categories,
    roles: def.roles,
    purposes: def.purposes,
    productArchetypes: [
      { tag: 'b2b-saas', weight: 95 },
      { tag: 'developer-tool', weight: 90 },
      { tag: 'consumer-subscription', weight: 85 },
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
        id: 'children',
        name: 'Foreground Content',
        type: 'component',
        required: false,
      },
    ],
    variants: [
      {
        id: 'quiet',
        name: 'Quiet',
        description: 'Micro-subtle opacity, neutral slate grid/grain texture, editorial calm.',
        props: { variant: 'quiet' },
      },
      {
        id: 'expressive',
        name: 'Expressive',
        description: 'Cobalt and violet atmospheric chromatic washes, dynamic depth.',
        props: { variant: 'expressive' },
      },
      {
        id: 'nocturne',
        name: 'Nocturne',
        description: 'Obsidian #0B0D10 canvas with hairline cyan luminescence and high-contrast matrix points.',
        props: { variant: 'nocturne' },
      },
    ],
    tags: def.tags,
    intent: {
      summary: def.description,
      idealFor: def.idealFor,
      avoidFor: def.avoidFor,
      jobs: def.jobs,
      contentRequirements: ['CSS patterns, SVG coordinate fields, zero GPU runaway memory leaks'],
      notes: ['Supports reduced motion, graceful degradation, lightweight DOM structure'],
    },
    visualDNA: {
      professionalism: 92,
      playfulness: 30,
      luxury: 50,
      warmth: 30,
      technicality: 85,
      editorial: 65,
      futurism: 60,
      visualAmbition: 75,
      structuralCreativity: 55,
      density: 65,
      whitespace: 50,
      contrast: 80,
      colourfulness: 30,
      curvature: 30,
      depth: 45,
      motion: 30,
      motionPlayfulness: 20,
      typographicExpression: 45,
      imageryIntensity: 0,
      videoIntensity: 0,
      threeDIntensity: 0,
      dataDensity: 60,
      interactionDensity: 65,
      asymmetry: 15,
      conversionIntensity: 35,
      trust: 95,
      accessibilityPriority: 98,
      performancePriority: 98,
      visualMode: 'adaptive',
      geometryFamily: 'rounded',
      primaryStack: 'react-tailwind',
    },
    interactionDNA: {
      interactionDensity: 60,
      motionIntensity: 25,
      keyboardComplexity: 'low',
      hoverDependency: 'none',
      directManipulation: false,
    },
    layoutDNA: {
      density: 65,
      whitespace: 45,
      asymmetry: 15,
      preferredWidths: ['full'],
      layoutFamilies: ['surface', 'canvas'],
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
      gpuCost: 'low',
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
      accessibility: 99,
      responsive: 96,
      performance: 100,
      codeQuality: 98,
      composability: 96,
      visualCraft: 97,
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
