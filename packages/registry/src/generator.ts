import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ResourceManifest } from '@tessellate/schemas';
import type { RegistryItem, RegistryFile, RegistryIndex, RegistryIndexItem } from './types.js';

export const SHADCN_REGISTRY_ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';
export const SHADCN_REGISTRY_INDEX_SCHEMA = 'https://ui.shadcn.com/schema/registry.json';

function isPathWithinDirectory(directory: string, candidate: string): boolean {
  const relativePath = path.relative(directory, candidate);
  return (
    relativePath !== '' &&
    relativePath !== '..' &&
    !relativePath.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePath)
  );
}

function resolveResourceFilePath(resourceDir: string, filePath: string): string {
  if (fs.existsSync(resourceDir)) {
    const resourceDirStat = fs.lstatSync(resourceDir);
    if (resourceDirStat.isSymbolicLink()) {
      throw new Error('Resource directory cannot be a symlink.');
    }
    if (!resourceDirStat.isDirectory()) {
      throw new Error('Resource path must be a directory.');
    }
  }

  const resourceRoot = fs.existsSync(resourceDir)
    ? fs.realpathSync(resourceDir)
    : path.resolve(resourceDir);
  const candidate = path.resolve(resourceRoot, filePath);

  if (!isPathWithinDirectory(resourceRoot, candidate)) {
    throw new Error(`Resource file path '${filePath}' escapes the resource directory.`);
  }

  if (fs.existsSync(candidate)) {
    const realCandidate = fs.realpathSync(candidate);
    if (!isPathWithinDirectory(resourceRoot, realCandidate)) {
      throw new Error(`Resource file path '${filePath}' resolves outside the resource directory.`);
    }
    return realCandidate;
  }

  return candidate;
}

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
      const fullPath = resolveResourceFilePath(resourceDir, fileSpec.path);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8').replace(/\r\n/g,'\n');
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
    const indexPath = resolveResourceFilePath(resourceDir, 'index.tsx');
    if (fs.existsSync(indexPath)) {
      files.push({
        path: 'index.tsx',
        content: fs.readFileSync(indexPath, 'utf-8').replace(/\r\n/g,'\n'),
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
