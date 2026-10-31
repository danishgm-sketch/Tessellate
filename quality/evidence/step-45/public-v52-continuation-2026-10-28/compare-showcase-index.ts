import { readFileSync } from 'node:fs';
import { SHOWCASE_PROJECTS } from '../../../../packages/composer/src/showcases.js';

const actual = JSON.parse(readFileSync('apps/site/public/data/showcases/index.json', 'utf8'));
const expected = SHOWCASE_PROJECTS.map(({ id, name, tagline, archetypeId, navigationModel, dnaPresetName, colorMode, manifest }) => ({
  id, name, tagline, archetypeId, navigationModel, dnaPresetName, colorMode, screenCount: manifest.screens.length,
}));
console.log(JSON.stringify({ expectedCount: expected.length, actualCount: actual.length, differences: expected.flatMap((item) => {
  const found = actual.find((entry: { id: string }) => entry.id === item.id);
  return !found ? [{ id: item.id, actual: null, expected: item }] : JSON.stringify(found) === JSON.stringify(item) ? [] : [{ id: item.id, actual: found, expected: item }];
}) }, null, 2));
