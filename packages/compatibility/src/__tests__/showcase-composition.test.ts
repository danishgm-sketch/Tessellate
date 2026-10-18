import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ProjectNode, ResourceManifest } from '@tessellate/schemas';
import { composeShowcase } from '../showcase-composition.js';

const catalogue: ResourceManifest[] = JSON.parse(readFileSync('apps/site/public/data/catalog.json', 'utf8')).resources;

function collectNodes(node: ProjectNode, result: ProjectNode[] = []): ProjectNode[] {
  result.push(node);
  for (const child of node.children) collectNodes(child, result);
  return result;
}

describe('showcase composition stability', () => {
  it('keeps the same graph identity and example timestamps across identical builds', () => {
    const first = composeShowcase('showcase-playful-hr', catalogue);
    const second = composeShowcase('showcase-playful-hr', catalogue);

    expect(second.screenGraph.id).toBe(first.screenGraph.id);
    expect(second.createdAt).toBe(first.createdAt);
    expect(second.updatedAt).toBe(first.updatedAt);
    expect(second).toEqual(first);
  });

  it.each([
    ['showcase-ai-developer-platform', 'Prompt Workspace', 'PW'],
    ['showcase-financial-terminal', 'Account Workspace', 'AW'],
  ])('preserves the %s product identity through content binding', (id, brand, initials) => {
    const manifest = composeShowcase(id, catalogue);
    const nodes = manifest.screens.flatMap((screen) => collectNodes(screen.rootNode));

    expect(nodes.some((node) => node.props.brand === brand)).toBe(true);
    expect(nodes.some((node) => node.props.initials === initials)).toBe(true);
  });
});
