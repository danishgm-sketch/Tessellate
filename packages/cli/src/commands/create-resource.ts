import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ResourceManifest } from '@tessellate/schemas';
import { ResourceManifestSchema } from '@tessellate/schemas';
import { resolveProjectPath } from '../config.js';

export interface CreateResourceOptions {
  slug?: string;
  name?: string;
  category?: string;
  type?: 'primitive' | 'block' | 'section' | 'page' | 'flow';
  author?: string;
  description?: string;
  cwd?: string;
}

export async function runCreateResource(options: CreateResourceOptions = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const slug = (options.slug || 'custom-component').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!slug) throw new Error('[tess] Resource slug must contain at least one letter or number.');
  const name = options.name || slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  const category = options.category || 'primitives';
  const resourceType = options.type || 'primitive';
  if (!['primitive', 'block', 'section', 'page', 'flow'].includes(resourceType)) {
    throw new Error(`[tess] Unsupported resource type "${resourceType}". Choose primitive, block, section, page, or flow.`);
  }
  const author = options.author || 'Unassigned contributor';
  const description = options.description || `Starter scaffold for ${name}. Review its behavior and metadata before sharing it.`;
  const compactName = name.replace(/[^a-zA-Z0-9_$]/g, '');
  const pascalName = compactName ? compactName.charAt(0).toUpperCase() + compactName.slice(1) : 'Resource';
  const componentName = /^[A-Za-z_$]/.test(pascalName) ? pascalName : `Resource${pascalName}`;

  console.log(`[tess] Scaffolding new resource: ${name} (${slug})...`);

  if (!/^[a-z][a-z0-9-]*$/.test(category)) {
    throw new Error(`[tess] Invalid resource category "${category}". Use a lowercase category name such as primitives, blocks, or sections.`);
  }

  // Target directory inside resources/<category>/<slug>. Keep this boundary
  // explicit even after validating the category to prevent future path leaks.
  const resourcesRoot = path.resolve(cwd, 'resources');
  const targetDir = resolveProjectPath(cwd, path.join('resources', category, slug), 'resource output directory');
  const relativeTarget = path.relative(resourcesRoot, targetDir);
  if (relativeTarget.startsWith('..') || path.isAbsolute(relativeTarget)) {
    throw new Error('[tess] Resource output path must remain inside the resources directory.');
  }

  const now = new Date().toISOString();
  const manifest: ResourceManifest = {
    schemaVersion: '1.0.0',
    id: `res_${slug.replace(/-/g, '_')}`,
    slug,
    name,
    version: '0.1.0',
    status: 'draft',
    description,
    resourceType,
    categories: [category],
    roles: ['display'],
    purposes: ['ui-element'],
    productArchetypes: [{ tag: 'saas', weight: 80 }],
    creator: {
      id: `contrib_${slug}`,
      displayName: author,
      handle: slug,
    },
    provenance: {
      origin: 'unknown',
      derivative: 'unknown',
      aiAssistance: 'unknown',
    },
    license: {
      spdx: 'NOASSERTION',
      name: 'License not selected',
      redistributionVerified: false,
      attributionRequired: false,
    },
    framework: 'react',
    language: 'typescript',
    styling: 'tailwind',
    dependencies: [],
    files: [
      {
        path: 'index.tsx',
        kind: 'component',
        required: true,
      },
    ],
    registry: {
      name: slug,
      dependencies: [],
      devDependencies: [],
      registryDependencies: [],
    },
    preview: {
      component: componentName,
      defaultProps: {},
      viewport: 1440,
    },
    slots: [],
    variants: [
      {
        id: 'default',
        name: 'Default',
        props: {},
      },
    ],
    tags: [slug, category, resourceType],
    intent: {
      summary: description,
      idealFor: ['web applications', 'modern landing pages'],
      avoidFor: ['legacy tabular frames'],
      jobs: ['render UI element'],
      contentRequirements: [],
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
      density: 50,
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
      dataDensity: 50,
      interactionDensity: 50,
      asymmetry: 10,
      conversionIntensity: 50,
      trust: 85,
      accessibilityPriority: 95,
      performancePriority: 95,
      visualMode: 'adaptive',
      geometryFamily: 'rounded',
      primaryStack: 'react-tailwind',
    },
    interactionDNA: {
      interactionDensity: 40,
      motionIntensity: 20,
      keyboardComplexity: 'low',
      hoverDependency: 'none',
      directManipulation: false,
    },
    layoutDNA: {
      density: 50,
      whitespace: 50,
      asymmetry: 10,
      preferredWidths: ['content', 'wide'],
      layoutFamilies: ['flex-row', 'grid-responsive'],
    },
    responsive: {
      verifiedWidths: [],
      defaultStrategy: 'compress',
    },
    accessibility: {
      levelTarget: 'none',
      keyboardVerified: false,
      screenReaderSemantics: false,
      reducedMotionVerified: false,
      contrastTokenCompatible: true,
      focusVisible: false,
      knownLimitations: ['Draft scaffold; accessibility behavior has not been tested.'],
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
      overall: 0,
      accessibility: 0,
      responsive: 0,
      performance: 0,
      codeQuality: 0,
      composability: 0,
      visualCraft: 0,
      dependencyCleanliness: 0,
      documentation: 0,
    assessment: { status: 'unassessed', evidence: [] },
    },
    createdAt: now,
    updatedAt: now,
  };

  // Validate the scaffolded manifest against schema
  const validation = ResourceManifestSchema.safeParse(manifest);
  if (!validation.success) {
    throw new Error(`Scaffolded manifest failed schema validation: ${JSON.stringify(validation.error.issues, null, 2)}`);
  }

  fs.mkdirSync(targetDir, { recursive: true });

  // Write resource.json
  const manifestPath = path.join(targetDir, 'resource.json');
  fs.writeFileSync(
    resolveProjectPath(cwd, path.relative(cwd, manifestPath), 'resource manifest output'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );

  // Write index.tsx
  const safeComment = (value: string) =>
    value
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map((line) => line.replace(/\*\//g, '* /'))
      .join('\n * ');
  const componentCode = `import React from 'react';

export interface ${componentName}Props {
  children?: React.ReactNode;
  className?: string;
}

/**
 * ${safeComment(name)} — ${safeComment(description)}
 * Adheres strictly to Tessellate semantic design tokens.
 */
export function ${componentName}({
  children,
  className = '',
}: ${componentName}Props) {
  return (
    <div
      className={\`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-[var(--tess-surface,#FFFFFF)] text-[var(--tess-ink,#111217)] border border-[var(--tess-border,#E5E3DC)] rounded-[var(--tess-radius,6px)] \${className}\`}
    >
      {children || ${JSON.stringify(name)}}
    </div>
  );
}

export default ${componentName};
`;
  const indexPath = path.join(targetDir, 'index.tsx');
  fs.writeFileSync(
    resolveProjectPath(cwd, path.relative(cwd, indexPath), 'resource source output'),
    componentCode,
    'utf-8'
  );

  // Write README.md
  const readmeCode = `# ${name}

> ${description}

This is an unpublished draft scaffold. It is not registered in the Tessellate catalogue.

## Before sharing
- Replace the unassigned contributor and unknown provenance with accurate attribution.
- Select a license and verify redistribution rights.
- Test accessibility and responsive behavior, then record only the widths and quality results you actually verified.
- Run \`tess validate resource.json\`; schema validation does not certify the source or its behavior.

## Usage
\`\`\`tsx
import { ${componentName} } from './components/ui/${componentName}';

export function Example() {
  return <${componentName}>Hello World</${componentName}>;
}
\`\`\`
`;
  const readmePath = path.join(targetDir, 'README.md');
  fs.writeFileSync(
    resolveProjectPath(cwd, path.relative(cwd, readmePath), 'resource documentation output'),
    readmeCode,
    'utf-8'
  );

  console.log(`[tess] Successfully created resource files:`);
  console.log(`  ✓ ${path.relative(cwd, manifestPath)}`);
  console.log(`  ✓ ${path.relative(cwd, indexPath)}`);
  console.log(`  ✓ ${path.relative(cwd, readmePath)}`);
  console.log(`\nNext: run 'tess validate ${path.relative(cwd, manifestPath)}' to test manifest validity.`);

  return {
    success: true,
    targetDir,
    manifestPath,
    indexPath,
    readmePath,
    manifest,
  };
}
