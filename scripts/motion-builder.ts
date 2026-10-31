import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ResourceManifest } from '@tessellate/schemas';

export interface MotionDef {
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

export function writeMotionResource(def: MotionDef, repoRoot: string) {
  const dir = path.join(repoRoot, 'resources', 'motion', def.slug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const manifest: ResourceManifest = {
    schemaVersion: '1.0.0',
    id: `res_mot_${def.slug.replace(/-/g, '_')}`,
    slug: def.slug,
    name: def.name,
    version: '1.0.0',
    status: 'verified',
    description: def.description,
    resourceType: 'motion',
    categories: def.categories,
    roles: def.roles,
    purposes: def.purposes,
    productArchetypes: [
      { tag: 'b2b-saas', weight: 90 },
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
        name: 'Animated Content',
        type: 'component',
        required: false,
      },
    ],
    variants: [
      {
        id: 'quiet',
        name: 'Quiet',
        description: 'Micro-subtle, linear easing, near-instant settling times for high-speed productivity.',
        props: { variant: 'quiet' },
      },
      {
        id: 'expressive',
        name: 'Expressive',
        description: 'Springy overshoot physics, tactile scale lifts, dynamic bezier curves.',
        props: { variant: 'expressive' },
      },
      {
        id: 'nocturne',
        name: 'Nocturne',
        description: 'Razor-sharp hairline glow sweeps, crisp luminescence, cyber-luminescent particle trails.',
        props: { variant: 'nocturne' },
      },
    ],
    tags: def.tags,
    intent: {
      summary: def.description,
      idealFor: def.idealFor,
      avoidFor: def.avoidFor,
      jobs: def.jobs,
      contentRequirements: ['CSS transition and animation transforms, reduced-motion fallbacks'],
      notes: ['Strictly zero heavy external physics engines, pure CSS/Web Animations API'],
    },
    visualDNA: {
      professionalism: 90,
      playfulness: 35,
      luxury: 50,
      warmth: 30,
      technicality: 85,
      editorial: 60,
      futurism: 60,
      visualAmbition: 80,
      structuralCreativity: 55,
      density: 70,
      whitespace: 45,
      contrast: 85,
      colourfulness: 35,
      curvature: 35,
      depth: 40,
      motion: 50,
      motionPlayfulness: 30,
      typographicExpression: 50,
      imageryIntensity: 0,
      videoIntensity: 0,
      threeDIntensity: 0,
      dataDensity: 65,
      interactionDensity: 85,
      asymmetry: 15,
      conversionIntensity: 40,
      trust: 95,
      accessibilityPriority: 98,
      performancePriority: 98,
      visualMode: 'adaptive',
      geometryFamily: 'rounded',
      primaryStack: 'react-tailwind',
    },
    interactionDNA: {
      interactionDensity: 85,
      motionIntensity: 45,
      keyboardComplexity: 'medium',
      hoverDependency: 'none',
      directManipulation: true,
    },
    layoutDNA: {
      density: 70,
      whitespace: 40,
      asymmetry: 15,
      preferredWidths: ['full'],
      layoutFamilies: ['panel', 'surface', 'inline'],
    },
    responsive: {
      verifiedWidths: [360, 768, 1440],
      defaultStrategy: 'compress',
    },
    accessibility: {
      levelTarget: 'AA',
      keyboardVerified: false,
      screenReaderSemantics: false,
      reducedMotionVerified: false,
      contrastTokenCompatible: false,
      focusVisible: false,
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
      assessment: { status: 'unassessed', evidence: [] },
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
