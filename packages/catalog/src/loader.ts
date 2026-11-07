import * as fs from 'node:fs';
import { ResourceManifestSchema, type ResourceManifest } from '@tessellate/schemas';

const MAX_STATIC_MANIFEST_BYTES = 1024 * 1024;

/**
 * Loads and parses a resource manifest from disk.
 * Supports JSON and static TypeScript/JavaScript object manifests without executing modules.
 */
export async function loadManifest(manifestPath: string): Promise<ResourceManifest> {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest file does not exist at path: ${manifestPath}`);
  }

  const isJson = manifestPath.toLowerCase().endsWith('.json');
  if (!isJson && fs.statSync(manifestPath).size > MAX_STATIC_MANIFEST_BYTES) {
    throw new Error(`Manifest module '${manifestPath}' exceeds the ${MAX_STATIC_MANIFEST_BYTES}-byte limit.`);
  }

  const content = fs.readFileSync(manifestPath, 'utf-8');
  let rawData: unknown;
  if (isJson) {
    rawData = JSON.parse(content);
  } else {
    const byteLength = Buffer.byteLength(content, 'utf-8');
    if (byteLength > MAX_STATIC_MANIFEST_BYTES) {
      throw new Error(`Manifest module '${manifestPath}' exceeds the ${MAX_STATIC_MANIFEST_BYTES}-byte limit.`);
    }
    const { readStaticManifestModule } = await import('./static-manifest.js');
    rawData = readStaticManifestModule(manifestPath, content);
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
