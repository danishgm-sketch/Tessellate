import * as fs from 'node:fs';
import * as path from 'node:path';
import type { CatalogueArtifact } from '@tessellate/catalog';
import { loadConfig } from '../config.js';

/**
 * Resolves the catalogue artifact from local filesystem or local build.
 */
export async function getCatalogue(cwd = process.cwd()): Promise<CatalogueArtifact> {
  const candidates = [
    path.resolve(cwd, 'apps/site/public/data/catalog.json'),
    path.resolve(cwd, '../../apps/site/public/data/catalog.json'),
    path.resolve(cwd, '../apps/site/public/data/catalog.json'),
    path.resolve(cwd, 'public/data/catalog.json'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        const raw = fs.readFileSync(candidate, 'utf-8');
        return JSON.parse(raw) as CatalogueArtifact;
      } catch {
        // continue
      }
    }
  }

  // Fallback: try fetching from configured registry URL
  const config = loadConfig(cwd);
  const catalogUrl = `${config.registry.replace(/\/r\/?$/, '')}/data/catalog.json`;
  try {
    const res = await fetch(catalogUrl);
    if (res.ok) {
      return (await res.json()) as CatalogueArtifact;
    }
  } catch {
    // offline or not reachable
  }

  // Fallback empty artifact
  return {
    schemaVersion: '1.0.0',
    catalogVersion: '0.1.0',
    generatedAt: new Date().toISOString(),
    count: 0,
    resources: [],
  };
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
