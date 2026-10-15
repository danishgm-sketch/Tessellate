import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { physioInterpretationFixture, type BriefInterpretation, type ResourceManifest } from '@tessellate/schemas';
import { composeFromInterpretation } from '@tessellate/compatibility';
import { generateSourceTree } from '../index.js';

/**
 * Phase 29/30 gate: client exports carry the client's brand and content, never Tessellate's own copy
 * (the MIT notice required by the licence lives only in THIRD_PARTY_NOTICES.md).
 */
const catalog: ResourceManifest[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../../apps/site/public/data/catalog.json'), 'utf-8'),
).resources;

const physio = (floor: 'AA' | 'AAA'): BriefInterpretation => ({
  ...physioInterpretationFixture,
  productModel: {
    ...physioInterpretationFixture.productModel,
    constraints: { ...physioInterpretationFixture.productModel.constraints, accessibilityFloor: floor },
  },
});

describe('client export output', () => {
  for (const floor of ['AA', 'AAA'] as const) {
    it(`physio (${floor}): no Tessellate copy, client brand in navigation, gaps labelled`, () => {
      const result = composeFromInterpretation(physio(floor), { catalogResources: catalog, productName: 'Northside Physio', projectIdBase: 'p' });
      for (const d of [result.directionA, result.directionB, result.directionC]) {
        const tree = generateSourceTree(d.manifest);
        expect(tree['THIRD_PARTY_NOTICES.md']).toMatch(/MIT License/);
        for (const [file, content] of Object.entries(tree)) {
          if (file === 'THIRD_PARTY_NOTICES.md') continue;
          expect(content, `${d.direction.name}: ${file}`).not.toMatch(/tessellate/i);
        }
        const screens = Object.entries(tree).filter(([f]) => f.startsWith('src/screens/')).map(([, c]) => c).join('\n');
        expect(screens).toContain('Northside Physio');
        const gaps = d.diagnostics?.length ?? 0;
        expect((screens.match(/data-gap=/g) ?? []).length).toBe(gaps);
      }
    });
  }

  it('the AA physio sign-in screen exports a real sign-in form', () => {
    const result = composeFromInterpretation(physio('AA'), { catalogResources: catalog, productName: 'Northside Physio', projectIdBase: 'p' });
    const tree = generateSourceTree(result.directionA.manifest);
    expect(Object.keys(tree)).toContain('src/components/SignInForm.tsx');
    expect(Object.values(tree).join('\n')).toMatch(/<SignInForm[^>]*productName="Northside Physio"/);
  });

  it('a screen named like one of its resources gets a distinct component name', () => {
    const result = composeFromInterpretation(physio('AA'), { catalogResources: catalog, productName: 'Northside Physio', projectIdBase: 'p' });
    const m = structuredClone(result.directionA.manifest);
    const editor = m.screens.find((s) => JSON.stringify(s.rootNode).includes('"slug":"document-editor"'))!;
    editor.name = 'Document editor';
    const tree = generateSourceTree(m);
    expect(tree['src/screens/DocumentEditorScreen.tsx']).toMatch(/export function DocumentEditorScreen\(/);
    expect(tree['src/screens/DocumentEditorScreen.tsx']).toMatch(/import \{ DocumentEditor \} from '\.\.\/components\/DocumentEditor'/);
  });
});

