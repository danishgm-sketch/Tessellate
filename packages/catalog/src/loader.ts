import * as fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { ResourceManifestSchema, type ResourceManifest } from '@tessellate/schemas';

/**
 * Loads and parses a resource manifest from disk.
 * Supports both JSON and TypeScript/JavaScript module formats.
 */
export async function loadManifest(manifestPath: string): Promise<ResourceManifest> {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest file does not exist at path: ${manifestPath}`);
  }

  let rawData: unknown;

  if (manifestPath.endsWith('.json')) {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    rawData = JSON.parse(content);
  } else {
    // Dynamic import for .ts or .js
    const fileUrl = pathToFileURL(manifestPath).href;
    const module = await import(fileUrl);
    rawData = module.default ?? module.manifest ?? module;
  }

  return ResourceManifestSchema.parse(rawData);
}

/**
 * Synchronous loader for JSON manifests.
 */
export function loadJsonManifest(manifestPath: string): ResourceManifest {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest file does not exist at path: ${manifestPath}`);
  }
  const content = fs.readFileSync(manifestPath, 'utf-8');
  const rawData = JSON.parse(content);
  return ResourceManifestSchema.parse(rawData);
}
