import { create, insert, type AnyOrama } from '@orama/orama';
import type { ResourceManifest } from '@tessellate/schemas';
import type { SearchDocument } from './types.js';

export const resourceSearchSchema = {
  id: 'string',
  slug: 'string',
  name: 'string',
  description: 'string',
  resourceType: 'string',
  categories: 'string[]',
  roles: 'string[]',
  purposes: 'string[]',
  tags: 'string[]',
  contentRequirements: 'string[]',
  intentSummary: 'string',
  intentJobs: 'string[]',
  intentIdealFor: 'string[]',
  archetypes: 'string[]',
  feel: 'string[]',
  intensity: 'string[]',
  motion: 'string[]',
  density: 'string[]',
  performance: 'string[]',
  accessibility: 'string[]',
  dependencies: 'string[]',
  qualityScore: 'number',
  license: 'string',
} as const;

export type ResourceOramaDb = AnyOrama;

/**
 * Creates a new Orama database instance initialized with the resource search schema.
 */
export async function createResourceSearchDb(): Promise<ResourceOramaDb> {
  return await create({
    schema: resourceSearchSchema,
  });
}

/**
 * Converts a ResourceManifest into an indexed SearchDocument.
 */
export function manifestToSearchDocument(manifest: ResourceManifest): SearchDocument {
  // Infer feel from personality and DNA
  const feelTags: string[] = [];
  if (manifest.visualDNA.editorial && manifest.visualDNA.editorial > 50) feelTags.push('editorial');
  if (manifest.visualDNA.playfulness && manifest.visualDNA.playfulness > 50) feelTags.push('playful');
  if (manifest.visualDNA.luxury && manifest.visualDNA.luxury > 50) feelTags.push('luxury', 'premium');
  if (manifest.visualDNA.technicality && manifest.visualDNA.technicality > 50) feelTags.push('technical');
  if (manifest.visualDNA.professionalism && manifest.visualDNA.professionalism > 60) feelTags.push('professional');
  if (manifest.visualDNA.futurism && manifest.visualDNA.futurism > 50) feelTags.push('futuristic');
  if (manifest.visualDNA.density && manifest.visualDNA.density < 40) feelTags.push('minimal');

  const ambition = manifest.visualDNA.visualAmbition ?? 50;
  const intensity = ambition < 40 ? 'Quiet' : ambition < 60 ? 'Balanced' : ambition < 75 ? 'Expressive' : 'Dramatic';
  const motionScore = manifest.interactionDNA.motionIntensity;
  const motion = motionScore === 0 ? 'None' : motionScore <= 30 ? 'Light' : motionScore <= 60 ? 'Moderate' : 'Heavy';
  const densityScore = manifest.layoutDNA.density;
  const density = densityScore <= 40 ? 'Sparse' : densityScore <= 65 ? 'Balanced' : 'Dense';

  const costs = [manifest.performance.jsCost, manifest.performance.gpuCost, manifest.performance.mediaCost];
  const complexity = manifest.performance.runtimeComplexity;
  const performance = costs.includes('high') || complexity === 'high'
    ? 'Heavy'
    : costs.includes('medium') || complexity === 'medium'
      ? 'Moderate'
      : 'Lightweight';

  const accessibility: string[] = [];
  if (manifest.accessibility.levelTarget === 'AA' || manifest.accessibility.levelTarget === 'AAA') {
    accessibility.push('AA target or higher');
  }
  if (manifest.accessibility.levelTarget === 'AAA') accessibility.push('AAA target');
  if (manifest.accessibility.keyboardVerified) accessibility.push('Keyboard verified');
  if (manifest.accessibility.reducedMotionVerified) accessibility.push('Reduced-motion verified');

  const dependencies = manifest.dependencies.filter((dependency) => dependency.kind !== 'dev');
  const dependencyPackages = dependencies.map((dependency) => dependency.package.toLowerCase());
  const dependencyFacets: string[] = [];
  if (dependencies.length === 0) dependencyFacets.push('Zero extra dependency');
  if (dependencyPackages.some((name) => /(^|\/)(motion|framer-motion)$/.test(name) || name.startsWith('@motionone/'))) {
    dependencyFacets.push('Motion');
  }
  if (dependencyPackages.some((name) => name.startsWith('@radix-ui/'))) dependencyFacets.push('Radix');
  if (dependencyPackages.some((name) => name === 'three' || name.startsWith('@react-three/'))) {
    dependencyFacets.push('Three.js');
  }
  if (dependencyPackages.some((name) => name === 'd3' || name.startsWith('d3-'))) dependencyFacets.push('D3');

  return {
    id: manifest.id,
    slug: manifest.slug,
    name: manifest.name,
    description: manifest.description,
    resourceType: manifest.resourceType,
    categories: manifest.categories,
    roles: manifest.roles,
    purposes: manifest.purposes,
    tags: manifest.tags,
    contentRequirements: manifest.intent.contentRequirements,
    intentSummary: manifest.intent.summary,
    intentJobs: manifest.intent.jobs,
    intentIdealFor: manifest.intent.idealFor,
    archetypes: manifest.productArchetypes.map((a) => a.tag),
    feel: feelTags,
    intensity: [intensity],
    motion: [motion],
    density: [density],
    performance: [performance],
    accessibility,
    dependencies: dependencyFacets,
    qualityScore: manifest.quality.overall,
    license: manifest.license.spdx,
  };
}

/**
 * Inserts a single manifest into the search database.
 */
export async function indexResource(db: ResourceOramaDb, manifest: ResourceManifest): Promise<void> {
  const doc = manifestToSearchDocument(manifest);
  await insert(db, doc as unknown as Record<string, unknown>);
}

/**
 * Bulk indexes multiple manifests into the search database.
 */
export async function indexResources(
  db: ResourceOramaDb,
  manifests: ResourceManifest[]
): Promise<void> {
  for (const manifest of manifests) {
    await indexResource(db, manifest);
  }
}
