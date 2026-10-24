import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CatalogueArtifact } from '@tessellate/catalog';
import { ResourceManifestSchema, ResourceSlugSchema, type ResourceManifest } from '@tessellate/schemas';

const catalogueCache = new Map<string, CatalogueArtifact>();
const packageRepositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const MAX_CATALOGUE_BYTES = 32 * 1024 * 1024;
const MAX_RESOURCE_SOURCE_BYTES = 256 * 1024;

export function getLocalCatalogPath(cwd = process.cwd()): string | null {
  const candidates = [
    path.resolve(cwd, 'apps/site/public/data/catalog.json'),
    path.resolve(cwd, 'public/data/catalog.json'),
    path.resolve(packageRepositoryRoot, 'apps/site/public/data/catalog.json'),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function isContainedBy(root: string, candidate: string): boolean {
  const realRoot = fs.realpathSync.native(root);
  const realCandidate = fs.realpathSync.native(candidate);
  const relativePath = path.relative(realRoot, realCandidate);
  return relativePath === '' || (
    relativePath !== '..' &&
    !relativePath.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePath)
  );
}

function parseCatalogue(value: unknown, source: string): CatalogueArtifact {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('expected a catalogue object');
  }

  const artifact = value as Partial<CatalogueArtifact>;
  if (
    typeof artifact.schemaVersion !== 'string' ||
    typeof artifact.catalogVersion !== 'string' ||
    typeof artifact.generatedAt !== 'string' ||
    !Array.isArray(artifact.resources) ||
    typeof artifact.count !== 'number' ||
    artifact.count !== artifact.resources.length
  ) {
    throw new Error('catalogue metadata or resource count is invalid');
  }

  const seenSlugs = new Set<string>();
  const resources = artifact.resources.map((resource, index) => {
    const parsed = ResourceManifestSchema.safeParse(resource);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new Error(`resource ${index} is invalid at ${issue?.path.join('.') || source}: ${issue?.message || 'schema mismatch'}`);
    }
    if (seenSlugs.has(parsed.data.slug)) {
      throw new Error(`duplicate resource slug "${parsed.data.slug}"`);
    }
    seenSlugs.add(parsed.data.slug);
    return parsed.data;
  });

  return { ...artifact, resources } as CatalogueArtifact;
}

export async function loadMcpCatalogue(cwd = process.cwd()): Promise<CatalogueArtifact> {
  const localPath = getLocalCatalogPath(path.resolve(cwd));
  if (localPath) {
    const source = path.resolve(localPath);
    const cached = catalogueCache.get(source);
    if (cached) return cached;

    if (!isContainedBy(path.resolve(cwd), source) && !isContainedBy(packageRepositoryRoot, source)) {
      throw new Error(`Catalogue at ${source} resolves outside the project and Tessellate package roots.`);
    }

    if (fs.statSync(source).size > MAX_CATALOGUE_BYTES) {
      throw new Error(`Catalogue at ${source} exceeds the 32 MiB local input limit.`);
    }

    // A malformed local catalogue is a local configuration error. Do not mask it
    // by quietly switching the agent to a different, remote catalogue snapshot.
    const parsed = parseCatalogue(JSON.parse(fs.readFileSync(source, 'utf-8')) as unknown, source);
    catalogueCache.set(source, parsed);
    return parsed;
  }

  const source = 'https://tessellate.design/data/catalog.json';
  const cached = catalogueCache.get(source);
  if (cached) return cached;

  let response: Response;
  try {
    response = await fetch(source, { signal: AbortSignal.timeout(5_000) });
  } catch (error) {
    throw new Error(`Catalogue unavailable at ${source}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!response.ok) {
    throw new Error(`Catalogue unavailable at ${source}: HTTP ${response.status}`);
  }

  let parsed: CatalogueArtifact;
  try {
    const contentLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > MAX_CATALOGUE_BYTES) {
      throw new Error('catalogue response exceeds the 32 MiB input limit');
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error('catalogue response did not include a readable body');
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_CATALOGUE_BYTES) {
        await reader.cancel();
        throw new Error('catalogue response exceeds the 32 MiB input limit');
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    parsed = parseCatalogue(JSON.parse(new TextDecoder().decode(bytes)) as unknown, source);
  } catch (error) {
    throw new Error(`Catalogue at ${source} is invalid: ${error instanceof Error ? error.message : String(error)}`);
  }
  catalogueCache.set(source, parsed);
  return parsed;
}

export async function findResourceBySlug(slug: string, cwd = process.cwd()): Promise<ResourceManifest | null> {
  const cleanSlug = slug.trim().replace(/^@tess\//, '');
  const catalogue = await loadMcpCatalogue(cwd);
  return catalogue.resources.find((resource) => resource.slug === cleanSlug) ?? null;
}

function safePath(root: string, ...parts: string[]): string | null {
  const resolvedRoot = path.resolve(root);
  const resolvedPath = path.resolve(resolvedRoot, ...parts);
  const relativePath = path.relative(resolvedRoot, resolvedPath);
  if (relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
    return null;
  }

  try {
    const realRoot = fs.realpathSync.native(resolvedRoot);
    const realPath = fs.realpathSync.native(resolvedPath);
    const realRelativePath = path.relative(realRoot, realPath);
    if (
      realRelativePath === '..' ||
      realRelativePath.startsWith(`..${path.sep}`) ||
      path.isAbsolute(realRelativePath)
    ) {
      return null;
    }
    return resolvedPath;
  } catch {
    // Missing or inaccessible resources are not eligible for source retrieval.
    return null;
  }
}

export function getResourceComponentCode(manifest: ResourceManifest, cwd = process.cwd()): string | null {
  if (!ResourceSlugSchema.safeParse(manifest.slug).success) return null;
  const roots = [
    path.resolve(cwd, 'resources'),
    path.resolve(packageRepositoryRoot, 'resources'),
  ];

  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const preferredCategory = manifest.categories.find((category) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(category));
    const preferred = preferredCategory ? safePath(root, preferredCategory, manifest.slug, 'index.tsx') : null;
    if (preferred && fs.existsSync(preferred)) {
      if (fs.statSync(preferred).size > MAX_RESOURCE_SOURCE_BYTES) return null;
      return fs.readFileSync(preferred, 'utf-8');
    }

    for (const category of fs.readdirSync(root)) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(category)) continue;
      const sourcePath = safePath(root, category, manifest.slug, 'index.tsx');
      if (sourcePath && fs.existsSync(sourcePath)) {
        if (fs.statSync(sourcePath).size > MAX_RESOURCE_SOURCE_BYTES) return null;
        return fs.readFileSync(sourcePath, 'utf-8');
      }
    }
  }

  return null;
}
