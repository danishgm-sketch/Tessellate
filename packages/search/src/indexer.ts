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
  intentSummary: 'string',
  intentJobs: 'string[]',
  intentIdealFor: 'string[]',
  archetypes: 'string[]',
  feel: 'string[]',
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
    intentSummary: manifest.intent.summary,
    intentJobs: manifest.intent.jobs,
    intentIdealFor: manifest.intent.idealFor,
    archetypes: manifest.productArchetypes.map((a) => a.tag),
    feel: feelTags,
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
