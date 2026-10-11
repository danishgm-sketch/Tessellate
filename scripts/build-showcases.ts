import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SHOWCASE_PROJECTS } from '../packages/composer/src/showcases.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const siteShowcasesDir = path.join(rootDir, 'apps', 'site', 'public', 'data', 'showcases');
const previewShowcasesDir = path.join(rootDir, 'apps', 'preview', 'public', 'data', 'showcases');

for (const dir of [siteShowcasesDir, previewShowcasesDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

console.log(`Writing ${SHOWCASE_PROJECTS.length} showcase project manifests...`);

const showcaseIndex = SHOWCASE_PROJECTS.map((s) => ({
  id: s.id,
  name: s.name,
  tagline: s.tagline,
  archetypeId: s.archetypeId,
  navigationModel: s.navigationModel,
  dnaPresetName: s.dnaPresetName,
  colorMode: s.colorMode,
  screenCount: s.manifest.screens.length,
}));

for (const dir of [siteShowcasesDir, previewShowcasesDir]) {
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(showcaseIndex, null, 2), 'utf-8');

  for (const s of SHOWCASE_PROJECTS) {
    fs.writeFileSync(path.join(dir, `${s.id}.json`), JSON.stringify(s.manifest, null, 2), 'utf-8');
  }
}

console.log('✓ Successfully generated showcase manifests in site and preview data dirs.');
