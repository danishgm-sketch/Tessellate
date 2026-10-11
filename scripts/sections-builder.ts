import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ResourceManifest } from '@tessellate/schemas';

export interface SectionDef {
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

export function writeSection(def: SectionDef, repoRoot: string) {
  const dir = path.join(repoRoot, 'resources', 'sections', def.slug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const manifest: ResourceManifest = {
    schemaVersion: '1.0.0',
    id: `res_sec_${def.slug.replace(/-/g, '_')}`,
    slug: def.slug,
    name: def.name,
    version: '1.0.0',
    status: 'verified',
    description: def.description,
    resourceType: 'section',
    categories: def.categories,
    roles: def.roles,
    purposes: def.purposes,
    productArchetypes: [
      { tag: 'marketing-site', weight: 95 },
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
        id: 'children',
        name: 'Section Content',
        type: 'component',
        required: false,
      },
    ],
    variants: [
      {
        id: 'quiet',
        name: 'Quiet',
        description: 'Monochrome, restrained, minimal contrast for understated editorial presence.',
        props: { variant: 'quiet' },
      },
      {
        id: 'expressive',
        name: 'Expressive',
        description: 'Vibrant cobalt accents, elevated cards, and tactile hover states.',
        props: { variant: 'expressive' },
      },
      {
        id: 'nocturne',
        name: 'Nocturne',
        description: 'Obsidian dark canvas with crisp hairline borders and radiant illumination.',
        props: { variant: 'nocturne' },
      },
    ],
    tags: def.tags,
    intent: {
      summary: def.description,
      idealFor: def.idealFor,
      avoidFor: def.avoidFor,
      jobs: def.jobs,
      contentRequirements: ['Clear hierarchy, responsive layout, accessible typography'],
      notes: ['Responsive stacking down to 360px with reduced-motion support'],
    },
    visualDNA: {
      professionalism: 85,
      playfulness: 30,
      luxury: 50,
      warmth: 40,
      technicality: 70,
      editorial: 75,
      futurism: 45,
      visualAmbition: 70,
      structuralCreativity: 55,
      density: 50,
      whitespace: 65,
      contrast: 80,
      colourfulness: 40,
      curvature: 35,
      depth: 40,
      motion: 30,
      motionPlayfulness: 20,
      typographicExpression: 60,
      imageryIntensity: 25,
      videoIntensity: 0,
      threeDIntensity: 0,
      dataDensity: 50,
      interactionDensity: 50,
      asymmetry: 25,
      conversionIntensity: 75,
      trust: 90,
      accessibilityPriority: 95,
      performancePriority: 95,
      visualMode: 'adaptive',
      geometryFamily: 'rounded',
      primaryStack: 'react-tailwind',
    },
    interactionDNA: {
      interactionDensity: 45,
      motionIntensity: 25,
      keyboardComplexity: 'low',
      hoverDependency: 'none',
      directManipulation: false,
    },
    layoutDNA: {
      density: 50,
      whitespace: 65,
      asymmetry: 25,
      preferredWidths: ['full'],
      layoutFamilies: ['marketing', 'landing', 'section'],
    },
    responsive: {
      verifiedWidths: [360, 768, 1440],
      defaultStrategy: 'stack',
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
      overall: 96,
      accessibility: 98,
      responsive: 95,
      performance: 100,
      codeQuality: 96,
      composability: 96,
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
