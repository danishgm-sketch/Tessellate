import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ResourceManifest } from '@tessellate/schemas';
import type { RegistryItem, RegistryFile, RegistryIndex, RegistryIndexItem } from './types.js';

export const SHADCN_REGISTRY_ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';
export const SHADCN_REGISTRY_INDEX_SCHEMA = 'https://ui.shadcn.com/schema/registry.json';

/**
 * Maps a Tessellate resourceType to shadcn registry item type.
 */
export function mapResourceTypeToRegistryType(
  resourceType: ResourceManifest['resourceType']
): RegistryItem['type'] {
  switch (resourceType) {
    case 'primitive':
      return 'registry:ui';
    case 'block':
    case 'section':
    case 'page':
    case 'flow':
      return 'registry:block';
    default:
      return 'registry:component';
  }
}

/**
 * Generates a shadcn-compatible RegistryItem from a validated ResourceManifest and its local directory.
 */
export function generateRegistryItem(
  manifest: ResourceManifest,
  resourceDir: string
): RegistryItem {
  const regType = mapResourceTypeToRegistryType(manifest.resourceType);

  const files: RegistryFile[] = [];

  for (const fileSpec of manifest.files) {
    // Only package component and utility files into the registry distribution
    if (fileSpec.kind === 'component' || fileSpec.kind === 'utility' || fileSpec.kind === 'style') {
      const fullPath = path.join(resourceDir, fileSpec.path);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        files.push({
          path: fileSpec.path,
          content,
          type: regType,
          target: `components/ui/${path.basename(fileSpec.path)}`,
        });
      }
    }
  }

  // Fallback: if no files matched kind above, grab index.tsx if present
  if (files.length === 0) {
    const indexPath = path.join(resourceDir, 'index.tsx');
    if (fs.existsSync(indexPath)) {
      files.push({
        path: 'index.tsx',
        content: fs.readFileSync(indexPath, 'utf-8'),
        type: regType,
        target: `components/ui/${manifest.slug}.tsx`,
      });
    }
  }

  return {
    $schema: SHADCN_REGISTRY_ITEM_SCHEMA,
    name: manifest.slug,
    type: regType,
    title: manifest.name,
    description: manifest.description,
    dependencies: manifest.registry.dependencies ?? [],
    devDependencies: manifest.registry.devDependencies ?? [],
    registryDependencies: manifest.registry.registryDependencies ?? [],
    files,
    categories: manifest.categories,
    meta: {
      tessellateId: manifest.id,
      version: manifest.version,
      license: manifest.license.spdx,
      variants: manifest.variants.map((v) => v.name),
    },
  };
}

/**
 * Builds a registry index from an array of RegistryItems.
 */
export function generateRegistryIndex(
  items: RegistryItem[],
  homepage = 'https://tessellate.design'
): RegistryIndex {
  const indexItems: RegistryIndexItem[] = items.map((item) => ({
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    dependencies: item.dependencies,
    devDependencies: item.devDependencies,
    registryDependencies: item.registryDependencies,
    categories: item.categories,
  }));

  return {
    $schema: SHADCN_REGISTRY_INDEX_SCHEMA,
    name: 'tessellate',
    homepage,
    items: indexItems,
  };
}
