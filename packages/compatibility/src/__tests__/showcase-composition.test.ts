import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ProjectNode, ResourceManifest } from '@tessellate/schemas';
import { composeShowcase } from '../showcase-composition.js';

const catalogue: ResourceManifest[] = JSON.parse(
  readFileSync('apps/site/public/data/catalog.json', 'utf8')
).resources;

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
    ['showcase-financial-terminal', 'Market Workspace', 'MW'],
  ])('preserves the %s product identity through content binding', (id, brand, initials) => {
    const manifest = composeShowcase(id, catalogue);
    const nodes = manifest.screens.flatMap((screen) => collectNodes(screen.rootNode));

    expect(nodes.some((node) => node.props.brand === brand)).toBe(true);
    expect(nodes.some((node) => node.props.initials === initials)).toBe(true);
  });

  it('keeps the financial terminal showcase within its market-trading domain', () => {
    const manifest = composeShowcase('showcase-financial-terminal', catalogue);
    const serialized = JSON.stringify(manifest).toLocaleLowerCase();

    expect(manifest.screens.map((screen) => screen.name)).toEqual(
      expect.arrayContaining(['Market Overview', 'Order Book', 'Positions & Risk'])
    );
    expect(serialized).toContain('market depth');
    expect(serialized).toContain('equity trade');
    expect(serialized).not.toMatch(/bank statements|reconcile statements|household budget/);
  });

  it('composes the luxury hospitality showcase as a stay and reservation product', () => {
    const manifest = composeShowcase('showcase-luxury-hospitality', catalogue);
    const serialized = JSON.stringify(manifest).toLocaleLowerCase();

    expect(manifest.productModel.productArchetypes[0]?.tag).toBe('travel');
    expect(manifest.screens.map((screen) => screen.name)).toEqual(
      expect.arrayContaining(['Find a Stay', 'Room Details', 'Reservation Checkout'])
    );
    expect(serialized).toMatch(/residence|room|reservation/);
    expect(serialized).not.toMatch(/article reader|journalist|newsroom|editorial publication/);
  });

  it('keeps the employee experience showcase focused on colleagues rather than hiring', () => {
    const manifest = composeShowcase('showcase-playful-hr', catalogue);
    const serialized = JSON.stringify(manifest).toLocaleLowerCase();

    expect(manifest.name).toBe('Kudos Employee Experience');
    expect(manifest.screens.map((screen) => screen.name)).toEqual(
      expect.arrayContaining([
        'People Directory',
        'Teams',
        'Onboarding',
        'Engagement',
        'Settings & Policies',
      ])
    );
    expect(serialized).toMatch(/employee|colleague|onboarding|policy/);
    expect(serialized).not.toMatch(/applicant pipeline|recruiting dashboard|candidate sourcing/);
  });
});
