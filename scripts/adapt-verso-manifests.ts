import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ResourceManifestSchema, SCHEMA_VERSION } from '../packages/schemas/src/index.js';
import { assertPrivatePaths, type VersoInventory, type VersoInventoryResource } from './verso-inventory.js';

const COLLECTION_TYPE: Record<VersoInventoryResource['collection'], 'component' | 'section' | 'block' | 'page' | 'effect' | 'typography'> = {
  fields: 'component',
  type: 'typography',
  pointers: 'effect',
  depth: 'effect',
  objects: 'component',
  sections: 'section',
  desk: 'block',
  editions: 'page',
  hybrids: 'section',
  originals: 'component',
};

const COLLECTION_CATEGORY: Record<VersoInventoryResource['collection'], string> = {
  fields: 'components',
  type: 'typography',
  pointers: 'effects',
  depth: 'effects',
  objects: 'components',
  sections: 'sections',
  desk: 'blocks',
  editions: 'pages',
  hybrids: 'blocks',
  originals: 'components',
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function readableLabel(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ').replace(/^./, (letter) => letter.toUpperCase());
}

function slotType(type: string, name: string): 'text' | 'rich-text' | 'image' | 'video' | 'icon' | 'action' | 'items' | 'data' | 'component' | 'number' | 'boolean' {
  const normalized = type.toLowerCase();
  if (/^on[A-Z]/.test(name) || normalized.includes('=>')) return 'action';
  if (normalized.includes('boolean')) return 'boolean';
  if (normalized.includes('number')) return 'number';
  if (normalized.includes('reactnode') || normalized.includes('element')) return 'component';
  if (normalized.includes('array') || normalized.includes('[]') || /^(items|rows|files|steps|options|data)$/i.test(name)) return 'items';
  if (normalized.includes('image') || /^(image|src|avatar|poster)$/i.test(name)) return 'image';
  if (normalized.includes('video') || /^(video|videoSrc)$/i.test(name)) return 'video';
  if (normalized.includes('icon') || /^icon$/i.test(name)) return 'icon';
  if (normalized.includes('string')) return 'text';
  return 'data';
}

export function projectVersoResource(resource: VersoInventoryResource, sourceLicense: string, timestamp: string) {
  const slug = `verso-${resource.collection}-${resource.id}`;
  const eventCount = resource.signals.eventProps.length;
  const controlCount = resource.signals.controls.length;
  const animated = resource.signals.browserApis.some((api) => api === 'requestAnimationFrame' || api === 'setInterval');
  const pointerDriven = resource.signals.eventProps.some((event) => /Pointer|Mouse|Touch|Drag/.test(event));
  const complexVisuals = resource.signals.visualApis.length > 0;
  const candidateRoles = resource.suggestedSemanticRoles.length > 0
    ? resource.suggestedSemanticRoles
    : [`verso-${resource.collection}`];
  const purposes = resource.collection === 'sections' || resource.collection === 'editions'
    ? ['marketing', 'editorial']
    : resource.collection === 'type'
      ? ['marketing', 'application']
      : ['application'];
  const archetypes = resource.suggestedProductArchetypes.map((tag) => ({ tag, weight: 40 }));
  const slots = resource.props.map((property) => ({
    id: property.name,
    name: readableLabel(property.name),
    type: slotType(property.type, property.name),
    required: property.required,
  }));
  const notes = [
    'Private source projection for local adaptation only. This record is not publishable or production-certified.',
    'Composition, behavior, responsive layout, accessibility, resource lifecycle and export compatibility have not been verified.',
  ];
  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    id: `res_${slug}`,
    slug,
    name: resource.name,
    version: '1.0.0',
    status: 'experimental' as const,
    description: resource.functionalPurpose,
    resourceType: COLLECTION_TYPE[resource.collection],
    categories: [COLLECTION_CATEGORY[resource.collection], resource.collection, 'verso-private'],
    roles: candidateRoles,
    purposes,
    productArchetypes: archetypes,
    creator: {
      id: 'creator_verso_private',
      displayName: 'Verso (private local source)',
      handle: 'verso-private',
    },
    provenance: {
      origin: 'unknown' as const,
      originalRepository: 'Private local Verso source; canonical identity and source hash are in the private inventory.',
      derivative: 'unknown' as const,
      derivativeNotes: 'Declared lineage is preserved separately; upstream rights and derivative status have not been legally reviewed.',
      aiAssistance: 'unknown' as const,
    },
    license: {
      spdx: sourceLicense,
      name: 'UNLICENSED (private source)',
      redistributionVerified: false,
      attributionRequired: 'unknown' as const,
      attributionText: 'Attribution requirements have not been established. This record does not grant redistribution permission.',
    },
    framework: 'react' as const,
    language: 'typescript' as const,
    styling: 'tailwind' as const,
    dependencies: resource.dependencies.map((dependency) => ({
      package: dependency.package,
      range: dependency.declaredRange ?? 'unresolved',
      kind: dependency.package === 'react' ? 'peer' as const : 'runtime' as const,
      optional: false,
      reason: 'Inferred from a static import; exact runtime use and version compatibility are unverified.',
    })),
    files: [{ path: resource.sourcePath, kind: 'component' as const, required: true }],
    registry: {
      name: `verso/${resource.collection}/${resource.id}`,
      dependencies: resource.dependencies.map((dependency) => dependency.package),
      devDependencies: [],
      registryDependencies: [],
    },
    preview: {
      component: resource.sourceExport,
      defaultProps: {},
      viewport: 360,
    },
    slots,
    variants: [],
    tags: [...new Set(['verso', 'private', 'unverified', 'unlicensed-local-only', resource.collection, ...resource.tags])],
    intent: {
      summary: resource.functionalPurpose,
      idealFor: resource.suggestedSemanticRoles,
      avoidFor: [],
      jobs: [],
      contentRequirements: [],
      notes,
    },
    visualDNA: {},
    interactionDNA: {
      interactionDensity: clamp(controlCount * 8 + eventCount * 3, 0, 100),
      motionIntensity: animated ? 60 : 0,
      keyboardComplexity: controlCount > 3 ? 'medium' as const : 'low' as const,
      hoverDependency: resource.signals.eventProps.some((event) => /MouseEnter|MouseMove|MouseLeave/.test(event))
        ? 'significant' as const
        : eventCount > 0 ? 'optional' as const : 'none' as const,
      directManipulation: pointerDriven || complexVisuals,
    },
    layoutDNA: {
      density: 50,
      whitespace: 50,
      asymmetry: 0,
      preferredWidths: ['content'] as const,
      layoutFamilies: [resource.collection],
    },
    responsive: {
      verifiedWidths: [],
      defaultStrategy: 'compress' as const,
    },
    accessibility: {
      levelTarget: 'none' as const,
      keyboardVerified: false,
      screenReaderSemantics: false,
      reducedMotionVerified: false,
      contrastTokenCompatible: false,
      focusVisible: false,
      knownLimitations: ['Accessibility has not been audited; source signals do not count as verification.'],
    },
    performance: {
      jsCost: complexVisuals || animated ? 'high' as const : 'medium' as const,
      gpuCost: complexVisuals ? 'high' as const : animated ? 'medium' as const : 'low' as const,
      mediaCost: resource.signals.visualCharacter.includes('canvas-or-shader-rendering') ? 'high' as const : 'low' as const,
      runtimeComplexity: resource.signals.reactHooks.length > 3 || controlCount > 4 ? 'high' as const : 'medium' as const,
      lazyRecommended: complexVisuals || animated,
      continuousAnimation: animated,
      notes: ['Static source estimate only; no bundle or runtime profile has been collected.'],
    },
    complexity: resource.signals.reactHooks.length > 3 || controlCount > 4 ? 'high' as const : 'medium' as const,
    customizability: resource.props.length > 4 ? 'high' as const : resource.props.length > 0 ? 'medium' as const : 'low' as const,
    compatibility: { requiredContext: [], forbiddenContext: [] },
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
      assessment: { status: 'unassessed' as const, evidence: [] as string[] },
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  return ResourceManifestSchema.parse(manifest);
}

export function buildPrivateVersoProjection(inventory: VersoInventory) {
  if (inventory.source.license !== 'UNLICENSED') {
    throw new Error(`Unexpected source license value '${inventory.source.license}'. Review rights before projecting. The source remains private.`);
  }
  if (
    inventory.totals.declaredResources !== inventory.resources.length ||
    inventory.totals.duplicateIds.length > 0 ||
    inventory.resources.some((resource) => !resource.exportedComponent || resource.certification !== 'unverified')
  ) {
    throw new Error('The inventory is incomplete, has duplicate IDs, or contains an unverified export mismatch. Rebuild and review it before adaptation.');
  }
  const timestamp = inventory.generatedAt;
  const records = inventory.resources.map((resource) => ({
    source: {
      id: resource.id,
      collection: resource.collection,
      path: resource.sourcePath,
      sourceExport: resource.sourceExport,
      sha256: resource.sourceHash,
      sourceFiles: resource.sourceFiles,
      props: resource.props,
      lineage: resource.lineage,
    },
    integration: {
      status: 'local-private-adaptation-candidate' as const,
      certification: 'unverified' as const,
      redistribution: 'blocked-unlicensed' as const,
      blockers: resource.blockers,
    },
    manifest: projectVersoResource(resource, inventory.source.license, timestamp),
  }));
  return {
    schemaVersion: 1,
    generatedAt: timestamp,
    sourceRoot: inventory.source.root,
    license: inventory.source.license,
    publicCatalogue: { baseCount: inventory.tessellateCatalogue.count, projectedOverlayCount: records.length },
    records,
  };
}

async function main(): Promise<void> {
  const args = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 2) {
    const key = process.argv[index];
    const value = process.argv[index + 1];
    if (!key?.startsWith('--') || !value || value.startsWith('--')) throw new Error('Usage: pnpm exec tsx scripts/adapt-verso-manifests.ts --inventory <private-inventory.json> --output <private-output.json>');
    args.set(key.slice(2), value);
  }
  const inventoryPath = args.get('inventory');
  const outputPath = args.get('output');
  if (!inventoryPath || !outputPath) throw new Error('Usage: pnpm exec tsx scripts/adapt-verso-manifests.ts --inventory <private-inventory.json> --output <private-output.json>');
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8')) as VersoInventory;
  assertPrivatePaths(repositoryRoot, inventory.source.root, outputPath);
  const projection = buildPrivateVersoProjection(inventory);
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  assertPrivatePaths(repositoryRoot, inventory.source.root, outputPath);
  await fs.promises.writeFile(outputPath, JSON.stringify(projection, null, 2), { encoding: 'utf8', flag: 'wx' });
  console.log(`[verso-adapter] Validated and wrote ${projection.records.length} private ResourceManifest projections.`);
  console.log('[verso-adapter] All records remain experimental, uncertified, local-only, and blocked from redistribution.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  main().catch((error: unknown) => {
    console.error('[verso-adapter] Refusing to continue:', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
