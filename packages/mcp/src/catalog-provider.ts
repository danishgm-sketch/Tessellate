import * as fs from 'node:fs';
import * as path from 'node:path';
import type { CatalogueArtifact } from '@tessellate/catalog';
import type { ResourceManifest } from '@tessellate/schemas';

let cachedCatalogue: CatalogueArtifact | null = null;

export function getLocalCatalogPath(cwd = process.cwd()): string | null {
  const candidates = [
    path.resolve(cwd, 'apps/site/public/data/catalog.json'),
    path.resolve(cwd, '../../apps/site/public/data/catalog.json'),
    path.resolve(cwd, '../apps/site/public/data/catalog.json'),
    path.resolve(cwd, 'public/data/catalog.json'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

export async function loadMcpCatalogue(cwd = process.cwd()): Promise<CatalogueArtifact> {
  if (cachedCatalogue) {
    return cachedCatalogue;
  }

  const localPath = getLocalCatalogPath(cwd);
  if (localPath) {
    try {
      const raw = fs.readFileSync(localPath, 'utf-8');
      cachedCatalogue = JSON.parse(raw) as CatalogueArtifact;
      return cachedCatalogue;
    } catch {
      // continue
    }
  }

  // Fallback: try remote static catalog endpoint
  try {
    const res = await fetch('https://tessellate.design/data/catalog.json');
    if (res.ok) {
      cachedCatalogue = (await res.json()) as CatalogueArtifact;
      return cachedCatalogue;
    }
  } catch {
    // network unavailable
  }

  return {
    schemaVersion: '1.0.0',
    catalogVersion: '0.1.0',
    generatedAt: new Date().toISOString(),
    count: 0,
    resources: [],
  };
}

export async function findResourceBySlug(slug: string, cwd = process.cwd()): Promise<ResourceManifest | null> {
  const catalogue = await loadMcpCatalogue(cwd);
  const cleanSlug = slug.replace(/^@tess\//, '');
  return catalogue.resources.find((r) => r.slug === cleanSlug) ?? null;
}

export function getResourceComponentCode(manifest: ResourceManifest, cwd = process.cwd()): string | null {
  const candidates = [
    path.resolve(cwd, 'resources', manifest.categories[0] ?? 'primitives', manifest.slug, 'index.tsx'),
    path.resolve(cwd, '../../resources', manifest.categories[0] ?? 'primitives', manifest.slug, 'index.tsx'),
    path.resolve(cwd, '../resources', manifest.categories[0] ?? 'primitives', manifest.slug, 'index.tsx'),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return fs.readFileSync(c, 'utf-8');
    }
  }

  // Fallback: search across all category folders in resources
  const rootResourcesCandidates = [
    path.resolve(cwd, 'resources'),
    path.resolve(cwd, '../../resources'),
    path.resolve(cwd, '../resources'),
  ];

  for (const root of rootResourcesCandidates) {
    if (fs.existsSync(root)) {
      const cats = fs.readdirSync(root);
      for (const cat of cats) {
        const file = path.join(root, cat, manifest.slug, 'index.tsx');
        if (fs.existsSync(file)) {
          return fs.readFileSync(file, 'utf-8');
        }
      }
    }
  }

  return null;
}
