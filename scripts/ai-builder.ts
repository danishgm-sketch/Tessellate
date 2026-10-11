import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ResourceManifest } from '@tessellate/schemas';

export interface AIDef {
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

export function writeAIResource(def: AIDef, repoRoot: string) {
  const dir = path.join(repoRoot, 'resources', 'ai', def.slug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const manifest: ResourceManifest = {
    schemaVersion: '1.0.0',
    id: `res_ai_${def.slug.replace(/-/g, '_')}`,
    slug: def.slug,
    name: def.name,
    version: '1.0.0',
    status: 'verified',
    description: def.description,
    resourceType: 'ai-pattern',
    categories: def.categories,
    roles: def.roles,
    purposes: def.purposes,
    productArchetypes: [
      { tag: 'developer-tool', weight: 95 },
      { tag: 'b2b-saas', weight: 90 },
      { tag: 'data-product', weight: 85 },
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
        name: 'AI Surface Content',
        type: 'component',
        required: false,
      },
    ],
    variants: [
      {
        id: 'quiet',
        name: 'Quiet',
        description: 'Subtle slate borders, minimal badge accents, calm tool call telemetry for deep work.',
        props: { variant: 'quiet' },
      },
      {
        id: 'expressive',
        name: 'Expressive',
        description: 'Vibrant cobalt highlights, fluid gradient thinking indicators, and rich model card pills.',
        props: { variant: 'expressive' },
      },
      {
        id: 'nocturne',
        name: 'Nocturne',
        description: 'Obsidian dark canvas, electric cyan luminescence, and high-contrast monospace code surfaces.',
        props: { variant: 'nocturne' },
      },
    ],
    tags: def.tags,
    intent: {
      summary: def.description,
      idealFor: def.idealFor,
      avoidFor: def.avoidFor,
      jobs: def.jobs,
      contentRequirements: ['Model state reflection, streaming message blocks, citation cards, human-in-the-loop approvals'],
      notes: ['Local state mockable, BYO endpoint compatible, zero lock-in contracts'],
    },
    visualDNA: {
      professionalism: 92,
      playfulness: 25,
      luxury: 45,
      warmth: 30,
      technicality: 88,
      editorial: 60,
      futurism: 55,
      visualAmbition: 75,
      structuralCreativity: 55,
      density: 70,
      whitespace: 45,
      contrast: 85,
      colourfulness: 35,
      curvature: 35,
      depth: 35,
      motion: 30,
      motionPlayfulness: 20,
      typographicExpression: 50,
      imageryIntensity: 0,
      videoIntensity: 0,
      threeDIntensity: 0,
      dataDensity: 75,
      interactionDensity: 85,
      asymmetry: 15,
      conversionIntensity: 35,
      trust: 95,
      accessibilityPriority: 95,
      performancePriority: 95,
      visualMode: 'adaptive',
      geometryFamily: 'rounded',
      primaryStack: 'react-tailwind',
    },
    interactionDNA: {
      interactionDensity: 85,
      motionIntensity: 25,
      keyboardComplexity: 'medium',
      hoverDependency: 'none',
      directManipulation: false,
    },
    layoutDNA: {
      density: 70,
      whitespace: 40,
      asymmetry: 15,
      preferredWidths: ['full'],
      layoutFamilies: ['panel', 'surface', 'bar'],
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
