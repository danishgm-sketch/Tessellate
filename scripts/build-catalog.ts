import {composeShowcase} from '../packages/compatibility/src/showcase-composition.js';
import {SHOWCASE_PROJECTS} from '../packages/composer/src/showcases.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildCatalogueFromDirectory,
  writeCatalogueArtifact,
  isGoldResource,
} from '../packages/catalog/src/index.js';
import {
  generateRegistryItem,
  generateRegistryIndex,
  generateLlmsTxt,
  generateLlmsFullTxt,
  generateOpenApiSpec,
} from '../packages/registry/src/index.js';
import { runGenerate as generateGoldArtifacts } from './generate-gold-artifacts.js';

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

  // Tag Gold 40 resources
  let goldCount = 0;
  for (const manifest of artifact.resources) {
    if (isGoldResource(manifest.slug)) {
      manifest.status = 'verified-gold';
      if (!manifest.tags.includes('verified-gold')) {
        manifest.tags.push('verified-gold');
      }
      goldCount++;
    }
  }
  console.log(`[build-catalog] Tagged ${goldCount} Gold 40 resources as 'verified-gold'.`);

  // 1. Write catalog.json to apps/site and apps/preview
  const siteCatalogPath = path.join(sitePublicDir, 'data', 'catalog.json');
  const previewCatalogPath = path.join(previewPublicDir, 'data', 'catalog.json');
  writeCatalogueArtifact(artifact, siteCatalogPath);
  writeCatalogueArtifact(artifact, previewCatalogPath);

  // Write minified catalog.min.json
  const minifiedContent = JSON.stringify(artifact);
  fs.writeFileSync(path.join(sitePublicDir, 'data', 'catalog.min.json'), minifiedContent, 'utf-8');
  fs.writeFileSync(path.join(previewPublicDir, 'data', 'catalog.min.json'), minifiedContent, 'utf-8');
  console.log('[build-catalog] Wrote catalog and catalog.min.json to site & preview public dirs.');

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
  }

  const registryIndex = generateRegistryIndex(registryItems);
  const indexPath = path.join(sitePublicDir, 'r', 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(registryIndex, null, 2), 'utf-8');
  console.log('[build-catalog] Generated registry index at:', indexPath);

  // Write registry styles.json for shadcn style registries
  const stylesIndex = [
    { name: 'default', label: 'Default', type: 'registry:style' },
    { name: 'new-york', label: 'New York', type: 'registry:style' },
  ];
  fs.writeFileSync(path.join(registryOutputDir, 'styles.json'), JSON.stringify(stylesIndex, null, 2), 'utf-8');

  // 3. Generate /llms.txt and /llms-full.txt
  const llmsTxt = generateLlmsTxt(artifact);
  const llmsFullTxt = generateLlmsFullTxt(artifact);
  fs.writeFileSync(path.join(sitePublicDir, 'llms.txt'), llmsTxt, 'utf-8');
  fs.writeFileSync(path.join(sitePublicDir, 'llms-full.txt'), llmsFullTxt, 'utf-8');
  console.log('[build-catalog] Generated /llms.txt and /llms-full.txt');

  // 4. Generate /openapi.json
  const openApiSpec = generateOpenApiSpec();
  fs.writeFileSync(path.join(sitePublicDir, 'openapi.json'), JSON.stringify(openApiSpec, null, 2), 'utf-8');
  console.log('[build-catalog] Generated /openapi.json');

  const showcasesDir=path.join(sitePublicDir,'data','showcases');
  fs.mkdirSync(showcasesDir,{recursive:true});
  for(const showcase of SHOWCASE_PROJECTS)fs.writeFileSync(path.join(showcasesDir,`${showcase.id}.json`),JSON.stringify(composeShowcase(showcase.id,artifact.resources),null,2),'utf8');
  // 5. Generate Gold 40 runtime registry & exporter sources
  await generateGoldArtifacts();
}

main().catch((err) => {
  console.error('[build-catalog] Error:', err);
  process.exit(1);
});
