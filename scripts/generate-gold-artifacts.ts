import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GOLD_40_SLUGS } from '../packages/catalog/src/gold.js';
import { buildCatalogueFromDirectory } from '../packages/catalog/src/index.js';
import { ResourceManifestSchema, ResourceSlugSchema, type ResourceManifest } from '../packages/schemas/src/index.js';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const resourcesDir = path.join(rootDir, 'resources');
const generatedPaths = {
  renderer: path.join(rootDir, 'packages', 'renderer', 'src', 'generated-gold-registry.tsx'),
  previewApp: path.join(rootDir, 'apps', 'preview', 'src', 'generated-previews.ts'),
  sitePreview: path.join(rootDir, 'apps', 'site', 'src', 'components', 'generated-previews.ts'),
};

export interface DiscoveredGoldComponent {
  slug: string;
  id?: string;
  category: string;
  componentName: string;
  importPath: string;
  previewName?: string;
  previewImportPathPreviewApp?: string;
  previewImportPathSite?: string;
  sourceCode: string;
  manifest: Record<string, unknown>;
}

function isWithinDirectory(directory: string, candidate: string): boolean {
  const relativePath = path.relative(directory, candidate);
  return relativePath !== '' && relativePath !== '..' &&
    !relativePath.startsWith(`..${path.sep}`) && !path.isAbsolute(relativePath);
}

function resolveResourceDirectory(resourcesRoot: string, resourceDir: string): string {
  const rootStat = fs.lstatSync(resourcesRoot);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    throw new Error(`Catalogue resource root must be a real directory: '${resourcesRoot}'.`);
  }
  const canonicalRoot = fs.realpathSync(resourcesRoot);
  const resolvedDir = path.resolve(resourceDir);
  if (!isWithinDirectory(canonicalRoot, resolvedDir)) {
    throw new Error(`Validated resource directory escapes the catalogue root: '${resourceDir}'.`);
  }
  const dirStat = fs.lstatSync(resolvedDir);
  if (dirStat.isSymbolicLink() || !dirStat.isDirectory()) {
    throw new Error(`Validated resource directory must be a real directory: '${resourceDir}'.`);
  }
  const canonicalDir = fs.realpathSync(resolvedDir);
  if (!isWithinDirectory(canonicalRoot, canonicalDir)) {
    throw new Error(`Validated resource directory resolves outside the catalogue root: '${resourceDir}'.`);
  }
  return canonicalDir;
}

function readResourceSource(resourceDir: string, fileName: string, required: boolean): string | undefined {
  const candidate = path.resolve(resourceDir, fileName);
  if (!isWithinDirectory(resourceDir, candidate)) {
    throw new Error(`Resource source path escapes its directory: '${fileName}'.`);
  }
  if (!fs.existsSync(candidate)) {
    if (required) throw new Error(`Required generated source is missing: '${candidate}'.`);
    return undefined;
  }
  const realCandidate = fs.realpathSync(candidate);
  if (!isWithinDirectory(resourceDir, realCandidate)) {
    throw new Error(`Resource source resolves outside its directory: '${fileName}'.`);
  }
  const sourceStat = fs.statSync(realCandidate);
  if (!sourceStat.isFile()) {
    throw new Error(`Resource source is not a file: '${candidate}'.`);
  }
  if (sourceStat.size > 1024 * 1024) {
    throw new Error(`Resource source exceeds the 1 MiB generated-source limit: '${candidate}'.`);
  }
  return fs.readFileSync(realCandidate, 'utf-8').replace(/\r\n/g, '\n');
}

function sourceImportPath(fromFile: string, resourceDir: string, fileName: 'index.tsx' | 'preview.tsx'): string {
  const emittedName = fileName.replace(/\.tsx$/, '.js');
  return path.relative(path.dirname(fromFile), path.join(resourceDir, emittedName)).replaceAll('\\', '/');
}

function createDiscoveredComponent(
  resourcesRoot: string,
  rawManifest: ResourceManifest,
  resourceDir: string
): DiscoveredGoldComponent | undefined {
  const manifest = ResourceManifestSchema.parse(rawManifest);
  if (!ResourceSlugSchema.safeParse(manifest.slug).success) {
    throw new Error(`Manifest has an invalid canonical resource slug: '${manifest.slug}'.`);
  }
  const canonicalDir = resolveResourceDirectory(resourcesRoot, resourceDir);
  const code = readResourceSource(canonicalDir, 'index.tsx', false);
  if (!code) return undefined;
  const match = code.match(/export\s+(?:function|const|class)\s+([A-Z][A-Za-z0-9_]*)/);
  if (!match?.[1]) {
    throw new Error(`Failed to find a named component export in '${canonicalDir}'.`);
  }

  const previewCode = readResourceSource(canonicalDir, 'preview.tsx', false);
  const previewMatch = previewCode?.match(/export\s+(?:function|const|class)\s+([A-Z][A-Za-z0-9_]*)/);
  const relative = path.relative(fs.realpathSync(resourcesRoot), canonicalDir).split(path.sep);
  return {
    slug: manifest.slug,
    id: manifest.id,
    category: relative[0] ?? 'resources',
    componentName: match[1],
    importPath: sourceImportPath(generatedPaths.renderer, canonicalDir, 'index.tsx'),
    previewName: previewMatch?.[1],
    previewImportPathPreviewApp: previewMatch
      ? sourceImportPath(generatedPaths.previewApp, canonicalDir, 'preview.tsx')
      : undefined,
    previewImportPathSite: previewMatch
      ? sourceImportPath(generatedPaths.sitePreview, canonicalDir, 'preview.tsx')
      : undefined,
    sourceCode: code,
    manifest: manifest as unknown as Record<string, unknown>,
  };
}

export async function discoverGoldComponents(
  resourceDirectories?: ReadonlyMap<ResourceManifest, string>
): Promise<DiscoveredGoldComponent[]> {
  const allComponents = await discoverAllComponents(resourceDirectories);
  const bySlug = new Map(allComponents.map((component) => [component.slug, component]));
  return GOLD_40_SLUGS.map((slug) => {
    const component = bySlug.get(slug);
    if (!component) throw new Error(`Failed to find validated Gold component for slug: ${slug}`);
    return component;
  });
}

export function generateGoldRendererRegistry(components: DiscoveredGoldComponent[]): string {
  const imports: string[] = ["import React from 'react';", "import type { ResourceRendererMap } from './types.js';"];
  const mappings: string[] = [];

  components.forEach((c, idx) => {
    if (!ResourceSlugSchema.safeParse(c.slug).success) {
      throw new Error(`Cannot generate a runtime registry entry for invalid resource slug '${c.slug}'.`);
    }
    if (!/^[A-Z][A-Za-z0-9_]*$/.test(c.componentName)) {
      throw new Error(`Cannot generate a runtime registry entry for invalid component identifier '${c.componentName}'.`);
    }
    const importAlias = `GoldComp_${idx}_${c.componentName}`;
    imports.push(`import { ${c.componentName} as ${importAlias} } from ${JSON.stringify(c.importPath)};`);
    mappings.push(`  ${JSON.stringify(c.slug)}: ${importAlias} as unknown as React.ComponentType<Record<string, unknown>>,`);
    if (c.id) {
      mappings.push(`  ${JSON.stringify(c.id)}: ${importAlias} as unknown as React.ComponentType<Record<string, unknown>>,`);
    }
  });

  return `// THIS FILE IS AUTO-GENERATED BY scripts/generate-gold-artifacts.ts - DO NOT EDIT MANUALLY
${imports.join('\n')}

export const GENERATED_GOLD_RENDERERS: ResourceRendererMap = {
${mappings.join('\n')}
};
`;
}

function extractAcceptedProps(code:string,slug:string):string[] {
  const source = ts.createSourceFile(`${slug}.tsx`,code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const acceptedProps:string[]=[];
  for (const statement of source.statements) {
    if (ts.isInterfaceDeclaration(statement) && statement.name.text.endsWith('Props')) {
    for (const member of statement.members) {
      if (ts.isPropertySignature(member) && member.name && (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))) acceptedProps.push(member.name.text);
    }
    if (statement.heritageClauses?.length) acceptedProps.push('id','title','disabled','type','defaultValue','value','placeholder','name','aria-label','aria-describedby','aria-labelledby','checked','required','readOnly','onClick','onChange','onKeyDown','onFocus','onBlur');
    }
  }
  return [...new Set(acceptedProps)];
}

function extractVariantIds(manifest: Record<string, unknown>): string[] {
  if (!Array.isArray(manifest.variants)) return [];
  return manifest.variants.flatMap((variant) => {
    if (!variant || typeof variant !== 'object' || !('id' in variant)) return [];
    const id = (variant as { id?: unknown }).id;
    return typeof id === 'string' ? [id] : [];
  });
}

export function generateGoldSources(components: DiscoveredGoldComponent[]): string {
  const records = components.map((c) => {
    const deps = (c.manifest.dependencies as Array<{ name: string; version: string }>) || [];
    const depsObj: Record<string, string> = {};
    const acceptedProps=extractAcceptedProps(c.sourceCode,c.slug);
    const variants=extractVariantIds(c.manifest);
    for (const d of deps) {
      depsObj[d.name] = d.version || 'latest';
    }

    return `  ${JSON.stringify(c.slug)}: {
    slug: ${JSON.stringify(c.slug)},
    id: ${JSON.stringify(c.id || '')},
    name: ${JSON.stringify(c.manifest.name || c.slug)},
    componentName: ${JSON.stringify(c.componentName)},
    dependencies: ${JSON.stringify(depsObj)},
    acceptedProps: ${JSON.stringify([...new Set(acceptedProps)])},
    variants: ${JSON.stringify(variants)},
    code: ${JSON.stringify(c.sourceCode)},
  },`;
  });

  return `// THIS FILE IS AUTO-GENERATED BY scripts/generate-gold-artifacts.ts - DO NOT EDIT MANUALLY
export interface GoldResourceSource {
  slug: string;
  id: string;
  name: string;
  componentName: string;
  dependencies: Record<string, string>;
  acceptedProps: string[];
  variants: string[];
  code: string;
}

export const GENERATED_GOLD_SOURCES: Record<string, GoldResourceSource> = {
${records.join('\n')}
};

export function getGoldResourceSource(slugOrId: string): GoldResourceSource | undefined {
  if (GENERATED_GOLD_SOURCES[slugOrId]) {
    return GENERATED_GOLD_SOURCES[slugOrId];
  }
  for (const src of Object.values(GENERATED_GOLD_SOURCES)) {
    if (src.id === slugOrId || src.slug === slugOrId) {
      return src;
    }
  }
  return undefined;
}
`;
}

export async function runGenerate(resourceDirectories?: ReadonlyMap<ResourceManifest, string>) {
  const components = await discoverAllComponents(resourceDirectories);
  const goldSlugs = new Set(GOLD_40_SLUGS);
  const goldComponents = components.filter((component) => goldSlugs.has(component.slug));
  if (goldComponents.length !== GOLD_40_SLUGS.length) {
    throw new Error(`Expected ${GOLD_40_SLUGS.length} verified Gold renderer sources; found ${goldComponents.length}.`);
  }
  console.log(`[generate-gold-artifacts] Discovered ${components.length} validated catalogue resources; exposing only ${goldComponents.length} Gold resources to the app renderer.`);

  // 1. Write renderer registry
  const rendererFile = path.join(rootDir, 'packages', 'renderer', 'src', 'generated-gold-registry.tsx');
  fs.writeFileSync(rendererFile, generateGoldRendererRegistry(goldComponents), 'utf-8');
  console.log(`[generate-gold-artifacts] Wrote ${rendererFile}`);

  const propsFile=path.join(rootDir,'packages/renderer/src/generated-gold-props.ts');
  fs.writeFileSync(propsFile,`// Generated at build time from TypeScript interfaces.
export const GOLD_RESOURCE_PROPS: Record<string,readonly string[]> = ${JSON.stringify(Object.fromEntries(goldComponents.map(component=>[component.slug,extractAcceptedProps(component.sourceCode,component.slug)])),null,2)};
`,'utf-8');

  const variantFile=path.join(rootDir,'packages/renderer/src/generated-resource-variants.ts');
  const variantEntries=components.flatMap((component) => {
    const variants=extractVariantIds(component.manifest);
    const entries:Array<[string,string[]]>=[[component.slug,variants]];
    if(component.id) entries.push([component.id,variants]);
    return entries;
  });
  fs.writeFileSync(variantFile,`// Generated from canonical ResourceManifest variant declarations.
export const RESOURCE_VARIANTS: Record<string,readonly string[]> = ${JSON.stringify(Object.fromEntries(variantEntries),null,2)};
`,'utf-8');

  // 2. Write exporter sources
  const exporterFile = path.join(rootDir, 'packages', 'exporter', 'src', 'generated-gold-sources.ts');
  fs.writeFileSync(exporterFile, generateGoldSources(components), 'utf-8');
  console.log(`[generate-gold-artifacts] Wrote ${exporterFile}`);
  fs.writeFileSync(path.join(rootDir,'apps/preview/src/generated-previews.ts'), generatePreviewsRegistry(components,'preview-app'),'utf-8');
  fs.writeFileSync(path.join(rootDir,'apps/site/src/components/generated-previews.ts'), generatePreviewsRegistry(components,'site'),'utf-8');
}

// Execute if run directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runGenerate().catch((err) => {
    console.error('[generate-gold-artifacts] Error:', err);
    process.exit(1);
  });
}

export async function discoverAllComponents(
  resourceDirectories?: ReadonlyMap<ResourceManifest, string>
): Promise<DiscoveredGoldComponent[]> {
  const rootStat = fs.lstatSync(resourcesDir);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    throw new Error(`Catalogue resource root must be a real directory: '${resourcesDir}'.`);
  }
  const canonicalRoot = fs.realpathSync(resourcesDir);
  const validatedDirectories = resourceDirectories ??
    (await buildCatalogueFromDirectory(canonicalRoot)).resourceDirectories;
  const discovered: DiscoveredGoldComponent[] = [];

  for (const [rawManifest, resourceDir] of validatedDirectories) {
    const manifest = ResourceManifestSchema.parse(rawManifest);
    const component = createDiscoveredComponent(canonicalRoot, manifest, resourceDir);
    if (component) {
      discovered.push(component);
    }
  }

  // Sort deterministically by slug
  discovered.sort((a, b) => a.slug.localeCompare(b.slug));
  return discovered;
}
export function generatePreviewsRegistry(components: DiscoveredGoldComponent[], target: 'preview-app' | 'site'): string {
  const imports: string[] = ["import React from 'react';"];
  const mappings: string[] = [];

  components.forEach((c, idx) => {
    if (!c.previewName) return;
    if (!ResourceSlugSchema.safeParse(c.slug).success) {
      throw new Error(`Cannot generate a preview registry entry for invalid resource slug '${c.slug}'.`);
    }
    if (!/^[A-Z][A-Za-z0-9_]*$/.test(c.previewName)) {
      throw new Error(`Cannot generate a preview registry entry for invalid component identifier '${c.previewName}'.`);
    }
    const importPath = target === 'preview-app' ? c.previewImportPathPreviewApp : c.previewImportPathSite;
    if (!importPath) return;

    const importAlias = `Preview_${idx}_${c.previewName}`;
    imports.push(`import { ${c.previewName} as ${importAlias} } from ${JSON.stringify(importPath)};`);
    mappings.push(`  ${JSON.stringify(c.slug)}: ${importAlias} as unknown as React.ComponentType<Record<string, unknown>>,`);
    if (c.id) {
      mappings.push(`  ${JSON.stringify(c.id)}: ${importAlias} as unknown as React.ComponentType<Record<string, unknown>>,`);
    }
  });

  return `// THIS FILE IS AUTO-GENERATED BY scripts/generate-gold-artifacts.ts - DO NOT EDIT MANUALLY
${imports.join('\n')}

export const GENERATED_PREVIEW_COMPONENTS: Record<string, React.ComponentType<Record<string, unknown>>> = {
${mappings.join('\n')}
};
`;
}
