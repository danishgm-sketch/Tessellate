import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildCatalogueFromDirectory,
  writeCatalogueArtifact,
} from '../packages/catalog/src/index.js';
import {
  generateRegistryItem,
  generateRegistryIndex,
} from '../packages/registry/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const resourcesDir = path.join(rootDir, 'resources');
const sitePublicDir = path.join(rootDir, 'apps', 'site', 'public');
const previewPublicDir = path.join(rootDir, 'apps', 'preview', 'public');

async function main() {
  console.log('[build-catalog] Scanning and validating resources at:', resourcesDir);
  const { artifact } = await buildCatalogueFromDirectory(resourcesDir);

  console.log(`[build-catalog] Successfully validated ${artifact.count} resource(s).`);

  // 1. Write catalog.json to apps/site and apps/preview
  const siteCatalogPath = path.join(sitePublicDir, 'data', 'catalog.json');
  const previewCatalogPath = path.join(previewPublicDir, 'data', 'catalog.json');
  writeCatalogueArtifact(artifact, siteCatalogPath);
  writeCatalogueArtifact(artifact, previewCatalogPath);
  console.log('[build-catalog] Wrote catalog artifact to:', siteCatalogPath);

  // 2. Generate registry items and index
  const registryItems = [];
  const registryOutputDir = path.join(sitePublicDir, 'r');
  if (!fs.existsSync(registryOutputDir)) {
    fs.mkdirSync(registryOutputDir, { recursive: true });
  }

  for (const manifest of artifact.resources) {
    const resDir = path.join(resourcesDir, manifest.categories[0] ?? 'primitives', manifest.slug);
    const item = generateRegistryItem(manifest, fs.existsSync(resDir) ? resDir : resourcesDir);
    registryItems.push(item);

    const itemPath = path.join(registryOutputDir, `${manifest.slug}.json`);
    fs.writeFileSync(itemPath, JSON.stringify(item, null, 2), 'utf-8');
    console.log(`[build-catalog] Generated registry item: ${itemPath}`);
  }

  const registryIndex = generateRegistryIndex(registryItems);
  const indexPath = path.join(sitePublicDir, 'r', 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(registryIndex, null, 2), 'utf-8');
  console.log('[build-catalog] Generated registry index at:', indexPath);
}

main().catch((err) => {
  console.error('[build-catalog] Error:', err);
  process.exit(1);
});
