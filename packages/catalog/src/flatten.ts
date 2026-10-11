import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ResourceManifest } from '@tessellate/schemas';
import { discoverResources } from './discovery.js';
import { loadJsonManifest, loadManifest } from './loader.js';
import { validateResource, type ResourceValidationResult } from './validator.js';

export const CATALOG_SCHEMA_VERSION = '1.0.0';
export const CATALOG_BUILD_VERSION = '0.1.0';

export interface CatalogueArtifact {
  schemaVersion: string;
  catalogVersion: string;
  generatedAt: string;
  count: number;
  resources: ResourceManifest[];
}

/**
 * Builds a deterministic flattened catalogue artifact from validated manifests.
 */
export function buildCatalogueArtifact(manifests: ResourceManifest[]): CatalogueArtifact {
  // Sort deterministically by slug
  const sorted = [...manifests].sort((a, b) => a.slug.localeCompare(b.slug));

  return {
    schemaVersion: CATALOG_SCHEMA_VERSION,
    catalogVersion: CATALOG_BUILD_VERSION,
    generatedAt: new Date().toISOString(),
    count: sorted.length,
    resources: sorted,
  };
}

/**
 * Scans a resources directory, validates each resource folder, and produces the catalogue artifact.
 * Throws an error if any resource fails validation.
 */
export async function buildCatalogueFromDirectory(
  resourcesDir: string
): Promise<{ artifact: CatalogueArtifact; validationResults: ResourceValidationResult[] }> {
  const discovered = discoverResources(resourcesDir);
  const validationResults: ResourceValidationResult[] = [];
  const validManifests: ResourceManifest[] = [];

  for (const item of discovered) {
    try {
      const manifest =
        item.format === 'json'
          ? loadJsonManifest(item.manifestPath)
          : await loadManifest(item.manifestPath);

      const res = validateResource(item.dir, manifest);
      validationResults.push(res);

      if (res.valid && res.manifest) {
        validManifests.push(res.manifest);
      } else {
        const errStr = res.errors.join('\n  ');
        throw new Error(`Resource '${item.slug}' failed validation:\n  ${errStr}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      validationResults.push({
        valid: false,
        resourceId: item.slug,
        slug: item.slug,
        errors: [msg],
        warnings: [],
      });
      throw new Error(`Failed to load and validate resource at ${item.dir}: ${msg}`);
    }
  }

  const artifact = buildCatalogueArtifact(validManifests);
  return { artifact, validationResults };
}

/**
 * Writes the catalogue artifact to a JSON file on disk, ensuring parent directories exist.
 */
export function writeCatalogueArtifact(artifact: CatalogueArtifact, outputPath: string): void {
  const parentDir = path.dirname(outputPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(artifact, null, 2), 'utf-8');
}
