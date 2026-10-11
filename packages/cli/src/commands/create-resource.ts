import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ResourceManifest } from '@tessellate/schemas';
import { ResourceManifestSchema } from '@tessellate/schemas';

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
  const name = options.name || slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  const category = options.category || 'primitives';
  const resourceType = options.type || 'primitive';
  const author = options.author || 'Tessellate Community Contributor';
  const description = options.description || `Accessible, deterministic ${name} designed with semantic design tokens.`;
  const componentName = name.replace(/[^a-zA-Z0-9]/g, '');

  console.log(`[tess] Scaffolding new resource: ${name} (${slug})...`);

  // Target directory inside resources/<category>/<slug>
  const targetDir = path.resolve(cwd, 'resources', category, slug);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const now = new Date().toISOString();
  const manifest: ResourceManifest = {
    schemaVersion: '1.0.0',
    id: `res_${slug.replace(/-/g, '_')}`,
    slug,
    name,
    version: '0.1.0',
    status: 'experimental',
    description,
    resourceType,
    categories: [category],
    roles: ['display', 'interactive'],
    purposes: ['ui-element'],
    productArchetypes: [{ tag: 'saas', weight: 80 }],
    creator: {
      id: `contrib_${slug}`,
      displayName: author,
      handle: slug,
      url: 'https://tessellate.design',
    },
    provenance: {
      origin: 'community',
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
      verifiedWidths: [375, 768, 1440],
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
    complexity: 'low',
    customizability: 'high',
    compatibility: {},
    relationships: [],
    quality: {
      overall: 90,
      accessibility: 95,
      responsive: 90,
      performance: 95,
      codeQuality: 92,
      composability: 90,
      visualCraft: 90,
      dependencyCleanliness: 100,
      documentation: 85,
    },
    createdAt: now,
    updatedAt: now,
  };

  // Validate the scaffolded manifest against schema
  const validation = ResourceManifestSchema.safeParse(manifest);
  if (!validation.success) {
    throw new Error(`Scaffolded manifest failed schema validation: ${JSON.stringify(validation.error.issues, null, 2)}`);
  }

  // Write resource.json
  const manifestPath = path.join(targetDir, 'resource.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  // Write index.tsx
  const componentCode = `import React from 'react';

export interface ${componentName}Props {
  children?: React.ReactNode;
  className?: string;
}

/**
 * ${name} — ${description}
 * Adheres strictly to Tessellate semantic design tokens.
 */
export function ${componentName}({
  children,
  className = '',
}: ${componentName}Props) {
  return (
    <div
      className={\`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tess-focus-ring,#2547E8)] bg-[var(--tess-surface,#FFFFFF)] text-[var(--tess-ink,#111217)] border border-[var(--tess-border,#E5E3DC)] rounded-[var(--tess-radius,6px)] hover:bg-[var(--tess-surface-raised,#FFFFFF)] \${className}\`}
    >
      {children || '${name}'}
    </div>
  );
}

export default ${componentName};
`;
  const indexPath = path.join(targetDir, 'index.tsx');
  fs.writeFileSync(indexPath, componentCode, 'utf-8');

  // Write README.md
  const readmeCode = `# ${name}

> ${description}

## Design DNA
- **Chroma**: Minimal
- **Radii**: Subtle
- **Motion**: Functional
- **Contrast**: Normal

## Installation
\`\`\`bash
tess add ${slug}
# or with shadcn
npx shadcn@latest add https://tessellate.design/r/${slug}.json
\`\`\`

## Usage
\`\`\`tsx
import { ${componentName} } from './components/ui/${componentName}';

export function Example() {
  return <${componentName}>Hello World</${componentName}>;
}
\`\`\`
`;
  const readmePath = path.join(targetDir, 'README.md');
  fs.writeFileSync(readmePath, readmeCode, 'utf-8');

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
