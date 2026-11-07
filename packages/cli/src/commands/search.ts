import * as fs from 'node:fs';
import * as path from 'node:path';
import type { CatalogueArtifact } from '@tessellate/catalog';
import { ResourceManifestSchema } from '@tessellate/schemas';
import { loadConfig } from '../config.js';
import { fetchRegistryResponse, readBoundedJsonResponse } from '../registry-io.js';

const MAX_CATALOGUE_BYTES = 32 * 1024 * 1024;

/**
 * Resolves the catalogue artifact from local filesystem or local build.
 */
export async function getCatalogue(cwd = process.cwd()): Promise<CatalogueArtifact> {
  const executablePath = process.argv[1] ? path.resolve(process.argv[1]) : '';
  const executableDirectory = executablePath ? path.dirname(executablePath) : '';
  const packagedCatalogue = executablePath && !/\.[cm]?tsx?$/.test(executablePath)
    ? [path.resolve(executableDirectory, 'data/catalog.json')]
    : [];
  const candidates = [
    ...packagedCatalogue,
    path.resolve(cwd, 'apps/site/public/data/catalog.json'),
    path.resolve(cwd, '../../apps/site/public/data/catalog.json'),
    path.resolve(cwd, '../apps/site/public/data/catalog.json'),
    path.resolve(cwd, 'public/data/catalog.json'),
  ];

  const failures: string[] = [];
  for (const candidate of [...new Set(candidates)]) {
    if (fs.existsSync(candidate)) {
      try {
        if (fs.statSync(candidate).size > MAX_CATALOGUE_BYTES) {
          throw new Error(`catalogue exceeds the ${MAX_CATALOGUE_BYTES}-byte input limit`);
        }
        const raw = fs.readFileSync(candidate, 'utf-8');
        return parseCatalogue(JSON.parse(raw), candidate);
      } catch (error) {
        failures.push(`${candidate}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  // Fallback: try fetching from configured registry URL
  const config = loadConfig(cwd);
  const catalogUrl = `${config.registry.replace(/\/r\/?$/, '')}/data/catalog.json`;
  try {
    const res = await fetchRegistryResponse(catalogUrl, MAX_CATALOGUE_BYTES, 'Catalogue');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return parseCatalogue(await readBoundedJsonResponse(res, MAX_CATALOGUE_BYTES, 'Catalogue'), catalogUrl);
  } catch (error) {
    failures.push(`${catalogUrl}: ${error instanceof Error ? error.message : String(error)}`);
  }

  throw new Error(`Catalogue unavailable. Could not load a valid local or remote catalogue. ${failures.join(' | ')}`);
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

  const resources = artifact.resources.map((resource, index) => {
    const parsed = ResourceManifestSchema.safeParse(resource);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new Error(`resource ${index} is invalid at ${issue?.path.join('.') || source}: ${issue?.message || 'schema mismatch'}`);
    }
    return parsed.data;
  });

  return { ...artifact, resources } as CatalogueArtifact;
}

export interface SearchOptions {
  category?: string;
  cwd?: string;
}

export async function runSearch(query = '', options: SearchOptions = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const catalogue = await getCatalogue(cwd);

  const q = query.toLowerCase().trim();
  const filtered = catalogue.resources.filter((r) => {
    if (options.category && !r.categories.includes(options.category)) {
      return false;
    }
    if (!q) return true;
    return (
      r.slug.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  console.log(`[tess] Found ${filtered.length} resource(s) matching "${query}":\n`);
  for (const item of filtered) {
    console.log(`  • ${item.name} (${item.slug})`);
    console.log(`    Category: ${item.categories.join(', ')} | Type: ${item.resourceType}`);
    console.log(`    ${item.description}`);
    console.log(`    Install:  tess add ${item.slug}\n`);
  }

  return filtered;
}

export async function runView(slug: string, options: { cwd?: string } = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const catalogue = await getCatalogue(cwd);

  const resource = catalogue.resources.find(
    (r) => r.slug === slug || r.name.toLowerCase() === slug.toLowerCase()
  );

  if (!resource) {
    console.error(`[tess] Resource "${slug}" not found in catalogue.`);
    return null;
  }

  console.log(`\n========================================================`);
  console.log(` ${resource.name} (@tess/${resource.slug})`);
  console.log(`========================================================`);
  console.log(`Description:  ${resource.description}`);
  console.log(`Type:         ${resource.resourceType}`);
  console.log(`Categories:   ${resource.categories.join(', ')}`);
  console.log(`License:      ${resource.license.spdx}`);
  console.log(`Dependencies: ${resource.registry.dependencies?.join(', ') || 'none'}`);
  console.log(`Variants:     ${resource.variants.map((v) => v.name).join(', ') || 'default'}`);
  console.log(`\nInstall:      tess add ${resource.slug}`);
  console.log(`Shadcn URL:   https://tessellate.design/r/${resource.slug}.json\n`);

  return resource;
}
