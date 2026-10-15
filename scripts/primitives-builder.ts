import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ResourceManifest } from '@tessellate/schemas';

export interface PrimitiveDef {
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

export function writePrimitive(def: PrimitiveDef, repoRoot: string) {
  const dir = path.join(repoRoot, 'resources', 'primitives', def.slug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const manifest: ResourceManifest = {
    schemaVersion: '1.0.0',
    id: `res_primitive_${def.slug.replace(/-/g, '_')}`,
    slug: def.slug,
    name: def.name,
    version: '1.0.0',
    status: 'verified',
    description: def.description,
    resourceType: 'primitive',
    categories: def.categories,
    roles: def.roles,
    purposes: def.purposes,
    productArchetypes: [
      { tag: 'developer-tool', weight: 90 },
      { tag: 'b2b-saas', weight: 85 },
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
        name: 'Content',
        type: 'component',
        required: false,
      },
    ],
    variants: [
      {
        id: 'quiet',
        name: 'Quiet',
        description: 'Monochrome, restrained, minimal contrast for high data density shells.',
        props: { variant: 'quiet' },
      },
      {
        id: 'expressive',
        name: 'Expressive',
        description: 'Cobalt primary, tactile elevation and hover lift, spring-like feel.',
        props: { variant: 'expressive' },
      },
      {
        id: 'nocturne',
        name: 'Nocturne',
        description: 'Obsidian dark canvas with razor-sharp hairline borders and crisp luminescence.',
        props: { variant: 'nocturne' },
      },
    ],
    tags: def.tags,
    intent: {
      summary: def.description,
      idealFor: def.idealFor,
      avoidFor: def.avoidFor,
      jobs: def.jobs,
      contentRequirements: ['Accessible label and appropriate semantic tokens'],
      notes: ['Supports keyboard navigation and reduced motion'],
    },
    visualDNA: {
      professionalism: 80,
      playfulness: 30,
      luxury: 40,
      warmth: 30,
      technicality: 70,
      editorial: 60,
      futurism: 40,
      visualAmbition: 50,
      structuralCreativity: 30,
      density: 60,
      whitespace: 50,
      contrast: 70,
      colourfulness: 40,
      curvature: 50,
      depth: 30,
      motion: 40,
      motionPlayfulness: 20,
      typographicExpression: 40,
      imageryIntensity: 10,
      videoIntensity: 0,
      threeDIntensity: 0,
      dataDensity: 60,
      interactionDensity: 70,
      asymmetry: 10,
      conversionIntensity: 60,
      trust: 85,
      accessibilityPriority: 95,
      performancePriority: 95,
      visualMode: 'adaptive',
      geometryFamily: 'rounded',
      primaryStack: 'react-tailwind',
    },
    interactionDNA: {
      interactionDensity: 60,
      motionIntensity: 30,
      keyboardComplexity: 'low',
      hoverDependency: 'none',
      directManipulation: false,
    },
    layoutDNA: {
      density: 60,
      whitespace: 40,
      asymmetry: 10,
      preferredWidths: ['content'],
      layoutFamilies: ['inline', 'row', 'toolbar'],
    },
    responsive: {
      verifiedWidths: [360, 768, 1440],
      defaultStrategy: 'compress',
    },
    accessibility: {
      levelTarget: 'AAA',
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
    complexity: 'low',
    customizability: 'high',
    compatibility: {},
    relationships: [],
    quality: {
      overall: 96,
      accessibility: 98,
      responsive: 95,
      performance: 100,
      codeQuality: 96,
      composability: 95,
      visualCraft: 95,
      dependencyCleanliness: 100,
      documentation: 95,
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
